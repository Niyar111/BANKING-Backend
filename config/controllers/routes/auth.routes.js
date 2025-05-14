const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateRegistration, validateLogin } = require('../middleware/validation.middleware'); 

router.post('/register', validateRegistration, authController.register); 
router.post('/login', validateLogin, authController.login); 
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/logout', authController.logout);
router.post('/resend-otp', authController.resendOtp);

router.use(protect); 
router.get('/me', authController.getCurrentUser);
router.post('/security/pin', authController.setPin);
router.post('/kyc/submit', authController.submitKyc);

// router.post('/password/reset', authController.resetPassword);
// router.post('/email/verify', authController.verifyEmail);
// router.post('/logout', authController.logout);

module.exports = router;
