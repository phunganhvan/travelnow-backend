require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const chatRoutes = require('./routes/chatRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(
  cors({
    origin: 'http://localhost:5173', // Vite dev server
    credentials: true
  })
);

// Tăng giới hạn kích thước body để nhận ảnh base64 (avatar, nhiều ảnh khách sạn)
// Cân nhắc: nếu ảnh quá lớn, nên giới hạn kích thước file ở frontend
// hoặc chuyển sang upload trực tiếp qua multipart/form-data.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Health check / root
app.get('/', (req, res) => {
  res.json({ message: 'TravelNow API is running' });
});

// Routes
app.use('/user', authRoutes); // /user/login, /user/register, /user/forgot-password
app.use('/hotels', hotelRoutes); // /hotels/search
app.use('/bookings', bookingRoutes);
app.use('/vouchers', voucherRoutes);
app.use('/chat', chatRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/admin', authMiddleware, adminRoutes);

// Global error handler (simple)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
