// src/core/middlewares/error.middleware.js
const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message);

  let error = { ...err };
  error.message = err.message;

  // Error de MongoDB: Llave duplicada (Ej: Slug repetido)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `El valor ingresado para '${field}' ya está en uso. Elige otro.`;
    error.statusCode = 400;
  }

  // Error de Validación de Mongoose (Ej: Falta nombre)
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error.message = message;
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor'
  });
};

module.exports = errorHandler;