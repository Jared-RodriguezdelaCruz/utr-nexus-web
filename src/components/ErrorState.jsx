import { Link } from 'react-router-dom'

// === tarjeta para cuando falla la carga de datos (error 500 o sin conexión), la van a usar el mapa y mi sesión ===
export default function ErrorState({ isOffline, isLoading, onRetry }) {
  return (
    <section className="error-card" aria-labelledby="error-state-title">
      {/* === sin conexión va un monitor tachado, con error del servidor va el 500 === */}
      <div className="error-code-block">
        {isOffline ? (
          <svg className="error-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" aria-hidden="true">
            <rect x="4" y="8" width="56" height="38" rx="5" />
            <path d="M32 46v8M20 56h24" />
            <path className="error-icon-cut" d="M10 58L54 4" />
            <path d="M10 58L54 4" />
          </svg>
        ) : (
          <p className="error-code">500</p>
        )}
        <p className="error-code-label">{isOffline ? 'Sin conexión' : 'Error del servidor'}</p>
      </div>

      <h2 id="error-state-title" className="error-title">
        {isOffline ? 'No hay conexión con el servidor' : 'El servidor no respondió bien'}
      </h2>
      <p className="error-text">
        {isOffline ? 'Revisa tu internet y vuelve a intentar.' : 'Hubo un problema de nuestro lado. Intenta de nuevo en unos minutos.'}
      </p>

      {/* === banner rojo del kit, solo con error del servidor === */}
      {!isOffline && (
        <div className="error-banner" role="alert">
          <span aria-hidden="true">!</span>
          <p>No se pudo cargar la información.</p>
        </div>
      )}

      <div className="error-actions">
        {!isOffline && <Link to="/labs" className="error-button error-button-secondary">Ir al mapa</Link>}
        {/* === mientras reintenta el botón queda deshabilitado y muestra el spinner === */}
        <button type="button" className="error-button" onClick={onRetry} disabled={isLoading}>
          {isLoading && <span className="auth-spinner" aria-hidden="true" />}
          {isLoading ? 'Cargando...' : 'Reintentar'}
        </button>
      </div>
    </section>
  )
}
