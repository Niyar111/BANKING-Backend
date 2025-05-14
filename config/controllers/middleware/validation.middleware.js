const { body, validationResult } = require('express-validator');

// Middleware for validating user registration data
exports.validateRegistration = [
  
  body('firebaseUid').notEmpty().withMessage('Firebase UID is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: errors.array(), 
      });
    }
    next();
  },
];


exports.validateLogin = [
  
  body('firebaseUid').notEmpty().withMessage('Firebase UID is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: errors.array(),
      });
    }
    next();
  },
];
