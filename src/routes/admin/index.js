const express = require('express');
const { requireRoles } = require('../../middlewares/adminMiddleware');
const userAdminController = require('../../controllers/admin/userAdminController');
const hotelAdminController = require('../../controllers/admin/hotelAdminController');
const bookingAdminController = require('../../controllers/admin/bookingAdminController');
const voucherAdminController = require('../../controllers/admin/voucherAdminController');
const statsAdminController = require('../../controllers/admin/statsAdminController');

const router = express.Router();

// User management - only superadmin/admin
router.get('/users', requireRoles('superadmin', 'admin'), userAdminController.listUsers);
router.get('/users/:id', requireRoles('superadmin', 'admin'), userAdminController.getUser);
router.post('/users', requireRoles('superadmin', 'admin'), userAdminController.createUser);
router.put('/users/:id', requireRoles('superadmin', 'admin'), userAdminController.updateUser);
router.delete('/users/:id', requireRoles('superadmin', 'admin'), userAdminController.deleteUser);

// Hotel management - superadmin/admin/manager/staff
router.get('/hotels', requireRoles('superadmin', 'admin', 'manager', 'staff'), hotelAdminController.listHotels);
router.get('/hotels/:id', requireRoles('superadmin', 'admin', 'manager', 'staff'), hotelAdminController.getHotel);
router.post('/hotels', requireRoles('superadmin', 'admin', 'manager', 'staff'), hotelAdminController.createHotel);
router.put('/hotels/:id', requireRoles('superadmin', 'admin', 'manager', 'staff'), hotelAdminController.updateHotel);
router.delete('/hotels/:id', requireRoles('superadmin', 'admin', 'manager', 'staff'), hotelAdminController.deleteHotel);

// Booking management - superadmin/admin/manager/staff
router.get('/bookings', requireRoles('superadmin', 'admin', 'manager', 'staff'), bookingAdminController.listBookings);
router.get('/bookings/:id', requireRoles('superadmin', 'admin', 'manager', 'staff'), bookingAdminController.getBooking);
router.put('/bookings/:id/status', requireRoles('superadmin', 'admin', 'manager', 'staff'), bookingAdminController.updateBookingStatus);
router.delete('/bookings/:id', requireRoles('superadmin', 'admin', 'manager', 'staff'), bookingAdminController.deleteBooking);

// Voucher management - superadmin/admin/manager/staff
router.get('/vouchers', requireRoles('superadmin', 'admin', 'manager', 'staff'), voucherAdminController.listVouchers);
router.get('/vouchers/:id', requireRoles('superadmin', 'admin', 'manager', 'staff'), voucherAdminController.getVoucher);
router.post('/vouchers', requireRoles('superadmin', 'admin', 'manager', 'staff'), voucherAdminController.createVoucher);
router.put('/vouchers/:id', requireRoles('superadmin', 'admin', 'manager', 'staff'), voucherAdminController.updateVoucher);
router.delete('/vouchers/:id', requireRoles('superadmin', 'admin', 'manager', 'staff'), voucherAdminController.deleteVoucher);

// Dashboard statistics - all admin-like roles
router.get('/stats', requireRoles('superadmin', 'admin', 'manager', 'staff'), statsAdminController.getStats);

module.exports = router;
