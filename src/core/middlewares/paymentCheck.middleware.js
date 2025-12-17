const Tenant = require('../../modules/tenants/tenant.model');

exports.checkPaymentStatus = async (req, res, next) => {
  try {
    let tenant = null;

    // CASO A: Ruta Pública (viene el slug en la URL)
    if (req.params.slug) {
      tenant = await Tenant.findOne({ slug: req.params.slug });
    } 
    // CASO B: Ruta Interna (viene tenantId en params)
    else if (req.params.tenantId) {
      tenant = await Tenant.findById(req.params.tenantId);
    }
    // CASO C: Usuario Logueado (Dueño operando su panel)
    else if (req.user && req.user.tenantId) {
      tenant = await Tenant.findById(req.user.tenantId);
    }

    if (!tenant) {
      return res.status(404).json({ message: "Restaurante no encontrado" });
    }
    
    // 1. Kill Switch Manual (Admin lo apagó)
    if (!tenant.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'SERVICIO SUSPENDIDO: Contacte a Soporte.' 
      });
    }

    // 2. Kill Switch Automático (Falta de Pago)
    const today = new Date();
    if (tenant.paymentDueDate < today) {
      console.log(`[ALERTA DE PAGO] Tenant ${tenant.name} vencido desde ${tenant.paymentDueDate}`);
      return res.status(402).json({ 
        success: false, 
        message: 'SUBSCRIPCIÓN VENCIDA. El servicio se reactivará al procesar el pago.' 
      });
    }

    req.tenant = tenant;
    next();

  } catch (error) {
    res.status(500).json({ message: "Error verificando estado de cuenta" });
  }
};