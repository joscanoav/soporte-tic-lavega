const { Router } = require('express');
const { chat }   = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = Router();

// POST /api/chat — protegida (solo equipo TIC)
router.post('/', protect, chat);

module.exports = router;
