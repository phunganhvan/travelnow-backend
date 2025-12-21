function requireRoles(...allowedRoles) {
  return function roleMiddleware(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập để truy cập tài nguyên này' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập tài nguyên này' });
    }

    next();
  };
}

module.exports = {
  requireRoles
};
