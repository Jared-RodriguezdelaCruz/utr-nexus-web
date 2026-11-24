import { Navigate, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import AccessDeniedPage from './pages/AccessDeniedPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import RegisterPage from './pages/RegisterPage'
import * as authService from './services/authService'
import { clearSession, getStoredUser, getToken, saveSession } from './utils/session'

// === pantalla temporal para /labs mientras no existe la página del mapa de PCs ===
function SessionPlaceholder({ user, onLogout }) {
  return (
    <main className="session-placeholder">
      <h1>Sesión iniciada</h1>
      <p>{user?.nombre ?? 'Usuario UTR'}</p>
      <button type="button" onClick={onLogout}>Cerrar sesión</button>
    </main>
  )
}

export default function App() {
  // === token y user arrancan con lo que haya en localStorage, así la sesión sobrevive al recargar ===
  const [token, setToken] = useState(getToken())
  const [user, setUser] = useState(getStoredUser())

  // === LoginPage la recibe como onLogin y la llama cuando el usuario manda el form ===
  const handleLogin = async (form) => {
    const session = await authService.login(form)
    // === guardamos en localStorage y también en el estado para que las rutas se enteren ===
    saveSession(session)
    setToken(session.token)
    setUser(session.user)
  }

  // === borramos la sesión de localStorage y del estado, con token en null las rutas mandan al login ===
  const handleLogout = () => {
    clearSession()
    setToken(null)
    setUser(null)
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* === /labs solo se ve con token, si no hay sesión regresa al login === */}
      <Route
        path="/labs"
        element={token ? <SessionPlaceholder user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      />
      {/* === la raíz manda a /labs o a /login según haya sesión === */}
      <Route path="/" element={<Navigate to={token ? '/labs' : '/login'} replace />} />
      {/* === aquí redirige el apiClient cuando la API responde 403 === */}
      <Route path="/acceso-restringido" element={<AccessDeniedPage user={user} onLogout={handleLogout} />} />
      {/* === cualquier ruta que no existe muestra el 404 === */}
      <Route path="*" element={<NotFoundPage user={user} onLogout={handleLogout} />} />
    </Routes>
  )
}
