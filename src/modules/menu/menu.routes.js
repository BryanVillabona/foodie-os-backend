const express = require('express');
const router = express.Router(); // ¡Recuerda la R mayúscula! 😉
const { createProduct, getMenuByTenant } = require('./menu.controller');

// Rutas
router.post('/', createProduct); // Crear producto
router.get('/:tenantId', getMenuByTenant); // Leer menú de un restaurante

module.exports = router;