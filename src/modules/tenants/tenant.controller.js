const Tenant = require('./tenant.model');

// @desc    Crear un nuevo restaurante (Solo Super Admin)
// @route   POST /api/tenants
exports.createTenant = async (req, res) => {
  try {
    // Por ahora extraemos los datos directamente del body
    // En el futuro validaremos permisos de Super Admin aquí
    const tenant = await Tenant.create(req.body);

    res.status(201).json({
      success: true,
      data: tenant
    });
  } catch (error) {
    // Manejo de error si el slug ya existe (código 11000 en Mongo)
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Ese Slug (URL) ya está en uso. Elige otro.' });
    }
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener datos públicos del restaurante por su URL (Slug)
// @route   GET /api/tenants/:slug
exports.getTenantPublic = async (req, res) => {
  try {
    const { slug } = req.params;

    const tenant = await Tenant.findOne({ slug, isActive: true })
      .select('-paymentDueDate'); // OJO: Por seguridad, NO enviamos la fecha de pago al frontend público

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Restaurante no encontrado o inactivo' });
    }

    // AQUI VA EL MIDDLEWARE DE PAGOS (Lógica manual por ahora)
    // Aunque el middleware lo haremos aparte, aquí hacemos una pequeña validación visual
    // Si estuviéramos en producción, aquí verificaríamos paymentDueDate también

    res.status(200).json({
      success: true,
      data: tenant
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTenantById = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id).select('name config plan'); // Solo info segura
    if (!tenant) return res.status(404).json({ message: 'Restaurante no encontrado' });
    
    res.status(200).json({ success: true, data: tenant });
  } catch (error) {
    next(error);
  }
};