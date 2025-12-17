const express = require('express');
const router = express.Router();
const { createProduct, getMenuBySlug } = require('./menu.controller'); // Ojo al cambio de nombre

// Importar Middlewares
const { protect } = require('../../core/middlewares/auth.middleware');
const { checkPaymentStatus } = require('../../core/middlewares/paymentCheck.middleware');

// Rutas

// 1. Crear producto (Admin)
router.post('/', protect, createProduct); 

// 2. Leer menú (Público)
// CORRECCIÓN: Cambiamos :tenantId por :slug y AGREGAMOS checkPaymentStatus
router.get('/:slug', checkPaymentStatus, getMenuBySlug); 

module.exports = router;