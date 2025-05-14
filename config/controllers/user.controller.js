const User = require('../models/user.model'); // Import your User model
const Wallet = require('../models/wallet.model');
const { auth, db } = require('../config/firebase');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    // The user's data is already attached to the request in the 'protect' middleware (req.user)
    const user = await User.findById(req.user._id); // Use your User model

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
    console.error('Error getting user profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    //  Basic validation
    if (!name || !email || !phone) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields',
      });
    }
    // Find and update
    const updatedUser = await User.findByIdAndUpdate(req.user._id, { name, email, phone }); // Use your User model

    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }
    // Fetch the updated user data to return
    const user = await User.findById(req.user._id);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Basic validation
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide old and new passwords',
      });
    }

    const user = await User.findById(req.user._id);
     if (!user) {
          return res.status(404).json({ status: 'error', message: 'User not found' });
     }

    // Use Firebase Auth to re-authenticate and change password
    const firebaseUser = await auth.getUser(req.user.uid); // Get Firebase user
    //  There is no direct way to verify password with firebase admin, client side verification is needed
    //   You can check the old password with client and send new password to backend
    try {
      await auth.updateUser(firebaseUser.uid, {
        password: newPassword,
      });
    } catch (firebaseError) {
        console.error("Firebase error: ", firebaseError)
        return res.status(400).json({ status: 'error', message: 'Invalid old password' });
    }


    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Add payment method (mocked for now)
exports.addPaymentMethod = async (req, res) => {
  try {
    //  In a real implementation, you would interact with a payment gateway (e.g., Stripe, PayPal)
    //  For this mock, we'll just simulate success
    const { type, details } = req.body;
        if (!type || !details) {
             return res.status(400).json({ status: 'error', message: 'Please provide payment type and details' });
        }
    const user = await User.findById(req.user._id);
    if (!user) {
         return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    const paymentMethod = {
      id: `mocked_${Date.now()}`, //  Generate a unique ID (in real, it will be provider ID)
      type,
      details,
    };

    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      $push: { paymentMethods: paymentMethod },
    });
     if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Payment method added successfully',
      data: { paymentMethod },
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Remove payment method (mocked for now)
exports.removePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user._id);
     if (!user) {
          return res.status(404).json({ status: 'error', message: 'User not found' });
     }
    // In a real implementation, you would interact with a payment gateway.
    // For this mock, we'll just simulate success
    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      $pull: { paymentMethods: { id } },
    });
     if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Payment method removed successfully',
    });
  } catch (error) {
    console.error('Error removing payment method:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    //  This route should only be accessible to admin users (handled by middleware)
    const users = await User.find(); // Use your User model
    res.status(200).json({
      status: 'success',
      data: { users },
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Get KYC status
exports.getKycStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        kycStatus: user.kycDetails?.status || 'not started', //  default
        kycDetails: user.kycDetails || {},
      },
    });
  } catch (error) {
    console.error('Error getting KYC status:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
// Submit KYC information
exports.submitKyc = async (req, res) => {
  try {
    const { pan, aadhar, photoIdUrl } = req.body;

    if (!pan || !aadhar || !photoIdUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required KYC details',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      kycDetails: {
        pan,
        aadhar,
        photoIdUrl,
        status: 'pending', // Set initial status
      },
    });
    if (!updatedUser) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'KYC information submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting KYC:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// Verify KYC (Admin/Staff) -  Mark KYC as verified.
exports.verifyKyc = async (req, res) => {
  try {
    const { userId } = req.body; // Get the user ID from the request

    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
      'kycDetails.status': 'verified',
    });
    if (!updatedUser) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json({ status: 'success', message: 'KYC verified' });
  } catch (error) {
    console.error('Error verifying KYC:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// Approve KYC (Admin/Staff)
exports.approveKyc = async (req, res) => {
  try {
    const { userId } = req.body;

     if (!userId) {
      return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
      'kycDetails.status': 'approved',
    });
     if (!updatedUser) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json({ status: 'success', message: 'KYC approved' });
  } catch (error) {
    console.error('Error approving KYC:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// Reject KYC (Admin/Staff)
exports.rejectKyc = async (req, res) => {
  try {
    const { userId, rejectionReason } = req.body;

    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }
     if (!rejectionReason) {
      return res.status(400).json({ status: 'error', message: 'Rejection Reason is required' });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
      'kycDetails.status': 'rejected',
      'kycDetails.rejectionReason': rejectionReason,
    });
     if (!updatedUser) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json({ status: 'success', message: 'KYC rejected' });
  } catch (error) {
    console.error('Error rejecting KYC:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// Resubmit KYC (User)
exports.resubmitKyc = async (req, res) => {
  try {
    const { pan, aadhar, photoIdUrl } = req.body;

    if (!pan || !aadhar || !photoIdUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required KYC details',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      kycDetails: {
        pan,
        aadhar,
        photoIdUrl,
        status: 'pending', // Reset status to pending
        rejectionReason: null, // Clear rejection reason
      },
    });
     if (!updatedUser) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json({ status: 'success', message: 'KYC information resubmitted' });
  } catch (error) {
    console.error('Error resubmitting KYC:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// Verify KYC OTP
exports.verifyKycOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ status: 'error', message: 'OTP is required' });
    }
    //  In real implementation, you will verify OTP.  This is placeholder.
    const user = await User.findById(req.user._id);
     if (!user) {
          return res.status(404).json({ status: 'error', message: 'User not found' });
     }

    // Mock OTP verification (replace with actual OTP verification logic)
    if (otp === '123456') {
      // Update KYC status
      await User.findByIdAndUpdate(req.user._id, { 'kycDetails.status': 'verified' });
      return res.status(200).json({ status: 'success', message: 'KYC OTP verified' });
    } else {
      return res.status(400).json({ status: 'error', message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Error verifying KYC OTP:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// Resend KYC OTP
exports.resendKycOtp = async (req, res) => {
  try {
    
    const user = await User.findById(req.user._id);
     if (!user) {
          return res.status(404).json({ status: 'error', message: 'User not found' });
     }
    // Mock OTP resend (replace with actual OTP resend logic)
    console.log('Resending KYC OTP to user:', req.user._id);
    res.status(200).json({ status: 'success', message: 'KYC OTP resent' });
  } catch (error) {
    console.error('Error resending KYC OTP:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// Verify KYC Email
exports.verifyKycEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ status: 'error', message: 'Token is required' });
    }
     const user = await User.findById(req.user._id);
     if (!user) {
          return res.status(404).json({ status: 'error', message: 'User not found' });
     }
    
    // Mock email verification
    if (token === 'valid-token') {
      await User.findByIdAndUpdate(req.user._id, { 'kycDetails.status': 'verified' });
      return res.status(200).json({ status: 'success', message: 'KYC Email verified' });
    } else {
      return res.status(400).json({ status: 'error', message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Error verifying KYC email:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};


exports.resendKycEmail = async (req, res) => {
  try {
     const user = await User.findById(req.user._id);
     if (!user) {
          return res.status(404).json({ status: 'error', message: 'User not found' });
     }
    // Mock resend
    console.log('Resending KYC Email to user:', req.user._id);
    res.status(200).json({ status: 'success', message: 'KYC Email resent' });
  } catch (error) {
    console.error('Error resending KYC email:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
