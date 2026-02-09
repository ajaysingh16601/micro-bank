const walletService = require('../services/wallet.service');
const logger = require('../utils/logger');

class WalletController {
  async getWallet(req, res, next) {
    try {
      const userId = req.headers['x-user-id'];
      const walletData = await walletService.getWalletByUserId(userId);

      res.status(200).json({
        success: true,
        data: walletData,
      });
    } catch (error) {
      next(error);
    }
  }

  async creditWallet(req, res, next) {
    try {
      const userId = req.headers['x-user-id'];
      const { amount, description } = req.body;
      const idempotencyKey = req.headers['x-idempotency-key'];

      if (!idempotencyKey) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_IDEMPOTENCY_KEY',
            message: 'X-Idempotency-Key header is required',
          },
        });
      }

      const transaction = await walletService.creditWallet(
        userId,
        amount,
        description || 'Credit transaction',
        idempotencyKey
      );

      res.status(200).json({
        success: true,
        message: 'Amount credited successfully',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async debitWallet(req, res, next) {
    try {
      const userId = req.headers['x-user-id'];
      const { amount, description } = req.body;
      const idempotencyKey = req.headers['x-idempotency-key'];

      if (!idempotencyKey) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_IDEMPOTENCY_KEY',
            message: 'X-Idempotency-Key header is required',
          },
        });
      }

      const transaction = await walletService.debitWallet(
        userId,
        amount,
        description || 'Debit transaction',
        idempotencyKey
      );

      res.status(200).json({
        success: true,
        message: 'Amount debited successfully',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req, res, next) {
    try {
      const userId = req.headers['x-user-id'];
      const limit = parseInt(req.query.limit) || 20;
      const skip = parseInt(req.query.skip) || 0;

      const transactions = await walletService.getTransactionHistory(userId, limit, skip);

      res.status(200).json({
        success: true,
        data: transactions,
        pagination: {
          limit,
          skip,
          count: transactions.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WalletController();
