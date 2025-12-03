require('dotenv').config(); // Cargar variables de entorno primero que todo
const http = require('http'); // Servidor nativo de Node
const { Server } = require('socket.io'); // Servidor de WebSockets
const app = require('./app'); // Importamos la configuración de Express
const connectDB = require('./config/db.js'); // Importamos conexión a DB

// 1. Crear servidor HTTP basándonos en Express
// Necesitamos esto para que Socket.io y Express compartan el mismo puerto
const server = http.createServer(app);

// 2. Configurar Socket.io (Tiempo Real)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"]
  }
});

// Escuchar conexiones de sockets (Lo usaremos más adelante para el KDS)
io.on('connection', (socket) => {
  console.log('🔌 Nuevo cliente conectado vía Socket.io:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', socket.id);
  });
});

// Inyectar 'io' en la app para usarlo en los controladores (req.io)
// Esto nos permitirá emitir eventos desde cualquier ruta de la API
app.set('socketio', io);

// 3. Función de arranque
const startServer = async () => {
  try {
    // Primero conectamos BD
    await connectDB();

    // Luego levantamos el servidor
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`\n🚀 Servidor FoodieOS corriendo en modo ${process.env.NODE_ENV} en puerto ${PORT}`);
      console.log(`🔗 http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Error fatal al iniciar el servidor:', error);
  }
};

// Iniciar
startServer();