const mongoose = require('mongoose');

const knowledgeSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true, // Ví dụ: "Chính sách hủy phòng", "Quy định check-in"
  },
  content: {
    type: String,
    required: true, // Nội dung chi tiết
  },
  embedding: {
    type: [Number], // Mảng số vector (Gemini trả về 768 chiều)
    required: true,
    index: true, // Quan trọng cho vector search
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Knowledge', knowledgeSchema);
