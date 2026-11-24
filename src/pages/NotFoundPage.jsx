import { Link, useLocation, useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { COMPUTER_STATUS } from '../utils/constants'

// === estaciones de ejemplo para el dibujo del mini mapa, no vienen de la API ===
const DEMO_STATIONS = [
  { id: 'UTR-PC-01', estatus: COMPUTER_STATUS.DISPONIBLE },
  { id: 'UTR-PC-02', estatus: COMPUTER_STATUS.DISPONIBLE },
  { id: 'UTR-PC-03', estatus: COMPUTER_STATUS.OCUPADA },
  { id: 'UTR-PC-04', estatus: COMPUTER_STATUS.MANTENIMIENTO },
  { id: 'UTR-PC-05', estatus: COMPUTER_STATUS.DISPONIBLE },
  { id: 'UTR-PC-06', estatus: COMPUTER_STATUS.OCUPADA },
  { id: 'UTR-PC-07', estatus: COMPUTER_STATUS.DISPONIBLE },
  { id: 'UTR-PC-08', estatus: COMPUTER_STATUS.DISPONIBLE },
  { id: 'UTR-PC-09', estatus: COMPUTER_STATUS.DISPONIBLE },
  { id: 'UTR-PC-10', estatus: COMPUTER_STATUS.MANTENIMIENTO },
  { id: 'UTR-PC-11', estatus: COMPUTER_STATUS.OCUPADA },
]

// === texto que se ve en cada estatus ===
const STATUS_LABELS = {
  [COMPUTER_STATUS.DISPONIBLE]: 'Disponible',
  [COMPUTER_STATUS.OCUPADA]: 'Ocupada',
  [COMPUTER_STATUS.MANTENIMIENTO]: 'Mantenimiento',
}

// === se muestra con cualquier ruta que no existe, la página es como una PC que no está en el inventario ===
export default function NotFoundPage({ user, onLogout }) {
  const navigate = useNavigate()
  // === location.pathname es la ruta que escribió el usuario ===
  const location = useLocation()

  // === si llegó desde otra pantalla regresamos, si abrió el link directo lo mandamos al mapa ===
  const handleGoBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1)
    } else {
      navigate('/labs')
    }
  }

  return (
    <div className="app-page">
      <AppHeader user={user} onLogout={onLogout} />

      <main className="error-main">
        <section className="error-card" aria-labelledby="not-found-title">
          {/* === el 0 del 404 es un monitor punteado, una PC fantasma === */}
          <div className="error-code-block">
            <p className="error-code" role="img" aria-label="404">
              <span>4</span>
              <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="5">
                <rect x="5" y="6" width="54" height="38" rx="6" strokeDasharray="8 5" />
                <path d="M32 46v7M19 58h26" strokeDasharray="6 4" />
              </svg>
              <span>4</span>
            </p>
            <p className="error-code-label" aria-hidden="true">Equipo no encontrado</p>
          </div>

          {/* === mini mapa de laboratorio, es solo dibujo y el lector de pantalla lo salta === */}
          <ul className="error-map" aria-hidden="true">
            {DEMO_STATIONS.map((station) => (
              <li key={station.id} className={`error-station error-station-${station.estatus.toLowerCase()}`}>
                <span className="error-station-number">{station.id}</span>
                <span className="error-station-status">{STATUS_LABELS[station.estatus]}</span>
              </li>
            ))}
            <li className="error-station error-station-missing">
              <span className="error-station-number">UTR-PC-404</span>
              <span className="error-station-status">No registrada</span>
            </li>
          </ul>

          <p className="error-path">{location.pathname}</p>
          <h1 id="not-found-title" className="error-title">Esta página no está en el inventario</h1>
          <p className="error-text">
            La dirección que buscas no existe o fue movida. Revisa el enlace o vuelve al mapa de laboratorios.
          </p>

          <div className="error-actions">
            <button type="button" className="error-button error-button-secondary" onClick={handleGoBack}>
              Volver atrás
            </button>
            <Link to="/labs" className="error-button">Ir al mapa</Link>
          </div>
        </section>
      </main>

      <footer className="app-footer">© 2026 UTR Labs</footer>
    </div>
  )
}
