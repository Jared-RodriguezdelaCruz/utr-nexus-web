import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'

// === aquí llegan los 403, el apiClient manda a /acceso-restringido cuando la API niega el permiso ===
export default function AccessDeniedPage({ user, onLogout }) {
  return (
    <div className="app-page">
      <AppHeader user={user} onLogout={onLogout} />

      <main className="error-main">
        <section className="error-card" aria-labelledby="access-denied-title">
          {/* === bloque oscuro con el código del error === */}
          <div className="error-code-block">
            <p className="error-code">403</p>
            <p className="error-code-label" aria-hidden="true">Acceso restringido</p>
          </div>

          <h1 id="access-denied-title" className="error-title">Acceso restringido</h1>
          <p className="error-text">
            Tu cuenta no tiene permisos para acceder a esta sección.
            <br />
            Si necesitas acceso, contacta al administrador.
          </p>

          <div className="error-actions">
            <Link to="/labs" className="error-button">Ir al mapa</Link>
          </div>
          <p className="error-note">Universidad Tecnológica El Retoño</p>
        </section>
      </main>

      <footer className="app-footer">© 2026 UTR Labs</footer>
    </div>
  )
}
