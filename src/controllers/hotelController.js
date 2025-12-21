const hotelService = require('../services/hotelService');

async function search(req, res, next) {
  try {
    const { destination = '', checkIn = '', checkOut = '', guests = '' } =
      req.query;

    const hotels = await hotelService.searchHotels({
      destination,
      checkIn,
      checkOut,
      guests
    });

    res.json({
      hotels,
      filters: {
        destination,
        checkIn,
        checkOut,
        guests
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const hotel = await hotelService.getHotelById(id);

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    res.json(hotel);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  search,
  getById
};
