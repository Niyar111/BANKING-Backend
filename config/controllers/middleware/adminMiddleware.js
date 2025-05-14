const adminMiddleware = (req, res, next) => {
  // Check if the user is authenticated
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: Please log in',
    });
  }

  
  if (req.user.role === 'admin') {
    next(); 
  } else {
    return res.status(403).json({
      status: 'error',
      message: 'Forbidden: Admin access required',
    });
  }
};

module.exports = { adminMiddleware };
