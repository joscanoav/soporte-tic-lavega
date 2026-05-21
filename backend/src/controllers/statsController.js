const Incident = require('../models/Incident');

// ── GET /api/stats ─────────────────────────────────────────────
// Protegida (técnico/superadmin): métricas para el dashboard.
const getStats = async (_req, res) => {
  const [byStatus, byCategory, byPriority, topClassrooms, avgResolution] =
    await Promise.all([

      // Tickets por estado
      Incident.aggregate([
        { $group: { _id: '$status', total: { $sum: 1 } } },
        { $sort:  { total: -1 } },
      ]),

      // Tickets por categoría
      Incident.aggregate([
        { $group: { _id: '$category', total: { $sum: 1 } } },
        { $sort:  { total: -1 } },
      ]),

      // Tickets por prioridad
      Incident.aggregate([
        { $group: { _id: '$priority', total: { $sum: 1 } } },
        { $sort:  { total: -1 } },
      ]),

      // Top 5 aulas con más incidencias
      Incident.aggregate([
        { $group: { _id: '$classroomId', total: { $sum: 1 } } },
        { $sort:  { total: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from:         'classrooms',
            localField:   '_id',
            foreignField: '_id',
            as:           'classroom',
          },
        },
        { $unwind: { path: '$classroom', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            total: 1,
            code:     '$classroom.code',
            building: '$classroom.building',
            floor:    '$classroom.floor',
          },
        },
      ]),

      // Tiempo medio de resolución (en horas) de tickets cerrados/resueltos
      Incident.aggregate([
        {
          $match: {
            status:     { $in: ['RESUELTO', 'CERRADO'] },
            resolvedAt: { $ne: null },
          },
        },
        {
          $project: {
            diffHours: {
              $divide: [
                { $subtract: ['$resolvedAt', '$createdAt'] },
                1000 * 60 * 60, // ms → horas
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgHours: { $avg: '$diffHours' },
            minHours: { $min: '$diffHours' },
            maxHours: { $max: '$diffHours' },
            count:    { $sum: 1 },
          },
        },
      ]),
    ]);

  const resolutionData = avgResolution[0] || { avgHours: null, minHours: null, maxHours: null, count: 0 };

  res.json({
    ok: true,
    data: {
      byStatus,
      byCategory,
      byPriority,
      topClassrooms,
      resolution: {
        avgHours: resolutionData.avgHours ? +resolutionData.avgHours.toFixed(1) : null,
        minHours: resolutionData.minHours ? +resolutionData.minHours.toFixed(1) : null,
        maxHours: resolutionData.maxHours ? +resolutionData.maxHours.toFixed(1) : null,
        resolvedCount: resolutionData.count,
      },
    },
  });
};

module.exports = { getStats };
