import axios from 'axios'
import { clearSession, getToken } from '../utils/session'

// === cliente único para hablar con la API, la URL sale del .env ===
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

// === antes de cada petición le pegamos el x-api-token y, si hay sesión, el Bearer ===
apiClient.interceptors.request.use((config) => {
  config.headers['x-api-token'] = import.meta.env.VITE_API_APP_TOKEN

  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// === revisamos cada respuesta con error antes de que llegue a la página ===
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const isAuthRequest = error.config?.url?.startsWith('/auth/')

    // === con 401 fuera de /auth borramos la sesión y recargamos en /login, así App vuelve a leer localStorage ===
    if (status === 401 && !isAuthRequest) {
      clearSession()
      window.location.href = '/login'
    }
    // === con 403 el usuario no tiene permiso, lo mandamos a la página de acceso restringido ===
    if (status === 403) {
      window.location.href = '/acceso-restringido'
    }
    return Promise.reject(error)
  },
)

export default apiClient
