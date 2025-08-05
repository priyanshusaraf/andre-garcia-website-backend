const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('Auth middleware - authHeader:', authHeader);
  console.log('Auth middleware - token:', token ? 'present' : 'missing');
  
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Auth middleware - token verification failed:', err.message);
      return res.status(403).json({ message: 'Invalid token' });
    }
    console.log('Auth middleware - token verified, user:', user);
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  console.log('Admin middleware - user:', req.user);
  console.log('Admin middleware - is_admin:', req.user?.is_admin);
  console.log('Admin middleware - is_super_admin:', req.user?.is_super_admin);
  
  if (!req.user || (!req.user.is_admin && !req.user.is_super_admin)) {
    console.log('Admin access denied');
    return res.status(403).json({ message: 'Admin access required' });
  }
  console.log('Admin access granted');
  next();
}

function requireSuperAdmin(req, res, next) {
  if (!req.user || !req.user.is_super_admin) {
    return res.status(403).json({ message: 'Super admin access required' });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin, requireSuperAdmin }; 