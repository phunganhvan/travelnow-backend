const bcrypt = require('bcrypt');
const User = require('../../models/User');
const cloudinary = require('../../config/cloudinary');

function sanitizeUser(userDoc) {
  if (!userDoc) return null;
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete user.passwordHash;
  return user;
}

async function listUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users: users.map(sanitizeUser) });
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const { fullName, email, password, role = 'user' } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    if (role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Chỉ Super Admin mới được phép tạo tài khoản Super Admin' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, passwordHash, role });

    res.status(201).json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const {
      fullName,
      phone,
      address,
      dateOfBirth,
      role,
      isActive,
      status,
      password,
      avatarUrl,
      avatarDataUrl
    } = req.body;

    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (existingUser.role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Admin không được phép chỉnh sửa tài khoản Super Admin' });
    }

    const isSelf = existingUser._id.toString() === req.user.id;

    const update = {};
    if (fullName !== undefined) update.fullName = fullName;
    if (phone !== undefined) update.phone = phone;
    if (address !== undefined) update.address = address;
    if (dateOfBirth !== undefined) update.dateOfBirth = new Date(dateOfBirth);
    if (role !== undefined) {
      if (role === 'superadmin' && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Chỉ Super Admin mới được phép gán quyền Super Admin' });
      }
      update.role = role;
    }
    if (isActive !== undefined) {
      update.isActive = isActive;
      // Đồng bộ status nếu có isActive
      if (status === undefined) {
        update.status = isActive ? 'active' : 'locked';
      }
    }
    if (status !== undefined) {
      if (!['active', 'locked'].includes(status)) {
        return res.status(400).json({ message: 'Trạng thái tài khoản không hợp lệ' });
      }
      update.status = status;
      if (isActive === undefined) {
        update.isActive = status === 'active';
      }
    }
    if (avatarUrl !== undefined) update.avatarUrl = avatarUrl;

    let uploadedAvatarUrl;

    if (avatarDataUrl) {
      const uploadResult = await cloudinary.uploader.upload(avatarDataUrl, {
        folder: 'travelnow/avatars',
        public_id: existingUser._id.toString(),
        overwrite: true
      });

      uploadedAvatarUrl = uploadResult.secure_url;
    }

    // Admin/Super Admin có thể đổi mật khẩu người dùng mà không cần mật khẩu cũ
    if (password && typeof password === 'string') {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
      }

      if (req.user.role === 'superadmin') {
        // Super Admin được phép đổi mật khẩu cho tất cả, kể cả chính mình
        const passwordHash = await bcrypt.hash(password, 10);
        update.passwordHash = passwordHash;
      } else if (req.user.role === 'admin') {
        if (isSelf) {
          return res.status(403).json({ message: 'Admin không được phép tự đổi mật khẩu tại trang quản trị. Vui lòng dùng chức năng đổi mật khẩu cá nhân.' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        update.passwordHash = passwordHash;
      } else {
        return res.status(403).json({ message: 'Chỉ Admin hoặc Super Admin mới được phép đổi mật khẩu người dùng' });
      }
    }

    if (uploadedAvatarUrl) {
      update.avatarUrl = uploadedAvatarUrl;
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Admin không được phép xóa tài khoản Super Admin' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa người dùng thành công' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
};
