// src/components/Toast.jsx
import React from 'react';

const Toast = ({ mensaje, tipo = 'success', onClose }) => {
  if (!mensaje) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className={`px-4 py-3 rounded-xl shadow-xl border text-xs font-bold flex items-center gap-3 ${
        tipo === 'success' 
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
          : 'bg-[#ff5733]/10 text-[#ff5733] border-[#ff5733]/30'
      }`}>
        <span className="text-sm">{tipo === 'success' ? '✅' : 'ℹ️'}</span>
        <span>{mensaje}</span>
        <button 
          onClick={onClose} 
          className="ml-2 text-current opacity-70 hover:opacity-100 cursor-pointer font-black text-sm"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;