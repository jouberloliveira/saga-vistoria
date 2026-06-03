import { useState } from 'react'
import { useVistoria } from '../../contexts/VistoriaContext'
import type { Dano } from '../../api/vistorias'
import { Plus, Trash2 } from 'lucide-react'

const LOCALIZACOES = [
  'Capô', 'Para-choque dianteiro', 'Para-choque traseiro', 'Porta dianteira esquerda',
  'Porta dianteira direita', 'Porta traseira esquerda', 'Porta traseira direita',
  'Lateral esquerda', 'Lateral direita', 'Teto', 'Mala/tampa traseira', 'Para-lama dianteiro esq',
  'Para-lama dianteiro dir', 'Coluna A', 'Coluna B', 'Coluna C', 'Espelho retrovisor esq',
  'Espelho retrovisor dir', 'Rodas', 'Vidro dianteiro', 'Vidro traseiro',
]

const emptyDano = (): Dano => ({ tipo: 'amassado', localizacao: '', gravidade: 'leve', descricao: '' })

export default function Step4Danos({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { data, updateData } = useVistoria()
  const [danos, setDanos] = useState<Dano[]>(data.danos)
  const [editando, setEditando] = useState<Dano | null>(null)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof Dano, string>>>({})

  const openNew = () => {
    setEditando(emptyDano())
    setEditIndex(null)
    setErrors({})
  }

  const openEdit = (i: number) => {
    setEditando({ ...danos[i] })
    setEditIndex(i)
    setErrors({})
  }

  const validateDano = (d: Dano) => {
    const e: Partial<Record<keyof Dano, string>> = {}
    if (!d.localizacao) e.localizacao = 'Selecione a localização'
    if (!d.descricao.trim()) e.descricao = 'Descrição obrigatória'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const saveDano = () => {
    if (!editando || !validateDano(editando)) return
    if (editIndex !== null) {
      setDanos((prev) => prev.map((d, i) => (i === editIndex ? editando : d)))
    } else {
      setDanos((prev) => [...prev, editando])
    }
    setEditando(null)
    setEditIndex(null)
  }

  const removeDano = (i: number) => setDanos((prev) => prev.filter((_, idx) => idx !== i))

  const handleNext = () => {
    updateData({ danos })
    onNext()
  }

  const tipoColor = (tipo: Dano['tipo']) =>
    tipo === 'amassado' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'

  const gravidadeColor = (g: Dano['gravidade']) => ({
    leve: 'bg-green-100 text-green-700',
    moderado: 'bg-yellow-100 text-yellow-700',
    grave: 'bg-red-100 text-red-700',
  }[g])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{danos.length} dano(s) registrado(s)</p>
        <button type="button" onClick={openNew} className="flex items-center gap-2 bg-[#f97316] hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors min-h-[44px]">
          <Plus className="w-4 h-4" /> Adicionar dano
        </button>
      </div>

      {danos.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-2xl text-gray-400">
          <p className="text-sm">Nenhum dano registrado</p>
        </div>
      )}

      <div className="space-y-3">
        {danos.map((d, i) => (
          <div key={i} className="bg-gray-50 rounded-2xl p-4 flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${tipoColor(d.tipo)}`}>{d.tipo}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${gravidadeColor(d.gravidade)}`}>{d.gravidade}</span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-700">{d.localizacao}</span>
              </div>
              <p className="text-sm text-gray-700">{d.descricao}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => openEdit(i)} className="text-[#1e3a5f] hover:bg-blue-50 p-2 rounded-lg transition-colors text-xs font-medium">Editar</button>
              <button type="button" onClick={() => removeDano(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de edição */}
      {editando && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="font-semibold text-gray-800">{editIndex !== null ? 'Editar dano' : 'Novo dano'}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={editando.tipo}
                  onChange={(e) => setEditando({ ...editando, tipo: e.target.value as Dano['tipo'] })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#f97316]"
                >
                  <option value="amassado">Amassado</option>
                  <option value="arranhado">Arranhado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gravidade</label>
                <select
                  value={editando.gravidade}
                  onChange={(e) => setEditando({ ...editando, gravidade: e.target.value as Dano['gravidade'] })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#f97316]"
                >
                  <option value="leve">Leve</option>
                  <option value="moderado">Moderado</option>
                  <option value="grave">Grave</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localização *</label>
              <select
                value={editando.localizacao}
                onChange={(e) => { setEditando({ ...editando, localizacao: e.target.value }); setErrors((p) => ({ ...p, localizacao: undefined })) }}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 ${errors.localizacao ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-[#f97316]'}`}
              >
                <option value="">Selecione...</option>
                {LOCALIZACOES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              {errors.localizacao && <p className="text-red-500 text-xs mt-1">{errors.localizacao}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
              <textarea
                value={editando.descricao}
                onChange={(e) => { setEditando({ ...editando, descricao: e.target.value }); setErrors((p) => ({ ...p, descricao: undefined })) }}
                rows={3}
                placeholder="Descreva o dano..."
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none focus:ring-2 ${errors.descricao ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-[#f97316]'}`}
              />
              {errors.descricao && <p className="text-red-500 text-xs mt-1">{errors.descricao}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setEditando(null); setEditIndex(null) }} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors min-h-[48px]">
                Cancelar
              </button>
              <button type="button" onClick={saveDano} className="flex-1 py-3 rounded-xl bg-[#1e3a5f] text-white font-semibold hover:bg-[#2d5a8e] transition-colors min-h-[48px]">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

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
