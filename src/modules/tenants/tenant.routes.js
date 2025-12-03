const express = require('express');
const router = express.Router();
const { createTenant, getTenantPublic } = require('./tenant.controller');

// Rutas
router.post('/', createTenant); // Crear (POST /api/tenants)
router.get('/:slug', getTenantPublic); // Leer (GET /api/tenants/el-brayan)

module.exports = router;