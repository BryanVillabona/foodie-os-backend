const express = require('express');
const router = express.Router();
const { createProduct, getMenuByTenant } = require('./menu.controller');

// Importar Middlewares
const { protect } = require('../../core/middlewares/auth.middleware'); // <-- IMPORTAR
const { checkPaymentStatus } = require('../../core/middlewares/paymentCheck.middleware'); // <-- IMPORTAR

// Rutas

// 1. Crear producto: SOLO si está logueado (protect)
router.post('/', protect, createProduct); 

// 2. Leer menú: Público, PERO verificamos si pagó la mensualidad (checkPaymentStatus)
// Nota: checkPaymentStatus busca el slug en req.params.slug. 
// Como aquí usas tenantId, el middleware necesitaría un ajuste leve o 
// aplicarlo a la ruta de tenants. 
// MEJOR ESTRATEGIA: Apliquemos el pago al obtener la INFO del restaurante.
router.get('/:tenantId', getMenuByTenant); 

module.exports = router;