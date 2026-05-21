const jwt   = require('jsonwebtoken');
const Admin = require('../models/Admin');

const signToken = (admin) =>
  jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

const authResponse = (res, statusCode, admin, token) =>
  res.status(statusCode).json({
    ok: true,
    token,
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role, lastLogin: admin.lastLogin },
  });

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ ok: false, message: 'Email y contraseña son obligatorios.' });

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!admin || !(await admin.comparePassword(password)))
    return res.status(401).json({ ok: false, message: 'Credenciales incorrectas.' });

  if (!admin.active)
    return res.status(403).json({ ok: false, message: 'Cuenta desactivada. Contacta con el superadmin.' });

  // FIX: usar updateOne para lastLogin — evita pasar por el hook pre('save')
  await Admin.updateOne({ _id: admin._id }, { lastLogin: new Date() });
  admin.lastLogin = new Date();

  authResponse(res, 200, admin, signToken(admin));
};

// GET /api/auth/me
const getMe = async (req, res) =>
  res.status(200).json({
    ok: true,
    admin: { id: req.admin._id, name: req.admin.name, email: req.admin.email, role: req.admin.role, lastLogin: req.admin.lastLogin },
  });

module.exports = { login, getMe };
