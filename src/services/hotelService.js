const Hotel = require('../models/Hotel');

async function searchHotels({ destination, checkIn, checkOut, guests }) {
  const query = {};

  if (destination) {
    const regex = new RegExp(destination.trim(), 'i');
    query.$or = [{ city: regex }, { name: regex }];
  }

  const hotels = await Hotel.find(query).limit(50).lean();

  return hotels;
}

module.exports = {
  searchHotels
};
