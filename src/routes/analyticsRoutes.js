const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { trackAction, getStats } = require('../controllers/analyticsController');

const router = express.Router();

router.use(authMiddleware);

// POST /analytics/track
router.post('/track', trackAction);

// GET /analytics/stats?from=...&to=...
router.get('/stats', getStats);

module.exports = router;
