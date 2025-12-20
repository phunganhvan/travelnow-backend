const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const { fullName, email, password } = req.body;
    const user = await authService.registerUser({ fullName, email, password });
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const data = await authService.loginUser({ email, password });
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordReset({ email });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyPasswordResetOtp({ email, otp });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPassword({ email, otp, newPassword });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

async function updateMe(req, res, next) {
  try {
    const user = await authService.updateCurrentUser(req.user.id, req.body);
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getMe,
  updateMe
};
