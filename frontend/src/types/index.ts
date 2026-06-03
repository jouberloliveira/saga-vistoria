export interface Funcionario {
  id: string
  nome: string
  usuario: string
  role: 'admin' | 'funcionario'
  ativo: boolean
}

export interface Veiculo {
  id: string
  placa: string
  marca: string
  modelo: string
  ano: number
  cor: string
  chassi?: string
  quilometragem: number
}

export interface Cliente {
  id: string
  nome: string
  documento: string
  telefone?: string
  email?: string
}

export interface Pneu {
  id: string
  posicao: 'dianteiro_esquerdo' | 'dianteiro_direito' | 'traseiro_esquerdo' | 'traseiro_direito' | 'estepe'
  estado: 'bom' | 'desgastado' | 'careca' | 'furado'
  observacoes?: string
}

export interface Dano {
  id: string
  tipo: 'amassado' | 'arranhado'
  localizacao: string
  gravidade: 'leve' | 'moderado' | 'grave'
  descricao?: string
  fotos?: Foto[]
}

export interface ItemFaltante {
  id: string
  nome: string
}

export interface Foto {
  id: string
  caminho: string
  url: string
  danoId?: string
  dataHora: string
}

export interface Assinatura {
  id: string
  tipo: 'funcionario' | 'cliente'
  imagemBase64: string
  dataHora: string
}

export interface Vistoria {
  id: string
  status: 'rascunho' | 'finalizado'
  dataInicio: string
  dataFim?: string
  observacoesGerais?: string
  nivelSujeiraInterna?: string
  nivelSujeiraExterna?: string
  veiculo: Veiculo
  cliente: Cliente
  funcionario: Pick<Funcionario, 'id' | 'nome'>
  pneus: Pneu[]
  danos: Dano[]
  itensFaltantes: ItemFaltante[]
  fotos: Foto[]
  assinaturas: Assinatura[]
}

export interface VistoriaListItem {
  id: string
  status: 'rascunho' | 'finalizado'
  dataInicio: string
  veiculo: Pick<Veiculo, 'placa' | 'marca' | 'modelo' | 'ano'>
  cliente: Pick<Cliente, 'nome' | 'documento'>
  funcionario: Pick<Funcionario, 'nome'>
  _count: { fotos: number; danos: number }
}
