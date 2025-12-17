const mongoose = require('mongoose');
const Order = require('./order.model');

// @desc    Crear un nuevo pedido (Cliente)
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    // CORRECCIÓN #4: Sanitización Financiera
    // Aseguramos que el total tenga máximo 2 decimales
    if (req.body.total) {
        req.body.total = Math.round(req.body.total * 100) / 100;
    }

    const order = await Order.create(req.body);

    // TIEMPO REAL: Notificar a la Cocina (KDS)
    const io = req.app.get('socketio');
    io.to(order.tenantId.toString()).emit('new_order', order);

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error); // ✅ Correcto: Pasa el error al middleware central
  }
};

// @desc    Obtener pedidos de un restaurante (Para el KDS y Caja)
// @route   GET /api/orders/:tenantId
exports.getOrdersByTenant = async (req, res, next) => { // <-- Agregamos 'next' aquí
  try {
    const { tenantId } = req.params;
    
    const orders = await Order.find({ 
      tenantId,
      status: { $ne: 'CANCELLED' } 
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error); // ✅ Usamos next(error) en lugar de res.status(500)...
  }
};

// @desc    Actualizar estado (Cocinero mueve tarjeta)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => { // <-- Agregamos 'next' aquí
  try {
    const { status } = req.body;
    const { id } = req.params;

    const order = await Order.findByIdAndUpdate(
      id, 
      { status },
      { new: true } 
    );

    if (!order) {
      // Nota: Para errores 404 manuales, también podrías usar next, 
      // pero responder directo aquí es aceptable para validaciones simples.
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    // TIEMPO REAL: Notificar al Cliente
    const io = req.app.get('socketio');
    
    io.to(order.tenantId.toString()).emit('order_status_update', {
      orderId: order._id,
      status: order.status
    });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error); // ✅ Error al middleware
  }
};

// @desc    Obtener resumen de ventas HOY
// @route   GET /api/orders/:tenantId/stats
exports.getDailyStats = async (req, res, next) => { // <-- Agregamos 'next' aquí
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
          status: { $ne: 'CANCELLED' }, 
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: null,
          totalVentas: { $sum: "$total" },
          cantidadPedidos: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats.length > 0 ? stats[0] : { totalVentas: 0, cantidadPedidos: 0 }
    });

  } catch (error) {
    next(error); // ✅ Error al middleware
  }
};