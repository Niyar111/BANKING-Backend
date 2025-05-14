const { db } = require('../config/firebase');

const walletsCollection = db.collection('wallets');

const Wallet = {
  createWalletForUser: async (userId) => {
    try {
      const newWallet = {
        userId,
        balance: 0,
        transactions: [], 
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      const docRef = await walletsCollection.add(newWallet);
      const wallet = await docRef.get();
      return { _id: docRef.id, ...wallet.data() };
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  },

  getWalletByUserId: async (userId) => {
    try {
      const snapshot = await walletsCollection.where('userId', '==', userId).limit(1).get();
      if (snapshot.empty) {
        return null;
      }
      const walletDoc = snapshot.docs[0];
      return { _id: walletDoc.id, ...walletDoc.data() };
    } catch (error) {
      console.error('Error getting wallet by user ID:', error);
      throw error;
    }
  },

  updateWalletBalance: async (walletId, newBalance) => {
    try {
      const walletRef = walletsCollection.doc(walletId);
      await walletRef.update({ balance: newBalance });
      const updatedWallet = await walletRef.get();
      return { _id: updatedWallet.id, ...updatedWallet.data() };
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      throw error;
    }
  },

  addTransactionToWallet: async (walletId, transaction) => {
    try {
      const walletRef = walletsCollection.doc(walletId);
      await walletRef.update({
        transactions: admin.firestore.FieldValue.arrayUnion(transaction),
      });
       const updatedWallet = await walletRef.get();
      return { _id: updatedWallet.id, ...updatedWallet.data() };
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },
    getWalletById: async (walletId) => {
    try {
      const doc = await walletsCollection.doc(walletId).get();
      if (!doc.exists) return null;
      return { _id: doc.id, ...doc.data() };
    } catch (error) {
      console.error("Error finding wallet by ID:", error);
      throw error;
    }
  },
};

module.exports = Wallet;
