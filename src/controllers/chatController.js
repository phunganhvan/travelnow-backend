const ChatMessage = require('../models/ChatMessage');
const Knowledge = require('../models/Knowledge');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user ? req.user.id : null;
    console.log('Chat request from userId:', userId);

    // 1. Save user message if logged in
    if (userId) {
      await ChatMessage.create({ userId, message, sender: 'user' });
    }
    
    let reply = "";

    if (process.env.GEMINI_API_KEY) {
      try {
        // 2. Tạo embedding cho câu hỏi của người dùng
        const embeddingResult = await embeddingModel.embedContent(message);
        const userEmbedding = embeddingResult.embedding.values;

        // 3. Tìm kiếm thông tin liên quan trong Database (Vector Search)
        // Lưu ý: Để chạy được đoạn này, bạn cần tạo Search Index trên MongoDB Atlas
        const relevantDocs = await Knowledge.aggregate([
          {
            "$vectorSearch": {
              "index": "vector_index", // Tên index bạn đặt trên Atlas
              "path": "embedding",
              "queryVector": userEmbedding,
              "numCandidates": 100,
              "limit": 3
            }
          },
          {
            "$project": {
              "_id": 0,
              "content": 1,
              "topic": 1,
              "score": { "$meta": "vectorSearchScore" }
            }
          }
        ]);

        // 4. Xây dựng ngữ cảnh (Context) từ dữ liệu tìm được
        let context = "";
        if (relevantDocs.length > 0) {
          context = relevantDocs.map(doc => `- ${doc.topic}: ${doc.content}`).join("\n");
        }

        // 5. Tạo prompt gửi cho Gemini
        const prompt = `
          Bạn là trợ lý ảo của TravelNow. Nhiệm vụ của bạn là trả lời khách hàng một cách NGẮN GỌN, SÚC TÍCH (tối đa 2-3 câu).
          
          Thông tin tham khảo:
          ---
          ${context}
          ---
          
          Yêu cầu:
          1. Trả lời thẳng vào vấn đề, không dài dòng.
          2. Dùng giọng điệu thân thiện, chuyên nghiệp.
          3. Nếu thông tin có trong phần tham khảo, hãy dùng nó. Nếu không, hãy trả lời dựa trên kiến thức chung.
          
          Câu hỏi: ${message}
        `;

        const result = await chatModel.generateContent(prompt);
        const response = await result.response;
        reply = response.text();

      } catch (aiError) {
        console.error("Gemini/Vector Search Error:", aiError);
        // Fallback nếu lỗi (ví dụ chưa cấu hình vector index)
        reply = "Xin lỗi, hệ thống đang bảo trì tính năng tìm kiếm thông minh. Vui lòng thử lại sau.";
      }
    }

    // Fallback nếu không có API Key hoặc lỗi
    if (!reply) {
       reply = "Xin lỗi, tôi chưa hiểu câu hỏi của bạn.";
    }

    // 6. Save bot response if logged in
    if (userId) {
      await ChatMessage.create({ userId, message: reply, sender: 'bot' });
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching history for userId:', userId);
    const messages = await ChatMessage.find({ userId }).sort({ timestamp: 1 });
    console.log('Found messages:', messages.length);
    res.status(200).json(messages);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
