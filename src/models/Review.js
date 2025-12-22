const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'hotel',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    // Điểm trung bình (tự động tính từ 5 hạng mục bên dưới)
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    // 5 hạng mục chi tiết
    cleanliness: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    amenities: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    location: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    service: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    valueForMoney: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Mỗi người dùng chỉ đánh giá một lần cho mỗi khách sạn (có thể cập nhật)
reviewSchema.index({ hotel: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('review', reviewSchema);
