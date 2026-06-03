import { api } from './client'

export interface LoginPayload {
  username: string
  password: string
}

export interface AuthUser {
  id: string
  name: string
  username: string
  role: 'admin' | 'funcionario'
  token: string
}

export const login = async (payload: LoginPayload): Promise<AuthUser> => {
  const { data } = await api.post<AuthUser>('/auth/login', payload)
  return data
}
