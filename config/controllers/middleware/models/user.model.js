const { db } = require('../config/firebase');

const usersCollection = db.collection('users');

const User = {
  create: async (userData) => {
    try {
      const docRef = await usersCollection.add(userData);
      const newUser = await docRef.get();
      return { _id: newUser.id, ...newUser.data() };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error; 
    }
  },
  findOne: async (query) => {
    try {
      let snapshot;
        if (query.firebaseUid) {
            snapshot = await usersCollection.where('firebaseUid', '==', query.firebaseUid).limit(1).get();
        } else if (query.email) {
            snapshot = await usersCollection.where('email', '==', query.email).limit(1).get();
        } else if (query.phone) {
            snapshot = await usersCollection.where('phone', '==', query.phone).limit(1).get();
        } else if (query._id) { 
            const doc = await usersCollection.doc(query._id).get(); 
             if (!doc.exists) {
                return null;
             }
             return { _id: doc.id, ...doc.data() };
        }
        else{
          return null;
        }

      if (snapshot && !snapshot.empty) {
        const userDoc = snapshot.docs[0];
        return { _id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error finding user:", error);
      throw error;
    }
  },
  findById: async (id) => {
    try {
      const doc = await usersCollection.doc(id).get();
      if (!doc.exists) return null;
      return { _id: doc.id, ...doc.data() };
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  },
  findByIdAndUpdate: async (id, updates) => {
    try {
      const userRef = usersCollection.doc(id);
      await userRef.update(updates);
      const updatedDoc = await userRef.get();
      if (!updatedDoc.exists) return null;
      return { _id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },
};

module.exports = User;
