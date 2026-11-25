import { Navigate, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import AccessDeniedPage from './pages/AccessDeniedPage'
import ActiveSessionPage from './pages/ActiveSessionPage'
import LabsGridPage from './pages/LabsGridPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import RegisterPage from './pages/RegisterPage'
import * as authService from './services/authService'
import { clearSession, getStoredUser, getToken, saveSession } from './utils/session'

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
      {/* === las rutas de adentro solo se ven con sesión, ProtectedRoute manda al login si no hay token === */}
      <Route element={<ProtectedRoute token={token} user={user} />}>
        <Route path="/labs" element={<LabsGridPage user={user} onLogout={handleLogout} />} />
        <Route path="/mi-sesion" element={<ActiveSessionPage user={user} onLogout={handleLogout} />} />
      </Route>
      {/* === la raíz manda a /labs o a /login según haya sesión === */}
      <Route path="/" element={<Navigate to={token ? '/labs' : '/login'} replace />} />
      {/* === aquí redirige el apiClient cuando la API responde 403 === */}
      <Route path="/acceso-restringido" element={<AccessDeniedPage user={user} onLogout={handleLogout} />} />
      {/* === cualquier ruta que no existe muestra el 404 === */}
      <Route path="*" element={<NotFoundPage user={user} onLogout={handleLogout} />} />
    </Routes>
  )
}
