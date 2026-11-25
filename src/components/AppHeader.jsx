import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ROLES } from '../utils/constants'

// === el enlace de la página en la que estamos se pinta en rojo ===
const getLinkClass = ({ isActive }) => (isActive ? 'app-header-link app-header-link-active' : 'app-header-link')

// === barra de arriba con logo, enlaces y usuario, sin sesión solo se ve el logo ===
export default function AppHeader({ user, onLogout }) {
  const navigate = useNavigate()

  // === borramos la sesión en App y mandamos al login ===
  const handleLogout = () => {
    onLogout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="app-header">
      <Link to="/labs" className="app-header-brand">
        <img src="/logo-utr.png" alt="Universidad Tecnológica El Retoño y BIS Universities" />
        <span>UTR Labs</span>
      </Link>

      {/* === enlaces y usuario solo si hay sesión === */}
      {user && (
        <>
          <nav className="app-header-nav" aria-label="Principal">
            {/* === end para que /labs/lo-que-sea no lo marque como activo === */}
            <NavLink to="/labs" end className={getLinkClass}>Mapa de laboratorios</NavLink>
            {/* === el ADMIN ve su panel en lugar de Mi sesión, como en Figma === */}
            {user.rol === ROLES.ADMIN ? (
              <NavLink to="/admin" className={getLinkClass}>Administración TI</NavLink>
            ) : (
              <NavLink to="/mi-sesion" className={getLinkClass}>Mi sesión</NavLink>
            )}
          </nav>
          <div className="app-header-user">
            <span>{user.nombre}</span>
            <button type="button" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </>
      )}
    </header>
  )
}
