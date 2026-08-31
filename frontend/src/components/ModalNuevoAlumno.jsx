// src/components/ModalNuevoAlumno.jsx
import React, { useState } from 'react';
import { API_URL, authHeaders } from '../config/api';

const ModalNuevoAlumno = ({ isOpen, onClose, onAgregarAlumno, plantillas = [] }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    usuario: '',
    password: '',
    dni: '',
    email: '',
    telefono: '',
    domicilio: '',
    sexo: '',
    fechaNacimiento: '',
    objetivo: plantillas.length > 0 ? plantillas[0].nombre : 'Pérdida de grasa',
    edad: '',
    peso: '',
    altura: ''
  });

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorBackend, setErrorBackend] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBackend('');
    setLoading(true);
    
    const plantillaSeleccionada = plantillas.find(p => p.nombre === formData.objetivo);

    const rutinaAsignada = plantillaSeleccionada
      ? { ...plantillaSeleccionada, plantillaId: plantillaSeleccionada._id || plantillaSeleccionada.id }
      : {
          nombre: formData.objetivo,
          dias: [
            { dia: "Día 1: General", ejercicios: [{ nombre: "Aperturas o Sentadillas", series: "3 x 10", carga: "A definir", descanso: "60s" }] }
          ]
        };

    const nuevoAlumno = {
      ...formData,
      role: 'alumno',
      estado: 'activo',
      fechaCreacion: new Date().toLocaleDateString(),
      rutinaActual: rutinaAsignada
    };

    try {
      const response = await fetch(`${API_URL}/api/alumnos/crear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(nuevoAlumno),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar el alumno en el servidor');
      }

      onAgregarAlumno(data.alumno || data);

      setFormData({
        nombre: '',
        usuario: '',
        password: '',
        dni: '',
        email: '',
        telefono: '',
        domicilio: '',
        sexo: '',
        fechaNacimiento: '',
        objetivo: plantillas.length > 0 ? plantillas[0].nombre : 'Pérdida de grasa',
        edad: '',
        peso: '',
        altura: ''
      });

      onClose();

    } catch (err) {
      console.error("Error al guardar en el backend:", err.message);
      setErrorBackend(err.message || 'No se pudo conectar con el servidor para guardar el alumno.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-[#121826] border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Registrar Nuevo Alumno</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer">✕</button>
        </div>

        {errorBackend && (
          <div className="mx-6 mt-4 bg-red-500/10 border border-red-500 text-red-400 p-3 text-xs uppercase tracking-wider text-center font-bold rounded-xl">
            {errorBackend}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre Completo</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff5733] transition" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Usuario</label>
              <input type="text" name="usuario" value={formData.usuario} onChange={handleChange} className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff5733] transition" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Contraseña</label>
              <div className="relative">
                <input type={mostrarPassword ? "text" : "password"} name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white outline-none focus:border-[#ff5733] transition" required />
                <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-sm cursor-pointer">
                  {mostrarPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Número de Documento (DNI)</label>
              <input type="text" name="dni" value={formData.dni} onChange={handleChange} placeholder="Ej: 41234567" className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff5733] transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email (para iniciar sesión)</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff5733] transition" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Teléfono</label>
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Ej: 3815551234" className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff5733] transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Domicilio</label>
              <input type="text" name="domicilio" value={formData.domicilio} onChange={handleChange} placeholder="Ej: Av. Belgrano 1234" className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff5733] transition" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Sexo</label>
              <select name="sexo" value={formData.sexo} onChange={handleChange} className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff5733] transition">
                <option value="">Seleccionar...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Fecha de Nacimiento</label>
              <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff5733] transition" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Objetivo / Rutina Plantilla</label>
            <select 
              name="objetivo"
              value={formData.objetivo} 
              onChange={handleChange}
              className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff5733] transition"
            >
              {plantillas.length > 0 ? (
                plantillas.map((plantilla, index) => (
                  <option key={index} value={plantilla.nombre}>
                    {plantilla.nombre}
                  </option>
                ))
              ) : (
                <option value="Rutina Base">No hay plantillas cargadas</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Edad</label>
              <input type="number" name="edad" value={formData.edad} onChange={handleChange} className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff5733] transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Peso</label>
              <input type="text" name="peso" value={formData.peso} onChange={handleChange} className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff5733] transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Altura</label>
              <input type="text" name="altura" value={formData.altura} onChange={handleChange} className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#ff5733] transition" />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <button type="button" onClick={onClose} className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition px-2 py-2">Cancelar</button>
            <button type="submit" disabled={loading} className="bg-[#ff5733] hover:bg-[#e04828] text-white text-xs px-6 py-3 rounded-xl font-bold cursor-pointer transition shadow-lg shadow-orange-900/20 disabled:opacity-50">
              {loading ? 'Guardando en Base de Datos...' : 'Guardar Alumno'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ModalNuevoAlumno;