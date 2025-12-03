const express = require('express');
const router = express.Router();
const { createOrder, getOrdersByTenant, updateOrderStatus, getDailyStats } = require('./order.controller');
const { protect } = require('../../core/middlewares/auth.middleware'); // <-- IMPORTAR

// Rutas

// Crear Pedido: PÚBLICO (Cualquiera puede pedir)
router.post('/', createOrder); 

// Ver Pedidos (KDS): PRIVADO (Solo el dueño/cocina logueado puede verlos)
router.get('/:tenantId', protect, getOrdersByTenant); 

// Mover Tarjeta (Cambiar estado): PRIVADO
router.put('/:id/status', protect, updateOrderStatus); 

// Ver Estadísticas: PRIVADO (Solo el dueño)
router.get('/:tenantId/stats', protect, getDailyStats);

module.exports = router;