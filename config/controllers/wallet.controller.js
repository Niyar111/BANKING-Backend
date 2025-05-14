const Wallet = require('../models/wallet.model'); 
const User = require('../models/user.model');
const { db } = require('../config/firebase'); 

// Get wallet balance and transaction history
exports.getWallet = async (req, res) => {
  try {
    const userId = req.user._id;

    const wallet = await Wallet.getWalletByUserId(userId); // Use your Wallet model
    if (!wallet) {
      return res.status(404).json({
        status: 'error',
        message: 'Wallet not found for this user',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        balance: wallet.balance,
        transactions: wallet.transactions,
      },
    });
  } catch (error) {
    console.error('Error getting wallet:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Add money to wallet (mocked)
exports.addMoney = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid amount',
      });
    }
     if (!paymentMethod) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a payment method',
      });
    }

    const userId = req.user._id;
    const wallet = await Wallet.getWalletByUserId(userId);
     if (!wallet) {
      return res.status(404).json({
        status: 'error',
        message: 'Wallet not found for this user',
      });
    }
    const newBalance = wallet.balance + amount;
    const updatedWallet = await Wallet.updateWalletBalance(wallet._id, newBalance);

    // Mock transaction object (replace with actual transaction details)
    const transaction = {
      id: `mocked_add_money_${Date.now()}`,
      type: 'credit',
      amount,
      timestamp: new Date(),
      description: `Added money to wallet via ${paymentMethod}`,
      status: 'success', 
    };

    await Wallet.addTransactionToWallet(wallet._id, transaction);

    res.status(200).json({
      status: 'success',
      message: 'Money added successfully',
      data: {
        newBalance: updatedWallet.balance,
        transaction,
      },
    });
  } catch (error) {
    console.error('Error adding money:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Send money to another user (mocked)
exports.sendMoney = async (req, res) => {
  try {
    const { toUser, amount } = req.body;

    if (!toUser || !amount || amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a recipient and a valid amount',
      });
    }

    const senderId = req.user._id;

    const senderWallet = await Wallet.getWalletByUserId(senderId);
    if (!senderWallet) {
       return res.status(404).json({
        status: 'error',
        message: 'Sender Wallet not found',
      });
    }


    if (senderWallet.balance < amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient balance',
      });
    }

    const recipientUser = await User.findOne({ _id: toUser }); // Use your User model
    if (!recipientUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Recipient user not found',
      });
    }
    const receiverWallet = await Wallet.getWalletByUserId(toUser);
     if (!receiverWallet) {
       return res.status(404).json({
        status: 'error',
        message: 'Receiver Wallet not found',
      });
    }

    // Mock transaction
    const senderNewBalance = senderWallet.balance - amount;
    const receiverNewBalance = receiverWallet.balance + amount;

    await Wallet.updateWalletBalance(senderWallet._id, senderNewBalance);
    await Wallet.updateWalletBalance(receiverWallet._id, receiverNewBalance);

    const senderTransaction = {
      id: `mocked_send_${Date.now()}`,
      type: 'debit',
      amount,
      timestamp: new Date(),
      description: `Sent money to ${recipientUser.name}`,
      status: 'success',
    };
    const receiverTransaction = {
      id: `mocked_receive_${Date.now()}`,
      type: 'credit',
      amount,
      timestamp: new Date(),
      description: `Received money from ${req.user.name}`, 
      status: 'success',
    };

    await Wallet.addTransactionToWallet(senderWallet._id, senderTransaction);
    await Wallet.addTransactionToWallet(receiverWallet._id, receiverTransaction);

    res.status(200).json({
      status: 'success',
      message: 'Money sent successfully',
      data: {
        senderNewBalance,
        senderTransaction,
      },
    });
  } catch (error) {
    console.error('Error sending money:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Transfer funds to a linked bank account (mocked)
exports.transferToBank = async (req, res) => {
  try {
    const { amount, bankAccountId } = req.body; 

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid amount',
      });
    }
     if (!bankAccountId) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a bank account ID',
      });
    }

    const userId = req.user._id;
    const wallet = await Wallet.getWalletByUserId(userId);
    if (!wallet) {
      return res.status(404).json({
        status: 'error',
        message: 'Wallet not found',
      });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient balance',
      });
    }
    //  In real implementation, you would interact with a bank API
    const newBalance = wallet.balance - amount;
    const updatedWallet = await Wallet.updateWalletBalance(wallet._id, newBalance);

    const transaction = {
      id: `mocked_bank_transfer_${Date.now()}`,
      type: 'debit',
      amount,
      timestamp: new Date(),
      description: `Transferred to bank account ${bankAccountId}`, //  include bank account ID
      status: 'success',
    };
    await Wallet.addTransactionToWallet(wallet._id, transaction);

    res.status(200).json({
      status: 'success',
      message: 'Transfer to bank successful',
      data: { newBalance: updatedWallet.balance, transaction },
    });
  } catch (error) {
    console.error('Error transferring to bank:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// View transaction history
exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const wallet = await Wallet.getWalletByUserId(userId);

    if (!wallet) {
      return res.status(404).json({
        status: 'error',
        message: 'Wallet not found',
      });
    }
    const { page = 1, limit = 10 } = req.query; // Default page and limit
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const transactions = wallet.transactions.slice(startIndex, endIndex);
    const totalTransactions = wallet.transactions.length;

    res.status(200).json({
      status: 'success',
      data: {
        transactions,
        totalTransactions,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTransactions / limit),
      },
    });
  } catch (error) {
    console.error('Error getting transaction history:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
// Get transaction details
exports.getTransactionDetails = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user._id;

    const wallet = await Wallet.getWalletByUserId(userId);
    if (!wallet) {
      return res.status(404).json({
        status: 'error',
        message: 'Wallet not found',
      });
    }
    const transaction = wallet.transactions.find((t) => t.id === transactionId);
    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found',
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        transaction,
      },
    });
  } catch (error) {
    console.error('Error getting transaction details:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
