const Classroom = require('../models/Classroom');

// ── GET /api/classrooms ────────────────────────────────────────
// Pública: los profesores necesitan ver el listado al abrir un ticket.
const getClassrooms = async (_req, res) => {
  const classrooms = await Classroom.find({ active: true })
    .sort({ building: 1, floor: 1, code: 1 })
    .lean();
  res.json({ ok: true, data: classrooms });
};

// ── GET /api/classrooms/:id ────────────────────────────────────
const getClassroom = async (req, res) => {
  const classroom = await Classroom.findById(req.params.id);
  if (!classroom) {
    return res.status(404).json({ ok: false, message: 'Aula no encontrada.' });
  }
  res.json({ ok: true, data: classroom });
};

// ── POST /api/classrooms ───────────────────────────────────────
// Protegida (superadmin)
const createClassroom = async (req, res) => {
  const classroom = await Classroom.create(req.body);
  res.status(201).json({ ok: true, data: classroom });
};

// ── PATCH /api/classrooms/:id ──────────────────────────────────
// Protegida (superadmin)
const updateClassroom = async (req, res) => {
  const classroom = await Classroom.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!classroom) {
    return res.status(404).json({ ok: false, message: 'Aula no encontrada.' });
  }
  res.json({ ok: true, data: classroom });
};

module.exports = { getClassrooms, getClassroom, createClassroom, updateClassroom };
