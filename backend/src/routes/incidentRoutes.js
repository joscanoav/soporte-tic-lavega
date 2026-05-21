const { Router } = require('express');
const {
  getIncidents,
  getIncident,
  createIncident,
  updateStatus,
  deleteIncident,
} = require('../controllers/incidentController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = Router();

// Públicas (profesores)
router.get('/',    getIncidents);
router.get('/:id', getIncident);
router.post('/',   createIncident);

// Protegidas (equipo TIC)
router.patch('/:id/status', protect, updateStatus);
router.delete('/:id',       protect, requireRole('superadmin'), deleteIncident);

module.exports = router;
