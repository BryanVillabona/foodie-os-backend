const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Intentamos conectar usando la variable de entorno
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error de conexión a MongoDB: ${error.message}`);
    // Si falla la base de datos, apagamos el servidor por seguridad
    process.exit(1);
  }
};

module.exports = connectDB;