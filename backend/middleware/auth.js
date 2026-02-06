const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Allow anonymous users with session ID
function authenticateAnonymous(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // If no token, generate anonymous session
  if (!token) {
    req.user = {
      isAnonymous: true,
      sessionId: crypto.randomUUID()
    };
    return next();
  }

  // If token provided, verify it
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // If invalid token, treat as anonymous
      req.user = {
        isAnonymous: true,
        sessionId: crypto.randomUUID()
      };
      return next();
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken, authenticateAnonymous };
