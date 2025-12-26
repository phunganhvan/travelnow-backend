const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const { sendOtpEmail } = require('../utils/email');
const cloudinary = require('../config/cloudinary');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const RESET_PASSWORD_TOKEN_TTL_MINUTES = 10;

async function registerUser({ fullName, email, password }) {
  const allowedDomain = '@stu.ptit.edu.vn';

  if (!email || !email.toLowerCase().endsWith(allowedDomain)) {
    const error = new Error('Email không đúng định dạng, vui lòng tạo lại');
    error.status = 400;
    throw error;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Email đã tồn tại');
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ fullName, email, passwordHash });

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role
  };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Email hoặc mật khẩu không đúng');
    error.status = 400;
    throw error;
  }

  // Không cho phép tài khoản bị khóa đăng nhập
  if (user.status === 'locked' || user.isActive === false) {
    const error = new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
    error.status = 403;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Email hoặc mật khẩu không đúng');
    error.status = 400;
    throw error;
  }

  const token = jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    }
  };
}

async function requestPasswordReset({ email }) {
  const user = await User.findOne({ email });
  if (!user) {
    // Không tiết lộ email không tồn tại
    return { message: 'Nếu email tồn tại, chúng tôi đã gửi mã OTP' };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(
    Date.now() + RESET_PASSWORD_TOKEN_TTL_MINUTES * 60 * 1000
  ); // 10 phút mặc định

  await PasswordResetToken.deleteMany({ email });
  await PasswordResetToken.create({ email, otp, expiresAt });

  // Gửi email OTP thực tế
  try {
    await sendOtpEmail({ to: email, otp });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    const err = new Error('Không thể gửi email OTP. Vui lòng thử lại sau.');
    err.status = 500;
    throw err;
  }

  const response = { message: 'Đã gửi mã OTP đặt lại mật khẩu đến email của bạn' };

  // Trong môi trường dev, trả thêm debugOtp để dễ test
  if (process.env.NODE_ENV !== 'production') {
    response.debugOtp = otp;
  }

  return response;
}

async function verifyPasswordResetOtp({ email, otp }) {
  if (!email || !otp) {
    const error = new Error('Email và mã OTP là bắt buộc');
    error.status = 400;
    throw error;
  }

  const tokenDoc = await PasswordResetToken.findOne({ email, otp });
  if (!tokenDoc) {
    const error = new Error('Mã OTP không hợp lệ');
    error.status = 400;
    throw error;
  }

  if (tokenDoc.expiresAt < new Date()) {
    await PasswordResetToken.deleteMany({ email });
    const error = new Error('Mã OTP đã hết hạn');
    error.status = 400;
    throw error;
  }

  return { message: 'Xác thực OTP thành công' };
}

async function resetPassword({ email, otp, newPassword }) {
  if (!email || !otp || !newPassword) {
    const error = new Error('Email, mã OTP và mật khẩu mới là bắt buộc');
    error.status = 400;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error('Mật khẩu phải có ít nhất 6 ký tự');
    error.status = 400;
    throw error;
  }

  const tokenDoc = await PasswordResetToken.findOne({ email, otp });
  if (!tokenDoc) {
    const error = new Error('Mã OTP không hợp lệ');
    error.status = 400;
    throw error;
  }

  if (tokenDoc.expiresAt < new Date()) {
    await PasswordResetToken.deleteMany({ email });
    const error = new Error('Mã OTP đã hết hạn');
    error.status = 400;
    throw error;
  }

  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Không tìm thấy người dùng');
    error.status = 404;
    throw error;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  user.passwordHash = passwordHash;
  await user.save();

  await PasswordResetToken.deleteMany({ email });

  return { message: 'Đặt lại mật khẩu thành công' };
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('Không tìm thấy người dùng');
    error.status = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Mật khẩu hiện tại không đúng');
    error.status = 400;
    throw error;
  }

  if (!newPassword || newPassword.length < 6) {
    const error = new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  user.passwordHash = passwordHash;
  await user.save();

  return { message: 'Đổi mật khẩu thành công' };
}

async function getCurrentUser(userId) {
  const user = await User.findById(userId).select(
    'fullName email phone address dateOfBirth avatarUrl notificationEmail notificationSms role isActive createdAt updatedAt'
  );

  if (!user) {
    const error = new Error('Không tìm thấy người dùng');
    error.status = 404;
    throw error;
  }

  return user;
}

async function updateCurrentUser(userId, data) {
  const allowedFields = [
    'fullName',
    'phone',
    'address',
    'dateOfBirth',
    'avatarUrl',
    'notificationEmail',
    'notificationSms'
  ];
  const update = {};

  let uploadedAvatarUrl;

  if (data.avatarDataUrl) {
    const uploadResult = await cloudinary.uploader.upload(data.avatarDataUrl, {
      folder: 'travelnow/avatars',
      public_id: userId,
      overwrite: true
    });

    uploadedAvatarUrl = uploadResult.secure_url;
  }

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      update[field] = data[field];
    }
  }

  if (uploadedAvatarUrl) {
    update.avatarUrl = uploadedAvatarUrl;
  }

  if (update.dateOfBirth) {
    update.dateOfBirth = new Date(update.dateOfBirth);
  }

  const user = await User.findByIdAndUpdate(userId, update, {
    new: true,
    runValidators: true,
    fields: 'fullName email phone address dateOfBirth avatarUrl createdAt updatedAt'
  });

  if (!user) {
    const error = new Error('Không tìm thấy người dùng');
    error.status = 404;
    throw error;
  }

  return user;
}

module.exports = {
  registerUser,
  loginUser,
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword,
  changePassword,
  getCurrentUser,
  updateCurrentUser
};
