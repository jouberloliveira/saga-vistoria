import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, ClipboardCheck, Clock, CheckCircle } from 'lucide-react'
import { api } from '../services/api'
import type { VistoriaListItem } from '../types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const today = new Date().toISOString().split('T')[0]

  const { data: todayData } = useQuery({
    queryKey: ['vistorias-today'],
    queryFn: () => api.get(`/vistorias?dataInicio=${today}&dataFim=${today}&limit=100`).then(r => r.data)
  })

  const { data: recentData } = useQuery({
    queryKey: ['vistorias-recent'],
    queryFn: () => api.get('/vistorias?limit=10').then(r => r.data)
  })

  const todayTotal = todayData?.total ?? 0
  const todayFinished = todayData?.items?.filter((v: VistoriaListItem) => v.status === 'finalizado').length ?? 0
  const todayDraft = todayTotal - todayFinished
  const recent: VistoriaListItem[] = recentData?.items ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-saga-navy">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button onClick={() => navigate('/vistorias/nova')} className="btn-orange flex items-center gap-2">
          <Plus size={18} /> Nova Vistoria
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-saga-navy/10 flex items-center justify-center">
              <ClipboardCheck size={20} className="text-saga-navy" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Vistorias hoje</p>
              <p className="text-2xl font-bold text-saga-navy">{todayTotal}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Finalizadas</p>
              <p className="text-2xl font-bold text-green-700">{todayFinished}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Clock size={20} className="text-saga-orange" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Em andamento</p>
              <p className="text-2xl font-bold text-saga-orange">{todayDraft}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-saga-navy mb-4">Vistorias recentes</h2>
        {recent.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Nenhuma vistoria registrada ainda.</p>
        ) : (
          <div className="space-y-2">
            {recent.map(v => (
              <button
                key={v.id}
                onClick={() => navigate(`/vistorias/${v.id}`)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-saga-light transition-all text-left"
              >
                <div>
                  <span className="font-medium text-saga-navy">{v.veiculo.placa}</span>
                  <span className="text-gray-500 text-sm ml-2">{v.veiculo.marca} {v.veiculo.modelo}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{v.cliente.nome}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={v.status === 'finalizado' ? 'badge-finalizado' : 'badge-rascunho'}>
                    {v.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(v.dataInicio).toLocaleDateString('pt-BR')}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
