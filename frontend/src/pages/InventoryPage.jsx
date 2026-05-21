import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo_lavega.png';

const STATUS_INFO = {
  OPERATIVO:     { label: 'Operativo',    color: '#10b981' },
  EN_REPARACION: { label: 'En reparación',color: '#f59e0b' },
  AVERIADO:      { label: 'Averiado',     color: '#ef4444' },
  BAJA:          { label: 'Baja',         color: '#6b7280' },
  ALMACEN:       { label: 'Almacén',      color: '#8b5cf6' },
};

const TYPE_ICONS = {
  PROYECTOR:           '📽',
  ALTAVOZ:             '🔊',
  PORTATIL:            '💻',
  IMPRESORA:           '🖨',
  SMART_TV:            '📺',
  ORDENADOR_SOBREMESA: '🖥',
  TABLET:              '📱',
  ROUTER:              '📡',
  SWITCH:              '🔌',
  CAMARA:              '📷',
  OTRO:                '🔧',
};

const Badge = ({ info }) => (
  <span className="badge" style={{
    background: info.color + '20',
    color: info.color,
    border: `1px solid ${info.color}40`,
  }}>{info.label}</span>
);

const InventoryPage = () => {
  const { admin, logout } = useAuth();
  const [devices, setDevices]       = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filters, setFilters]       = useState({ classroomId: '', type: '', status: '' });
  const [selected, setSelected]     = useState(null);
  const [editForm, setEditForm]     = useState({});
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [showAdd, setShowAdd]       = useState(false);
  const [addForm, setAddForm]       = useState({
    inventoryCode: '', type: '', brand: '', model: '',
    classroomId: '', status: 'OPERATIVO', notes: '', serialNumber: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.classroomId) params.set('classroomId', filters.classroomId);
      if (filters.type)        params.set('type',        filters.type);
      if (filters.status)      params.set('status',      filters.status);
      const [devData, clData] = await Promise.all([
        api.get(`/devices?${params}`),
        api.get('/classrooms'),
      ]);
      setDevices(devData.data);
      setClassrooms(clData.data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filters]);

  const openEdit = (dev) => {
    setSelected(dev);
    setEditForm({
      status: dev.status,
      notes:  dev.notes || '',
      assignedTo: dev.assignedTo || '',
    });
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api.patch(`/devices/${selected._id}`, editForm);
      setSelected(null);
      load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const saveAdd = async () => {
    setSaving(true);
    try {
      await api.post('/devices', addForm);
      setShowAdd(false);
      setAddForm({ inventoryCode: '', type: '', brand: '', model: '', classroomId: '', status: 'OPERATIVO', notes: '', serialNumber: '' });
      load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  // Contadores por estado
  const counts = devices.reduce((acc, d) => { acc[d.status] = (acc[d.status] || 0) + 1; return acc; }, {});

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">
          <img src={logo} alt="Logo" className="navbar-logo" />
          <div className="navbar-title">Soporte TIC<span>Ntra. Sra. de La Vega</span></div>
        </div>
        <div className="navbar-right">
          <a href="/dashboard" className="btn-ghost" style={{ textDecoration: 'none' }}>🎫 Incidencias</a>
          <a href="/stats" className="btn-ghost" style={{ textDecoration: 'none' }}>📊 Estadísticas</a>
          <div className="navbar-user">
            {admin?.name}<span className="role-badge">{admin?.role}</span>
          </div>
          <button className="btn-ghost" onClick={logout}>Cerrar sesión</button>
        </div>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <div>
            <h2>Inventario de dispositivos</h2>
            <p>{devices.length} dispositivos encontrados</p>
          </div>
          <button className="btn-primary" style={{ width: 'auto' }} onClick={() => setShowAdd(true)}>
            + Añadir dispositivo
          </button>
        </div>

        {/* Stats */}
        <div className="stats-row">
          {Object.entries(STATUS_INFO).map(([k, v]) => (
            <div className="stat-card" key={k}>
              <div className="stat-label">{v.label}</div>
              <div className="stat-value" style={{ color: v.color }}>{counts[k] || 0}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="filters">
          <select value={filters.classroomId} onChange={e => setFilters(f => ({ ...f, classroomId: e.target.value }))}>
            <option value="">Todas las aulas</option>
            {classrooms.map(c => <option key={c._id} value={c._id}>{c.code}</option>)}
          </select>
          <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
            <option value="">Todos los tipos</option>
            {Object.keys(TYPE_ICONS).map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>)}
          </select>
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_INFO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button className="btn-ghost" onClick={load}>↻ Actualizar</button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠ {error}</div>}

        {loading ? <div className="center-spinner"><div className="spinner" /></div> : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Tipo</th>
                  <th>Marca / Modelo</th>
                  <th>Aula</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th>Nº Serie</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {devices.length === 0 && (
                  <tr><td colSpan={8} className="empty">No hay dispositivos con estos filtros</td></tr>
                )}
                {devices.map(dev => (
                  <tr key={dev._id}>
                    <td><code>{dev.inventoryCode}</code></td>
                    <td>{TYPE_ICONS[dev.type] || '🔧'} {dev.type}</td>
                    <td style={{ color: 'var(--text2)' }}>{dev.brand || '—'} {dev.model || ''}</td>
                    <td style={{ color: 'var(--text2)' }}>{dev.classroomId?.code || '—'}</td>
                    <td style={{ color: 'var(--text3)', fontSize: '12px' }}>{dev.assignedTo || '—'}</td>
                    <td><Badge info={STATUS_INFO[dev.status] || { label: dev.status, color: '#6b7280' }} /></td>
                    <td style={{ color: 'var(--text3)', fontSize: '12px' }}>{dev.serialNumber || '—'}</td>
                    <td><button className="btn-sm" onClick={() => openEdit(dev)}>Editar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal editar */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected.inventoryCode}</h3>
              <button className="btn-ghost" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="modal-title">{TYPE_ICONS[selected.type]} {selected.type} — {selected.brand} {selected.model}</p>
              <p className="modal-desc">Aula: {selected.classroomId?.code || '—'}</p>
              <div className="field">
                <label>Estado</label>
                <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
                  {Object.entries(STATUS_INFO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Ubicación en el aula</label>
                <input value={editForm.assignedTo} onChange={e => setEditForm(f => ({ ...f, assignedTo: e.target.value }))}
                  placeholder="Ej: Pared frontal, Mesa profesor..." />
              </div>
              <div className="field">
                <label>Notas</label>
                <textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3} placeholder="Observaciones sobre el dispositivo..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setSelected(null)}>Cancelar</button>
              <button className="btn-primary" onClick={saveEdit} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal añadir */}
      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo dispositivo</h3>
              <button className="btn-ghost" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="field-row">
                <div className="field">
                  <label>Código inventario *</label>
                  <input value={addForm.inventoryCode} onChange={e => setAddForm(f => ({ ...f, inventoryCode: e.target.value }))}
                    placeholder="Ej: PROY-010" required />
                </div>
                <div className="field">
                  <label>Tipo *</label>
                  <select value={addForm.type} onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="">Selecciona...</option>
                    {Object.keys(TYPE_ICONS).map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Marca</label>
                  <input value={addForm.brand} onChange={e => setAddForm(f => ({ ...f, brand: e.target.value }))} placeholder="Ej: Epson" />
                </div>
                <div className="field">
                  <label>Modelo</label>
                  <input value={addForm.model} onChange={e => setAddForm(f => ({ ...f, model: e.target.value }))} placeholder="Ej: EB-W52" />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Aula *</label>
                  <select value={addForm.classroomId} onChange={e => setAddForm(f => ({ ...f, classroomId: e.target.value }))}>
                    <option value="">Selecciona...</option>
                    {classrooms.map(c => <option key={c._id} value={c._id}>{c.code}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Estado</label>
                  <select value={addForm.status} onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))}>
                    {Object.entries(STATUS_INFO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Número de serie</label>
                <input value={addForm.serialNumber} onChange={e => setAddForm(f => ({ ...f, serialNumber: e.target.value }))}
                  placeholder="Ej: SN123456789" />
              </div>
              <div className="field">
                <label>Notas</label>
                <textarea value={addForm.notes} onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder="Observaciones opcionales..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancelar</button>
              <button className="btn-primary" onClick={saveAdd} disabled={saving || !addForm.inventoryCode || !addForm.type || !addForm.classroomId}>
                {saving ? 'Guardando...' : 'Añadir dispositivo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
