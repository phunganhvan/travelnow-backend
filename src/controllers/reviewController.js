const Hotel = require('../models/Hotel');
const Review = require('../models/Review');

async function calculateHotelReviewSummary(hotelObjectId) {
  const stats = await Review.aggregate([
    { $match: { hotel: hotelObjectId } },
    {
      $group: {
        _id: '$hotel',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        avgCleanliness: { $avg: '$cleanliness' },
        avgAmenities: { $avg: '$amenities' },
        avgLocation: { $avg: '$location' },
        avgService: { $avg: '$service' },
        avgValueForMoney: { $avg: '$valueForMoney' }
      }
    }
  ]);

  if (!stats.length) {
    return {
      averageRating: 0,
      totalReviews: 0,
      criteria: {
        cleanliness: 0,
        amenities: 0,
        location: 0,
        service: 0,
        valueForMoney: 0
      }
    };
  }

  const s = stats[0];
  return {
    averageRating: s.averageRating || 0,
    totalReviews: s.totalReviews || 0,
    criteria: {
      cleanliness: s.avgCleanliness || 0,
      amenities: s.avgAmenities || 0,
      location: s.avgLocation || 0,
      service: s.avgService || 0,
      valueForMoney: s.avgValueForMoney || 0
    }
  };
}

async function getHotelReviews(req, res, next) {
  try {
    const { id: hotelId } = req.params;

    const hotel = await Hotel.findById(hotelId).select('_id');
    if (!hotel) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn' });
    }

    const reviews = await Review.find({ hotel: hotel._id })
      .sort({ createdAt: -1 })
      .populate('user', 'fullName email avatarUrl');

    const summary = await calculateHotelReviewSummary(hotel._id);

    res.json({ summary, reviews });
  } catch (error) {
    next(error);
  }
}

async function createOrUpdateReview(req, res, next) {
  try {
    const { id: hotelId } = req.params;
    const userId = req.user && req.user.id;
    const {
      cleanliness,
      amenities,
      location,
      service,
      valueForMoney,
      comment
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập để đánh giá khách sạn' });
    }

    const rawScores = {
      cleanliness,
      amenities,
      location,
      service,
      valueForMoney
    };

    const numericScores = {};
    for (const [key, value] of Object.entries(rawScores)) {
      const num = Number(value);
      if (!num || num < 1 || num > 5) {
        return res.status(400).json({
          message: 'Vui lòng đánh giá đầy đủ 5 hạng mục với số sao từ 1 đến 5.'
        });
      }
      numericScores[key] = num;
    }

    const overallRating =
      Object.values(numericScores).reduce((sum, v) => sum + v, 0) /
      Object.values(numericScores).length;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn' });
    }

    let review = await Review.findOne({ hotel: hotel._id, user: userId });

    const basePayload = {
      rating: overallRating,
      cleanliness: numericScores.cleanliness,
      amenities: numericScores.amenities,
      location: numericScores.location,
      service: numericScores.service,
      valueForMoney: numericScores.valueForMoney,
      comment: comment ? String(comment).trim() : ''
    };

    if (!review) {
      review = await Review.create({
        hotel: hotel._id,
        user: userId,
        ...basePayload
      });
    } else {
      Object.assign(review, basePayload);
      await review.save();
    }

    // Tính lại điểm trung bình và số lượng đánh giá cho khách sạn (bao gồm 5 hạng mục)
    const summary = await calculateHotelReviewSummary(hotel._id);

    hotel.rating = summary.averageRating;
    hotel.reviewCount = summary.totalReviews;
    await hotel.save();

    const populatedReview = await Review.findById(review._id).populate(
      'user',
      'fullName email avatarUrl'
    );

    res.status(201).json({
      message: 'Gửi đánh giá thành công',
      review: populatedReview,
      summary
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHotelReviews,
  createOrUpdateReview
};
