const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  // Relación: ¿De qué restaurante es este plato?
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },

  name: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },

  price: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: 0
  },

  category: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    // Ej: "Hamburguesas", "Bebidas", "Adiciones"
    trim: true
  },

  image: {
    type: String,
    default: 'https://via.placeholder.com/300' // Placeholder temporal (luego usaremos Cloudinary)
  },

  // --- LÓGICA DE NEGOCIO ---
  isAvailable: {
    type: Boolean,
    default: true 
    // Este es el "Botón de Pánico" para apagar el producto si se agota
  },

  isCombo: {
    type: Boolean,
    default: false
    // Si es true, el frontend lo mostrará destacado
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);