require('dotenv').config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');

async function main() {
  try {
    await connectDB();

    const email = process.env.SEED_ADMIN_EMAIL || 'admin@travelnow.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

    let user = await User.findOne({ email });

    if (user) {
      if (user.role !== 'superadmin') {
        user.role = 'superadmin';
        user.isActive = true;
        await user.save();
        console.log(`Đã nâng cấp user ${email} thành superadmin.`);
      } else {
        console.log(`User ${email} đã là superadmin sẵn.`);
      }
    } else {
      const passwordHash = await bcrypt.hash(password, 10);
      user = await User.create({
        fullName: 'Default Admin',
        email,
        passwordHash,
        role: 'superadmin',
        isActive: true
      });
      console.log('Đã tạo tài khoản superadmin mới:');
      console.log(`  Email: ${email}`);
      console.log(`  Mật khẩu: ${password}`);
    }
  } catch (err) {
    console.error('Lỗi khi tạo/nâng cấp admin:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
