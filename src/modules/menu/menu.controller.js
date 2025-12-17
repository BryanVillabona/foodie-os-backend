const Product = require('./product.model');
const Tenant = require('../tenants/tenant.model'); // <-- Necesitamos importar esto

exports.createProduct = async (req, res, next) => {
  try {
    // Aseguramos tenantId del usuario autenticado (Safety First)
    const productData = { ...req.body, tenantId: req.user.tenantId };
    const product = await Product.create(productData);

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener menú público por SLUG
// @route   GET /api/menu/:slug
exports.getMenuBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // 1. Buscar el Restaurante primero
    // Nota: checkPaymentStatus ya validó que existe, pero aquí necesitamos sus datos para el Frontend
    const tenant = await Tenant.findOne({ slug }).select('name config plan');

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
    }

    // 2. Buscar Productos usando el ID del restaurante encontrado
    const products = await Product.find({ 
      tenantId: tenant._id,
      isAvailable: true // Solo mostramos lo disponible al público
    });

    // 3. Responder con la estructura que el Frontend espera
    res.status(200).json({
      success: true,
      tenant: {
        _id: tenant._id,
        name: tenant.name,
        config: tenant.config
      },
      data: products
    });

  } catch (error) {
    next(error);
  }
};