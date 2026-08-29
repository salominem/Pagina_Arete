// URL base de la API. En desarrollo usa localhost por defecto.
// En producción, se define VITE_API_URL en las variables de entorno de Vercel
// apuntando a la URL real del backend (ej: https://tu-backend.onrender.com)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Devuelve el header de Authorization con el token guardado en el login.
// Se usa junto con 'Content-Type' en los fetch a rutas protegidas.
export function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}