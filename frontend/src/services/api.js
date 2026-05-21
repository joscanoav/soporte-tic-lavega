// FIX: usar variable de entorno de Vite, con fallback para desarrollo local
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('tic_token');

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const handleRes = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error en la petición');
  return data;
};

export const api = {
  get:    (path)       => fetch(`${BASE}${path}`, { headers: headers() }).then(handleRes),
  post:   (path, body) => fetch(`${BASE}${path}`, { method: 'POST',   headers: headers(), body: JSON.stringify(body) }).then(handleRes),
  patch:  (path, body) => fetch(`${BASE}${path}`, { method: 'PATCH',  headers: headers(), body: JSON.stringify(body) }).then(handleRes),
  delete: (path)       => fetch(`${BASE}${path}`, { method: 'DELETE', headers: headers() }).then(handleRes),
};
