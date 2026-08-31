import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Importa tus componentes de modales según corresponda en tu estructura de carpetas:
import ModalNuevoAlumno from "../components/ModalNuevoAlumno";
import ModalEditarAlumno from "../components/ModalEditarAlumno";
import ModalVerDatosAlumno from "../components/ModalVerDatosAlumno";
import ModalObservaciones from "../components/ModalObservaciones";
import ModalFormularioEjercicio from "../components/ModalFormularioEjercicio";
import { API_URL, authHeaders } from '../config/api';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Estados principales
  const [activeSection, setActiveSection] = useState('alumnos');
  const [alumnos, setAlumnos] = useState([]);
  const [plantillas, setPlantillas] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [configuracion, setConfiguracion] = useState({
    nombrePanel: 'Panel de Administración',
    emailContacto: 'admin@universumcorp.com'
  });

  // Estados de Modales
  const [isModalAlumnoOpen, setIsModalAlumnoOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [isModalVerDatosOpen, setIsModalVerDatosOpen] = useState(false);
  const [isModalObsOpen, setIsModalObsOpen] = useState(false);
  const [isModalEjercicioOpen, setIsModalEjercicioOpen] = useState(false);
  const [diaSeleccionadoParaEjercicio, setDiaSeleccionadoParaEjercicio] = useState(null);

  // Helper para obtener el ID correcto (soporta MongoDB _id e id local)
  const getId = (item) => item?._id || item?.id;

  // --- CARGA INICIAL DE DATOS DESDE EL BACKEND ---
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const [resAlumnos, resPlantillas, resConfig] = await Promise.all([
          fetch(`${API_URL}/api/alumnos`, { headers: authHeaders() }),
          fetch(`${API_URL}/api/plantillas`, { headers: authHeaders() }),
          fetch(`${API_URL}/api/configuracion`, { headers: authHeaders() })
        ]);

        if (resAlumnos.ok) {
          const dataAlumnos = await resAlumnos.json();
          setAlumnos(dataAlumnos);
        }

        if (resPlantillas.ok) {
          const dataPlantillas = await resPlantillas.json();
          setPlantillas(dataPlantillas);
        }

        if (resConfig.ok) {
          const dataConfig = await resConfig.json();
          setConfiguracion({
            nombrePanel: dataConfig.nombrePanel,
            emailContacto: dataConfig.emailContacto
          });
        }
      } catch (e) {
        console.error('Error al cargar datos del panel:', e);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const guardarConfiguracion = async () => {
    try {
      const res = await fetch(`${API_URL}/api/configuracion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(configuracion)
      });
      if (res.ok) {
        alert('¡Configuración guardada exitosamente!');
      } else {
        alert('No se pudo guardar la configuración. Intentá de nuevo.');
      }
    } catch (e) {
      console.error('Error al guardar configuración:', e);
      alert('No se pudo conectar con el servidor para guardar la configuración.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    navigate('/login', { replace: true });
  };

  // --- FUNCIONES API & MANEJADORES ---

  const actualizarAlumnoEnBD = async (alumnoModificado) => {
    try {
      const id = getId(alumnoModificado);
      await fetch(`${API_URL}/api/alumnos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(alumnoModificado)
      });
    } catch (e) {
      console.error("Error al actualizar alumno:", e);
    }
  };

  const actualizarPlantillaEnBD = async (plantillaActualizada) => {
    try {
      const id = getId(plantillaActualizada);
      await fetch(`${API_URL}/api/plantillas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(plantillaActualizada)
      });
    } catch (e) {
      console.error("Error al actualizar plantilla:", e);
    }
  };

  // --- ACCIONES DE ALUMNOS ---
  const handleAgregarAlumno = (nuevoAlumno) => {
    setAlumnos(prev => [...prev, nuevoAlumno]);
  };

  const handleActualizarAlumno = (alumnoActualizado) => {
    setAlumnos(prev => prev.map(al => getId(al) === getId(alumnoActualizado) ? alumnoActualizado : al));
    if (getId(alumnoSeleccionado) === getId(alumnoActualizado)) {
      setAlumnoSeleccionado(alumnoActualizado);
    }
  };

  const handleEliminarAlumno = async (alumno) => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${alumno.nombre}? Esta acción no se puede deshacer.`)) return;
    const id = getId(alumno);
    try {
      await fetch(`${API_URL}/api/alumnos/${id}`, { method: 'DELETE', headers: authHeaders() });
    } catch (e) {
      console.error('Error al eliminar alumno:', e);
    }
    setAlumnos(prev => prev.filter(a => getId(a) !== id));
    if (getId(alumnoSeleccionado) === id) {
      setAlumnoSeleccionado(null);
    }
  };

  const handleToggleEstado = async (alumno) => {
    const nuevoEstado = alumno.estado === 'inactivo' ? 'activo' : 'inactivo';
    const alumnoModificado = { ...alumno, estado: nuevoEstado };
    handleActualizarAlumno(alumnoModificado);
    await actualizarAlumnoEnBD(alumnoModificado);
  };

  const handleGuardarObservaciones = async (nuevasObs) => {
    if (!alumnoSeleccionado) return;
    const alumnoModificado = { ...alumnoSeleccionado, observaciones: nuevasObs };
    handleActualizarAlumno(alumnoModificado);
    await actualizarAlumnoEnBD(alumnoModificado);
  };

  const handleAgregarDiaAlumno = async () => {
    if (!alumnoSeleccionado) return;
    const nombreDia = prompt("Nombre del nuevo día (Ej: Día 1 - Pierna):");
    if (!nombreDia?.trim()) return;

    const nuevosDias = [...(alumnoSeleccionado.rutinaActual?.dias || []), { dia: nombreDia, ejercicios: [] }];
    const alumnoModificado = {
      ...alumnoSeleccionado,
      rutinaActual: { ...(alumnoSeleccionado.rutinaActual || {}), dias: nuevosDias }
    };

    setAlumnoSeleccionado(alumnoModificado);
    handleActualizarAlumno(alumnoModificado);
    await actualizarAlumnoEnBD(alumnoModificado);
  };

  const eliminarDiaAlumno = async (indexDia) => {
    const nuevosDias = alumnoSeleccionado.rutinaActual.dias.filter((_, idx) => idx !== indexDia);
    const alumnoModificado = {
      ...alumnoSeleccionado,
      rutinaActual: { ...alumnoSeleccionado.rutinaActual, dias: nuevosDias }
    };

    setAlumnoSeleccionado(alumnoModificado);
    handleActualizarAlumno(alumnoModificado);
    await actualizarAlumnoEnBD(alumnoModificado);
  };

  const eliminarEjercicioAlumno = async (indexDia, indexEjercicio) => {
    const nuevosDias = [...alumnoSeleccionado.rutinaActual.dias];
    nuevosDias[indexDia].ejercicios = nuevosDias[indexDia].ejercicios.filter((_, idx) => idx !== indexEjercicio);

    const alumnoModificado = {
      ...alumnoSeleccionado,
      rutinaActual: { ...alumnoSeleccionado.rutinaActual, dias: nuevosDias }
    };

    setAlumnoSeleccionado(alumnoModificado);
    handleActualizarAlumno(alumnoModificado);
    await actualizarAlumnoEnBD(alumnoModificado);
  };

  // --- ACCIONES DE PLANTILLAS ---
  const handleAgregarDiaPlantilla = async () => {
    if (!plantillaSeleccionada) return;
    const nombreDia = prompt("Nombre del nuevo día para la plantilla:");
    if (!nombreDia?.trim()) return;

    const nuevosDias = [...(plantillaSeleccionada.dias || []), { dia: nombreDia, ejercicios: [] }];
    const plantillaActualizada = { ...plantillaSeleccionada, dias: nuevosDias };

    setPlantillaSeleccionada(plantillaActualizada);
    setPlantillas(prev => prev.map(p => getId(p) === getId(plantillaActualizada) ? plantillaActualizada : p));
    await actualizarPlantillaEnBD(plantillaActualizada);
  };

  const eliminarDiaPlantilla = async (indexDia) => {
    const nuevosDias = plantillaSeleccionada.dias.filter((_, idx) => idx !== indexDia);
    const plantillaActualizada = { ...plantillaSeleccionada, dias: nuevosDias };

    setPlantillaSeleccionada(plantillaActualizada);
    setPlantillas(prev => prev.map(p => getId(p) === getId(plantillaActualizada) ? plantillaActualizada : p));
    await actualizarPlantillaEnBD(plantillaActualizada);
  };

  const eliminarEjercicioPlantilla = async (indexDia, indexEjercicio) => {
    const nuevosDias = [...plantillaSeleccionada.dias];
    nuevosDias[indexDia].ejercicios = nuevosDias[indexDia].ejercicios.filter((_, idx) => idx !== indexEjercicio);

    const plantillaActualizada = { ...plantillaSeleccionada, dias: nuevosDias };

    setPlantillaSeleccionada(plantillaActualizada);
    setPlantillas(prev => prev.map(p => getId(p) === getId(plantillaActualizada) ? plantillaActualizada : p));
    await actualizarPlantillaEnBD(plantillaActualizada);
  };

    const asignarPlantillaAAlumno = async (plantilla) => {
    if (!alumnoSeleccionado) return;
    const copiaPlantilla = JSON.parse(JSON.stringify(plantilla)); // Copia profunda para evitar referencias cruzadas
    copiaPlantilla.plantillaId = getId(plantilla);
    const alumnoModificado = {
      ...alumnoSeleccionado,
      rutinaActual: copiaPlantilla
    };
    handleActualizarAlumno(alumnoModificado);
    await actualizarAlumnoEnBD(alumnoModificado);
    alert(`¡Plantilla "${plantilla.nombre}" asignada con éxito a ${alumnoSeleccionado.nombre}!`);
  };

  const handleAgregarEjercicio = async (nuevoEjercicio) => {
    if (plantillaSeleccionada) {
      const dias = [...plantillaSeleccionada.dias];
      const targetIndex = diaSeleccionadoParaEjercicio !== null ? diaSeleccionadoParaEjercicio : 0;
      if (dias[targetIndex]) {
        dias[targetIndex].ejercicios.push(nuevoEjercicio);
        const actualizada = { ...plantillaSeleccionada, dias };
        setPlantillaSeleccionada(actualizada);
        setPlantillas(prev => prev.map(p => getId(p) === getId(actualizada) ? actualizada : p));
        await actualizarPlantillaEnBD(actualizada);
      }
    } else if (alumnoSeleccionado && alumnoSeleccionado.rutinaActual?.dias) {
      const dias = [...alumnoSeleccionado.rutinaActual.dias];
      const targetIndex = diaSeleccionadoParaEjercicio !== null ? diaSeleccionadoParaEjercicio : 0;
      if (dias[targetIndex]) {
        dias[targetIndex].ejercicios.push(nuevoEjercicio);
        const alumnoModificado = {
          ...alumnoSeleccionado,
          rutinaActual: { ...alumnoSeleccionado.rutinaActual, dias }
        };
        setAlumnoSeleccionado(alumnoModificado);
        handleActualizarAlumno(alumnoModificado);
        await actualizarAlumnoEnBD(alumnoModificado);
      }
    }
    setIsModalEjercicioOpen(false);
  };

  const alumnosFiltrados = alumnos.filter(a =>
    a.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.dni?.includes(busqueda) ||
    a.email?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">

      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-base sm:text-lg font-black text-slate-900">{configuracion.nombrePanel}</h1>

          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => { setActiveSection('alumnos'); setAlumnoSeleccionado(null); }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer transition ${activeSection === 'alumnos' ? 'bg-[#ff5733] text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Alumnos
            </button>
            <button
              onClick={() => { setActiveSection('rutinas'); setAlumnoSeleccionado(null); setPlantillaSeleccionada(null); }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer transition ${activeSection === 'rutinas' ? 'bg-[#ff5733] text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Rutinas
            </button>
            <button
              onClick={() => setActiveSection('configuracion')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer transition ${activeSection === 'configuracion' ? 'bg-[#ff5733] text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Configuración
            </button>
          </nav>

          <button
            onClick={handleLogout}
            className="text-xs font-bold text-slate-500 hover:text-red-600 cursor-pointer transition"
          >
            Cerrar sesión ↪
          </button>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6 flex-1">

        {/* SECCIÓN ALUMNOS (LISTADO PRINCIPAL) */}
        {activeSection === 'alumnos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Alumnos</h1>
                <p className="text-xs text-slate-500 mt-1">Gestioná el alta, edición y seguimiento de tus alumnos.</p>
              </div>
              <button
                onClick={() => setIsModalAlumnoOpen(true)}
                className="bg-[#ff5733] hover:bg-[#e04828] text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-md transition cursor-pointer w-full sm:w-auto text-center"
              >
                + Nuevo Alumno
              </button>
            </div>

            <input
              type="text"
              placeholder="Buscar por nombre, DNI o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-[#ff5733] transition"
            />

            <div className="grid grid-cols-1 gap-4">
              {cargando ? (
                <div className="bg-white border border-slate-200 p-8 rounded-xl text-center text-slate-400 text-xs italic">
                  Cargando alumnos...
                </div>
              ) : alumnosFiltrados.length === 0 ? (
                <div className="bg-white border border-slate-200 p-8 rounded-xl text-center text-slate-400 text-xs italic">
                  {alumnos.length === 0
                    ? 'No hay alumnos registrados todavía. Hacé clic en "+ Nuevo Alumno" para empezar.'
                    : 'No se encontraron alumnos con ese criterio de búsqueda.'}
                </div>
              ) : (
                alumnosFiltrados.map((alumno) => (
                  <div key={getId(alumno)} className="bg-white border border-slate-200 p-4 sm:p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{alumno.nombre}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${alumno.estado === 'inactivo' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {alumno.estado === 'inactivo' ? 'Inactivo' : 'Activo'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{alumno.email} {alumno.dni && `· DNI: ${alumno.dni}`}</p>
                      <span className="inline-block mt-2 bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                        Rutina: {alumno.rutinaActual?.nombre || 'Sin asignar'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                      <button
                        onClick={() => { setAlumnoSeleccionado(alumno); setIsModalVerDatosOpen(true); }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-2 rounded-lg font-semibold cursor-pointer border border-slate-200"
                      >
                        Ver datos
                      </button>
                      <button
                        onClick={() => { setAlumnoSeleccionado(alumno); setIsModalEditOpen(true); }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-2 rounded-lg font-semibold cursor-pointer border border-slate-200"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => { setAlumnoSeleccionado(alumno); setIsModalObsOpen(true); }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-2 rounded-lg font-semibold cursor-pointer border border-slate-200"
                      >
                        Observaciones
                      </button>
                      <button
                        onClick={() => handleToggleEstado(alumno)}
                        className={`text-xs px-3 py-2 rounded-lg font-semibold cursor-pointer border ${alumno.estado === 'inactivo' ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'}`}
                      >
                        {alumno.estado === 'inactivo' ? 'Activar' : 'Desactivar'}
                      </button>
                      <button
                        onClick={() => handleEliminarAlumno(alumno)}
                        className="bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs px-3 py-2 rounded-lg font-semibold cursor-pointer border border-slate-200"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SECCIÓN RUTINAS / DETALLE DE RUTINA DE ALUMNO */}
        {activeSection === 'rutinas' && alumnoSeleccionado && !plantillaSeleccionada && (
          <div className="space-y-6">
            <button
              onClick={() => setActiveSection('alumnos')}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              ← Volver a alumnos
            </button>

            <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between gap-4 shadow-xs items-center">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">Rutina de: {alumnoSeleccionado.nombre}</h1>
                <p className="text-xs text-slate-500 mt-1">Gestiona los días y ejercicios asignados directamente al alumno.</p>
              </div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <button onClick={handleAgregarDiaAlumno} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer shadow-xs flex-1 md:flex-none text-center">+ Nuevo Día</button>
                <button onClick={() => { setDiaSeleccionadoParaEjercicio(null); setIsModalEjercicioOpen(true); }} className="bg-[#ff5733] hover:bg-[#e04828] text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer shadow-xs flex-1 md:flex-none text-center">+ Agregar Ejercicio</button>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 space-y-4 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900">Días de Entrenamiento</h3>

              {(!alumnoSeleccionado.rutinaActual?.dias || alumnoSeleccionado.rutinaActual.dias.length === 0) && (
                <p className="text-xs text-slate-400 py-4 text-center">No hay días creados en esta rutina. Haz clic en "+ Nuevo Día" para empezar.</p>
              )}

              {alumnoSeleccionado.rutinaActual?.dias?.map((d, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-2 gap-2">
                    <h4 className="font-bold text-[#ff5733] text-sm">{d.dia}</h4>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { setDiaSeleccionadoParaEjercicio(i); setIsModalEjercicioOpen(true); }}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer"
                      >
                        + Agregar Ejercicio
                      </button>
                      <button
                        onClick={() => eliminarDiaAlumno(i)}
                        className="text-xs text-red-400 hover:text-red-600 font-bold cursor-pointer"
                      >
                        Eliminar Día ✕
                      </button>
                    </div>
                  </div>

                  {d.ejercicios.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic py-1">Sin ejercicios en este día.</p>
                  )}

                  {d.ejercicios.map((ej, j) => (
                    <div key={j} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs bg-white p-2.5 rounded border border-slate-200 text-slate-700 gap-1">
                      <span className="font-bold">{ej.nombre}</span>
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        <span className="text-slate-500 text-[11px]">Series: {ej.series} | Carga: {ej.carga} | Descanso: {ej.descanso}</span>
                        <button
                          onClick={() => eliminarEjercicioAlumno(i, j)}
                          className="text-red-400 hover:text-red-600 font-bold cursor-pointer ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECCIÓN PLANTILLAS GENERALES */}
        {activeSection === 'rutinas' && !plantillaSeleccionada && !alumnoSeleccionado && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Rutinas Generales (Plantillas)</h1>
              </div>
              <button
                onClick={async () => {
                  const nombreP = prompt("Nombre de la nueva plantilla (Ej: Hipertrofia Avanzada):");
                  if (!nombreP?.trim()) return;
                  const descP = prompt("Breve descripción de la plantilla:", "Creada desde el panel administrativo");

                  const nueva = {
                    nombre: nombreP,
                    descripcion: descP || "",
                    dias: [{ dia: "Día 1: General", ejercicios: [] }]
                  };

                  try {
                    const res = await fetch(`${API_URL}/api/plantillas/crear`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', ...authHeaders() },
                      body: JSON.stringify(nueva)
                    });
                    if (res.ok) {
                      const creada = await res.json();
                      setPlantillas(prev => [...prev, creada]);
                      setPlantillaSeleccionada(creada);
                      return;
                    }
                  } catch (e) { console.error(e); }

                  const localNueva = { id: Date.now(), ...nueva };
                  setPlantillas(prev => [...prev, localNueva]);
                  setPlantillaSeleccionada(localNueva);
                }}
                className="bg-[#ff5733] hover:bg-[#e04828] text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-md transition cursor-pointer w-full sm:w-auto text-center"
              >
                + Nueva Plantilla
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {plantillas.length === 0 ? (
                <div className="bg-white border border-slate-200 p-8 rounded-xl text-center text-slate-400 text-xs italic">
                  No hay plantillas creadas todavía. Haz clic en "+ Nueva Plantilla" para crear una.
                </div>
              ) : (
                plantillas.map((plantilla) => (
                  <div key={getId(plantilla)} className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{plantilla.nombre}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{plantilla.descripcion}</p>
                      <span className="inline-block mt-2 bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                        {plantilla.dias?.length || 0} días estructurados
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                      <button
                        onClick={() => setPlantillaSeleccionada(plantilla)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3.5 py-2 rounded-lg font-bold cursor-pointer shadow-xs flex-1 md:flex-none text-center"
                      >
                        Editar Plantilla
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm(`¿Estás seguro de eliminar la plantilla "${plantilla.nombre}"?`)) {
                            try {
                              const id = getId(plantilla);
                              await fetch(`${API_URL}/api/plantillas/${id}`, { method: 'DELETE', headers: authHeaders() });
                            } catch (e) { console.error(e); }

                            setPlantillas(prev => prev.filter(p => getId(p) !== getId(plantilla)));
                          }
                        }}
                        className="bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs px-3 py-2 rounded-lg font-semibold cursor-pointer border border-slate-200"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* DETALLE / EDICIÓN DE PLANTILLA SELECCIONADA */}
        {activeSection === 'rutinas' && plantillaSeleccionada && (
          <div className="space-y-6">
            <button onClick={() => setPlantillaSeleccionada(null)} className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer">← Volver a plantillas</button>

            <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between gap-4 shadow-xs items-center">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">Plantilla: {plantillaSeleccionada.nombre}</h1>
                <p className="text-xs text-slate-500 mt-1">{plantillaSeleccionada.descripcion}</p>
              </div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <button onClick={handleAgregarDiaPlantilla} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer shadow-xs flex-1 md:flex-none text-center">+ Nuevo Día</button>
                <button onClick={() => { setDiaSeleccionadoParaEjercicio(null); setIsModalEjercicioOpen(true); }} className="bg-[#ff5733] hover:bg-[#e04828] text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer shadow-xs flex-1 md:flex-none text-center">+ Agregar Ejercicio</button>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 space-y-4 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900">Estructura de la Plantilla</h3>

              {(!plantillaSeleccionada.dias || plantillaSeleccionada.dias.length === 0) && (
                <p className="text-xs text-slate-400 py-4 text-center">No hay días creados en esta plantilla. Haz clic en "+ Nuevo Día" para empezar.</p>
              )}

              {plantillaSeleccionada.dias?.map((d, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-2 gap-2">
                    <h4 className="font-bold text-[#ff5733] text-sm">{d.dia}</h4>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { setDiaSeleccionadoParaEjercicio(i); setIsModalEjercicioOpen(true); }}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer"
                      >
                        + Agregar Ejercicio
                      </button>
                      <button
                        onClick={() => eliminarDiaPlantilla(i)}
                        className="text-xs text-red-400 hover:text-red-600 font-bold cursor-pointer"
                      >
                        Eliminar Día ✕
                      </button>
                    </div>
                  </div>

                  {d.ejercicios.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic py-1">Sin ejercicios en este día.</p>
                  )}

                  {d.ejercicios.map((ej, j) => (
                    <div key={j} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs bg-white p-2.5 rounded border border-slate-200 text-slate-700 gap-1">
                      <span className="font-bold">{ej.nombre}</span>
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        <span className="text-slate-500 text-[11px]">Series: {ej.series} | Carga: {ej.carga} | Descanso: {ej.descanso}</span>
                        <button
                          onClick={() => eliminarEjercicioPlantilla(i, j)}
                          className="text-red-400 hover:text-red-600 font-bold cursor-pointer ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {alumnoSeleccionado ? null : (
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
                <p className="text-xs text-slate-500 mb-3">Para asignar esta plantilla a un alumno, andá a la sección "Alumnos", elegí un alumno y usá el botón "Rutina" para asignarle una plantilla desde ahí.</p>
              </div>
            )}

            {alumnoSeleccionado && (
              <button
                onClick={() => asignarPlantillaAAlumno(plantillaSeleccionada)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2.5 rounded-lg font-bold cursor-pointer shadow-xs"
              >
                ✓ Asignar esta plantilla a {alumnoSeleccionado.nombre}
              </button>
            )}
          </div>
        )}

        {/* CONFIGURACIÓN DEL SISTEMA */}
        {activeSection === 'configuracion' && (
          <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Configuración del Sistema</h1>
            <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-4 shadow-xs max-w-xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Datos del Entrenador / Administrador</h3>
                <p className="text-xs text-slate-500">Modifica la información general de tu panel.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nombre del Panel</label>
                  <input
                    type="text"
                    value={configuracion.nombrePanel}
                    onChange={(e) => setConfiguracion({...configuracion, nombrePanel: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 outline-none focus:border-[#ff5733]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Email de Contacto</label>
                  <input
                    type="email"
                    value={configuracion.emailContacto}
                    onChange={(e) => setConfiguracion({...configuracion, emailContacto: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 outline-none focus:border-[#ff5733]"
                  />
                </div>
                <button
                  onClick={guardarConfiguracion}
                  className="bg-[#ff5733] hover:bg-[#e04828] text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer shadow-xs w-full sm:w-auto"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full bg-white border-t border-slate-200 py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        Desarrollado por Universumcorp © 2026
      </footer>

      {/* MODALES */}
      <ModalNuevoAlumno
        isOpen={isModalAlumnoOpen}
        onClose={() => setIsModalAlumnoOpen(false)}
        onAgregarAlumno={handleAgregarAlumno}
        plantillas={plantillas}
      />

      <ModalEditarAlumno
        isOpen={isModalEditOpen}
        onClose={() => setIsModalEditOpen(false)}
        alumno={alumnoSeleccionado}
        onActualizarAlumno={handleActualizarAlumno}
        plantillas={plantillas}
      />

      <ModalVerDatosAlumno
        isOpen={isModalVerDatosOpen}
        onClose={() => setIsModalVerDatosOpen(false)}
        alumno={alumnoSeleccionado}
        onOpenEdit={() => setIsModalEditOpen(true)}
      />

      <ModalObservaciones
        isOpen={isModalObsOpen}
        onClose={() => setIsModalObsOpen(false)}
        alumno={alumnoSeleccionado}
        onGuardarObservaciones={handleGuardarObservaciones}
      />

      <ModalFormularioEjercicio
        isOpen={isModalEjercicioOpen}
        onClose={() => setIsModalEjercicioOpen(false)}
        onAgregarEjercicio={handleAgregarEjercicio}
      />
    </div>
  );
};

export default AdminDashboard;