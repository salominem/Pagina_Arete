// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      const usuarioLogueado = {
        id: data.user._id || data.user.id,
        nombre: data.user.nombre,
        email: data.user.email,
        usuario: data.user.usuario,
        role: data.user.role || data.user.rol || 'alumno'
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(usuarioLogueado));

      window.dispatchEvent(new Event('storage'));

      const userRole = usuarioLogueado.role.toLowerCase().trim();

      if (userRole === 'admin' || userRole === 'administrador') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/alumno', { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-slate-100 flex flex-col justify-between selection:bg-[#ff5733] selection:text-white font-sans">
      <header className="w-full bg-[#141414]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-end items-center">
        <button 
          onClick={() => navigate('/')}
          className="text-xs uppercase tracking-widest text-slate-400 hover:text-white transition cursor-pointer font-black"
        >
          ← Volver al inicio
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#1c1c1c] border border-white/10 p-8 sm:p-10 shadow-2xl space-y-8 rounded-2xl">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-widest uppercase text-white">
              Iniciar Sesión
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Ingresa a tu panel de entrenamiento
            </p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 text-[10px] uppercase tracking-widest text-center font-bold rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-black">Email</label>
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#141414] border border-white/20 rounded-xl px-4 py-3 text-xs text-white tracking-wider placeholder-slate-600 focus:outline-none focus:border-[#ff5733] transition font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-black">Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#141414] border border-white/20 rounded-xl px-4 py-3 text-xs text-white tracking-wider placeholder-slate-600 focus:outline-none focus:border-[#ff5733] transition font-medium"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff5733] hover:bg-[#e04828] text-white py-3.5 rounded-xl text-xs uppercase tracking-widest font-black transition duration-300 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {loading ? 'Validando...' : 'Ingresar al Sistema'}
            </button>
          </form>

          <div className="text-center border-t border-white/10 pt-6">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              ¿No tienes cuenta? <span className="text-[#ff5733] font-black cursor-pointer hover:underline" onClick={() => navigate('/')}>Solicita acceso con el entrenador</span>
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full py-6 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest border-t border-white/5 bg-[#141414]">
        Desarrollado por Universumcorp © 2026
      </footer>
    </div>
  );
};

export default Login;