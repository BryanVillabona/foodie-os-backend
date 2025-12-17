const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Cargar variables de entorno
dotenv.config();

// Importar Modelos
const Tenant = require('./src/modules/tenants/tenant.model');
const User = require('./src/modules/auth/user.model');
const Product = require('./src/modules/menu/product.model');
const Order = require('./src/modules/orders/order.model');

// Datos de Prueba
const tenants = [
  {
    name: 'Hamburguesas Don Brayan',
    slug: 'don-brayan',
    plan: 'PRO',
    paymentDueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Vence en 1 mes
    isActive: true,
    config: {
        primaryColor: '#F97316',
        logo: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
        whatsappNumber: '573001234567' 
    }
  }
];

const seedDB = async () => {
  try {
    // 1. Conectar a Mongo
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 MongoDB Conectado...'.cyan.underline);

    // 2. Limpiar Base de Datos
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Tenant.deleteMany();
    console.log('🧹 Datos anteriores eliminados...'.red);

    // 3. Crear Tenant
    const createdTenants = await Tenant.insertMany(tenants);
    const tenantId = createdTenants[0]._id;
    console.log('🏗️ Restaurante "Don Brayan" creado...'.green);

    // 4. Crear Usuario Dueño
    // CORRECCIÓN: Usamos 'TENANT_ADMIN' en lugar de 'admin'
    await User.create({
      name: 'Bryan Villabona',
      email: 'admin@donbrayan.com',
      password: '123',
      role: 'TENANT_ADMIN', // <--- CORREGIDO AQUÍ
      tenantId: tenantId
    });
    console.log('👤 Usuario Admin creado (admin@donbrayan.com / 123)...'.green);

    // 5. Crear Productos
    const products = [
      {
        name: 'La Doble Bestia',
        price: 25000,
        description: 'Doble carne angus, doble queso, tocineta y salsa secreta.',
        category: 'Hamburguesas',
        isAvailable: true,
        tenantId: tenantId,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60'
      },
      {
        name: 'Clásica con Queso',
        price: 18000,
        description: 'Carne 150g, vegetales frescos y queso americano.',
        category: 'Hamburguesas',
        isAvailable: true,
        tenantId: tenantId,
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=60'
      },
      {
        name: 'Coca-Cola 400ml',
        price: 5000,
        description: 'Bien fría.',
        category: 'Bebidas',
        isAvailable: true,
        tenantId: tenantId
      },
      {
        name: 'Papas Rústicas',
        price: 8000,
        description: 'Con paprika y orégano.',
        category: 'Entradas',
        isAvailable: true,
        tenantId: tenantId
      },
      {
        name: 'COMBO PAREJA',
        price: 45000,
        description: '2 Hamburguesas Clásicas + 2 Gaseosas + 1 Papas.',
        category: 'Combos',
        esCombo: true,
        isAvailable: true,
        tenantId: tenantId
      }
    ];

    await Product.insertMany(products);
    console.log(`🍔 Menú creado con 5 productos...`.green);

    // 6. Crear Pedidos de Prueba
    const orders = [
      {
        tenantId: tenantId,
        items: [
          { name: 'La Doble Bestia', price: 25000, quantity: 1, notes: 'Sin cebolla' },
          { name: 'Coca-Cola 400ml', price: 5000, quantity: 1 }
        ],
        total: 30000,
        status: 'PENDING',
        clientName: 'Juan Perez (Mesa 1)',
        table: '1'
      },
      {
        tenantId: tenantId,
        items: [
          { name: 'Clásica con Queso', price: 18000, quantity: 2 }
        ],
        total: 36000,
        status: 'PREPARING',
        clientName: 'Maria (Para Llevar)',
        deliveryMethod: 'pickup'
      }
    ];

    await Order.insertMany(orders);
    console.log('🧾 2 Pedidos de prueba creados...'.green);

    console.log('✅ ¡TODO LISTO! Base de datos poblada.'.inverse.green);
    process.exit();

  } catch (error) {
    console.error(`❌ ERROR: ${error.message}`.red);
    process.exit(1);
  }
};

seedDB();