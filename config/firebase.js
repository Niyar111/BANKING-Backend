const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error);
  //  Handle error as needed,  process.exit(1) if initialization is critical
}

const auth = admin.auth();
const db = admin.firestore();

module.exports = { auth, db };
//  You can now use `auth` and `db` in your other modules
//  For example, in your user model, you can import them like this: