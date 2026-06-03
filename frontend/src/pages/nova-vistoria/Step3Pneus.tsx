import { useState } from 'react'
import { useVistoria } from '../../contexts/VistoriaContext'
import type { PneuStatus } from '../../api/vistorias'

const POSICOES: { key: PneuStatus['posicao']; label: string }[] = [
  { key: 'DE', label: 'Dianteiro Esquerdo' },
  { key: 'DD', label: 'Dianteiro Direito' },
  { key: 'TE', label: 'Traseiro Esquerdo' },
  { key: 'TD', label: 'Traseiro Direito' },
  { key: 'estepe', label: 'Estepe' },
]

const STATUS_OPTIONS: { value: PneuStatus['status']; label: string; color: string }[] = [
  { value: 'bom', label: 'Bom', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'desgastado', label: 'Desgastado', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'careca', label: 'Careca', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'furado', label: 'Furado', color: 'bg-red-100 text-red-700 border-red-300' },
]

export default function Step3Pneus({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { data, updateData } = useVistoria()
  const [pneus, setPneus] = useState<PneuStatus[]>(data.pneus)

  const setStatus = (posicao: PneuStatus['posicao'], status: PneuStatus['status']) => {
    setPneus((prev) => prev.map((p) => p.posicao === posicao ? { ...p, status } : p))
  }

  const handleNext = () => {
    updateData({ pneus })
    onNext()
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4">
        {POSICOES.map(({ key, label }) => {
          const pneu = pneus.find((p) => p.posicao === key)!
          return (
            <div key={key} className="bg-gray-50 rounded-2xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">{label}</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(({ value, label: lbl, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatus(key, value)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all min-h-[44px] ${
                      pneu.status === value
                        ? color + ' ring-2 ring-offset-1 ring-current'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between pt-4">
        <button type="button" onClick={onBack} className="px-8 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors min-h-[48px]">
          Voltar
        </button>
        <button type="button" onClick={handleNext} className="bg-[#1e3a5f] hover:bg-[#2d5a8e] text-white font-semibold px-8 py-3 rounded-xl transition-colors min-h-[48px]">
          Próximo
        </button>
      </div>
    </div>
  )
}
