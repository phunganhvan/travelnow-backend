const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// GET /hotels/search?destination=Da%20Nang&checkIn=2025-12-20&checkOut=2025-12-23&guests=2
router.get('/search', hotelController.search);

module.exports = router;
