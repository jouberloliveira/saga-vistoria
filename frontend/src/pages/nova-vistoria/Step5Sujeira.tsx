import { useState } from 'react'
import { useVistoria } from '../../contexts/VistoriaContext'
import type { SujeiraItem } from '../../api/vistorias'
import { Plus, X } from 'lucide-react'

const AREAS = ['Interior', 'Carpete', 'Banco dianteiro', 'Banco traseiro', 'Porta-malas', 'Exterior', 'Rodas/Calçados', 'Vidros']
const NIVEIS: { value: SujeiraItem['nivel']; label: string; color: string }[] = [
  { value: 'limpo', label: 'Limpo', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'sujo', label: 'Sujo', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'muito_sujo', label: 'Muito sujo', color: 'bg-red-100 text-red-700 border-red-300' },
]

const ITENS_COMUNS = ['Documento do veículo', 'Manual do proprietário', 'Estepe', 'Macaco', 'Chave de roda', 'Triângulo', 'Extintor', 'Tapete dianteiro esq', 'Tapete dianteiro dir', 'Tapete traseiro', 'Tampa do porta-malas']

export default function Step5Sujeira({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { data, updateData } = useVistoria()
  const [sujeira, setSujeira] = useState<SujeiraItem[]>(data.sujeira)
  const [itensFaltantes, setItensFaltantes] = useState<string[]>(data.itensFaltantes)
  const [itemCustom, setItemCustom] = useState('')

  const setNivel = (area: string, nivel: SujeiraItem['nivel']) => {
    setSujeira((prev) => {
      const existing = prev.find((s) => s.area === area)
      if (existing) return prev.map((s) => s.area === area ? { ...s, nivel } : s)
      return [...prev, { area, nivel }]
    })
  }

  const getNivel = (area: string): SujeiraItem['nivel'] | undefined =>
    sujeira.find((s) => s.area === area)?.nivel

  const toggleItem = (item: string) => {
    setItensFaltantes((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )
  }

  const addCustom = () => {
    const v = itemCustom.trim()
    if (v && !itensFaltantes.includes(v)) {
      setItensFaltantes((prev) => [...prev, v])
    }
    setItemCustom('')
  }

  const handleNext = () => {
    updateData({ sujeira, itensFaltantes })
    onNext()
  }

  return (
    <div className="space-y-6">
      {/* Sujeira */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Estado de limpeza</h3>
        <div className="grid grid-cols-1 gap-3">
          {AREAS.map((area) => {
            const nivel = getNivel(area)
            return (
              <div key={area} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-700 min-w-[120px]">{area}</span>
                <div className="flex gap-2 flex-wrap">
                  {NIVEIS.map(({ value, label, color }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setNivel(area, value)}
                      className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all min-h-[40px] ${
                        nivel === value ? color + ' ring-2 ring-offset-1 ring-current' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Itens faltantes */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Itens faltantes</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {ITENS_COMUNS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleItem(item)}
              className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all min-h-[40px] ${
                itensFaltantes.includes(item)
                  ? 'bg-red-100 text-red-700 border-red-300 ring-2 ring-offset-1 ring-red-400'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Custom item */}
        <div className="flex gap-2">
          <input
            value={itemCustom}
            onChange={(e) => setItemCustom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
            placeholder="Outro item faltante..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#f97316]"
          />
          <button type="button" onClick={addCustom} className="bg-[#1e3a5f] text-white px-4 py-2.5 rounded-xl hover:bg-[#2d5a8e] transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {itensFaltantes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {itensFaltantes.map((item) => (
              <span key={item} className="flex items-center gap-1 bg-red-100 text-red-700 text-xs font-medium px-3 py-1.5 rounded-full">
                {item}
                <button type="button" onClick={() => toggleItem(item)} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
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
