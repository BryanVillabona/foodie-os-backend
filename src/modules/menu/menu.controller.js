const Product = require('./product.model');

exports.createProduct = async (req, res, next) => {
  try {

    const productData = {
      ...req.body,
      tenantId: req.user.tenantId 
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

exports.getMenuByTenant = async (req, res, next) => {
  try {
    
    const { tenantId } = req.params;
    
    const products = await Product.find({ 
      tenantId,
      isAvailable: true 
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};