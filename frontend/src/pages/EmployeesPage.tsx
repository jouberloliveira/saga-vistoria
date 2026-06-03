import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, Pencil } from 'lucide-react'
import api from '../api'
import type { Employee } from '../types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuth } from '../auth'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import Card from '../components/Card'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'

export default function EmployeesPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [toggleId, setToggleId] = useState<{ id: string; active: 0 | 1 } | null>(null)

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: () => api.get('/employees').then((r) => r.data),
  })

  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: 0 | 1 }) =>
      api.patch(`/employees/${id}`, { active: active === 1 ? 0 : 1 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      setToggleId(null)
    },
  })

  return (
    <div>
      <PageHeader
        title="Funcionários"
        subtitle="Gerencie a equipe de inspetores e administradores"
        actions={
          isAdmin ? (
            <Button onClick={() => navigate('/employees/new')} size="sm">
              <Plus className="w-4 h-4" /> Novo Funcionário
            </Button>
          ) : undefined
        }
      />

      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full" />
          </div>
        ) : employees.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum funcionário encontrado"
            action={isAdmin ? <Button onClick={() => navigate('/employees/new')} size="sm"><Plus className="w-4 h-4" /> Novo Funcionário</Button> : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="px-5 py-3.5">Nome</th>
                  <th className="px-5 py-3.5">E-mail</th>
                  <th className="px-5 py-3.5">Perfil</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Desde</th>
                  {isAdmin && <th className="px-5 py-3.5 text-right">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                          {emp.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{emp.email}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={emp.role === 'admin' ? 'info' : 'neutral'}>
                        {emp.role === 'admin' ? 'Admin' : 'Inspetor'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={emp.active === 1 ? 'success' : 'neutral'}>
                        {emp.active === 1 ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {format(new Date(emp.created_at), "dd/MM/yy", { locale: ptBR })}
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/employees/${emp.id}/edit`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            aria-label="Editar funcionário"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setToggleId({ id: emp.id, active: emp.active })}
                            className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            {emp.active === 1 ? 'Desativar' : 'Ativar'}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!toggleId}
        onClose={() => setToggleId(null)}
        onConfirm={() => toggleId && toggle.mutate(toggleId)}
        loading={toggle.isPending}
        title={toggleId?.active === 1 ? 'Desativar Funcionário' : 'Ativar Funcionário'}
        description={toggleId?.active === 1 ? 'O funcionário perderá acesso ao sistema.' : 'O funcionário recuperará acesso ao sistema.'}
        confirmLabel={toggleId?.active === 1 ? 'Desativar' : 'Ativar'}
      />
    </div>
  )
}
