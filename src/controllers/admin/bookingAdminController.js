const Booking = require('../../models/Booking');

async function listBookings(req, res, next) {
  try {
    const bookings = await Booking.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
}

async function getBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id).populate('user', 'fullName email');
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt phòng' });
    }
    res.json({ booking });
  } catch (error) {
    next(error);
  }
}

async function updateBookingStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'fullName email');

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt phòng' });
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
}

async function deleteBooking(req, res, next) {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt phòng' });
    }
    res.json({ message: 'Xóa đặt phòng thành công' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listBookings,
  getBooking,
  updateBookingStatus,
  deleteBooking
};
