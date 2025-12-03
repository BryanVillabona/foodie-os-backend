const Tenant = require('../../modules/tenants/tenant.model');

exports.checkPaymentStatus = async (req, res, next) => {
  try {
    // Asumimos que la URL viene con el slug (ej: /api/tenants/el-brayan)
    // O que el tenantId viene en el body.
    // Para el menú público, usamos el slug.
    
    const { slug } = req.params; 

    if (!slug) return next(); // Si no es una ruta con slug, ignorar

    const tenant = await Tenant.findOne({ slug }).select('paymentDueDate isActive');

    if (!tenant) {
        return res.status(404).json({ message: "Restaurante no encontrado" });
    }

    // 1. Verificar si está activo manualmente
    if (!tenant.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'SERVICIO SUSPENDIDO: Contacte al proveedor.' 
      });
    }

    // 2. Verificar fecha de pago (KILL SWITCH AUTOMÁTICO)
    const today = new Date();
    if (tenant.paymentDueDate < today) {
      return res.status(402).json({ 
        success: false, 
        message: 'SUBSCRIPCIÓN VENCIDA: Por favor realice el pago para reactivar el servicio.' 
      });
    }

    next(); // Todo pagado, disfrute su comida
  } catch (error) {
    res.status(500).json({ message: "Error verificando pago" });
  }
};