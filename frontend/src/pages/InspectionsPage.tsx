import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, ClipboardList, Trash2, Eye, Pencil } from 'lucide-react'
import api from '../api'
import type { Inspection } from '../types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import Card from '../components/Card'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'

export default function InspectionsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: inspections = [], isLoading } = useQuery<Inspection[]>({
    queryKey: ['inspections', q],
    queryFn: () => api.get('/inspections', { params: q ? { q } : {} }).then((r) => r.data),
  })

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/inspections/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inspections'] })
      setDeleteId(null)
    },
  })

  const statusBadge = (s: string) =>
    s === 'signed' ? <Badge variant="success">Assinada</Badge> : <Badge variant="warning">Aberta</Badge>

  return (
    <div>
      <PageHeader
        title="Vistorias"
        subtitle="Gerencie todas as vistorias veiculares"
        actions={
          <Button onClick={() => navigate('/inspections/new')} size="sm">
            <Plus className="w-4 h-4" /> Nova Vistoria
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="p-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="search"
            placeholder="Buscar por placa, cliente ou CPF..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
            aria-label="Buscar vistorias"
          />
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full" />
          </div>
        ) : inspections.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhuma vistoria encontrada"
            description={q ? 'Tente outro termo de busca' : 'Crie a primeira vistoria para começar'}
            action={!q && <Button onClick={() => navigate('/inspections/new')} size="sm"><Plus className="w-4 h-4" /> Nova Vistoria</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="px-5 py-3.5">Veículo</th>
                  <th className="px-5 py-3.5">Cliente</th>
                  <th className="px-5 py-3.5">Inspetor</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Data</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {inspections.map((insp) => (
                  <tr key={insp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900">{insp.plate}</p>
                      <p className="text-xs text-slate-400">{insp.brand} {insp.model}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-700">{insp.client_name}</p>
                      <p className="text-xs text-slate-400">{insp.client_cpf}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{insp.employee_name}</td>
                    <td className="px-5 py-3.5">{statusBadge(insp.status)}</td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {format(new Date(insp.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/inspections/${insp.id}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          aria-label="Ver vistoria"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {insp.status !== 'signed' && (
                          <button
                            onClick={() => navigate(`/inspections/${insp.id}/edit`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            aria-label="Editar vistoria"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {insp.status !== 'signed' && (
                          <button
                            onClick={() => setDeleteId(insp.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label="Excluir vistoria"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && del.mutate(deleteId)}
        loading={del.isPending}
        title="Excluir Vistoria"
        description="Esta ação não pode ser desfeita. Tem certeza que deseja excluir esta vistoria?"
        confirmLabel="Excluir"
      />
    </div>
  )
}
