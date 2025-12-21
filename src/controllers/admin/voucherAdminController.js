const Voucher = require('../../models/Voucher');

async function listVouchers(req, res, next) {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.json({ vouchers });
  } catch (error) {
    next(error);
  }
}

async function getVoucher(req, res, next) {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ message: 'Không tìm thấy voucher' });
    }
    res.json({ voucher });
  } catch (error) {
    next(error);
  }
}

async function createVoucher(req, res, next) {
  try {
    const voucher = await Voucher.create(req.body);
    res.status(201).json({ voucher });
  } catch (error) {
    next(error);
  }
}

async function updateVoucher(req, res, next) {
  try {
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!voucher) {
      return res.status(404).json({ message: 'Không tìm thấy voucher' });
    }

    res.json({ voucher });
  } catch (error) {
    next(error);
  }
}

async function deleteVoucher(req, res, next) {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) {
      return res.status(404).json({ message: 'Không tìm thấy voucher' });
    }

    res.json({ message: 'Xóa voucher thành công' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listVouchers,
  getVoucher,
  createVoucher,
  updateVoucher,
  deleteVoucher
};
