const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Inicializar la app
const app = express();

// --- MIDDLEWARES GLOBALES ---

// 1. Seguridad HTTP (Headers)
app.use(helmet());

// 2. CORS (Permitir peticiones desde tu Frontend React)
app.use(cors({
  origin: process.env.CLIENT_URL || '*', // En producción seremos más estrictos
  credentials: true
}));

// 3. Logger (Ver peticiones en consola en modo desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 4. Parser (Para leer JSON en el body de las peticiones POST)
app.use(express.json());


// --- RUTAS (Las importaremos luego) ---
// Ruta de prueba para verificar que el servidor respira
app.get('/', (req, res) => {
  res.send('API FoodieOS funcionando correctamente 🚀');
});

// Manejo de errores 404 (Ruta no encontrada)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada en el servidor'
  });
});

module.exports = app;