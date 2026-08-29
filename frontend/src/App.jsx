// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AlumnoDashboard from './pages/AlumnoDashboard';
import Home from './pages/Home';

function App() {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setAuth({
        token: localStorage.getItem('token'),
        user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
      });
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isAuthenticated = !!auth.token && !!auth.user;
  const rawRole = auth.user ? (auth.user.role || auth.user.rol || '') : '';
  const userRole = rawRole.toLowerCase().trim();

  // Validación limpia: si es admin o administrador entra al admin, sino al alumno
  const esAdmin = userRole === 'admin' || userRole === 'administrador';

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route 
          path="/admin/*" 
          element={isAuthenticated && esAdmin ? <AdminDashboard /> : <Navigate to="/login" replace />} 
        />

        <Route 
          path="/alumno/*" 
          element={isAuthenticated && !esAdmin ? <AlumnoDashboard /> : <Navigate to="/login" replace />} 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;