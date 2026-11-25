import { useState } from 'react'
import { createComputer } from '../services/labService'
import { PERIPHERALS } from '../utils/constants'
import { getErrorMessage } from '../utils/httpErrors'

// === form vacío, los periféricos empiezan todos marcados como en Figma ===
const EMPTY_FORM = { numeroInventario: '', laboratorio: '', especificaciones: '', perifericosIncluidos: PERIPHERALS }

// === C4 registrar PC: labOptions llega del panel y onSaved recarga los contadores ===
export default function AdminComputerForm({ labOptions, onSaved }) {
  // === estados: el form, si está cargando, el error y el aviso de éxito ===
  const [form, setForm] = useState(EMPTY_FORM)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // === se llama cada vez que el usuario escribe o elige un laboratorio ===
  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  // === marca o desmarca un periférico de la lista ===
  const handlePeripheralToggle = (peripheral) => {
    const isSelected = form.perifericosIncluidos.includes(peripheral)
    const perifericosIncluidos = isSelected
      ? form.perifericosIncluidos.filter((item) => item !== peripheral)
      : [...form.perifericosIncluidos, peripheral]
    setForm({ ...form, perifericosIncluidos })
  }

  // === se ejecuta al presionar "Registrar equipo" ===
  const handleSubmit = async (event) => {
    // === evitamos que el navegador recargue la página ===
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    // === sin inventario, laboratorio o especificaciones no mandamos nada ===
    if (!form.numeroInventario.trim() || !form.laboratorio || !form.especificaciones.trim()) {
      setError('Llena el número de inventario, el laboratorio y las especificaciones.')
      return
    }

    // === mientras isLoading esté en true el botón queda deshabilitado ===
    setIsLoading(true)
    try {
      // === llamada a la API con los datos sin espacios de más ===
      await createComputer({
        numeroInventario: form.numeroInventario.trim(),
        laboratorio: form.laboratorio,
        especificaciones: form.especificaciones.trim(),
        perifericosIncluidos: form.perifericosIncluidos,
      })
      // === avisamos, limpiamos el form y el panel recarga los contadores ===
      setSuccessMessage(`Equipo ${form.numeroInventario.trim()} registrado.`)
      setForm(EMPTY_FORM)
      onSaved()
    } catch (requestError) {
      // === por ejemplo un 409 si ese número de inventario ya existe ===
      setError(getErrorMessage(requestError))
    } finally {
      // === pase lo que pase quitamos el estado de carga ===
      setIsLoading(false)
    }
  }

  return (
    <section className="admin-panel" aria-labelledby="computer-title">
      <h2 id="computer-title" className="admin-panel-title">Registrar PC</h2>

      {/* === noValidate porque la validación la hacemos nosotros en handleSubmit === */}
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="auth-form-error" role="alert">
            <span aria-hidden="true">!</span>
            <p>{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="success-banner" role="status">
            <span aria-hidden="true">✓</span>
            <p>{successMessage}</p>
          </div>
        )}

        {/* === inventario y laboratorio van lado a lado en escritorio === */}
        <div className="admin-form-row">
          <div className="admin-field">
            <label htmlFor="computer-inventario">Número de inventario</label>
            <input
              id="computer-inventario"
              name="numeroInventario"
              value={form.numeroInventario}
              onChange={handleChange}
              placeholder="UTR-PC-13"
              aria-describedby="computer-inventario-hint"
            />
            <p id="computer-inventario-hint" className="auth-form-hint">Identificador único del equipo.</p>
          </div>
          <div className="admin-field">
            <label htmlFor="computer-laboratorio">Laboratorio</label>
            <select
              id="computer-laboratorio"
              name="laboratorio"
              value={form.laboratorio}
              onChange={handleChange}
              aria-describedby="computer-laboratorio-hint"
            >
              <option value="">Elige un laboratorio</option>
              {labOptions.map((labName) => (
                <option key={labName} value={labName}>{labName}</option>
              ))}
            </select>
            <p id="computer-laboratorio-hint" className="auth-form-hint">Selecciona un laboratorio.</p>
          </div>
        </div>

        <label htmlFor="computer-especificaciones">Especificaciones</label>
        <input
          id="computer-especificaciones"
          name="especificaciones"
          value={form.especificaciones}
          onChange={handleChange}
          placeholder="Core i7, 16GB RAM"
          aria-describedby="computer-especificaciones-hint"
        />
        <p id="computer-especificaciones-hint" className="auth-form-hint">Procesador y memoria en un solo campo.</p>

        {/* === chips de periféricos, los marcados se pintan en rojo === */}
        <p id="computer-perifericos-label" className="modal-label">Periféricos incluidos</p>
        <div className="admin-chips" role="group" aria-labelledby="computer-perifericos-label">
          {PERIPHERALS.map((peripheral) => {
            const isSelected = form.perifericosIncluidos.includes(peripheral)
            return (
              <button
                key={peripheral}
                type="button"
                aria-pressed={isSelected}
                className={isSelected ? 'admin-chip admin-chip-active' : 'admin-chip'}
                onClick={() => handlePeripheralToggle(peripheral)}
              >
                <span aria-hidden="true">{isSelected ? '✓' : '+'}</span>
                {peripheral}
              </button>
            )
          })}
        </div>

        {/* === mientras carga el botón se deshabilita y muestra el spinner === */}
        <button className="auth-form-submit" type="submit" disabled={isLoading}>
          {isLoading && <span className="auth-spinner" aria-hidden="true" />}
          <span>{isLoading ? 'Registrando equipo' : 'Registrar equipo'}</span>
        </button>
      </form>
    </section>
  )
}
