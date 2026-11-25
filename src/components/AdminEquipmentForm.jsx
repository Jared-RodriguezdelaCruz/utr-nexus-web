import { useState } from 'react'
import { createEquipment } from '../services/labService'
import { EQUIPMENT_TYPES } from '../utils/constants'
import { getErrorMessage } from '../utils/httpErrors'

// === form vacío, el primer tipo (Proyector) viene elegido como en Figma ===
const EMPTY_FORM = { tipo: EQUIPMENT_TYPES[0], numeroSerie: '', laboratorio: '' }

// === C4 registrar periférico: labOptions llega del panel ===
export default function AdminEquipmentForm({ labOptions }) {
  // === estados: el form, si está cargando, el error y el aviso de éxito ===
  const [form, setForm] = useState(EMPTY_FORM)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // === se llama cada vez que el usuario escribe o elige un laboratorio ===
  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  // === al tocar una tarjeta guardamos ese tipo de periférico ===
  const handleTypeChange = (tipo) => {
    setForm({ ...form, tipo })
  }

  // === se ejecuta al presionar "Registrar periférico" ===
  const handleSubmit = async (event) => {
    // === evitamos que el navegador recargue la página ===
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    // === sin número de serie o laboratorio no mandamos nada ===
    if (!form.numeroSerie.trim() || !form.laboratorio) {
      setError('Llena el número de serie y el laboratorio.')
      return
    }

    // === mientras isLoading esté en true el botón queda deshabilitado ===
    setIsLoading(true)
    try {
      // === llamada a la API con el número de serie sin espacios de más ===
      await createEquipment({ tipo: form.tipo, numeroSerie: form.numeroSerie.trim(), laboratorio: form.laboratorio })
      // === avisamos y dejamos el form listo para otro periférico ===
      setSuccessMessage(`${form.tipo} ${form.numeroSerie.trim()} registrado.`)
      setForm(EMPTY_FORM)
    } catch (requestError) {
      // === por ejemplo un 409 si ese número de serie ya existe ===
      setError(getErrorMessage(requestError))
    } finally {
      // === pase lo que pase quitamos el estado de carga ===
      setIsLoading(false)
    }
  }

  return (
    <section className="admin-panel" aria-labelledby="equipment-title">
      <h2 id="equipment-title" className="admin-panel-title">Registrar periférico</h2>

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

        {/* === tarjetas de tipo, la elegida se pinta con borde rojo === */}
        <p id="equipment-tipo-label" className="modal-label">Tipo de periférico</p>
        <div className="admin-types" role="group" aria-labelledby="equipment-tipo-label">
          {EQUIPMENT_TYPES.map((tipo) => (
            <button
              key={tipo}
              type="button"
              aria-pressed={tipo === form.tipo}
              className={tipo === form.tipo ? 'admin-type admin-type-active' : 'admin-type'}
              onClick={() => handleTypeChange(tipo)}
            >
              {tipo === form.tipo && <span aria-hidden="true">✓</span>}
              {tipo}
            </button>
          ))}
        </div>

        <label htmlFor="equipment-serie">Número de serie</label>
        <input
          id="equipment-serie"
          name="numeroSerie"
          value={form.numeroSerie}
          onChange={handleChange}
          placeholder="EP-2026-00482"
          aria-describedby="equipment-serie-hint"
        />
        <p id="equipment-serie-hint" className="auth-form-hint">Escribe el número de serie del accesorio.</p>

        <label htmlFor="equipment-laboratorio">Laboratorio</label>
        <select
          id="equipment-laboratorio"
          name="laboratorio"
          value={form.laboratorio}
          onChange={handleChange}
          aria-describedby="equipment-laboratorio-hint"
        >
          <option value="">Elige un laboratorio</option>
          {labOptions.map((labName) => (
            <option key={labName} value={labName}>{labName}</option>
          ))}
        </select>
        <p id="equipment-laboratorio-hint" className="auth-form-hint">Selecciona un laboratorio.</p>

        {/* === mientras carga el botón se deshabilita y muestra el spinner === */}
        <button className="auth-form-submit" type="submit" disabled={isLoading}>
          {isLoading && <span className="auth-spinner" aria-hidden="true" />}
          <span>{isLoading ? 'Registrando periférico' : 'Registrar periférico'}</span>
        </button>
      </form>
    </section>
  )
}
