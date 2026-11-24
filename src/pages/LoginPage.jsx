import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthStory from '../components/AuthStory'
import { UTR_EMAIL_REGEX } from '../utils/constants'
import { getErrorMessage } from '../utils/httpErrors'

// === onLogin viene de App, ahí se guarda la sesión ===
export default function LoginPage({ onLogin }) {
  // === navigate sirve para mandar al usuario a otra ruta desde el código ===
  const navigate = useNavigate()
  // === estados: lo que escribe el usuario, si está cargando y el mensaje de error ===
  const [form, setForm] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // === se llama cada vez que el usuario escribe en un input ===
  const handleChange = (event) => {
    // === el name del input dice qué campo del form hay que cambiar ===
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  // === por ahora no hay recuperación de contraseña, solo avisamos a quién acudir ===
  const handleForgotPassword = () => {
    setError('Contacta al área de TI para recuperar tu contraseña.')
  }

  // === se ejecuta al enviar el form con el botón o con Enter ===
  const handleSubmit = async (event) => {
    // === evitamos que el navegador recargue la página ===
    event.preventDefault()
    // === limpiamos el error anterior antes de volver a intentar ===
    setError('')

    // === si falta el correo o la contraseña no mandamos nada a la API ===
    if (!form.email.trim() || !form.password) {
      setError('Ingresa tu correo institucional y contraseña.')
      return
    }
    // === el correo tiene que ser institucional ===
    if (!UTR_EMAIL_REGEX.test(form.email.trim())) {
      setError('Usa tu correo institucional (@utr.edu.mx).')
      return
    }

    // === mientras isLoading esté en true el botón queda deshabilitado ===
    setIsLoading(true)
    try {
      // === App hace el login y guarda la sesión, si sale bien entramos a /labs ===
      await onLogin({ ...form, email: form.email.trim() })
      // === replace para que el botón de atrás no regrese al login ===
      navigate('/labs', { replace: true })
    } catch (requestError) {
      // === si la API falla mostramos el mensaje que arma getErrorMessage ===
      setError(getErrorMessage(requestError))
    } finally {
      // === pase lo que pase quitamos el estado de carga ===
      setIsLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      {/* === panel izquierdo con el logo y la info de los laboratorios === */}
      <AuthStory />

      <section className="auth-panel">
        <div className="auth-card">
          {/* === logo con "UTR Labs", el CSS solo lo muestra en pantallas angostas === */}
          <div className="auth-card-brand">
            <img src="/logo-utr.png" alt="Universidad Tecnológica El Retoño y BIS Universities" />
            <span>UTR Labs</span>
          </div>

          <header className="auth-card-header">
            <h1>Bienvenido de nuevo</h1>
            <p>Ingresa con tu correo institucional.</p>
          </header>

          {/* === pestañas: estamos en login, la otra manda a registro === */}
          <nav className="auth-tabs" aria-label="Acceso">
            <Link className="auth-tabs-item auth-tabs-item-active" to="/login" aria-current="page">
              Iniciar sesión
            </Link>
            <Link className="auth-tabs-item" to="/register">
              Registro
            </Link>
          </nav>

          {/* === noValidate porque la validación la hacemos nosotros en handleSubmit === */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* === el banner de error solo aparece si error tiene texto === */}
            {error && (
              <div className="auth-form-error" role="alert">
                <span aria-hidden="true">!</span>
                <p>{error}</p>
              </div>
            )}

            {/* === inputs controlados: muestran lo que hay en form y lo actualizan con handleChange === */}
            <label htmlFor="login-email">Correo institucional</label>
            <input
              id="login-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="nombre@utr.edu.mx"
              aria-describedby="login-email-hint"
            />
            {/* === texto de ayuda, el lector de pantalla lo lee junto con el input === */}
            <p id="login-email-hint" className="auth-form-hint">Usa tu cuenta @utr.edu.mx.</p>

            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              placeholder="••••••••••"
              aria-describedby="login-password-hint"
            />
            <p id="login-password-hint" className="auth-form-hint">Escribe tu contraseña.</p>

            <div className="auth-form-help">
              <button type="button" onClick={handleForgotPassword}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* === mientras carga el botón se deshabilita y muestra el spinner === */}
            <button className="auth-form-submit" type="submit" disabled={isLoading}>
              {isLoading && <span className="auth-spinner" aria-hidden="true" />}
              <span>{isLoading ? 'Iniciando sesión' : 'Iniciar sesión'}</span>
            </button>
          </form>

          <p className="auth-card-support">
            ¿Necesitas ayuda? <a href="mailto:ti@utr.edu.mx">Contacta al área de TI.</a>
          </p>
        </div>

        <p className="auth-panel-footer">© 2026 UTR Labs · Comunidad universitaria</p>
      </section>
    </main>
  )
}
