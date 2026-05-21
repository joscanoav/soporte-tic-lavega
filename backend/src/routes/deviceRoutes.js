const { Router } = require('express');
const {
  getDevices,
  getDevice,
  createDevice,
  updateDevice,
  deleteDevice,
  getMeta,
} = require('../controllers/deviceController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = Router();

// Pública: el profesor necesita ver los dispositivos de su aula
router.get('/meta', getMeta);
router.get('/',     getDevices);
router.get('/:id',  getDevice);

// Protegidas
router.post('/',    protect, createDevice);
router.patch('/:id', protect, updateDevice);
router.delete('/:id', protect, requireRole('superadmin'), deleteDevice);

module.exports = router;
