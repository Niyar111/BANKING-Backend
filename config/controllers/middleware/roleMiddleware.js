const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    // Check if the user's role is in the allowedRoles array
    if (req.user && allowedRoles.includes(req.user.role)) {
      next(); 
    } else {
      res.status(403).json({ 
        status: 'error',
        message: 'Forbidden: Insufficient permissions',
      });
    }
  };
};

module.exports = { roleMiddleware };
