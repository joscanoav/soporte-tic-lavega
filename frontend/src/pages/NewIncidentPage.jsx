import { useState, useEffect } from 'react';
import { api } from '../services/api';
import logo from '../assets/logo_lavega.png';

const CATEGORIES = [
  { value: 'HARDWARE',  label: '🖥 Hardware' },
  { value: 'SOFTWARE',  label: '💿 Software' },
  { value: 'RED',       label: '🌐 Red / WiFi' },
  { value: 'PROYECTOR', label: '📽 Proyector' },
  { value: 'IMPRESORA', label: '🖨 Impresora' },
  { value: 'AUDIO',     label: '🔊 Audio' },
  { value: 'PANTALLA',  label: '🖥 Pantalla' },
  { value: 'OTRO',      label: '❓ Otro' },
];

const PRIORITIES = [
  { value: 'BAJA',    label: 'Baja',    color: '#10b981' },
  { value: 'MEDIA',   label: 'Media',   color: '#f59e0b' },
  { value: 'ALTA',    label: 'Alta',    color: '#ef4444' },
  { value: 'CRITICA', label: 'Crítica', color: '#dc2626' },
];

const NewIncidentPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [devices, setDevices]       = useState([]);
  const [form, setForm] = useState({
    reporterName: '', classroomId: '', deviceId: '',
    category: '', title: '', description: '', priority: 'MEDIA',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/classrooms').then(d => setClassrooms(d.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.classroomId) { setDevices([]); return; }
    api.get(`/devices?classroomId=${form.classroomId}`)
      .then(d => setDevices(d.data)).catch(() => {});
  }, [form.classroomId]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post('/incidents', { ...form, deviceId: form.deviceId || null });
      setSuccess(data.data.ticketNumber);
      setForm({ reporterName: '', classroomId: '', deviceId: '', category: '', title: '', description: '', priority: 'MEDIA' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-wrap">
        <div className="login-card success-card">
          <img src={logo} alt="Logo Ntra. Sra. de La Vega" className="logo-img" />
          <span className="success-icon">✅</span>
          <h2>Incidencia registrada</h2>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Tu número de ticket es:</p>
          <code className="ticket-number">{success}</code>
          <p className="success-hint">
            El equipo TIC de Ntra. Sra. de La Vega recibirá tu incidencia<br />
            y la resolverá lo antes posible.
          </p>
          <button className="btn-primary" onClick={() => setSuccess(null)}>
            Reportar otra incidencia
          </button>
          <a href="/login" className="login-footer-link">Acceso equipo TIC →</a>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrap">
      <div className="login-card wide-card">
        <div className="login-logo">
          <img src={logo} alt="Logo Ntra. Sra. de La Vega" className="logo-img" />
          <h1>Reportar incidencia</h1>
          <p className="subtitle">Servicio de Soporte TIC</p>
          <p className="school-name">Ntra. Sra. de La Vega</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="alert alert-error">⚠ {error}</div>}

          <div className="field">
            <label>Nombre del profesor *</label>
            <input
              name="reporterName" value={form.reporterName} onChange={handleChange}
              placeholder="Ej: María García López" required
            />
          </div>

          <div className="field">
            <label>Aula *</label>
            <select name="classroomId" value={form.classroomId} onChange={handleChange} required>
              <option value="">Selecciona el aula...</option>
              {classrooms.map(c => (
                <option key={c._id} value={c._id}>
                  {c.code}{c.description ? ` — ${c.description}` : ''} ({c.building})
                </option>
              ))}
            </select>
          </div>

          {devices.length > 0 && (
            <div className="field">
              <label>Dispositivo afectado (opcional)</label>
              <select name="deviceId" value={form.deviceId} onChange={handleChange}>
                <option value="">Sin dispositivo concreto</option>
                {devices.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.inventoryCode} — {d.type}{d.brand ? ` (${d.brand})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="field-row">
            <div className="field">
              <label>Categoría *</label>
              <select name="category" value={form.category} onChange={handleChange} required>
                <option value="">Selecciona...</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Prioridad</label>
              <select name="priority" value={form.priority} onChange={handleChange}>
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Título de la incidencia *</label>
            <input
              name="title" value={form.title} onChange={handleChange}
              placeholder="Ej: El proyector no enciende al iniciar clase"
              required maxLength={150}
            />
          </div>

          <div className="field">
            <label>Descripción detallada *</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              placeholder="Describe el problema con el mayor detalle posible: cuándo ocurre, mensajes de error, si ha pasado antes..."
              required rows={4} maxLength={2000}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Enviando...' : '📨 Enviar incidencia'}
          </button>
        </form>

        <div className="login-footer">
          <a href="/login">Acceso equipo TIC →</a>
        </div>
      </div>
    </div>
  );
};

export default NewIncidentPage;
