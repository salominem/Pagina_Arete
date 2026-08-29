// Script para crear el administrador inicial.
// Se ejecuta UNA sola vez con: node seed.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Admin = require('./models/Admin');

const crearAdmin = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('✅ Conectado a MongoDB');

    const emailAdmin = 'admin@universumcorp.com'; // cambiá esto si querés otro email
    const passwordAdmin = 'admin123';              // cambiá esto por una contraseña segura

    const existente = await Admin.findOne({ email: emailAdmin });
    if (existente) {
      console.log('⚠️  Ya existe un administrador con ese email. No se creó nada nuevo.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHasheada = await bcrypt.hash(passwordAdmin, salt);

    const admin = new Admin({
      nombre: 'Administrador',
      email: emailAdmin,
      password: passwordHasheada,
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Administrador creado con éxito:');
    console.log(`   Email: ${emailAdmin}`);
    console.log(`   Contraseña: ${passwordAdmin}`);
    console.log('   (Iniciá sesión con estos datos y después podés crear alumnos)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear el administrador:', error);
    process.exit(1);
  }
};

crearAdmin();