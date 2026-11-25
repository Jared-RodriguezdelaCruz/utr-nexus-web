import { useEffect, useState } from 'react'
import { releaseAssignment } from '../services/labService'
import { getErrorMessage } from '../utils/httpErrors'

// === C4 monitor: las sesiones activas de todos y la liberación forzada, onReleased recarga el panel ===
// === isLoadingList es la carga de la lista que hace el panel, isLoading es la liberación de aquí ===
export default function AdminMonitor({ assignments, isLoadingList, onReleased }) {
  // === estados: la asignación del diálogo, si se está liberando y el error ===
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // === con Esc se cierra el diálogo, menos mientras se libera ===
  useEffect(() => {
    // === sin diálogo abierto no escuchamos el teclado ===
    if (!selectedAssignment) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isLoading) setSelectedAssignment(null)
    }
    document.addEventListener('keydown', handleKeyDown)

    // === limpieza: quitamos el listener al cerrar el diálogo ===
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedAssignment, isLoading])

  // === "Liberación forzada" abre el diálogo de confirmación con esa asignación ===
  const handleSelect = (assignment) => {
    setError('')
    setSelectedAssignment(assignment)
  }

  // === Cancelar o clic en el fondo cierran el diálogo ===
  const handleCloseDialog = () => {
    if (!isLoading) setSelectedAssignment(null)
  }

  // === clic en el fondo oscuro: cerramos, pero no si el clic fue dentro de la tarjeta ===
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) handleCloseDialog()
  }

  // === se ejecuta al confirmar "Liberar equipo" ===
  const handleRelease = async () => {
    setError('')
    // === mientras isLoading esté en true los botones quedan deshabilitados ===
    setIsLoading(true)
    try {
      // === liberación forzada: el ADMIN libera la asignación de otro usuario sin reporte de falla ===
      await releaseAssignment(selectedAssignment.assignmentId, { reporteFalla: false, descripcionFalla: '' })
      setSelectedAssignment(null)
      onReleased()
    } catch (requestError) {
      // === si la API falla mostramos el mensaje dentro del diálogo ===
      setError(getErrorMessage(requestError))
    } finally {
      // === pase lo que pase quitamos el estado de carga ===
      setIsLoading(false)
    }
  }

  // === cargando, sin sesiones activas o la tabla ===
  let content
  if (isLoadingList) {
    content = <p className="admin-empty" role="status">Cargando asignaciones...</p>
  } else if (assignments.length === 0) {
    content = <p className="admin-empty">No hay sesiones activas.</p>
  } else {
    content = (
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">PC</th>
              <th scope="col">Laboratorio</th>
              <th scope="col">Usuario</th>
              <th scope="col">Acción</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.assignmentId}>
                <td className="admin-table-pc">{assignment.pc}</td>
                <td>{assignment.laboratorio}</td>
                <td>{assignment.usuario}</td>
                <td>
                  <button
                    type="button"
                    className="admin-release-button"
                    aria-label={`Liberación forzada de ${assignment.pc}`}
                    onClick={() => handleSelect(assignment)}
                  >
                    Liberación forzada
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <section className="admin-panel" aria-labelledby="monitor-title">
      <h2 id="monitor-title" className="admin-panel-title">Monitor de asignaciones</h2>
      {content}

      {/* === diálogo de confirmación, solo se pinta con una asignación elegida === */}
      {selectedAssignment && (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
          <section
            className="modal-card"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="release-title"
            aria-describedby="release-text"
          >
            <h2 id="release-title" className="modal-title">¿Liberar este equipo?</h2>
            <p className="admin-dialog-pc">{selectedAssignment.pc} · {selectedAssignment.laboratorio}</p>
            <p className="admin-dialog-text">Usuario: {selectedAssignment.usuario}</p>
            <p id="release-text" className="admin-dialog-text">
              Esta acción finalizará la asignación del usuario. Confirma que deseas continuar.
            </p>

            {error && (
              <div className="auth-form-error admin-dialog-error" role="alert">
                <span aria-hidden="true">!</span>
                <p>{error}</p>
              </div>
            )}

            <div className="error-actions">
              <button
                type="button"
                className="error-button error-button-secondary"
                onClick={handleCloseDialog}
                disabled={isLoading}
              >
                Cancelar
              </button>
              {/* === mientras libera el botón se deshabilita y muestra el spinner === */}
              <button type="button" className="error-button" onClick={handleRelease} disabled={isLoading} autoFocus>
                {isLoading && <span className="auth-spinner" aria-hidden="true" />}
                {isLoading ? 'Liberando' : 'Liberar equipo'}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
