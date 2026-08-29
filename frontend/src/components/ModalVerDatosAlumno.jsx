// src/components/ModalVerDatosAlumno.jsx
import React from 'react';

const ModalVerDatosAlumno = ({ isOpen, onClose, alumno, onOpenEdit }) => {
  if (!isOpen || !alumno) return null;

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'No especificado';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaStr)) return fechaStr;
    const partes = fechaStr.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return fechaStr;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-[#121826] border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-white shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold">Datos Personales del Alumno</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer">✕</button>
        </div>

        <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4 bg-[#1b2234] p-4 rounded-xl border border-slate-700/60">
            <div>
              <span className="block text-slate-400 font-bold uppercase text-[10px]">Nombre Completo</span>
              <span className="text-sm font-semibold text-white">{alumno.nombre}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-bold uppercase text-[10px]">Usuario</span>
              <span className="text-sm font-semibold text-white">@{alumno.usuario}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-[#1b2234] p-4 rounded-xl border border-slate-700/60">
            <div>
              <span className="block text-slate-400 font-bold uppercase text-[10px]">Número de Documento (DNI)</span>
              <span className="text-sm font-semibold text-white">{alumno.dni || 'No especificado'}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-bold uppercase text-[10px]">Email</span>
              <span className="text-sm font-semibold text-white">{alumno.email || 'No especificado'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-[#1b2234] p-4 rounded-xl border border-slate-700/60">
            <div>
              <span className="block text-slate-400 font-bold uppercase text-[10px]">Teléfono</span>
              <span className="text-sm font-semibold text-white">{alumno.telefono || 'No especificado'}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-bold uppercase text-[10px]">Domicilio</span>
              <span className="text-sm font-semibold text-white">{alumno.domicilio || 'No especificado'}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-[#1b2234] p-4 rounded-xl border border-slate-700/60">
            <div>
              <span className="block text-slate-400 font-bold uppercase text-[10px]">Sexo</span>
              <span className="text-sm font-semibold text-white">{alumno.sexo || 'No especificado'}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-bold uppercase text-[10px]">Fecha Nac.</span>
              <span className="text-sm font-semibold text-white">{formatearFecha(alumno.fechaNacimiento)}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-bold uppercase text-[10px]">Edad</span>
              <span className="text-sm font-semibold text-white">{alumno.edad ? `${alumno.edad} años` : 'S/D'}</span>
            </div>
          </div>

          <div className="bg-[#1b2234] p-4 rounded-xl border border-slate-700/60 space-y-1">
            <span className="block text-slate-400 font-bold uppercase text-[10px]">Objetivo Actual</span>
            <span className="text-sm font-semibold text-[#ff5733]">{alumno.objetivo || 'Sin objetivo definido'}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-[#1b2234] p-4 rounded-xl border border-slate-700/60">
            <div>
              <span className="block text-slate-400 font-bold uppercase text-[10px]">Peso Actual</span>
              <span className="text-sm font-semibold text-white">{alumno.peso || 'S/D'}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-bold uppercase text-[10px]">Altura</span>
              <span className="text-sm font-semibold text-white">{alumno.altura || 'S/D'}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
          <button 
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-2.5 rounded-xl font-bold cursor-pointer transition"
          >
            Cerrar
          </button>
          <button 
            onClick={() => { onClose(); onOpenEdit(); }} 
            className="bg-[#ff5733] hover:bg-[#e04828] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-orange-900/20 transition cursor-pointer"
          >
            Editar Datos
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModalVerDatosAlumno;