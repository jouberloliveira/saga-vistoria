import { useQuery } from '@tanstack/react-query'
import { ClipboardList, Car, Users, CheckCircle2, Clock, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../auth'
import Card from '../components/Card'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import type { Inspection, Vehicle, Employee } from '../types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number | string; color: string
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: inspections = [] } = useQuery<Inspection[]>({
    queryKey: ['inspections'],
    queryFn: () => api.get('/inspections').then((r) => r.data),
  })

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: () => api.get('/vehicles').then((r) => r.data),
  })

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: () => api.get('/employees').then((r) => r.data),
    enabled: user?.role === 'admin',
  })

  const open = inspections.filter((i) => i.status === 'open').length
  const signed = inspections.filter((i) => i.status === 'signed').length
  const recent = [...inspections].slice(0, 5)

  return (
    <div>
      <PageHeader
        title={`Olá, ${user?.name?.split(' ')[0]}`}
        subtitle="Aqui está um resumo das operações."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={ClipboardList} label="Total de Vistorias" value={inspections.length} color="bg-blue-100 text-blue-600" />
        <StatCard icon={Clock} label="Em Aberto" value={open} color="bg-amber-100 text-amber-600" />
        <StatCard icon={CheckCircle2} label="Assinadas" value={signed} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={Car} label="Veículos" value={vehicles.length} color="bg-purple-100 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Vistorias Recentes
              </h2>
              <button
                onClick={() => navigate('/inspections')}
                className="text-xs text-blue-600 hover:underline"
              >
                Ver todas
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {recent.length === 0 && (
                <p className="text-sm text-slate-400 px-6 py-8 text-center">Nenhuma vistoria ainda</p>
              )}
              {recent.map((insp) => (
                <div
                  key={insp.id}
                  onClick={() => navigate(`/inspections/${insp.id}`)}
                  className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {insp.plate} — {insp.brand} {insp.model}
                    </p>
                    <p className="text-xs text-slate-500">
                      {insp.client_name} · {format(new Date(insp.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant={insp.status === 'signed' ? 'success' : 'warning'}>
                    {insp.status === 'signed' ? 'Assinada' : 'Aberta'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Equipe
              </h2>
            </div>
            <div className="divide-y divide-slate-50">
              {employees.slice(0, 6).map((emp) => (
                <div key={emp.id} className="px-6 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold shrink-0">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{emp.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{emp.role === 'admin' ? 'Admin' : 'Inspetor'}</p>
                  </div>
                  {emp.active === 0 && <Badge variant="neutral">Inativo</Badge>}
                </div>
              ))}
              {employees.length === 0 && (
                <p className="text-sm text-slate-400 px-6 py-8 text-center">
                  {user?.role === 'admin' ? 'Sem dados de equipe' : 'Acesso restrito a admins'}
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
