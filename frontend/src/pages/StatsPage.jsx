import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import logo from '../assets/logo_lavega.png';

const COLORS = {
  PENDIENTE:          '#f59e0b',
  EN_PROCESO:         '#3b82f6',
  ESPERANDO_REPUESTO: '#8b5cf6',
  RESUELTO:           '#10b981',
  CERRADO:            '#6b7280',
  BAJA:               '#10b981',
  MEDIA:              '#f59e0b',
  ALTA:               '#ef4444',
  CRITICA:            '#dc2626',
  HARDWARE:  '#3b82f6',
  SOFTWARE:  '#8b5cf6',
  RED:       '#06b6d4',
  PROYECTOR: '#f59e0b',
  IMPRESORA: '#10b981',
  AUDIO:     '#ec4899',
  PANTALLA:  '#6366f1',
  OTRO:      '#6b7280',
};

const BAR_HEIGHT = 32;

const BarChart = ({ data, title, colorKey }) => {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d.total), 1);
  return (
    <div className="chart-card">
      <h3 className="chart-title">{title}</h3>
      <div className="bar-list">
        {data.map((d, i) => {
          const color = COLORS[d._id] || `hsl(${i * 47}, 65%, 55%)`;
          const pct   = Math.round((d.total / max) * 100);
          return (
            <div key={d._id} className="bar-row">
              <div className="bar-label">{d._id || '—'}</div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
              <div className="bar-value" style={{ color }}>{d.total}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DonutChart = ({ data, title }) => {
  if (!data?.length) return null;
  const total = data.reduce((s, d) => s + d.total, 0);
  let offset  = 0;
  const R = 60, C = 2 * Math.PI * R;

  const slices = data.map((d, i) => {
    const color = COLORS[d._id] || `hsl(${i * 47}, 65%, 55%)`;
    const pct   = d.total / total;
    const dash  = pct * C;
    const slice = { color, dash, offset, label: d._id, total: d.total, pct: Math.round(pct * 100) };
    offset += dash;
    return slice;
  });

  return (
    <div className="chart-card donut-card">
      <h3 className="chart-title">{title}</h3>
      <div className="donut-wrap">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={R} fill="none" stroke="var(--bg3)" strokeWidth="24" />
          {slices.map((s, i) => (
            <circle key={i} cx="80" cy="80" r={R} fill="none"
              stroke={s.color} strokeWidth="22"
              strokeDasharray={`${s.dash} ${C - s.dash}`}
              strokeDashoffset={C / 4 - s.offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px' }}
            />
          ))}
          <text x="80" y="75" textAnchor="middle" fill="var(--text)" fontSize="22" fontWeight="700">{total}</text>
          <text x="80" y="95" textAnchor="middle" fill="var(--text2)" fontSize="11">total</text>
        </svg>
        <div className="donut-legend">
          {slices.map((s, i) => (
            <div key={i} className="legend-item">
              <span className="legend-dot" style={{ background: s.color }} />
              <span className="legend-label">{s.label}</span>
              <span className="legend-val" style={{ color: s.color }}>{s.total} <em>({s.pct}%)</em></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatsPage = () => {
  const { admin, logout } = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/stats')
      .then(d => setStats(d.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">
          <img src={logo} alt="Logo" className="navbar-logo" />
          <div className="navbar-title">Soporte TIC<span>Ntra. Sra. de La Vega</span></div>
        </div>
        <div className="navbar-right">
          <a href="/dashboard"  className="btn-ghost" style={{ textDecoration: 'none' }}>🎫 Incidencias</a>
          <a href="/inventario" className="btn-ghost" style={{ textDecoration: 'none' }}>💻 Inventario</a>
          <div className="navbar-user">
            {admin?.name}<span className="role-badge">{admin?.role}</span>
          </div>
          <button className="btn-ghost" onClick={logout}>Cerrar sesión</button>
        </div>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <div>
            <h2>Estadísticas</h2>
            <p>Resumen global del sistema de incidencias</p>
          </div>
          <button className="btn-ghost" onClick={() => { setLoading(true); api.get('/stats').then(d => setStats(d.data)).finally(() => setLoading(false)); }}>
            ↻ Actualizar
          </button>
        </div>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        {loading ? <div className="center-spinner"><div className="spinner" /></div> : stats && (
          <>
            {/* KPIs */}
            <div className="stats-row" style={{ marginBottom: 28 }}>
              <div className="stat-card">
                <div className="stat-label">Tiempo medio resolución</div>
                <div className="stat-value" style={{ color: 'var(--primary)', fontSize: '22px' }}>
                  {stats.resolution.avgHours != null ? `${stats.resolution.avgHours}h` : '—'}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Tickets resueltos</div>
                <div className="stat-value" style={{ color: '#10b981' }}>{stats.resolution.resolvedCount}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Resolución más rápida</div>
                <div className="stat-value" style={{ color: '#10b981', fontSize: '22px' }}>
                  {stats.resolution.minHours != null ? `${stats.resolution.minHours}h` : '—'}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Resolución más lenta</div>
                <div className="stat-value" style={{ color: '#ef4444', fontSize: '22px' }}>
                  {stats.resolution.maxHours != null ? `${stats.resolution.maxHours}h` : '—'}
                </div>
              </div>
            </div>

            {/* Gráficas */}
            <div className="charts-grid">
              <DonutChart data={stats.byStatus}   title="Tickets por estado" />
              <DonutChart data={stats.byPriority} title="Tickets por prioridad" />
              <BarChart   data={stats.byCategory} title="Tickets por categoría" />
              <div className="chart-card">
                <h3 className="chart-title">Top aulas con más incidencias</h3>
                <div className="bar-list">
                  {stats.topClassrooms.length === 0 && (
                    <p style={{ color: 'var(--text3)', fontSize: '13px' }}>Sin datos aún</p>
                  )}
                  {stats.topClassrooms.map((c, i) => {
                    const max = stats.topClassrooms[0]?.total || 1;
                    return (
                      <div key={i} className="bar-row">
                        <div className="bar-label">{c.code || '—'}</div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${Math.round((c.total / max) * 100)}%`, background: 'var(--primary)' }} />
                        </div>
                        <div className="bar-value" style={{ color: 'var(--primary)' }}>{c.total}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StatsPage;
