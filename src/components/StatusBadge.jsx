import { COMPUTER_STATUS, STATUS_LABELS } from '../utils/constants'

// === símbolo de cada estatus para no depender solo del color, el ︎ hace que ⚠ no salga como emoji ===
const STATUS_SYMBOLS = {
  [COMPUTER_STATUS.DISPONIBLE]: '✓',
  [COMPUTER_STATUS.OCUPADA]: '−',
  [COMPUTER_STATUS.MANTENIMIENTO]: '⚠︎',
}

// === chip de estatus del kit: punto, símbolo y texto con el color del estatus ===
export default function StatusBadge({ estatus }) {
  return (
    <span className={`status-badge status-badge-${estatus.toLowerCase()}`}>
      <span aria-hidden="true">{STATUS_SYMBOLS[estatus]}</span>
      {STATUS_LABELS[estatus]}
    </span>
  )
}
