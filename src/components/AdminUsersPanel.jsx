import { useEffect, useState } from 'react'
import { getUsers, updateUserRole } from '../services/userService'
import { ROLES } from '../utils/constants'
import { getErrorMessage } from '../utils/httpErrors'

// === opciones del segmentado de rol de cada usuario ===
const ROLE_OPTIONS = [ROLES.USER, ROLES.ADMIN]

// === C4 gestión de usuarios: buscador, estatus y cambio de rol, currentUser es el ADMIN que entró ===
export default function AdminUsersPanel({ currentUser }) {
  // === estados: usuarios de la API, búsqueda, carga, error, el usuario que se actualiza y reintentos ===
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  // === al abrir el panel y al reintentar pedimos los usuarios ===
  useEffect(() => {
    // === si se cierra el panel antes de que llegue la respuesta, la ignoramos ===
    let ignore = false

    const loadUsers = async () => {
      setIsLoading(true)
      setError('')
      try {
        // === llamada a la API, solo un ADMIN la puede hacer ===
        const data = await getUsers()
        if (!ignore) setUsers(data)
      } catch (requestError) {
        if (!ignore) setError(getErrorMessage(requestError))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadUsers()

    // === limpieza: corre al salir del panel o antes de reintentar ===
    return () => {
      ignore = true
    }
  }, [retryCount])

  // === input controlado del buscador ===
  const handleSearchChange = (event) => {
    setSearch(event.target.value)
  }

  // === botón Reintentar: sumamos un reintento para que el efecto corra otra vez ===
  const handleRetry = () => {
    setRetryCount(retryCount + 1)
  }

  // === se ejecuta al tocar USER o ADMIN en la fila de un usuario ===
  const handleRoleChange = async (selectedUser, rol) => {
    // === si ya tiene ese rol no hay nada que mandar ===
    if (selectedUser.rol === rol) return
    setError('')

    // === mientras updatingId tenga valor los segmentados quedan deshabilitados ===
    setUpdatingId(selectedUser.id)
    try {
      // === llamada a la API y cambiamos solo ese usuario en la lista ===
      await updateUserRole(selectedUser.id, rol)
      setUsers(users.map((item) => (item.id === selectedUser.id ? { ...item, rol } : item)))
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      // === pase lo que pase quitamos el estado de carga ===
      setUpdatingId(null)
    }
  }

  // === el buscador filtra aquí por nombre, matrícula o correo ===
  const term = search.trim().toLowerCase()
  const filteredUsers = users.filter((item) =>
    `${item.nombre} ${item.matricula} ${item.email}`.toLowerCase().includes(term),
  )

  // === cargando, sin resultados o la lista ===
  let content
  if (isLoading) {
    content = <p className="admin-empty" role="status">Cargando usuarios...</p>
  } else if (filteredUsers.length === 0) {
    content = <p className="admin-empty">{users.length === 0 ? 'Todavía no hay usuarios.' : 'Ningún usuario coincide con la búsqueda.'}</p>
  } else {
    content = (
      <ul className="admin-users-list">
        {filteredUsers.map((item) => {
          // === el ADMIN que entró no puede cambiar su propio rol ===
          const isCurrentUser = item.id === currentUser?.id
          return (
            <li key={item.id} className="admin-user" aria-busy={updatingId === item.id}>
              <div className="admin-user-info">
                <p className="admin-user-name">
                  {item.nombre}
                  {isCurrentUser && ' · Tú'}
                </p>
                <p className="admin-user-email">{item.email}</p>
                <span className={item.activo ? 'admin-user-status admin-user-status-active' : 'admin-user-status'}>
                  {item.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* === segmentado de rol, el actual se pinta en rojo === */}
              <div className="admin-role" role="group" aria-label={`Rol de ${item.nombre}`}>
                {ROLE_OPTIONS.map((rol) => (
                  <button
                    key={rol}
                    type="button"
                    aria-pressed={item.rol === rol}
                    disabled={isCurrentUser || updatingId !== null}
                    className={item.rol === rol ? 'admin-role-item admin-role-item-active' : 'admin-role-item'}
                    onClick={() => handleRoleChange(item, rol)}
                  >
                    {rol}
                    {/* === candado en el rol propio, bloqueado === */}
                    {isCurrentUser && item.rol === rol && (
                      <svg className="admin-lock" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                        <rect x="3" y="7" width="10" height="7" rx="1.5" />
                        <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <aside className="admin-panel admin-users" aria-labelledby="users-title">
      <h2 id="users-title" className="admin-panel-title">Gestión de usuarios</h2>

      {/* === buscador controlado, la etiqueta solo la lee el lector de pantalla === */}
      <label htmlFor="users-search" className="visually-hidden">Buscar usuario</label>
      <input
        id="users-search"
        type="search"
        className="admin-search"
        value={search}
        onChange={handleSearchChange}
        placeholder="Buscar nombre, matrícula o correo"
      />

      {error && (
        <div className="auth-form-error admin-users-error" role="alert">
          <span aria-hidden="true">!</span>
          <p>{error}</p>
          {/* === si falló la carga se puede volver a pedir la lista === */}
          {users.length === 0 && (
            <button type="button" className="admin-retry" onClick={handleRetry}>Reintentar</button>
          )}
        </div>
      )}

      {content}

      <p className="admin-users-note">Tu rol está bloqueado para evitar perder el acceso.</p>
    </aside>
  )
}
