import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthStory from '../components/AuthStory'
import { register } from '../services/authService'
import { MATRICULA_REGEX, UTR_EMAIL_REGEX } from '../utils/constants'
import { getErrorMessage } from '../utils/httpErrors'

// === form vacío, lo usamos al iniciar y para limpiar después de registrarse ===
const INITIAL_FORM = {
  nombre: '',
  matricula: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function RegisterPage() {
  // === navigate sirve para mandar al usuario a otra ruta desde el código ===
  const navigate = useNavigate()
  // === estados: los datos del registro, si está cargando y el mensaje de error ===
  const [form, setForm] = useState(INITIAL_FORM)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // === se llama cada vez que el usuario escribe en un input ===
  const handleChange = (event) => {
    // === el name del input dice qué campo del form hay que cambiar ===
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  // === se ejecuta al enviar el form con el botón o con Enter ===
  const handleSubmit = async (event) => {
    // === evitamos que el navegador recargue la página ===
    event.preventDefault()
    // === limpiamos el error anterior antes de volver a intentar ===
    setError('')

    // === todos los campos son obligatorios ===
    if (
      !form.nombre.trim() ||
      !form.matricula.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.confirmPassword.trim()
    ) {
      setError('Completa todos los campos para crear tu cuenta.')
      return
    }
    // === la matrícula tiene que ser de 4 números ===
    if (!MATRICULA_REGEX.test(form.matricula)) {
      setError('La matrícula debe tener 4 números.')
      return
    }
    // === el correo tiene que ser institucional ===
    if (!UTR_EMAIL_REGEX.test(form.email.trim())) {
      setError('Usa tu correo institucional (@utr.edu.mx).')
      return
    }
    // === las dos contraseñas tienen que ser iguales ===
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    // === mientras isLoading esté en true el botón queda deshabilitado ===
    setIsLoading(true)
    try {
      // === mandamos los datos a la API (confirmPassword no se envía), el correo sin espacios ===
      await register({ ...form, email: form.email.trim() })
      // === si salió bien limpiamos el form y mandamos al login ===
      setForm(INITIAL_FORM)
      navigate('/login', { replace: true })
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
            <h1>Crea tu cuenta</h1>
            <p>Únete con tus datos institucionales.</p>
          </header>

          {/* === pestañas: estamos en registro, la otra regresa al login === */}
          <nav className="auth-tabs" aria-label="Acceso">
            <Link className="auth-tabs-item" to="/login">
              Iniciar sesión
            </Link>
            <Link className="auth-tabs-item auth-tabs-item-active" to="/register" aria-current="page">
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

            {/* === inputs controlados: el name coincide con su campo en form y abajo va su ayuda === */}
            <label htmlFor="register-name">Nombre completo</label>
            <input
              id="register-name"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              autoComplete="name"
              placeholder="Ej. Mariana López"
              aria-describedby="register-name-hint"
            />
            <p id="register-name-hint" className="auth-form-hint">Escribe tu nombre y apellidos.</p>

            <label htmlFor="register-matricula">Matrícula</label>
            <input
              id="register-matricula"
              name="matricula"
              value={form.matricula}
              onChange={handleChange}
              inputMode="numeric"
              maxLength={4}
              placeholder="Ej. 1234"
              aria-describedby="register-matricula-hint"
            />
            <p id="register-matricula-hint" className="auth-form-hint">Ingresa los 4 dígitos de tu matrícula.</p>

            <label htmlFor="register-email">Correo institucional</label>
            <input
              id="register-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="nombre@utr.edu.mx"
              aria-describedby="register-email-hint"
            />
            <p id="register-email-hint" className="auth-form-hint">Usa tu cuenta @utr.edu.mx.</p>

            <label htmlFor="register-password">Contraseña</label>
            <input
              id="register-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder="••••••••••"
              aria-describedby="register-password-hint"
            />
            <p id="register-password-hint" className="auth-form-hint">Escribe tu contraseña.</p>

            <label htmlFor="register-confirm-password">Confirmar contraseña</label>
            <input
              id="register-confirm-password"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder="••••••••••"
              aria-describedby="register-confirm-password-hint"
            />
            <p id="register-confirm-password-hint" className="auth-form-hint">Repite la misma contraseña.</p>

            {/* === mientras carga el botón se deshabilita y muestra el spinner === */}
            <button className="auth-form-submit" type="submit" disabled={isLoading}>
              {isLoading && <span className="auth-spinner" aria-hidden="true" />}
              <span>{isLoading ? 'Creando cuenta' : 'Crear cuenta'}</span>
            </button>
          </form>

          <p className="auth-card-support">
            Al registrarte aceptas el reglamento de los laboratorios.
          </p>
        </div>

        <p className="auth-panel-footer">© 2026 UTR Labs · Comunidad universitaria</p>
      </section>
    </main>
  )
}
