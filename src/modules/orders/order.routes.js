const express = require('express');
const router = express.Router();
const { createOrder, getOrdersByTenant, updateOrderStatus } = require('./order.controller');

router.post('/', createOrder); // Crear pedido
router.get('/:tenantId', getOrdersByTenant); // Ver lista (KDS/Caja)
router.put('/:id/status', updateOrderStatus); // Mover tarjeta (Cambiar estado)

module.exports = router;