// === roles que maneja la API, así no escribimos 'ADMIN' o 'USER' a mano ===
export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
}

// === laboratorios que hay, la API no tiene un endpoint para pedirlos ===
export const LABS = ['Lab-A', 'Lab-B', 'Redes']

// === la matrícula son exactamente 4 números, por ejemplo 1234 ===
export const MATRICULA_REGEX = /^\d{4}$/

// === solo aceptamos correos institucionales que terminen en @utr.edu.mx ===
export const UTR_EMAIL_REGEX = /^[^\s@]+@utr\.edu\.mx$/i

