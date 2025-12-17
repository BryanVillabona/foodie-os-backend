const express = require('express');
const router = express.Router();
const { createTenant, getTenantPublic } = require('./tenant.controller');
const { checkPaymentStatus } = require('../../core/middlewares/paymentCheck.middleware'); // <-- IMPORTAR

// Rutas
router.post('/', createTenant); // Crear (Podrías protegerla con una clave maestra en el futuro)

// LEER (Público): AQUÍ PONEMOS EL CANDADO DE PAGO
router.get('/:slug', checkPaymentStatus, getTenantPublic); 

// Ruta Pública para obtener config (WhatsApp) por ID
router.get('/:id', getTenantById);

module.exports = router;