import { api } from './client'

export interface Vistoria {
  id: string
  placa: string
  marca: string
  modelo: string
  ano: number
  cor: string
  quilometragem: number
  chassi: string
  clienteNome: string
  clienteDocumento: string
  clienteTelefone: string
  clienteEmail: string
  pneus: PneuStatus[]
  danos: Dano[]
  sujeira: SujeiraItem[]
  itensFaltantes: string[]
  fotos: Foto[]
  assinaturaFuncionario?: string
  assinaturaCliente?: string
  status: 'rascunho' | 'finalizado'
  funcionarioId: string
  funcionarioNome: string
  createdAt: string
  updatedAt: string
}

export interface PneuStatus {
  posicao: 'DE' | 'DD' | 'TE' | 'TD' | 'estepe'
  status: 'bom' | 'desgastado' | 'careca' | 'furado'
}

export interface Dano {
  id?: string
  tipo: 'amassado' | 'arranhado'
  localizacao: string
  gravidade: 'leve' | 'moderado' | 'grave'
  descricao: string
}

export interface SujeiraItem {
  area: string
  nivel: 'limpo' | 'sujo' | 'muito_sujo'
}

export interface Foto {
  id: string
  url: string
  danoId?: string
  descricao?: string
}

export interface VistoriaFiltros {
  placa?: string
  cliente?: string
  dataInicio?: string
  dataFim?: string
  funcionarioId?: string
  page?: number
  limit?: number
}

export interface VistoriasPaginadas {
  data: Vistoria[]
  total: number
  page: number
  limit: number
}

export const getVistorias = async (filtros?: VistoriaFiltros): Promise<VistoriasPaginadas> => {
  const { data } = await api.get('/vistorias', { params: filtros })
  return data
}

export const getVistoria = async (id: string): Promise<Vistoria> => {
  const { data } = await api.get(`/vistorias/${id}`)
  return data
}

export const createVistoria = async (payload: Partial<Vistoria>): Promise<Vistoria> => {
  const { data } = await api.post('/vistorias', payload)
  return data
}

export const updateVistoria = async (id: string, payload: Partial<Vistoria>): Promise<Vistoria> => {
  const { data } = await api.patch(`/vistorias/${id}`, payload)
  return data
}

export const finalizarVistoria = async (id: string, assinaturas: { funcionario: string; cliente: string }): Promise<Vistoria> => {
  const { data } = await api.post(`/vistorias/${id}/finalizar`, assinaturas)
  return data
}

export const getVistoriaPdf = async (id: string): Promise<Blob> => {
  const { data } = await api.get(`/vistorias/${id}/pdf`, { responseType: 'blob' })
  return data
}

export const uploadFoto = async (id: string, formData: FormData): Promise<Foto[]> => {
  const { data } = await api.post(`/vistorias/${id}/fotos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const getDashboard = async () => {
  const { data } = await api.get('/vistorias/dashboard')
  return data
}
