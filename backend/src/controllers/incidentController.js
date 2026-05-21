const Incident  = require('../models/Incident');
const { getSuggestion } = require('../services/ai/geminiService');

// ── GET /api/incidents ─────────────────────────────────────────
// Pública: los profesores pueden ver el estado de sus tickets.
// Query params opcionales: status, priority, category, classroomId, page, limit
const getIncidents = async (req, res) => {
  const { status, priority, category, classroomId, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status)      filter.status      = status;
  if (priority)    filter.priority    = priority;
  if (category)    filter.category    = category;
  if (classroomId) filter.classroomId = classroomId;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Incident.countDocuments(filter);

  const incidents = await Incident.find(filter)
    .populate('classroomId', 'code building floor')
    .populate('deviceId',    'inventoryCode type brand model')
    .populate('assignedToAdmin', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.json({
    ok: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: incidents,
  });
};

// ── GET /api/incidents/:id ─────────────────────────────────────
const getIncident = async (req, res) => {
  const incident = await Incident.findById(req.params.id)
    .populate('classroomId',     'code building floor')
    .populate('deviceId',        'inventoryCode type brand model')
    .populate('assignedToAdmin', 'name email');

  if (!incident) {
    return res.status(404).json({ ok: false, message: 'Incidencia no encontrada.' });
  }

  res.json({ ok: true, data: incident });
};

// ── POST /api/incidents ────────────────────────────────────────
// Pública: cualquier profesor puede abrir un ticket sin autenticarse.
const createIncident = async (req, res) => {
  const { reporterName, classroomId, deviceId, category, title, description, priority } = req.body;

  const incident = await Incident.create({
    reporterName,
    classroomId,
    deviceId:    deviceId || null,
    category,
    title,
    description,
    priority:    priority || 'MEDIA',
    statusHistory: [{ status: 'PENDIENTE', changedBy: 'sistema', comment: 'Ticket creado' }],
  });

  // Sugerencia de Gemini en background (no bloquea la respuesta)
  getSuggestion(incident).then(async (suggestion) => {
    if (suggestion) {
      await Incident.findByIdAndUpdate(incident._id, { aiSuggestion: suggestion });
    }
  }).catch(() => {}); // silencioso si Gemini no está configurado

  res.status(201).json({ ok: true, data: incident });
};

// ── PATCH /api/incidents/:id/status ───────────────────────────
// Protegida (técnico/superadmin): cambia el estado del ticket.
const updateStatus = async (req, res) => {
  const { status, comment, assignedToAdmin, resolutionNotes } = req.body;

  if (!status) {
    return res.status(400).json({ ok: false, message: 'El campo status es obligatorio.' });
  }

  const incident = await Incident.findById(req.params.id);
  if (!incident) {
    return res.status(404).json({ ok: false, message: 'Incidencia no encontrada.' });
  }

  incident.status = status;

  // Añadir entrada al historial de auditoría
  incident.statusHistory.push({
    status,
    changedBy: req.admin.name,
    comment:   comment || null,
  });

  if (assignedToAdmin !== undefined) incident.assignedToAdmin = assignedToAdmin || null;
  if (resolutionNotes !== undefined) incident.resolutionNotes = resolutionNotes;

  await incident.save();

  res.json({ ok: true, data: incident });
};

// ── DELETE /api/incidents/:id ─────────────────────────────────
// Solo superadmin
const deleteIncident = async (req, res) => {
  const incident = await Incident.findByIdAndDelete(req.params.id);
  if (!incident) {
    return res.status(404).json({ ok: false, message: 'Incidencia no encontrada.' });
  }
  res.json({ ok: true, message: `Incidencia ${incident.ticketNumber} eliminada.` });
};

module.exports = { getIncidents, getIncident, createIncident, updateStatus, deleteIncident };
