import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getDashboard, getVistorias } from '../api/vistorias'
import { Plus, Car, CheckCircle, Clock, TrendingUp, ChevronRight, Loader2 } from 'lucide-react'
import { format } from '../utils/format'

export default function Dashboard() {
  const { user } = useAuth()

  const { data: dashboard, isLoading: loadingDash } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    retry: false,
  })

  const { data: recentes, isLoading: loadingRecentes } = useQuery({
    queryKey: ['vistorias', { page: 1, limit: 5 }],
    queryFn: () => getVistorias({ page: 1, limit: 5 }),
    retry: false,
  })

  const stats = [
    {
      label: 'Vistorias hoje',
      value: dashboard?.hoje ?? '—',
      icon: Car,
      color: 'bg-blue-50 text-[#1e3a5f]',
      iconBg: 'bg-[#1e3a5f]',
    },
    {
      label: 'Finalizadas',
      value: dashboard?.finalizadas ?? '—',
      icon: CheckCircle,
      color: 'bg-green-50 text-green-700',
      iconBg: 'bg-green-600',
    },
    {
      label: 'Em andamento',
      value: dashboard?.emAndamento ?? '—',
      icon: Clock,
      color: 'bg-orange-50 text-orange-700',
      iconBg: 'bg-[#f97316]',
    },
    {
      label: 'Total do mês',
      value: dashboard?.mes ?? '—',
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-700',
      iconBg: 'bg-purple-600',
    },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Olá, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link
          to="/vistorias/nova"
          className="flex items-center gap-2 bg-[#f97316] hover:bg-orange-600 text-white font-semibold px-5 py-3 rounded-xl transition-colors min-h-[48px]"
        >
          <Plus className="w-4 h-4" />
          Nova Vistoria
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, iconBg }) => (
          <div key={label} className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 ${color}`}>
            {loadingDash ? (
              <Loader2 className="w-5 h-5 animate-spin opacity-40 mb-2" />
            ) : (
              <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            )}
            <p className="text-2xl font-bold">{loadingDash ? '—' : value}</p>
            <p className="text-sm opacity-70 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent inspections */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-800">Vistorias Recentes</h2>
          <Link to="/historico" className="text-[#f97316] text-sm font-medium hover:underline flex items-center gap-1">
            Ver todas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingRecentes ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : !recentes?.data?.length ? (
          <div className="text-center py-12 text-gray-400">
            <Car className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma vistoria registrada</p>
            <Link to="/vistorias/nova" className="text-[#f97316] text-sm font-medium mt-2 inline-block">
              Criar primeira vistoria
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentes.data.map((v) => (
              <Link
                key={v.id}
                to={`/vistorias/${v.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Car className="w-5 h-5 text-[#1e3a5f]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{v.placa}</p>
                    <p className="text-sm text-gray-500">{v.clienteNome} · {v.marca} {v.modelo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    v.status === 'finalizado'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {v.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
                  </span>
                  <span className="text-xs text-gray-400">{format.date(v.createdAt)}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
