import { useEffect, useState } from 'react'
import AdminComputerForm from '../components/AdminComputerForm'
import AdminEquipmentForm from '../components/AdminEquipmentForm'
import AdminMonitor from '../components/AdminMonitor'
import AdminUsersPanel from '../components/AdminUsersPanel'
import AppHeader from '../components/AppHeader'
import ErrorState from '../components/ErrorState'
import { getAssignments, getComputers } from '../services/labService'
import { ASSIGNMENT_STATUS, COMPUTER_STATUS, LABS } from '../utils/constants'

// === pestañas de la columna izquierda ===
const TABS = [
  { id: 'computer', label: 'Registrar PC' },
  { id: 'equipment', label: 'Registrar periférico' },
  { id: 'monitor', label: 'Monitor' },
]

// === cada 30 s se vuelven a pedir los datos para que el monitor esté en vivo ===
const REFRESH_MS = 30000

// === C4 control TI: contadores, alta de PCs y periféricos, monitor y usuarios, solo ADMIN ===
export default function AdminDashboardPage({ user, onLogout }) {
  // === estados: PCs y asignaciones de la API, pestaña elegida, carga, error y recargas ===
  const [computers, setComputers] = useState([])
  const [assignments, setAssignments] = useState([])
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadCount, setReloadCount] = useState(0)

  // === al abrir la página y en cada recarga pedimos las PCs y las asignaciones ===
  useEffect(() => {
    // === si sale de la página antes de que llegue la respuesta, la ignoramos ===
    let ignore = false

    const loadDashboard = async () => {
      setError(null)
      try {
        // === las dos peticiones van al mismo tiempo, sin filtros llegan todas ===
        const [computerList, assignmentList] = await Promise.all([getComputers({}), getAssignments()])
        if (!ignore) {
          setComputers(computerList)
          setAssignments(assignmentList)
        }
      } catch (requestError) {
        // === el 401 y el 403 ya los redirige el apiClient, aquí guardamos el error para pintarlo ===
        if (!ignore) setError(requestError)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadDashboard()

    // === limpieza: corre al salir de la página o antes de la siguiente recarga ===
    return () => {
      ignore = true
    }
  }, [reloadCount])

  // === monitor en vivo: a los 30 s de la última carga pedimos todo otra vez ===
  useEffect(() => {
    const intervalId = setInterval(() => {
      setReloadCount(reloadCount + 1)
    }, REFRESH_MS)

    // === limpieza: quitamos el intervalo al salir o cuando ya se recargó ===
    return () => {
      clearInterval(intervalId)
    }
  }, [reloadCount])

  // === al tocar una pestaña cambiamos lo que se ve a la izquierda ===
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
  }

  // === después de registrar una PC o liberar un equipo recargamos sin mostrar la carga ===
  const handleReload = () => {
    setReloadCount(reloadCount + 1)
  }

  // === botón Reintentar del error: mostramos la carga y volvemos a pedir ===
  const handleRetry = () => {
    setIsLoading(true)
    setReloadCount(reloadCount + 1)
  }

  // === contadores de arriba, salen de los estatus que manda la API ===
  const availableCount = computers.filter((computer) => computer.estatus === COMPUTER_STATUS.DISPONIBLE).length
  const maintenanceCount = computers.filter((computer) => computer.estatus === COMPUTER_STATUS.MANTENIMIENTO).length
  const activeAssignments = assignments.filter((assignment) => assignment.estatus === ASSIGNMENT_STATUS.ASIGNADA)

  // === laboratorios del select: los que ya tienen PCs más los 14 reales, sin repetidos y ordenados ===
  const labNames = [...computers.map((computer) => computer.laboratorio), ...LABS.map((lab) => lab.id)]
  const labOptions = labNames.filter((labName, index) => labNames.indexOf(labName) === index).sort()

  // === cada contador con su color: verde disponibles, rojo sesiones y ámbar mantenimiento ===
  const stats = [
    { label: 'Equipos disponibles', value: availableCount, className: 'admin-stat-value admin-stat-available' },
    { label: 'Sesiones activas', value: activeAssignments.length, className: 'admin-stat-value admin-stat-occupied' },
    { label: 'Mantenimiento', value: maintenanceCount, className: 'admin-stat-value admin-stat-maintenance' },
  ]

  return (
    <div className="app-page">
      <AppHeader user={user} onLogout={onLogout} />

      <main className="labs-main">
        <h1 className="labs-title">Control TI</h1>
        <p className="labs-subtitle">Inventario, asignaciones y accesos.</p>

        {error ? (
          <div className="labs-error">
            <ErrorState isOffline={!error.response} isLoading={isLoading} onRetry={handleRetry} />
          </div>
        ) : (
          <>
            {/* === contadores del inventario, mientras carga muestran un guion === */}
            <dl className="admin-stats">
              {stats.map((stat) => (
                <div key={stat.label} className="admin-stat">
                  <dt>{stat.label}</dt>
                  <dd className={stat.className}>{isLoading ? '–' : stat.value}</dd>
                </div>
              ))}
            </dl>

            {/* === pestañas, la elegida va subrayada en rojo === */}
            <div className="admin-tabs" role="tablist" aria-label="Secciones de Control TI">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  id={`admin-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={tab.id === activeTab}
                  aria-controls="admin-tab-panel"
                  className={tab.id === activeTab ? 'admin-tab admin-tab-active' : 'admin-tab'}
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* === a la izquierda la pestaña elegida y a la derecha siempre los usuarios === */}
            <div className="admin-layout">
              <div id="admin-tab-panel" role="tabpanel" aria-labelledby={`admin-tab-${activeTab}`}>
                {activeTab === 'computer' && <AdminComputerForm labOptions={labOptions} onSaved={handleReload} />}
                {activeTab === 'equipment' && <AdminEquipmentForm labOptions={labOptions} />}
                {activeTab === 'monitor' && (
                  <AdminMonitor assignments={activeAssignments} isLoadingList={isLoading} onReleased={handleReload} />
                )}
              </div>
              <AdminUsersPanel currentUser={user} />
            </div>
          </>
        )}
      </main>

      <footer className="app-footer">© 2026 UTR Labs · Acceso exclusivo para administración TI</footer>
    </div>
  )
}
