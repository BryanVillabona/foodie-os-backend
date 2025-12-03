const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: { type: String, required: true, select: false }, // select: false para que no devuelva la contraseña en las consultas
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'TENANT_ADMIN', 'KITCHEN'],
    default: 'TENANT_ADMIN'
  },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' } // Vinculamos al usuario con SU restaurante
}, { timestamps: true });

// Encriptar contraseña antes de guardar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseñas (Login)
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);