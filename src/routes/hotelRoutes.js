const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

// GET /hotels/search?destination=Da%20Nang&checkIn=2025-12-20&checkOut=2025-12-23&guests=2
router.get('/search', hotelController.search);

// Reviews của khách sạn
router.get('/:id/reviews', reviewController.getHotelReviews);
router.post('/:id/reviews', authMiddleware, reviewController.createOrUpdateReview);

// GET /hotels/:id
router.get('/:id', hotelController.getById);

module.exports = router;
