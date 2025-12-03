const Product = require('./product.model');

// @desc    Crear un nuevo producto o combo
// @route   POST /api/menu
exports.createProduct = async (req, res) => {
  try {
    // req.body debe traer: { tenantId, name, price, category, ... }
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener todo el menú de un restaurante específico
// @route   GET /api/menu/:tenantId
exports.getMenuByTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    // Buscamos productos que pertenezcan a este ID y que estén disponibles
    // (Opcional: Si eres el dueño, querrás ver incluso los no disponibles, 
    // pero para el MVP público mostramos todo por ahora)
    const products = await Product.find({ tenantId });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};