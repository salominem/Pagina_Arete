const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Alumno = require('../models/Alumno');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    const emailNormalizado = email.toLowerCase().trim();

    // 1) Buscar primero entre los administradores
    let usuario = await Admin.findOne({ email: emailNormalizado });
    let esAdmin = true;

    // 2) Si no es admin, buscar entre los alumnos
    if (!usuario) {
      usuario = await Alumno.findOne({ email: emailNormalizado });
      esAdmin = false;
    }

    if (!usuario) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    // Si el alumno está inactivo, no dejamos que inicie sesión
    if (!esAdmin && usuario.estado === 'inactivo') {
      return res.status(403).json({ message: 'Tu cuenta se encuentra inactiva. Consultá con tu entrenador.' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: usuario._id, role: esAdmin ? 'admin' : 'alumno' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        usuario: usuario.usuario || usuario.nombre,
        role: esAdmin ? 'admin' : 'alumno'
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error del servidor al iniciar sesión' });
  }
});

module.exports = router;