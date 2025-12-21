const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');

router.post('/', optionalAuthMiddleware, chatController.chat);
router.get('/history', authMiddleware, chatController.getHistory);

module.exports = router;
