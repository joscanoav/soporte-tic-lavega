const Incident  = require('../models/Incident');
const Device    = require('../models/Device');
const Classroom = require('../models/Classroom');

/**
 * POST /api/chat
 * Usa la API de Groq (compatible OpenAI) con Llama 3.2.
 * Gratuita y válida para producción.
 */
const chat = async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ ok: false, message: 'Groq API key no configurada.' });
  }

  const { message, history = [] } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ ok: false, message: 'El mensaje no puede estar vacío.' });
  }

  // ── Contexto compacto desde la BD ─────────────────────────────
  const [
    totalIncidents, byStatus, byPriority, byCategory,
    recentIncidents, devicesByStatus, totalDevices, totalClassrooms,
  ] = await Promise.all([
    Incident.countDocuments(),
    Incident.aggregate([{ $group: { _id: '$status',   count: { $sum: 1 } } }]),
    Incident.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
    Incident.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Incident.find({}).sort({ createdAt: -1 }).limit(15)
      .populate('classroomId', 'code')
      .populate('assignedToAdmin', 'name')
      .lean(),
    Device.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Device.countDocuments(),
    Classroom.countDocuments(),
  ]);

  const recentSummary = recentIncidents.map(i => ({
    ticket:    i.ticketNumber,
    titulo:    i.title,
    categoria: i.category,
    prioridad: i.priority,
    estado:    i.status,
    aula:      i.classroomId?.code || '—',
    profesor:  i.reporterName,
    asignado:  i.assignedToAdmin?.name || 'Sin asignar',
    fecha:     i.createdAt?.toISOString?.().split('T')[0] || '—',
  }));

  const systemPrompt = `
Eres el asistente IA del sistema de gestión de incidencias TIC del instituto "Nuestra Señora de La Vega".
Tienes acceso a estadísticas en tiempo real de la base de datos.

RESUMEN DEL SISTEMA:
- Total incidencias: ${totalIncidents}
- Total dispositivos: ${totalDevices}
- Total aulas: ${totalClassrooms}

INCIDENCIAS POR ESTADO: ${JSON.stringify(byStatus)}
INCIDENCIAS POR PRIORIDAD: ${JSON.stringify(byPriority)}
INCIDENCIAS POR CATEGORÍA: ${JSON.stringify(byCategory)}
DISPOSITIVOS POR ESTADO: ${JSON.stringify(devicesByStatus)}

ÚLTIMAS 15 INCIDENCIAS: ${JSON.stringify(recentSummary)}

Responde siempre en español, de forma concisa y clara.
Usa listas con guiones cuando sea útil. No uses markdown con asteriscos.
Si no tienes el dato exacto, indícalo honestamente.
  `.trim();

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history
      .filter((h, i) => !(i === 0 && h.role === 'assistant'))
      .map(h => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content })),
    { role: 'user', content: message },
  ];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       'llama-3.3-70b-versatile',
        messages,
        max_tokens:  800,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Groq error:', err);
      return res.status(500).json({ ok: false, message: 'Error al conectar con Groq.' });
    }

    const data  = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Sin respuesta.';
    res.json({ ok: true, reply });
  } catch (err) {
    console.error('Groq chat error:', err.message);
    res.status(500).json({ ok: false, message: 'Error al conectar con Groq.' });
  }
};

module.exports = { chat };
