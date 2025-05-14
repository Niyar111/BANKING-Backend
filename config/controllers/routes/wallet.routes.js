const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { protect } = require('../middleware/auth.middleware'); 


router.use(protect);

// Get wallet balance and transaction history
router.get('/', walletController.getWallet);

// Add money to wallet (mocked)
router.post('/add-money', walletController.addMoney);

// Send money to another user (mocked)
router.post('/send-money', walletController.sendMoney);



// Transfer funds to a linked bank account (mocked)
router.post('/transfer-to-bank', walletController.transferToBank);

// View and filter transaction history
router.get('/transactions', walletController.getTransactionHistory);
router.get('/transactions/:transactionId', walletController.getTransactionDetails); // Get details for a specific transaction


module.exports = router;
