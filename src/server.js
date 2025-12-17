require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken'); 
const app = require('./app');
const connectDB = require('./config/db.js');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"]
  }
});

// --- CORRECCIÓN #3: Middleware de Seguridad para Sockets ---
io.use((socket, next) => {
  // El frontend debe enviar: socket = io(url, { auth: { token: "..." } })
  const token = socket.handshake.auth.token;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Autenticación fallida en Socket'));
      
      // Guardamos datos del usuario en el socket
      socket.user = decoded; 
      next();
    });
  } else {
    // Permitir conexiones públicas (Clientes escaneando QR)
    // Pero NO dejarlos entrar a salas privadas luego
    socket.user = { role: 'GUEST' }; 
    next();
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Conexión: ${socket.id} | Rol: ${socket.user?.role || 'Guest'}`);

  // Evento para unirse a la sala de un restaurante
  socket.on('join_tenant_room', (tenantId) => {
    // Si es GUEST (Cliente), solo puede escuchar cambios de SU pedido (esto lo validaremos en front),
    // pero para escuchar TODO el restaurante (KDS), debe ser Staff.
    
    if(socket.user.role === 'GUEST') {
        // Los clientes se unen a su propio canal de pedido (no al del restaurante entero)
        // Lógica futura: socket.join(`order_${orderId}`);
        console.log(`Cliente anónimo intentó unirse a sala privada ${tenantId} - Bloqueado`);
        return; 
    }

    socket.join(tenantId);
    console.log(`👨‍🍳 Staff unido a sala de cocina: ${tenantId}`);
  });
  
  socket.on('disconnect', () => {
    // console.log('❌ Cliente desconectado:', socket.id);
  });
});

app.set('socketio', io);

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`\n🚀 Servidor FoodieOS corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error fatal:', error);
  }
};

startServer();