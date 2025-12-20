const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String },
    description: { type: String },
    pricePerNight: { type: Number, required: true },
    currency: { type: String },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    distanceFromCenterKm: { type: Number, default: 0 },
    imageUrl: { type: String },
    tags: [{ type: String }],
    amenities: [{ type: String }]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('hotel', hotelSchema);
