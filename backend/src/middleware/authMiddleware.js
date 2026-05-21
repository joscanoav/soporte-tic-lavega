const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// ── protect ────────────────────────────────────────────────────

/**
 * Middleware de autenticación JWT.
 *
 * Espera la cabecera:  Authorization: Bearer <token>
 *
 * Si el token es válido, inyecta `req.admin` con los datos del
 * admin y llama a next(). En caso contrario devuelve 401.
 */
const protect = async (req, res, next) => {
  // 1. Extraer el token del header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      message: 'No autenticado. Proporciona un token Bearer.',
    });
  }

  const token = authHeader.split(' ')[1];

  // 2. Verificar y decodificar
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Sesión expirada. Vuelve a iniciar sesión.'
        : 'Token inválido.';
    return res.status(401).json({ ok: false, message });
  }

  // 3. Buscar el admin en BD (comprueba que sigue activo y existiendo)
  const admin = await Admin.findById(decoded.id);
  if (!admin || !admin.active) {
    return res.status(401).json({
      ok: false,
      message: 'Usuario no encontrado o cuenta desactivada.',
    });
  }

  // 4. Inyectar en la request y continuar
  req.admin = admin;
  next();
};

// ── requireRole ────────────────────────────────────────────────

/**
 * Factory de middleware de autorización por rol.
 *
 * Uso:  router.delete('/:id', protect, requireRole('superadmin'), handler)
 *
 * @param  {...string} roles  Roles permitidos ('superadmin', 'tecnico')
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.admin.role)) {
    return res.status(403).json({
      ok: false,
      message: `Acceso denegado. Se requiere uno de estos roles: ${roles.join(', ')}.`,
    });
  }
  next();
};

module.exports = { protect, requireRole };
