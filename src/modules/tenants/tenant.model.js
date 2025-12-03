const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
  // Información Básica
  name: {
    type: String,
    required: [true, 'El nombre del restaurante es obligatorio'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'El slug (URL) es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true
    // Este será el identificador en la URL: tuapp.com/slug-restaurante
  },
  
  // Configuración del Plan (SaaS)
  plan: {
    type: String,
    enum: ['LITE', 'PRO'],
    default: 'LITE'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  paymentDueDate: {
    type: Date,
    required: true
    // Si la fecha actual > esta fecha, se activa el Kill Switch
  },

  // Configuración Visual y de Contacto
  config: {
    logo: { 
      type: String, 
      default: 'https://via.placeholder.com/150' // Placeholder por defecto
    },
    primaryColor: { 
      type: String, 
      default: '#FF5733' // Un naranja genérico por defecto
    },
    whatsappNumber: { 
      type: String, 
      required: [true, 'El número de WhatsApp es vital para la versión LITE'] 
    },
    wifiPassword: { type: String, default: '' }, // Opcional
    enableTips: { type: Boolean, default: false } // Para la versión PRO
  },

  // Referencia al Dueño (Lo conectaremos luego con el módulo de Auth)
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true // Lo descomentaremos cuando creemos el modelo de Usuario
  }

}, {
  timestamps: true // Crea createdAt y updatedAt automáticamente
});

module.exports = mongoose.model('Tenant', TenantSchema);