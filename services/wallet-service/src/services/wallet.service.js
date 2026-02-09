const Wallet = require('../models/Wallet.model');
const Transaction = require('../models/Transaction.model');
const walletEventsProducer = require('../events/producers/walletEvents.producer');
const idempotencyService = require('./idempotency.service');
const redisClient = require('../config/redis');
const config = require('../config/env');
const logger = require('../utils/logger');
const { ValidationError, NotFoundError, AppError } = require('../utils/errors');

class WalletService {
  /**
   * Create wallet for a new user
   * @param {String} userId - User ID
   * @returns {Object} Wallet data
   */
  async createWallet(userId) {
    try {
      // Check if wallet already exists
      const existingWallet = await Wallet.findOne({ userId });
      if (existingWallet) {
        logger.info(`Wallet already exists for user: ${userId}`);
        return existingWallet;
      }

      // Create wallet
      const wallet = await Wallet.create({
        userId,
        balance: 0,
        currency: 'USD',
      });

      logger.info(`Wallet created for user: ${userId}`);

      // Publish WALLET_CREATED event
      await walletEventsProducer.publishWalletCreated({
        userId,
        walletId: wallet._id.toString(),
      });

      return wallet;
    } catch (error) {
      logger.error(`Create wallet error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get wallet by user ID
   * @param {String} userId - User ID
   * @returns {Object} Wallet data
   */
  async getWalletByUserId(userId) {
    try {
      // Try to get from cache first
      const redis = redisClient.getClient();
      const cacheKey = `wallet:balance:${userId}`;
      
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        logger.debug(`Wallet data retrieved from cache for user: ${userId}`);
        return JSON.parse(cachedData);
      }

      // Get from database
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        throw new NotFoundError('Wallet not found');
      }

      const walletData = {
        walletId: wallet._id,
        userId: wallet.userId,
        balance: wallet.balance,
        currency: wallet.currency,
        createdAt: wallet.createdAt,
      };

      // Cache for 5 minutes
      await redis.setEx(cacheKey, config.redis.cacheTTL, JSON.stringify(walletData));

      return walletData;
    } catch (error) {
      if (error.message === 'Redis client is not connected') {
        // Fallback to database only
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
          throw new NotFoundError('Wallet not found');
        }
        return {
          walletId: wallet._id,
          userId: wallet.userId,
          balance: wallet.balance,
          currency: wallet.currency,
          createdAt: wallet.createdAt,
        };
      }
      logger.error(`Get wallet error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Credit amount to wallet
   * @param {String} userId - User ID
   * @param {Number} amount - Amount to credit
   * @param {String} description - Transaction description
   * @param {String} idempotencyKey - Idempotency key
   * @returns {Object} Transaction data
   */
  async creditWallet(userId, amount, description, idempotencyKey) {
    try {
      // Check idempotency
      const existingTransaction = await idempotencyService.checkIdempotency(idempotencyKey);
      if (existingTransaction) {
        logger.info(`Duplicate credit request detected for key: ${idempotencyKey}`);
        return existingTransaction;
      }

      // Get wallet
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        throw new NotFoundError('Wallet not found');
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore + amount;

      // Update wallet balance
      wallet.balance = balanceAfter;
      await wallet.save();

      // Create transaction record
      const transaction = await Transaction.create({
        walletId: wallet._id,
        userId,
        type: 'CREDIT',
        amount,
        balanceBefore,
        balanceAfter,
        description,
        idempotencyKey,
        status: 'SUCCESS',
      });

      logger.info(`Wallet credited: ${amount} for user: ${userId}`);

      // Invalidate cache
      await this.invalidateWalletCache(userId);

      // Store idempotency
      await idempotencyService.storeIdempotency(idempotencyKey, {
        transactionId: transaction._id,
        walletId: wallet._id,
        type: 'CREDIT',
        amount,
        balanceBefore,
        balanceAfter,
        createdAt: transaction.createdAt,
      });

      // Publish WALLET_CREDITED event
      await walletEventsProducer.publishWalletCredited({
        userId,
        walletId: wallet._id.toString(),
        amount,
        balance: balanceAfter,
        transactionId: transaction._id.toString(),
      });

      return {
        transactionId: transaction._id,
        walletId: wallet._id,
        type: 'CREDIT',
        amount,
        balanceBefore,
        balanceAfter,
        createdAt: transaction.createdAt,
      };
    } catch (error) {
      logger.error(`Credit wallet error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Debit amount from wallet
   * @param {String} userId - User ID
   * @param {Number} amount - Amount to debit
   * @param {String} description - Transaction description
   * @param {String} idempotencyKey - Idempotency key
   * @returns {Object} Transaction data
   */
  async debitWallet(userId, amount, description, idempotencyKey) {
    try {
      // Check idempotency
      const existingTransaction = await idempotencyService.checkIdempotency(idempotencyKey);
      if (existingTransaction) {
        logger.info(`Duplicate debit request detected for key: ${idempotencyKey}`);
        return existingTransaction;
      }

      // Get wallet
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        throw new NotFoundError('Wallet not found');
      }

      const balanceBefore = wallet.balance;

      // Check sufficient balance
      if (balanceBefore < amount) {
        logger.warn(`Insufficient balance for user: ${userId}`);
        
        // Publish INSUFFICIENT_BALANCE event
        await walletEventsProducer.publishInsufficientBalance({
          userId,
          walletId: wallet._id.toString(),
          requestedAmount: amount,
          currentBalance: balanceBefore,
        });

        throw new ValidationError('Insufficient balance for this transaction');
      }

      const balanceAfter = balanceBefore - amount;

      // Update wallet balance
      wallet.balance = balanceAfter;
      await wallet.save();

      // Create transaction record
      const transaction = await Transaction.create({
        walletId: wallet._id,
        userId,
        type: 'DEBIT',
        amount,
        balanceBefore,
        balanceAfter,
        description,
        idempotencyKey,
        status: 'SUCCESS',
      });

      logger.info(`Wallet debited: ${amount} for user: ${userId}`);

      // Invalidate cache
      await this.invalidateWalletCache(userId);

      // Store idempotency
      await idempotencyService.storeIdempotency(idempotencyKey, {
        transactionId: transaction._id,
        walletId: wallet._id,
        type: 'DEBIT',
        amount,
        balanceBefore,
        balanceAfter,
        createdAt: transaction.createdAt,
      });

      // Publish WALLET_DEBITED event
      await walletEventsProducer.publishWalletDebited({
        userId,
        walletId: wallet._id.toString(),
        amount,
        balance: balanceAfter,
        transactionId: transaction._id.toString(),
      });

      return {
        transactionId: transaction._id,
        walletId: wallet._id,
        type: 'DEBIT',
        amount,
        balanceBefore,
        balanceAfter,
        createdAt: transaction.createdAt,
      };
    } catch (error) {
      logger.error(`Debit wallet error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get transaction history
   * @param {String} userId - User ID
   * @param {Number} limit - Number of transactions to return
   * @param {Number} skip - Number of transactions to skip
   * @returns {Array} Transaction list
   */
  async getTransactionHistory(userId, limit = 20, skip = 0) {
    try {
      const transactions = await Transaction.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .select('-__v -idempotencyKey');

      return transactions;
    } catch (error) {
      logger.error(`Get transaction history error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Invalidate wallet cache
   * @param {String} userId - User ID
   */
  async invalidateWalletCache(userId) {
    try {
      const redis = redisClient.getClient();
      const cacheKey = `wallet:balance:${userId}`;
      await redis.del(cacheKey);
      logger.debug(`Wallet cache invalidated for user: ${userId}`);
    } catch (error) {
      logger.error(`Cache invalidation error: ${error.message}`);
      // Don't throw, just log
    }
  }
}

module.exports = new WalletService();
