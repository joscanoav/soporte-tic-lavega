const { Router } = require('express');
const { getStats }             = require('../controllers/statsController');
const { protect }              = require('../middleware/authMiddleware');

const router = Router();

// Protegida: solo el equipo TIC necesita las métricas
router.get('/', protect, getStats);

module.exports = router;
