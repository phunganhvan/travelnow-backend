const User = require('../../models/User');
const Hotel = require('../../models/Hotel');
const Booking = require('../../models/Booking');
const Voucher = require('../../models/Voucher');

async function getStats(req, res, next) {
  try {
    const [
      totalHotels,
      totalUsers,
      totalAdmins,
      totalVouchers,
      totalBookings
    ] = await Promise.all([
      Hotel.countDocuments({}),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: { $in: ['admin', 'superadmin', 'manager', 'staff'] } }),
      Voucher.countDocuments({}),
      Booking.countDocuments({})
    ]);

    res.json({
      totalHotels,
      totalUsers,
      totalAdmins,
      totalVouchers,
      totalBookings
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStats
};
