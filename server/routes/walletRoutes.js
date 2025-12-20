// server/routes/walletRoutes.js
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

// Existing Route (Syncs & Lists Transactions)
router.get('/:address', walletController.getTransactions);

// NEW Route (Calculates Stats)
router.get('/:address/stats', walletController.getWalletStats);

module.exports = router;