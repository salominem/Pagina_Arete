const express = require('express');
const Configuracion = require('../models/Configuracion');
const { verificarToken, soloAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/configuracion -> devuelve la configuración (crea una por defecto si no existe ninguna)
router.get('/', verificarToken, soloAdmin, async (req, res) => {
  try {
    let config = await Configuracion.findOne();
    if (!config) {
      config = await Configuracion.create({});
    }
    res.json(config);
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ message: 'Error al obtener la configuración' });
  }
});

// PUT /api/configuracion -> actualiza la configuración (o la crea si no existía)
router.put('/', verificarToken, soloAdmin, async (req, res) => {
  try {
    const { nombrePanel, emailContacto } = req.body;

    let config = await Configuracion.findOne();
    if (!config) {
      config = new Configuracion();
    }

    if (nombrePanel !== undefined) config.nombrePanel = nombrePanel;
    if (emailContacto !== undefined) config.emailContacto = emailContacto;

    await config.save();
    res.json(config);
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ message: 'Error al guardar la configuración' });
  }
});

module.exports = router;