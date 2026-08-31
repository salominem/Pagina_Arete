const mongoose = require('mongoose');

const HistorialSchema = new mongoose.Schema({
  fecha: String,
  carga: String
}, { _id: false });

const EjercicioSchema = new mongoose.Schema({
  nombre: String,
  series: String,
  carga: String,
  descanso: String,
  historial: [HistorialSchema]
}, { _id: false });

const DiaSchema = new mongoose.Schema({
  dia: String,
  ejercicios: [EjercicioSchema]
}, { _id: false });

const RutinaSchema = new mongoose.Schema({
  nombre: String,
  descripcion: String,
  plantillaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plantilla' },
  dias: [DiaSchema]
}, { _id: false });

const ObservacionSchema = new mongoose.Schema({
  remitente: String, // 'admin' o 'alumno'
  texto: String,
  fecha: String
}, { _id: false });

const AlumnoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  usuario: { type: String },
  password: { type: String, required: true }, // se guarda hasheada
  dni: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  telefono: String,
  domicilio: String,
  sexo: String,
  fechaNacimiento: String,
  objetivo: String,
  edad: String,
  peso: String,
  altura: String,
  role: { type: String, default: 'alumno' },
  estado: { type: String, default: 'activo' }, // 'activo' o 'inactivo'
  fechaCreacion: { type: String, default: () => new Date().toLocaleDateString() },
  rutinaActual: RutinaSchema,
  observaciones: [ObservacionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Alumno', AlumnoSchema);