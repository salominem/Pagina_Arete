const express = require('express');
const bcrypt = require('bcryptjs');
const Alumno = require('../models/Alumno');
const { verificarToken, soloAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/alumnos -> lista todos los alumnos (solo admin, expone datos de todos)
router.get('/', verificarToken, soloAdmin, async (req, res) => {
  try {
    const alumnos = await Alumno.find().select('-password');
    res.json(alumnos);
  } catch (error) {
    console.error('Error al listar alumnos:', error);
    res.status(500).json({ message: 'Error al obtener los alumnos' });
  }
});

// GET /api/alumnos/me -> devuelve únicamente los datos del alumno logueado
router.get('/me', verificarToken, async (req, res) => {
  if (req.usuario.role !== 'alumno') {
    return res.status(403).json({ message: 'Esta ruta es solo para alumnos.' });
  }
  try {
    const alumno = await Alumno.findById(req.usuario.id).select('-password');
    if (!alumno) return res.status(404).json({ message: 'Alumno no encontrado' });
    res.json(alumno);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tus datos' });
  }
});

// GET /api/alumnos/:id -> un alumno puntual (solo admin)
router.get('/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const alumno = await Alumno.findById(req.params.id).select('-password');
    if (!alumno) return res.status(404).json({ message: 'Alumno no encontrado' });
    res.json(alumno);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el alumno' });
  }
});

// POST /api/alumnos/crear -> crear un alumno nuevo (solo admin)
router.post('/crear', verificarToken, soloAdmin, async (req, res) => {
  try {
    const datos = { ...req.body };

    if (!datos.password) {
      return res.status(400).json({ message: 'La contraseña es obligatoria' });
    }

    // Hasheamos la contraseña antes de guardar
    const salt = await bcrypt.genSalt(10);
    datos.password = await bcrypt.hash(datos.password, salt);

    const nuevoAlumno = new Alumno(datos);
    await nuevoAlumno.save();

    const alumnoSinPassword = nuevoAlumno.toObject();
    delete alumnoSinPassword.password;

    res.status(201).json({ alumno: alumnoSinPassword });
  } catch (error) {
    console.error('Error al crear alumno:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Ya existe un alumno registrado con ese email' });
    }
    res.status(500).json({ message: 'Error al registrar el alumno' });
  }
});

// PUT /api/alumnos/:id -> editar/actualizar un alumno (datos, rutina, observaciones, etc.)
// El admin puede editar a cualquier alumno. Un alumno logueado solo puede editarse a sí mismo
// (lo usa, por ejemplo, para registrar cargas o responder en el chat).
router.put('/:id', verificarToken, async (req, res) => {
  if (req.usuario.role !== 'admin' && req.usuario.id !== req.params.id) {
    return res.status(403).json({ message: 'No tenés permisos para editar este alumno.' });
  }

  try {
    const datos = { ...req.body };

    // Si quien edita es el propio alumno (no el admin), solo puede tocar
    // su rutina (para registrar cargas) y las observaciones (el chat).
    // No puede cambiarse el estado, el email, el DNI, etc.
    if (req.usuario.role !== 'admin') {
      const datosPermitidos = {};
      if (datos.rutinaActual !== undefined) datosPermitidos.rutinaActual = datos.rutinaActual;
      if (datos.observaciones !== undefined) datosPermitidos.observaciones = datos.observaciones;
      Object.keys(datos).forEach(key => delete datos[key]);
      Object.assign(datos, datosPermitidos);
    }

    // Si viene una password nueva en el body, la hasheamos.
    // Si no viene (o viene vacía), no la tocamos.
    if (datos.password && datos.password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      datos.password = await bcrypt.hash(datos.password, salt);
    } else {
      delete datos.password;
    }

    // Nunca dejamos que se pisen estos campos desde el body
    delete datos._id;
    delete datos.id;

    const alumnoActualizado = await Alumno.findByIdAndUpdate(
      req.params.id,
      datos,
      { new: true, runValidators: true }
    ).select('-password');

    if (!alumnoActualizado) {
      return res.status(404).json({ message: 'Alumno no encontrado' });
    }

    res.json(alumnoActualizado);
  } catch (error) {
    console.error('Error al actualizar alumno:', error);
    res.status(500).json({ message: 'Error al actualizar el alumno' });
  }
});

// DELETE /api/alumnos/:id -> eliminar un alumno (solo admin)
router.delete('/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const eliminado = await Alumno.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ message: 'Alumno no encontrado' });
    }
    res.json({ message: 'Alumno eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar alumno:', error);
    res.status(500).json({ message: 'Error al eliminar el alumno' });
  }
});

module.exports = router;