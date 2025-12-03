const express = require('express');
const router = express.Router();
const { createOrder, getOrdersByTenant, updateOrderStatus, getDailyStats } = require('./order.controller');

router.post('/', createOrder); // Crear pedido
router.get('/:tenantId', getOrdersByTenant); // Ver lista (KDS/Caja)
router.put('/:id/status', updateOrderStatus); // Mover tarjeta (Cambiar estado)
router.get('/:tenantId/stats', getDailyStats);

module.exports = router;