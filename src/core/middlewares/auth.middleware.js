const jwt = require('jsonwebtoken');
const User = require('../../modules/auth/user.model');

exports.protect = async (req, res, next) => {
  let token;

  // Verificar si viene el header "Authorization: Bearer ksadjhasd..."
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtener el token (quitar la palabra 'Bearer ')
      token = req.headers.authorization.split(' ')[1];

      // Decodificar
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar usuario en BD y agregarlo a la request (req.user)
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Todo bien, pase adelante
    } catch (error) {
      res.status(401).json({ success: false, message: 'Token no válido, autorización denegada' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'No hay token, autorización denegada' });
  }
};