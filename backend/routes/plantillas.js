const express = require('express');
const Plantilla = require('../models/Plantilla');
const Alumno = require('../models/Alumno');
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

// PUT /api/plantillas/:id -> editar una plantilla, y sincronizar a los alumnos que la tienen asignada
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

    // Buscar a todos los alumnos que tienen ESTA plantilla asignada
    const alumnosAfectados = await Alumno.find({ 'rutinaActual.plantillaId': req.params.id });

    for (const alumno of alumnosAfectados) {
      const diasViejos = alumno.rutinaActual?.dias || [];

      // Reconstruimos los días/ejercicios según la plantilla actualizada,
      // pero conservando el historial de cargas de los ejercicios que ya existían.
      const diasNuevos = (actualizada.dias || []).map(diaPlantilla => {
        const diaViejo = diasViejos.find(d => d.dia === diaPlantilla.dia);
        const ejerciciosNuevos = (diaPlantilla.ejercicios || []).map(ejPlantilla => {
          const ejViejo = diaViejo?.ejercicios?.find(e => e.nombre === ejPlantilla.nombre);
          return {
            nombre: ejPlantilla.nombre,
            series: ejPlantilla.series,
            carga: ejPlantilla.carga,
            descanso: ejPlantilla.descanso,
            historial: ejViejo?.historial || []
          };
        });
        return { dia: diaPlantilla.dia, ejercicios: ejerciciosNuevos };
      });

      alumno.rutinaActual = {
        nombre: actualizada.nombre,
        descripcion: actualizada.descripcion,
        plantillaId: actualizada._id,
        dias: diasNuevos
      };
      await alumno.save();
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