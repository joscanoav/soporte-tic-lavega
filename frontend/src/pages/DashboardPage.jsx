import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import logo from '../assets/logo_lavega.png';
import ChatBox from '../components/ChatBox';

const STATUS_LABELS = {
  PENDIENTE:          { label: 'Pendiente',     color: '#f59e0b' },
  EN_PROCESO:         { label: 'En proceso',    color: '#3b82f6' },
  ESPERANDO_REPUESTO: { label: 'Esp. repuesto', color: '#8b5cf6' },
  RESUELTO:           { label: 'Resuelto',      color: '#10b981' },
  CERRADO:            { label: 'Cerrado',       color: '#6b7280' },
};

const PRIORITY_LABELS = {
  BAJA:    { label: 'Baja',    color: '#10b981' },
  MEDIA:   { label: 'Media',   color: '#f59e0b' },
  ALTA:    { label: 'Alta',    color: '#ef4444' },
  CRITICA: { label: '🔴 Crítica', color: '#dc2626' },
};

const Badge = ({ map, value }) => {
  const info = map[value] || { label: value, color: '#6b7280' };
  return (
    <span className="badge" style={{
      background: info.color + '20',
      color: info.color,
      border: `1px solid ${info.color}40`,
    }}>
      {info.label}
    </span>
  );
};

const DashboardPage = () => {
  const { admin, logout } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({ status: '', priority: '' });
  const [selected, setSelected]   = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', comment: '', resolutionNotes: '' });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [chatOpen, setChatOpen] = useState(false);

  // FIX: useCallback para evitar re-renders infinitos
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.status)   params.set('status',   filters.status);
      if (filters.priority) params.set('priority', filters.priority);
      const data = await api.get(`/incidents?${params}`);
      setIncidents(data.data);
      setTotal(data.total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const openModal = (inc) => {
    setSelected(inc);
    setStatusForm({ status: inc.status, comment: '', resolutionNotes: inc.resolutionNotes || '' });
  };

  const saveStatus = async () => {
    setSaving(true);
    try {
      await api.patch(`/incidents/${selected._id}/status`, statusForm);
      setSelected(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Contadores para stats
  const counts = incidents.reduce((acc, inc) => {
    acc[inc.status] = (acc[inc.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <img src={logo} alt="Logo" className="navbar-logo" />
          <div className="navbar-title">
            Soporte TIC
            <span>Ntra. Sra. de La Vega</span>
          </div>
        </div>
        <div className="navbar-right">
          <a href="/inventario" className="btn-ghost" style={{ textDecoration: 'none' }}>💻 Inventario</a>
          <a href="/stats"      className="btn-ghost" style={{ textDecoration: 'none' }}>📊 Estadísticas</a>
          <div className="navbar-user">
            {admin?.name}<span className="role-badge">{admin?.role}</span>
          </div>
          <button className="btn-ghost" onClick={logout}>Cerrar sesión</button>
        </div>
      </nav>

      <div className="page-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h2>Panel de incidencias</h2>
            <p>{total} ticket{total !== 1 ? 's' : ''} registrados</p>
          </div>
          <a href="/nueva-incidencia" className="btn-primary">+ Nueva incidencia</a>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Pendientes</div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>{counts.PENDIENTE || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">En proceso</div>
            <div className="stat-value" style={{ color: '#3b82f6' }}>{counts.EN_PROCESO || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Resueltos</div>
            <div className="stat-value" style={{ color: '#10b981' }}>{counts.RESUELTO || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Cerrados</div>
            <div className="stat-value" style={{ color: '#6b7280' }}>{counts.CERRADO || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total</div>
            <div className="stat-value" style={{ color: 'var(--text)' }}>{total}</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="filters">
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
            <option value="">Todas las prioridades</option>
            {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button className="btn-ghost" onClick={load}>↻ Actualizar</button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠ {error}</div>}

        {/* Tabla */}
        {loading ? (
          <div className="center-spinner"><div className="spinner" /></div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Título</th>
                  <th>Profesor</th>
                  <th>Aula</th>
                  <th>Categoría</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {incidents.length === 0 && (
                  <tr><td colSpan={9} className="empty">No hay incidencias con estos filtros</td></tr>
                )}
                {incidents.map(inc => (
                  <tr key={inc._id}>
                    <td><code>{inc.ticketNumber}</code></td>
                    <td className="td-title" title={inc.title}>{inc.title}</td>
                    <td style={{ color: 'var(--text2)', fontSize: '12px' }}>{inc.reporterName}</td>
                    <td style={{ color: 'var(--text2)' }}>{inc.classroomId?.code || '—'}</td>
                    <td style={{ color: 'var(--text2)', fontSize: '12px' }}>{inc.category}</td>
                    <td><Badge map={PRIORITY_LABELS} value={inc.priority} /></td>
                    <td><Badge map={STATUS_LABELS}   value={inc.status} /></td>
                    <td style={{ color: 'var(--text3)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {new Date(inc.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td>
                      <button className="btn-sm" onClick={() => openModal(inc)}>Gestionar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected.ticketNumber}</h3>
              <button className="btn-ghost" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="modal-body">
              <p className="modal-title">{selected.title}</p>
              <div className="modal-meta">
                <Badge map={STATUS_LABELS}   value={selected.status} />
                <Badge map={PRIORITY_LABELS} value={selected.priority} />
                <span style={{ fontSize: '12px', color: 'var(--text2)' }}>
                  📍 {selected.classroomId?.code || '—'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text2)' }}>
                  👤 {selected.reporterName}
                </span>
              </div>
              <p className="modal-desc">{selected.description}</p>

              {selected.aiSuggestion && (
                <div className="ai-box">
                  <strong>💡 Sugerencia IA</strong>
                  <p>{selected.aiSuggestion}</p>
                </div>
              )}

              <div className="field">
                <label>Cambiar estado</label>
                <select value={statusForm.status} onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Comentario (opcional)</label>
                <input
                  type="text"
                  value={statusForm.comment}
                  onChange={e => setStatusForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="Ej: Revisando el proyector, pendiente de pieza..."
                />
              </div>

              <div className="field">
                <label>Notas de resolución</label>
                <textarea
                  value={statusForm.resolutionNotes}
                  onChange={e => setStatusForm(f => ({ ...f, resolutionNotes: e.target.value }))}
                  placeholder="Describe cómo se resolvió la incidencia..."
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setSelected(null)}>Cancelar</button>
              <button className="btn-primary" onClick={saveStatus} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Chat flotante */}
      {chatOpen && <ChatBox onClose={() => setChatOpen(false)} />}
      <button className="chat-fab" onClick={() => setChatOpen(o => !o)} title="Asistente IA">
        {chatOpen ? '✕' : '🤖'}
      </button>
    </div>
  );
};

export default DashboardPage;
