const jwt = require('jsonwebtoken');

// Verifica que venga un token válido en el header Authorization: Bearer <token>
// Si es válido, guarda los datos del usuario en req.usuario para usarlos después.
function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado. Iniciá sesión de nuevo.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Sesión inválida o expirada. Iniciá sesión de nuevo.' });
  }
}

// Se usa DESPUÉS de verificarToken. Solo deja pasar si el usuario logueado es admin.
function soloAdmin(req, res, next) {
  if (req.usuario?.role !== 'admin') {
    return res.status(403).json({ message: 'No tenés permisos para realizar esta acción.' });
  }
  next();
}

module.exports = { verificarToken, soloAdmin };