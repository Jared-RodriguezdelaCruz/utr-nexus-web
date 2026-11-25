import apiClient from './apiClient'

// === solo ADMIN: pide los usuarios, por ejemplo [{ id, nombre, matricula, email, rol, activo }] ===
export async function getUsers() {
  const { data } = await apiClient.get('/users')
  return data
}

// === solo ADMIN: cambia el rol de un usuario a 'ADMIN' o 'USER', regresa { message, user } ===
export async function updateUserRole(id, rol) {
  const { data } = await apiClient.patch(`/users/${id}/role`, { rol })
  return data
}
