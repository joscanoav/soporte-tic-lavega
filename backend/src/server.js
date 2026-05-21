const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
require('dotenv').config();

const connectDB         = require('./config/db');
const authRoutes        = require('./routes/authRoutes');
const incidentRoutes    = require('./routes/incidentRoutes');
const classroomRoutes   = require('./routes/classroomRoutes');
const deviceRoutes      = require('./routes/deviceRoutes');
const statsRoutes       = require('./routes/statsRoutes');
const chatRoutes        = require('./routes/chatRoutes');

const app = express();

// ── Base de datos ──────────────────────────────────────────────
connectDB();

// ── Middlewares globales ───────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ── Rutas ──────────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'OK', message: 'Backend Soporte TIC funcionando' })
);

app.use('/api/auth',       authRoutes);
app.use('/api/incidents',  incidentRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/devices',    deviceRoutes);
app.use('/api/stats',      statsRoutes);
app.use('/api/chat',       chatRoutes);

// ── 404 ────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada.' });
});

// ── Manejador global de errores (Express 5 compatible) ─────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('❌ Error no controlado:', err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ ok: false, message: messages.join(' · ') });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      ok: false,
      message: `Ya existe un registro con ese ${field}.`,
    });
  }

  res.status(err.statusCode || 500).json({
    ok: false,
    message: err.message || 'Error interno del servidor.',
  });
});

// ── Arranque ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
);
