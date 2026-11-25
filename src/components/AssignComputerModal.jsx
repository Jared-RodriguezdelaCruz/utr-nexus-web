import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assignComputer } from '../services/labService'
import { SESSION_HOURS } from '../utils/constants'
import { getErrorMessage } from '../utils/httpErrors'

// === C2 asignar equipo: LabsGridPage lo abre al elegir una PC disponible ===
export default function AssignComputerModal({ computer, user, onClose }) {
  const navigate = useNavigate()
  // === estados: materia y horas del form, si está cargando y el mensaje de error ===
  const [form, setForm] = useState({ materia: '', horasUso: 2 })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // === con Esc se cierra el modal, menos mientras se manda la asignación ===
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isLoading) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    // === limpieza: quitamos el listener al cerrar el modal ===
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isLoading, onClose])

  // === se llama cada vez que el usuario escribe la materia ===
  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  // === al tocar una hora del segmentado la guardamos en el form ===
  const handleHoursChange = (hours) => {
    setForm({ ...form, horasUso: hours })
  }

  // === clic en el fondo oscuro: cerramos, pero no si el clic fue dentro de la tarjeta ===
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !isLoading) onClose()
  }

  // === se ejecuta al confirmar con el botón o con Enter ===
  const handleSubmit = async (event) => {
    // === evitamos que el navegador recargue la página ===
    event.preventDefault()
    setError('')

    // === sin materia no mandamos nada a la API ===
    if (!form.materia.trim()) {
      setError('Escribe el nombre de tu materia.')
      return
    }

    // === mientras isLoading esté en true el botón queda deshabilitado ===
    setIsLoading(true)
    try {
      // === llamada a la API, horasUso ya es número porque sale del segmentado ===
      await assignComputer({
        computerId: computer.id,
        userId: user.id,
        materia: form.materia.trim(),
        horasUso: form.horasUso,
      })
      // === si sale bien vamos a Mi sesión para ver el equipo ===
      navigate('/mi-sesion')
    } catch (requestError) {
      // === por ejemplo un 409 si alguien ya tomó la PC o ya tienes otra asignada ===
      setError(getErrorMessage(requestError))
    } finally {
      // === pase lo que pase quitamos el estado de carga ===
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="assign-title">
        <h2 id="assign-title" className="modal-title">Asignar equipo</h2>
        <p className="modal-subtitle">{computer.numeroInventario} · {computer.laboratorio}</p>

        {/* === noValidate porque la validación la hacemos nosotros en handleSubmit === */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* === el banner de error solo aparece si error tiene texto === */}
          {error && (
            <div className="auth-form-error" role="alert">
              <span aria-hidden="true">!</span>
              <p>{error}</p>
            </div>
          )}

          {/* === segmentado de horas, la elegida se pinta en rojo === */}
          <p id="assign-hours-label" className="modal-label">Duración de la sesión</p>
          <div className="hours-segmented" role="group" aria-labelledby="assign-hours-label">
            {SESSION_HOURS.map((hours) => (
              <button
                key={hours}
                type="button"
                aria-pressed={hours === form.horasUso}
                className={hours === form.horasUso ? 'hours-segmented-item hours-segmented-item-active' : 'hours-segmented-item'}
                onClick={() => handleHoursChange(hours)}
              >
                {hours} h
              </button>
            ))}
          </div>

          {/* === input controlado de la materia === */}
          <label htmlFor="assign-materia">Materia</label>
          <input
            id="assign-materia"
            name="materia"
            value={form.materia}
            onChange={handleChange}
            placeholder="Desarrollo de aplicaciones web"
            aria-describedby="assign-materia-hint"
            autoFocus
          />
          <p id="assign-materia-hint" className="auth-form-hint">Escribe el nombre de tu materia.</p>

          {/* === mientras carga el botón se deshabilita y muestra el spinner === */}
          <button className="auth-form-submit" type="submit" disabled={isLoading}>
            {isLoading && <span className="auth-spinner" aria-hidden="true" />}
            <span>{isLoading ? 'Asignando equipo' : 'Confirmar asignación'}</span>
          </button>
          <button className="modal-cancel" type="button" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
        </form>
      </section>
    </div>
  )
}
