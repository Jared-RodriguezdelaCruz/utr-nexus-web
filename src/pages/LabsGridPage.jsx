import { useEffect, useState } from 'react'
import AppHeader from '../components/AppHeader'
import AssignComputerModal from '../components/AssignComputerModal'
import ErrorState from '../components/ErrorState'
import StatusBadge from '../components/StatusBadge'
import { getComputers, getLabs } from '../services/labService'
import { COMPUTER_STATUS, STATUS_FILTERS } from '../utils/constants'

// === texto de abajo de la tarjeta cuando la PC no se puede pedir ===
const STATUS_NOTES = {
  [COMPUTER_STATUS.OCUPADA]: 'Equipo en uso',
  [COMPUTER_STATUS.MANTENIMIENTO]: 'No disponible',
}

// === cuántas tarjetas grises se ven mientras carga ===
const SKELETON_CARDS = [1, 2, 3, 4, 5, 6, 7, 8]

// === C1 mapa de laboratorio: pestañas de laboratorio, filtros de estatus y la cuadrícula de PCs ===
export default function LabsGridPage({ user, onLogout }) {
  // === estados: labs de la API, lab y filtro elegidos, las PCs, carga, error, reintentos y la PC del modal ===
  const [labs, setLabs] = useState([])
  const [laboratorio, setLaboratorio] = useState('')
  const [estatus, setEstatus] = useState('')
  const [computers, setComputers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [selectedComputer, setSelectedComputer] = useState(null)

  // === al abrir la página pedimos los nombres de los laboratorios ===
  useEffect(() => {
    // === si ya los tenemos no los pedimos otra vez (pasa al reintentar) ===
    if (labs.length > 0) return

    const loadLabs = async () => {
      try {
        // === llamada a la API, regresa algo como ['Lab-A', 'Lab-B', 'Redes'] ===
        const labNames = await getLabs()
        setLabs(labNames)
        if (labNames.length > 0) {
          // === elegimos el primero, eso hace que el otro efecto pida sus PCs ===
          setLaboratorio(labNames[0])
        } else {
          // === sin laboratorios no hay nada más que cargar ===
          setIsLoading(false)
        }
      } catch (requestError) {
        // === el 401 y el 403 ya los redirige el apiClient, aquí guardamos el error para pintarlo ===
        setError(requestError)
        setIsLoading(false)
      }
    }

    loadLabs()
  }, [labs.length, retryCount])

  // === pedimos las PCs al cambiar de lab o de filtro y al reintentar ===
  useEffect(() => {
    // === sin lab elegido todavía no hay nada que pedir ===
    if (!laboratorio) return
    // === si cambian de lab antes de que llegue la respuesta, la vieja se ignora ===
    let ignore = false

    const loadComputers = async () => {
      // === mientras carga se ven las tarjetas grises ===
      setIsLoading(true)
      setError(null)
      try {
        // === llamada a la API con el lab y el estatus del filtro ===
        const data = await getComputers({ laboratorio, estatus })
        if (!ignore) setComputers(data)
      } catch (requestError) {
        if (!ignore) setError(requestError)
      } finally {
        // === pase lo que pase quitamos la carga, solo si esta respuesta sigue siendo la buena ===
        if (!ignore) setIsLoading(false)
      }
    }

    loadComputers()

    // === limpieza: corre antes de volver a pedir con otro lab o filtro ===
    return () => {
      ignore = true
    }
  }, [laboratorio, estatus, retryCount])

  // === al elegir un laboratorio cambiamos el lab y el efecto pide sus PCs ===
  const handleTabChange = (labName) => {
    setLaboratorio(labName)
  }

  // === al elegir un filtro cambiamos el estatus que se manda a la API ===
  const handleFilterChange = (value) => {
    setEstatus(value)
  }

  // === al tocar "Asignar equipo" guardamos la PC y se abre el modal C2 ===
  const handleSelect = (computer) => {
    setSelectedComputer(computer)
  }

  // === Cancelar, Esc o clic afuera: sin PC elegida el modal se cierra ===
  const handleCloseModal = () => {
    setSelectedComputer(null)
  }

  // === botón Reintentar: quitamos el error y sumamos un reintento para que los efectos corran otra vez ===
  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    setRetryCount(retryCount + 1)
  }

  // === textos del estado vacío según lo que pasó ===
  let emptyTitle = 'Este laboratorio no tiene equipos'
  let emptyText = 'Prueba con otro laboratorio.'
  if (labs.length === 0) {
    emptyTitle = 'Todavía no hay laboratorios'
    emptyText = 'Cuando se registren equipos van a aparecer aquí.'
  } else if (estatus) {
    emptyTitle = 'No hay equipos con este filtro'
    emptyText = 'Prueba con otro estatus o laboratorio.'
  }

  // === lo que va debajo del pizarrón: error, carga, vacío o la cuadrícula ===
  let content
  if (error) {
    content = (
      <div className="labs-error">
        <ErrorState isOffline={!error.response} isLoading={isLoading} onRetry={handleRetry} />
      </div>
    )
  } else if (isLoading) {
    content = (
      <div className="labs-grid" role="status">
        <span className="visually-hidden">Cargando equipos...</span>
        {SKELETON_CARDS.map((card) => (
          <div key={card} className="pc-card pc-card-skeleton" aria-hidden="true">
            <span className="skeleton-bar skeleton-bar-short" />
            <span className="skeleton-bar" />
            <span className="skeleton-bar skeleton-bar-medium" />
            <span className="skeleton-bar skeleton-bar-button" />
          </div>
        ))}
      </div>
    )
  } else if (computers.length === 0) {
    content = (
      <div className="labs-empty">
        <h2>{emptyTitle}</h2>
        <p>{emptyText}</p>
      </div>
    )
  } else {
    content = (
      <ul className="labs-grid">
        {computers.map((computer) => (
          <li key={computer.id} className="pc-card">
            <p className="pc-card-label">N.º de inventario</p>
            <h2 className="pc-card-number">{computer.numeroInventario}</h2>
            <p className="pc-card-specs">{computer.especificaciones}</p>
            <StatusBadge estatus={computer.estatus} />
            {/* === solo las PCs disponibles se pueden pedir, las demás muestran su nota === */}
            {computer.estatus === COMPUTER_STATUS.DISPONIBLE ? (
              <button
                type="button"
                className="pc-card-button"
                aria-label={`Asignar equipo ${computer.numeroInventario}`}
                onClick={() => handleSelect(computer)}
              >
                Asignar equipo
              </button>
            ) : (
              <p className="pc-card-note">{STATUS_NOTES[computer.estatus]}</p>
            )}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="app-page">
      <AppHeader user={user} onLogout={onLogout} />

      <main className="labs-main">
        <h1 className="labs-title">Mapa de laboratorio</h1>
        <p className="labs-subtitle">Selecciona un equipo disponible en tu laboratorio.</p>

        {/* === laboratorios que manda la API, el elegido se pinta en rojo === */}
        {labs.length > 0 && (
          <div className="labs-tabs" role="group" aria-label="Laboratorio">
            {labs.map((labName) => (
              <button
                key={labName}
                type="button"
                aria-pressed={labName === laboratorio}
                className={labName === laboratorio ? 'labs-chip labs-chip-active' : 'labs-chip'}
                onClick={() => handleTabChange(labName)}
              >
                {labName}
              </button>
            ))}
          </div>
        )}

        {/* === filtros de estatus, "Todos" no manda estatus a la API === */}
        <div className="labs-filters" role="group" aria-label="Filtrar por estatus">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              aria-pressed={filter.value === estatus}
              className={filter.value === estatus ? 'labs-chip labs-chip-active' : 'labs-chip'}
              onClick={() => handleFilterChange(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* === franja que marca el frente del salón === */}
        <p className="labs-board">Pizarrón / Escritorio Docente</p>

        {content}
      </main>

      <footer className="app-footer">© 2026 UTR Labs</footer>

      {/* === modal C2, solo se pinta cuando hay una PC elegida === */}
      {selectedComputer && (
        <AssignComputerModal computer={selectedComputer} user={user} onClose={handleCloseModal} />
      )}
    </div>
  )
}
