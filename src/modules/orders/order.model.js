const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  
  // Datos del Cliente
  clientName: { type: String, required: true }, // Ej: "Juan"
  clientPhone: { type: String }, // Opcional (Vital para Domicilios)

  // Tipo de Servicio
  type: {
    type: String,
    enum: ['DINE_IN', 'DELIVERY'], // Mesa o Domicilio
    default: 'DINE_IN'
  },
  tableNumber: { type: String }, // Solo si es DINE_IN
  deliveryAddress: { type: String }, // Solo si es DELIVERY

  // Los Productos (Snapshot)
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: { type: String, required: true }, // Guardamos el nombre por si cambia en el menú
      price: { type: Number, required: true }, // Guardamos el precio del momento de compra
      quantity: { type: Number, required: true, default: 1 },
      notes: { type: String } // Las famosas "Notas de Cocina" (Ej: Sin cebolla)
    }
  ],

  // Dinero
  total: { type: Number, required: true },
  tip: { type: Number, default: 0 }, // La Propina voluntaria
  
  // Estado del Pedido (El flujo del KDS)
  status: {
    type: String,
    enum: ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING'
  },

  isCancelled: { type: Boolean, default: false } // Para el Rollback financiero

}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);