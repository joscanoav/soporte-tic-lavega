const { Router } = require('express');
const { login, getMe } = require('../controllers/authController');
const { protect }      = require('../middleware/authMiddleware');

const router = Router();

// POST /api/auth/login  →  pública
router.post('/login', login);

// GET  /api/auth/me     →  requiere JWT válido
router.get('/me', protect, getMe);

module.exports = router;
