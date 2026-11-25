// === roles que maneja la API, así no escribimos 'ADMIN' o 'USER' a mano ===
export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
}

// === estatus que puede tener una computadora, tal cual los manda la API ===
export const COMPUTER_STATUS = {
  DISPONIBLE: 'DISPONIBLE',
  OCUPADA: 'OCUPADA',
  MANTENIMIENTO: 'MANTENIMIENTO',
}

// === texto que ve el usuario para cada estatus ===
export const STATUS_LABELS = {
  [COMPUTER_STATUS.DISPONIBLE]: 'Disponible',
  [COMPUTER_STATUS.OCUPADA]: 'Ocupada',
  [COMPUTER_STATUS.MANTENIMIENTO]: 'Mantenimiento',
}

// === filtros del mapa, value vacío es "Todos" y no se manda a la API ===
export const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: COMPUTER_STATUS.DISPONIBLE, label: 'Disponibles' },
  { value: COMPUTER_STATUS.OCUPADA, label: 'Ocupadas' },
  { value: COMPUTER_STATUS.MANTENIMIENTO, label: 'Mantenimiento' },
]

// === horas que se pueden elegir al asignar una PC, como el segmentado del kit ===
export const SESSION_HOURS = [1, 2, 3, 4]

// === edificios y laboratorios de la UTR, solo para el panel del login, el mapa pide los labs a la API ===
export const BUILDINGS = [
  { id: 'A', label: 'Edificio A' },
  { id: 'B', label: 'Edificio B' },
  { id: 'D', label: 'Edificio D' },
  { id: 'SAC', label: 'SAC' },
  { id: 'VINC', label: 'Vinculación' },
]

// === laboratorios de cada edificio para el mismo panel del login ===
export const LABS = [
  { id: 'AL-01', label: 'AL-01', building: 'A' },
  { id: 'AL-02', label: 'AL-02', building: 'A' },
  { id: 'BL-01', label: 'BL-01', building: 'B' },
  { id: 'BL-02', label: 'BL-02', building: 'B' },
  { id: 'BL-03', label: 'BL-03', building: 'B' },
  { id: 'BL-04', label: 'BL-04', building: 'B' },
  { id: 'BL-05', label: 'BL-05', building: 'B' },
  { id: 'DL-01', label: 'DL-01', building: 'D' },
  { id: 'DL-02', label: 'DL-02', building: 'D' },
  { id: 'DL-03', label: 'DL-03', building: 'D' },
  { id: 'DL-04', label: 'DL-04', building: 'D' },
  { id: 'SAC-1', label: 'SAC 1', building: 'SAC' },
  { id: 'SAC-2', label: 'SAC 2', building: 'SAC' },
  { id: 'VINC', label: 'VINC', building: 'VINC' },
]

// === la matrícula son exactamente 4 números, por ejemplo 1234 ===
export const MATRICULA_REGEX = /^\d{4}$/

// === cualquier correo con forma nombre@dominio.algo, el login lo usa porque las cuentas del profe son @equipo-c2.utr ===
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// === en el registro solo aceptamos correos institucionales que terminen en @utr.edu.mx ===
export const UTR_EMAIL_REGEX = /^[^\s@]+@utr\.edu\.mx$/i

