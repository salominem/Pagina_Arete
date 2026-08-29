const express = require('express');
const Plantilla = require('../models/Plantilla');
const { verificarToken, soloAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/plantillas -> listar todas las plantillas
router.get('/', verificarToken, async (req, res) => {
  try {
    const plantillas = await Plantilla.find();
    res.json(plantillas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las plantillas' });
  }
});

// POST /api/plantillas/crear -> crear una plantilla nueva
router.post('/crear', verificarToken, soloAdmin, async (req, res) => {
  try {
    const nuevaPlantilla = new Plantilla(req.body);
    await nuevaPlantilla.save();
    res.status(201).json(nuevaPlantilla);
  } catch (error) {
    console.error('Error al crear plantilla:', error);
    res.status(500).json({ message: 'Error al crear la plantilla' });
  }
});

// PUT /api/plantillas/:id -> editar una plantilla
router.put('/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const datos = { ...req.body };
    delete datos._id;
    delete datos.id;

    const actualizada = await Plantilla.findByIdAndUpdate(
      req.params.id,
      datos,
      { new: true, runValidators: true }
    );

    if (!actualizada) {
      return res.status(404).json({ message: 'Plantilla no encontrada' });
    }

    res.json(actualizada);
  } catch (error) {
    console.error('Error al actualizar plantilla:', error);
    res.status(500).json({ message: 'Error al actualizar la plantilla' });
  }
});

// DELETE /api/plantillas/:id -> eliminar una plantilla
router.delete('/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const eliminada = await Plantilla.findByIdAndDelete(req.params.id);
    if (!eliminada) {
      return res.status(404).json({ message: 'Plantilla no encontrada' });
    }
    res.json({ message: 'Plantilla eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la plantilla' });
  }
});

module.exports = router;