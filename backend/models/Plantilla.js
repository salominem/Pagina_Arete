const mongoose = require('mongoose');

const EjercicioSchema = new mongoose.Schema({
  nombre: String,
  series: String,
  carga: String,
  descanso: String
}, { _id: false });

const DiaSchema = new mongoose.Schema({
  dia: String,
  ejercicios: [EjercicioSchema]
}, { _id: false });

const PlantillaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: String,
  dias: [DiaSchema]
}, { timestamps: true });

module.exports = mongoose.model('Plantilla', PlantillaSchema);