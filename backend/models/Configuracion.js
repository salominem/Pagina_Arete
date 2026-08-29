const mongoose = require('mongoose');

const ConfiguracionSchema = new mongoose.Schema({
  nombrePanel: { type: String, default: 'Panel de Administración' },
  emailContacto: { type: String, default: 'admin@universumcorp.com' }
}, { timestamps: true });

module.exports = mongoose.model('Configuracion', ConfiguracionSchema);