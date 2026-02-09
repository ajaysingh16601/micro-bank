const express = require('express');
const walletController = require('../controllers/wallet.controller');
const validate = require('../middlewares/validation.middleware');
const { creditSchema, debitSchema } = require('../validators/wallet.validator');

const router = express.Router();

router.get('/', walletController.getWallet);

router.post('/credit', validate(creditSchema), walletController.creditWallet);

router.post('/debit', validate(debitSchema), walletController.debitWallet);

router.get('/transactions', walletController.getTransactions);

module.exports = router;
