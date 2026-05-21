const { Router } = require('express');
const {
  getClassrooms,
  getClassroom,
  createClassroom,
  updateClassroom,
} = require('../controllers/classroomController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = Router();

// Públicas
router.get('/',    getClassrooms);
router.get('/:id', getClassroom);

// Protegidas (solo superadmin gestiona el catálogo de aulas)
router.post('/',    protect, requireRole('superadmin'), createClassroom);
router.patch('/:id', protect, requireRole('superadmin'), updateClassroom);

module.exports = router;
