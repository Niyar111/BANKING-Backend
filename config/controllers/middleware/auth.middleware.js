const { auth, db } = require('../config/firebase.js');

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: No token provided',
      });
    }

    try{
      const decodedToken = await auth.verifyIdToken(token);
      req.user = decodedToken; // Attach user info to the request
    }
    catch(error){
       return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: Invalid token',
      });
    }


    //  Optionally, you can also check if the user exists in your Firestore database
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: User not found',
      });
    }

    next(); 
  } catch (error) {
    console.error('Error in protect middleware:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

module.exports = { protect };
