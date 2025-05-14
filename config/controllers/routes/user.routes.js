const express = require('express');
    const router = express.Router();
    const userController = require('../controllers/user.controller');
    const { protect } = require('../middleware/auth.middleware');
    const { roleMiddleware } = require('../middleware/roleMiddleware'); // Import roleMiddleware
    const { adminMiddleware } = require('../middleware/adminMiddleware'); // Import adminMiddleware

    // Apply protect middleware to secure these routes
    router.use(protect);

    // User Profile Routes
    router.get('/me', userController.getUserProfile);
    router.put('/me', userController.updateUserProfile);
    router.post('/change-password', userController.changePassword);

    // KYC Routes
    router.post('/me/kyc', userController.submitKyc);
    router.get('/me/kyc', userController.getKycStatus);
    router.post('/me/kyc/resubmit', userController.resubmitKyc);
    router.post('/me/kyc/verify', roleMiddleware(['admin', 'staff']), userController.verifyKyc);
    router.post('/me/kyc/approve', roleMiddleware(['admin', 'staff']), userController.approveKyc);
    router.post('/me/kyc/reject', roleMiddleware(['admin', 'staff']), userController.rejectKyc);
    router.post('/me/kyc/verify-otp', userController.verifyKycOtp);
    router.post('/me/kyc/resend-otp', userController.resendKycOtp);
    router.post('/me/kyc/verify-email', userController.verifyKycEmail);
    router.post('/me/kyc/resend-email', userController.resendKycEmail);

    // Payment Method Routes
    router.post('/payment-method', userController.addPaymentMethod);
    router.delete('/payment-method/:id', userController.removePaymentMethod);

    // Get all users (Admin only)
    router.get('/', adminMiddleware, userController.getAllUsers); // Apply adminMiddleware here

    module.exports = router;