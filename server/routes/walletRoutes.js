// server/routes/walletRoutes.js
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

// Existing Routes
router.get('/stats/:address', walletController.getWalletStats);
router.get('/transactions/:address', walletController.getTransactions);

// NEW Route for P/L Engine
router.get('/performance/:address', walletController.getPortfolioPerformance);

module.exports = router;