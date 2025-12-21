const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role || 'user'
    };
    console.log('OptionalAuth: User identified', req.user.id);
  } catch (error) {
    console.log('OptionalAuth: Token verification failed', error.message);
    // Token invalid or expired, treat as guest
    req.user = null;
  }
  next();
}

module.exports = optionalAuthMiddleware;
