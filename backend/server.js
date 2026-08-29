const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const alumnosRoutes = require('./routes/alumnos');
const plantillasRoutes = require('./routes/plantillas');
const configuracionRoutes = require('./routes/configuracion');

const app = express();

// Si falta la clave del JWT, frenamos el servidor antes de arrancar mal.
if (!process.env.JWT_SECRET) {
  console.error('❌ Falta JWT_SECRET en el archivo .env. Agregalo antes de iniciar el servidor.');
  process.exit(1);
}

// CORS: en desarrollo permite todo; en producción solo el dominio configurado en FRONTEND_URL
const origenesPermitidos = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : true; // true = permitir cualquier origen (solo para desarrollo local)

app.use(cors({ origin: origenesPermitidos }));
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.DB_URL)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((error) => console.error('❌ Error al conectar a MongoDB:', error));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/plantillas', plantillasRoutes);
app.use('/api/configuracion', configuracionRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});