const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Genera una sugerencia de solución para una incidencia usando Gemini 1.5 Flash.
 * Si GEMINI_API_KEY no está configurada devuelve null silenciosamente.
 */
const getSuggestion = async (incident) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'TU_CLAVE_AQUI') return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
Eres el técnico de soporte TIC de un instituto de educación secundaria.
Un profesor ha reportado la siguiente incidencia técnica:

- Categoría: ${incident.category}
- Aula: ${incident.classroomId || 'No especificada'}
- Título: ${incident.title}
- Descripción: ${incident.description}

Proporciona una guía de diagnóstico y los primeros pasos para resolver el problema.
Responde en español, de forma clara y práctica, con un máximo de 5 pasos numerados.
No incluyas introducción ni conclusión, solo los pasos directamente.
    `.trim();

    const result = await model.generateContent(prompt);
    return result.response.text().trim() || null;
  } catch (err) {
    console.error('⚠️  Gemini error:', err.message);
    return null;
  }
};

module.exports = { getSuggestion };
