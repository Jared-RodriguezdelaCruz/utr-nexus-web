import { Navigate, Outlet } from 'react-router-dom'

// === protege las rutas de adentro: sin token manda al login y con roles revisa el rol del usuario ===
export default function ProtectedRoute({ token, user, roles }) {
  // === sin sesión no se puede entrar ===
  if (!token) {
    return <Navigate to="/login" replace />
  }
  // === si la ruta pide un rol y el usuario no lo tiene, va a acceso restringido ===
  if (roles && !roles.includes(user?.rol)) {
    return <Navigate to="/acceso-restringido" replace />
  }
  // === Outlet pinta la ruta hija que sí pasó el filtro ===
  return <Outlet />
}
