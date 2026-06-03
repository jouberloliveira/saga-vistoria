import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Dano, PneuStatus, SujeiraItem } from '../api/vistorias'

export interface VistoriaFormData {
  // Etapa 1 - Veículo
  placa: string
  marca: string
  modelo: string
  ano: string
  cor: string
  quilometragem: string
  chassi: string
  // Etapa 2 - Cliente
  clienteNome: string
  clienteDocumento: string
  clienteTelefone: string
  clienteEmail: string
  // Etapa 3 - Pneus
  pneus: PneuStatus[]
  // Etapa 4 - Danos
  danos: Dano[]
  // Etapa 5 - Sujeira e itens
  sujeira: SujeiraItem[]
  itensFaltantes: string[]
  // Etapa 6 - Fotos (gerenciadas separadamente após criar vistoria)
  vistoriaId?: string
  // Etapa 8 - Assinaturas
  assinaturaFuncionario?: string
  assinaturaCliente?: string
}

const defaultPneus: PneuStatus[] = [
  { posicao: 'DE', status: 'bom' },
  { posicao: 'DD', status: 'bom' },
  { posicao: 'TE', status: 'bom' },
  { posicao: 'TD', status: 'bom' },
  { posicao: 'estepe', status: 'bom' },
]

const initialData: VistoriaFormData = {
  placa: '', marca: '', modelo: '', ano: '', cor: '', quilometragem: '', chassi: '',
  clienteNome: '', clienteDocumento: '', clienteTelefone: '', clienteEmail: '',
  pneus: defaultPneus,
  danos: [],
  sujeira: [],
  itensFaltantes: [],
}

interface VistoriaContextValue {
  step: number
  data: VistoriaFormData
  setStep: (step: number) => void
  updateData: (partial: Partial<VistoriaFormData>) => void
  reset: () => void
}

const VistoriaContext = createContext<VistoriaContextValue | null>(null)

export function VistoriaProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<VistoriaFormData>(initialData)

  const updateData = useCallback((partial: Partial<VistoriaFormData>) => {
    setData((prev) => ({ ...prev, ...partial }))
  }, [])

  const reset = useCallback(() => {
    setStep(1)
    setData(initialData)
  }, [])

  return (
    <VistoriaContext.Provider value={{ step, data, setStep, updateData, reset }}>
      {children}
    </VistoriaContext.Provider>
  )
}

export function useVistoria() {
  const ctx = useContext(VistoriaContext)
  if (!ctx) throw new Error('useVistoria must be used within VistoriaProvider')
  return ctx
}
