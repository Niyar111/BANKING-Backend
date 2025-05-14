const jwt = require('jsonwebtoken');
const { auth, db } = require('../config/firebase.js'); 
const User = require('../models/user.model');
const Wallet = require('../models/wallet.model');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Register user
exports.register = async (req, res) => {
  try {
    const { firebaseUid, name, email, phone } = req.body;

    
    if (!firebaseUid || !name || !email || !phone) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields',
      });
    }

    // Check if user already exists (using Firebase UID, email, or phone)
    const userByFirebaseUid = await User.findOne({ firebaseUid });
    const userByEmail = await User.findOne({ email });
    const userByPhone = await User.findOne({ phone });

    if (userByFirebaseUid || userByEmail || userByPhone) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists',
      });
    }

    // Get user data from Firebase Auth
     const firebaseUser = await auth.getUser(firebaseUid);
      if (!firebaseUser) {
        return res.status(400).json({ status: 'error', message: 'Invalid Firebase UID' });
      }

    // Create user in your Firestore database
    const newUser = await User.create({
      firebaseUid,
      name,
      email,
      phone,
      
    });

    // Create wallet for the user (if you have a Wallet model)
    await Wallet.createWalletForUser(newUser._id); 

    // Generate token
    const token = generateToken(newUser._id);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        token,
        user: {
          _id: newUser._id,
          name,
          email,
          phone,
          kycVerified: false, 
          profilePicture: null,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Login user with Firebase UID
exports.login = async (req, res) => {
  try {
    const { firebaseUid } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide Firebase UID',
      });
    }

    // Find user by Firebase UID in your Firestore database
    const user = await User.findOne({ firebaseUid }); // Use your User model

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          kycVerified: user.kycVerified,
          profilePicture: user.profilePicture,
          
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    
    const user = await User.findById(req.user._id); 

     if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          kycVerified: user.kycVerified,
          kycDetails: user.kycDetails,
          profilePicture: user.profilePicture,
          notificationPreferences: user.notificationPreferences,
          darkMode: user.darkMode,
        },
      },
    });
  } catch (error) {
     console.error("Get current user error:", error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Set transaction PIN
exports.setPin = async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid 4-digit PIN',
      });
    }

    // Update user with new PIN
    await User.findByIdAndUpdate(req.user._id, { pin }); 

    res.status(200).json({
      status: 'success',
      message: 'PIN set successfully',
    });
  } catch (error) {
     console.error("Set PIN error:", error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Submit KYC details
exports.submitKyc = async (req, res) => {
  try {
    const { pan, aadhar, photoIdUrl } = req.body;

    if (!pan || !aadhar || !photoIdUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required KYC details',
      });
    }

    // Update user with KYC details
    const updatedUser = await User.findByIdAndUpdate(req.user._id, {  
      kycDetails: {
        pan,
        aadhar,
        photoIdUrl,
        status: 'pending',
      },
    });

     if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'KYC details submitted successfully',
    });
  } catch (error) {
    console.error("Submit KYC error:", error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

//  Add other controller functions (e.g., resetPassword, verifyEmail, logout)
