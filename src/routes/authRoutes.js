const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

// POST /user/register
router.post('/register', authController.register);

// POST /user/login
router.post('/login', authController.login);

// POST /user/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// POST /user/forgot-password/verify-otp
router.post('/forgot-password/verify-otp', authController.verifyOtp);

// POST /user/reset-password
router.post('/reset-password', authController.resetPassword);

// GET /user/me - thông tin người dùng hiện tại
router.get('/me', authMiddleware, authController.getMe);

// PUT /user/me - cập nhật thông tin người dùng hiện tại
router.put('/me', authMiddleware, authController.updateMe);

// POST /user/change-password - đổi mật khẩu
router.post('/change-password', authMiddleware, userController.changePassword);

module.exports = router;
