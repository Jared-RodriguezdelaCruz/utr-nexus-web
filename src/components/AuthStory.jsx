import { BUILDINGS, LABS } from '../utils/constants'

// === panel izquierdo que comparten login y registro ===
export default function AuthStory() {
  return (
    <section className="auth-story" aria-label="UTR Labs">
      <img className="auth-logo" src="/logo-utr.png" alt="Universidad Tecnológica El Retoño y BIS Universities" />
      <p className="auth-story-eyebrow">UTR Labs / Control de laboratorios</p>
      <div className="auth-story-copy">
        <h1>Tu espacio para<br />crear el futuro.</h1>
        <p>Reserva tu equipo y enfócate en tu próximo proyecto.</p>
      </div>

      {/* === tarjeta con los laboratorios y el horario, es info fija, no viene de la API === */}
      <div className="auth-labs">
        <p className="auth-labs-title">Laboratorios</p>
        <ul className="auth-labs-list">
          {BUILDINGS.map((building) => (
            <li key={building.id} className="auth-labs-building">
              <span className="auth-labs-building-name">{building.label}</span>
              <ul className="auth-labs-chips">
                {LABS.filter((lab) => lab.building === building.id).map((lab) => (
                  <li key={lab.id} className="auth-labs-chip">{lab.label}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className="auth-labs-hours">
          Horario de atención
          <strong className="auth-labs-hours-value">07:30–16:30</strong>
        </p>
      </div>

      <p className="auth-story-footer">
        <strong>Universidad Tecnológica El Retoño</strong>
        <span>Conocimiento que transforma.</span>
      </p>
    </section>
  )
}
