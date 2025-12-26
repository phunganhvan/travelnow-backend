const mongoose = require('mongoose');

const userActionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    actionType: {
      type: String,
      enum: ['login', 'view_hotel', 'book_trip'],
      required: true,
      index: true
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: { createdAt: 'timestamp', updatedAt: false }
  }
);

module.exports = mongoose.model('UserAction', userActionSchema);
