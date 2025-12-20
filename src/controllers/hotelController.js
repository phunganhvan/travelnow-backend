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

module.exports = {
  search
};
