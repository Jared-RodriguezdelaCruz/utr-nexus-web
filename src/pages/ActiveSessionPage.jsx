import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import ErrorState from '../components/ErrorState'
import { getAssignments, releaseAssignment } from '../services/labService'
import { ASSIGNMENT_STATUS } from '../utils/constants'
import { getErrorMessage } from '../utils/httpErrors'

// === C3 mi sesión: el equipo que tengo asignado, reportar falla y liberarlo ===
export default function ActiveSessionPage({ user, onLogout }) {
  // === estados: la asignación activa, el form, carga, errores, banner de éxito y reintentos ===
  const [assignment, setAssignment] = useState(null)
  const [form, setForm] = useState({ reporteFalla: false, descripcionFalla: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  // === al abrir la página y al reintentar buscamos si el usuario tiene una PC asignada ===
  useEffect(() => {
    // === si sale de la página antes de que llegue la respuesta, la ignoramos ===
    let ignore = false

    const loadAssignment = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // === llamada a la API, la sesión activa es la ASIGNADA de este usuario ===
        const data = await getAssignments()
        const activeAssignment = data.find(
          (item) => item.estatus === ASSIGNMENT_STATUS.ASIGNADA && item.userId === user?.id,
        )
        if (!ignore) setAssignment(activeAssignment ?? null)
      } catch (requestError) {
        // === el 401 y el 403 ya los redirige el apiClient, aquí guardamos el error para pintarlo ===
        if (!ignore) setError(requestError)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadAssignment()

    // === limpieza: corre al salir de la página o antes de reintentar ===
    return () => {
      ignore = true
    }
  }, [retryCount, user?.id])

  // === el checkbox guarda checked y el textarea su texto ===
  const handleChange = (event) => {
    const { name, type, checked, value } = event.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  // === se ejecuta al presionar "Liberar equipo" ===
  const handleRelease = async (event) => {
    // === evitamos que el navegador recargue la página ===
    event.preventDefault()
    setFormError('')

    // === si reporta falla la API pide una descripción de al menos 5 caracteres ===
    if (form.reporteFalla && form.descripcionFalla.trim().length < 5) {
      setFormError('Describe la falla con al menos 5 caracteres.')
      return
    }

    // === mientras isLoading esté en true el botón queda deshabilitado ===
    setIsLoading(true)
    try {
      // === llamada a la API, sin falla mandamos la descripción vacía ===
      await releaseAssignment(assignment.assignmentId, {
        reporteFalla: form.reporteFalla,
        descripcionFalla: form.reporteFalla ? form.descripcionFalla.trim() : '',
      })
      // === ya no hay equipo: avisamos, limpiamos el form y se ve el estado vacío ===
      setSuccessMessage(form.reporteFalla ? 'Equipo liberado y falla reportada.' : 'Equipo liberado.')
      setForm({ reporteFalla: false, descripcionFalla: '' })
      setAssignment(null)
    } catch (requestError) {
      // === si la API falla mostramos el mensaje que arma getErrorMessage ===
      setFormError(getErrorMessage(requestError))
    } finally {
      // === pase lo que pase quitamos el estado de carga ===
      setIsLoading(false)
    }
  }

  // === botón Reintentar: quitamos el error y sumamos un reintento para que el efecto corra otra vez ===
  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    setRetryCount(retryCount + 1)
  }

  // === lo que va debajo del título: error, carga, sin equipo o la sesión ===
  let content
  if (error) {
    content = (
      <div className="labs-error">
        <ErrorState isOffline={!error.response} isLoading={isLoading} onRetry={handleRetry} />
      </div>
    )
  } else if (isLoading && !assignment) {
    content = (
      <div className="session-grid" role="status">
        <span className="visually-hidden">Cargando tu sesión...</span>
        <div className="session-pc" aria-hidden="true">
          <span className="skeleton-bar skeleton-bar-short" />
          <span className="skeleton-bar skeleton-bar-medium" />
          <span className="skeleton-bar skeleton-bar-short" />
        </div>
        <div className="session-form" aria-hidden="true">
          <span className="skeleton-bar skeleton-bar-medium" />
          <span className="skeleton-bar" />
          <span className="skeleton-bar skeleton-bar-button" />
        </div>
      </div>
    )
  } else if (!assignment) {
    content = (
      <section className="session-empty" aria-labelledby="session-empty-title">
        {/* === banner verde del kit, solo después de liberar === */}
        {successMessage && (
          <div className="success-banner" role="status">
            <span aria-hidden="true">✓</span>
            <p>{successMessage}</p>
          </div>
        )}
        <h2 id="session-empty-title" className="session-empty-title">No tienes equipo asignado</h2>
        <p className="session-empty-text">Elige un equipo disponible para comenzar.</p>
        <Link to="/labs" className="session-button">Ir al mapa</Link>
      </section>
    )
  } else {
    content = (
      <>
        <div className="session-grid">
          {/* === tarjeta oscura con la PC asignada === */}
          <section className="session-pc" aria-label="Equipo asignado">
            <p className="session-pc-label">N.º de inventario</p>
            <p className="session-pc-number">{assignment.pc}</p>
            <p className="session-pc-lab">Laboratorio / {assignment.laboratorio}</p>
            <span className="status-badge session-badge">
              <span aria-hidden="true">✓</span>
              En curso
            </span>
          </section>

          {/* === noValidate porque la validación la hacemos nosotros en handleRelease === */}
          <form className="session-form" onSubmit={handleRelease} noValidate>
            {formError && (
              <div className="auth-form-error" role="alert">
                <span aria-hidden="true">!</span>
                <p>{formError}</p>
              </div>
            )}

            {/* === checkbox controlado, al marcarlo aparece la descripción === */}
            <label className="session-check">
              <input type="checkbox" name="reporteFalla" checked={form.reporteFalla} onChange={handleChange} />
              Reportar falla
            </label>

            {form.reporteFalla ? (
              <>
                <label htmlFor="session-falla" className="session-label">Describe la falla</label>
                <textarea
                  id="session-falla"
                  name="descripcionFalla"
                  value={form.descripcionFalla}
                  onChange={handleChange}
                  rows={4}
                  placeholder="El teclado no responde al escribir."
                />
              </>
            ) : (
              <p className="session-hint">Guarda tus archivos antes de liberar el equipo.</p>
            )}

            {/* === mientras carga el botón se deshabilita y muestra el spinner === */}
            <button className="auth-form-submit" type="submit" disabled={isLoading}>
              {isLoading && <span className="auth-spinner" aria-hidden="true" />}
              <span>{isLoading ? 'Liberando equipo' : 'Liberar equipo'}</span>
            </button>
          </form>
        </div>
        <p className="session-note">Reporta cualquier falla antes de liberar el equipo.</p>
      </>
    )
  }

  // === sin equipo el subtítulo cambia, como en Figma ===
  const subtitle = !isLoading && !error && !assignment
    ? 'Tu próximo espacio de trabajo te espera.'
    : 'Administra tu equipo asignado.'

  return (
    <div className="app-page">
      <AppHeader user={user} onLogout={onLogout} />

      <main className="labs-main">
        <h1 className="labs-title">Mi sesión</h1>
        <p className="labs-subtitle">{subtitle}</p>

        {content}
      </main>

      <footer className="app-footer">© 2026 UTR Labs</footer>
    </div>
  )
}
