const Device = require('../models/Device');

// ── GET /api/devices ───────────────────────────────────────────
// Pública: el profesor selecciona el dispositivo al reportar.
// Query params: classroomId, type, status
const getDevices = async (req, res) => {
  const { classroomId, type, status } = req.query;

  const filter = {};
  if (classroomId) filter.classroomId = classroomId;
  if (type)        filter.type        = type;
  if (status)      filter.status      = status;

  const devices = await Device.find(filter)
    .populate('classroomId', 'code building floor')
    .sort({ classroomId: 1, type: 1, inventoryCode: 1 })
    .lean();

  res.json({ ok: true, data: devices });
};

// ── GET /api/devices/:id ───────────────────────────────────────
const getDevice = async (req, res) => {
  const device = await Device.findById(req.params.id)
    .populate('classroomId', 'code building floor');
  if (!device) {
    return res.status(404).json({ ok: false, message: 'Dispositivo no encontrado.' });
  }
  res.json({ ok: true, data: device });
};

// ── POST /api/devices ──────────────────────────────────────────
// Protegida (superadmin / técnico)
const createDevice = async (req, res) => {
  const device = await Device.create(req.body);
  res.status(201).json({ ok: true, data: device });
};

// ── PATCH /api/devices/:id ─────────────────────────────────────
// Protegida (técnico): actualizar estado, notas, ubicación, etc.
const updateDevice = async (req, res) => {
  const device = await Device.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('classroomId', 'code building floor');

  if (!device) {
    return res.status(404).json({ ok: false, message: 'Dispositivo no encontrado.' });
  }
  res.json({ ok: true, data: device });
};

// ── DELETE /api/devices/:id ────────────────────────────────────
// Protegida (superadmin)
const deleteDevice = async (req, res) => {
  const device = await Device.findByIdAndDelete(req.params.id);
  if (!device) {
    return res.status(404).json({ ok: false, message: 'Dispositivo no encontrado.' });
  }
  res.json({ ok: true, message: `Dispositivo ${device.inventoryCode} eliminado.` });
};

// ── GET /api/devices/types ─────────────────────────────────────
// Devuelve la lista de tipos y estados válidos (util para el frontend)
const getMeta = (_req, res) => {
  res.json({
    ok: true,
    types:  Device.TYPES  || [],
    status: Device.STATUS || [],
  });
};

module.exports = { getDevices, getDevice, createDevice, updateDevice, deleteDevice, getMeta };
