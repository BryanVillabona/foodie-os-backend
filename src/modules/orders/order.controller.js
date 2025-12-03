const mongoose = require('mongoose');
const Order = require('./order.model');

// @desc    Crear un nuevo pedido (Cliente)
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    // 1. Guardar en Base de Datos
    const order = await Order.create(req.body);

    // 2. TIEMPO REAL: Notificar a la Cocina (KDS) y Caja
    // Obtenemos la instancia de Socket.io
    const io = req.app.get('socketio');
    
    // Emitimos un evento a la "Sala" específica de este restaurante
    // (En el frontend, la cocina se unirá a la sala: socket.join(tenantId))
    io.to(order.tenantId.toString()).emit('new_order', order);

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Obtener pedidos de un restaurante (Para el KDS y Caja)
// @route   GET /api/orders/:tenantId
exports.getOrdersByTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    // Traemos pedidos que NO estén cancelados ni entregados (solo activos para cocina)
    // OJO: Luego agregaremos filtros si queremos ver el historial
    const orders = await Order.find({ 
      tenantId,
      status: { $ne: 'CANCELLED' } // $ne significa "Not Equal" (No igual a)
    }).sort({ createdAt: -1 }); // Los más nuevos primero

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Actualizar estado (Cocinero mueve tarjeta)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body; // Esperamos: { "status": "PREPARING" }
    const { id } = req.params;

    const order = await Order.findByIdAndUpdate(
      id, 
      { status },
      { new: true } // Para que nos devuelva el objeto actualizado
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    // TIEMPO REAL: Notificar al Cliente (Para que su celular vibre o cambie de color)
    const io = req.app.get('socketio');
    
    // Emitimos a la sala del restaurante, pero el frontend filtrará por ID de pedido
    // O podríamos emitir a una sala específica del pedido: io.to(order._id).emit(...)
    io.to(order.tenantId.toString()).emit('order_status_update', {
      orderId: order._id,
      status: order.status
    });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Obtener resumen de ventas HOY
// @route   GET /api/orders/:tenantId/stats
exports.getDailyStats = async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Calcular inicio y fin del día actual
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const stats = await Order.aggregate([
      { 
        $match: { 
          tenantId: new mongoose.Types.ObjectId(tenantId),
          status: { $ne: 'CANCELLED' }, // Ignorar cancelados
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: null,
          totalVentas: { $sum: "$total" }, // Sumar campo 'total'
          cantidadPedidos: { $sum: 1 }     // Contar pedidos
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats.length > 0 ? stats[0] : { totalVentas: 0, cantidadPedidos: 0 }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};