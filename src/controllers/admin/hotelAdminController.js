const Hotel = require('../../models/Hotel');

async function listHotels(req, res, next) {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 });
    res.json({ hotels });
  } catch (error) {
    next(error);
  }
}

async function getHotel(req, res, next) {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn' });
    }
    res.json({ hotel });
  } catch (error) {
    next(error);
  }
}

async function createHotel(req, res, next) {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json({ hotel });
  } catch (error) {
    next(error);
  }
}

async function updateHotel(req, res, next) {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!hotel) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn' });
    }

    res.json({ hotel });
  } catch (error) {
    next(error);
  }
}

async function deleteHotel(req, res, next) {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn' });
    }

    res.json({ message: 'Xóa khách sạn thành công' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel
};
