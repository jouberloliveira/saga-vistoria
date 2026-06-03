import { api } from './client'

export interface Funcionario {
  id: string
  name: string
  username: string
  email: string
  role: 'admin' | 'funcionario'
  ativo: boolean
  createdAt: string
}

export interface FuncionarioPayload {
  name: string
  username: string
  email: string
  password?: string
  role: 'admin' | 'funcionario'
}

export const getFuncionarios = async (): Promise<Funcionario[]> => {
  const { data } = await api.get('/funcionarios')
  return data
}

export const createFuncionario = async (payload: FuncionarioPayload): Promise<Funcionario> => {
  const { data } = await api.post('/funcionarios', payload)
  return data
}

export const updateFuncionario = async (id: string, payload: Partial<FuncionarioPayload>): Promise<Funcionario> => {
  const { data } = await api.patch(`/funcionarios/${id}`, payload)
  return data
}

export const toggleFuncionario = async (id: string, ativo: boolean): Promise<Funcionario> => {
  const { data } = await api.patch(`/funcionarios/${id}`, { ativo })
  return data
}
