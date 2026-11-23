// === nombres con los que se guardan el token y el usuario en localStorage ===
const TOKEN_KEY = 'token'
const USER_KEY = 'user'

// === regresa el token guardado o null si no hay sesión ===
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

// === el usuario se guarda como texto, aquí lo regresamos a objeto ===
export function getStoredUser() {
  // === si el texto guardado está roto mejor regresamos null que tronar la app ===
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

// === se llama después del login para guardar token y usuario ===
export function saveSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// === borra todo al cerrar sesión o cuando el token ya no sirve ===
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

