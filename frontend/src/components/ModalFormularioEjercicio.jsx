// src/components/ModalFormularioEjercicio.jsx
import React, { useState } from 'react';

const ModalFormularioEjercicio = ({ isOpen, onClose, onAgregarEjercicio }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    series: '',
    carga: '',
    descanso: '90s'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAgregarEjercicio(formData);
    setFormData({ nombre: '', series: '', carga: '', descanso: '90s' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#121826] border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-xl">
        <h2 className="text-xl font-black text-white mb-4 border-b border-slate-800 pb-3">Agregar Ejercicio a Rutina</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Nombre del Ejercicio</label>
            <input 
              type="text" 
              placeholder="Ej: Press de banca con barra"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full bg-[#1b2234] border border-slate-700/60 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#ff5733]" 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Series y Repeticiones</label>
              <input 
                type="text" 
                placeholder="Ej: 4 x 8/10"
                value={formData.series}
                onChange={(e) => setFormData({...formData, series: e.target.value})}
                className="w-full bg-[#1b2234] border border-slate-700/60 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#ff5733]" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Carga / Peso</label>
              <input 
                type="text" 
                placeholder="Ej: 60 kg"
                value={formData.carga}
                onChange={(e) => setFormData({...formData, carga: e.target.value})}
                className="w-full bg-[#1b2234] border border-slate-700/60 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#ff5733]" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Tiempo de Descanso</label>
            <input 
              type="text" 
              placeholder="Ej: 90s"
              value={formData.descanso}
              onChange={(e) => setFormData({...formData, descanso: e.target.value})}
              className="w-full bg-[#1b2234] border border-slate-700/60 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#ff5733]" 
              required 
            />
          </div>

          <div className="pt-3 flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="w-full py-2.5 rounded-lg text-sm font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer transition"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="w-full py-2.5 bg-[#ff5733] hover:bg-[#e04828] rounded-lg text-sm font-bold text-white shadow-xs cursor-pointer transition"
            >
              Añadir Ejercicio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalFormularioEjercicio;