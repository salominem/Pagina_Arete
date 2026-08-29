// src/components/ModalObservaciones.jsx
import React, { useState, useEffect } from 'react';

const ModalObservaciones = ({ isOpen, onClose, alumno, onGuardarObservaciones }) => {
  const [historial, setHistorial] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');

  useEffect(() => {
    if (alumno) {
      if (Array.isArray(alumno.observaciones)) {
        setHistorial(alumno.observaciones);
      } else if (typeof alumno.observaciones === 'string' && alumno.observaciones.trim() !== '') {
        setHistorial([{ remitente: 'admin', texto: alumno.observaciones }]);
      } else {
        setHistorial([]);
      }
    }
  }, [alumno]);

  if (!isOpen || !alumno) return null;

  const handleEnviarMensaje = (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;

    const mensajeAdmin = {
      remitente: 'admin',
      texto: nuevoMensaje.trim(),
      fecha: new Date().toLocaleDateString()
    };

    const historialActualizado = [...historial, mensajeAdmin];
    setHistorial(historialActualizado);
    onGuardarObservaciones(historialActualizado);
    setNuevoMensaje('');
  };

  const handleLimpiarChat = () => {
    if (window.confirm("¿Estás seguro de que deseas vaciar todo el historial de chat con este alumno?")) {
      setHistorial([]);
      onGuardarObservaciones([]);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-[#121826] border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Cabecera */}
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Chat y Observaciones</h2>
            <p className="text-xs text-slate-400 mt-0.5">Seguimiento e interacción con {alumno.nombre}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {historial.length > 0 && (
              <button 
                type="button"
                onClick={handleLimpiarChat}
                className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 font-medium"
                title="Vaciar chat completo"
              >
                🗑️ Limpiar chat
              </button>
            )}

            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Cuerpo del Historial de Conversación */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-3">
              Historial de mensajes:
            </label>
            
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 bg-[#1b2234] border border-slate-700/60 rounded-xl p-4">
              {historial.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">No hay mensajes registrados con este alumno todavía.</p>
              ) : (
                historial.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-xl text-xs max-w-[85%] ${
                      msg.remitente === 'admin' 
                        ? 'bg-[#ff5733] text-white ml-auto rounded-br-none shadow-md' 
                        : 'bg-[#2a344a] text-slate-200 mr-auto rounded-bl-none border border-slate-700'
                    }`}
                  >
                    <span className="block font-bold text-[10px] opacity-80 mb-0.5">
                      {msg.remitente === 'admin' ? 'Tú (Entrenador)' : alumno.nombre}
                    </span>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.texto}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Formulario para enviar nuevo mensaje */}
          <form onSubmit={handleEnviarMensaje} className="space-y-3 pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-400">
              Escribir nueva nota o respuesta al alumno:
            </label>
            <div className="flex gap-2">
              <textarea 
                rows="2"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Ej: ¡Excelente progreso! Sube un escalón más en los pesos la próxima sesión..."
                className="flex-1 bg-[#1b2234] border border-slate-700/60 rounded-xl p-3 text-xs text-white outline-none focus:border-[#ff5733] transition resize-none"
              />
              <button 
                type="submit"
                className="bg-[#ff5733] hover:bg-[#e04828] text-white text-xs px-4 rounded-xl font-bold cursor-pointer transition shadow-lg shadow-orange-900/25 self-end h-10"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>

        {/* Pie del Modal */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end shrink-0 bg-[#121826]">
          <button 
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-5 py-2.5 rounded-xl font-bold cursor-pointer transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModalObservaciones;