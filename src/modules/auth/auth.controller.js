const User = require('./user.model');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Registrar un nuevo usuario (Dueño)
// @route   POST /api/auth/register
exports.registerUser = async (req, res, next) => { // Agregamos next
  try {
    // CORRECCIÓN FINAL: Permitir recibir tenantId
    const { name, email, password, role, tenantId } = req.body;
    
    // Verificar si ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'El usuario ya existe' });
    }

    // Crear usuario vinculándolo al restaurante (si aplica)
    const user = await User.create({ 
      name, 
      email, 
      password, 
      role, 
      tenantId // <-- VITAL: Ahora guardamos la referencia
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        tenantId: user.tenantId // Devolvemos el dato para confirmar
      }
    });
  } catch (error) {
    next(error); // Usar el middleware de errores
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        tenantId: user.tenantId 
      }
    });
  } catch (error) {
    next(error);
  }
};