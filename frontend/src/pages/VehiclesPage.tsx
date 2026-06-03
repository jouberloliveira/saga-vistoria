import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Car, Trash2, Pencil } from 'lucide-react'
import api from '../api'
import type { Vehicle } from '../types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'

export default function VehiclesPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ['vehicles', q],
    queryFn: () => api.get('/vehicles', { params: q ? { q } : {} }).then((r) => r.data),
  })

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/vehicles/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      setDeleteId(null)
    },
  })

  return (
    <div>
      <PageHeader
        title="Veículos"
        subtitle="Gerencie a frota de veículos cadastrados"
        actions={
          <Button onClick={() => navigate('/vehicles/new')} size="sm">
            <Plus className="w-4 h-4" /> Novo Veículo
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="p-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="search"
            placeholder="Buscar por placa, marca ou modelo..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
            aria-label="Buscar veículos"
          />
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full" />
          </div>
        ) : vehicles.length === 0 ? (
          <EmptyState
            icon={Car}
            title="Nenhum veículo encontrado"
            description={q ? 'Tente outro termo de busca' : 'Cadastre o primeiro veículo para começar'}
            action={!q && <Button onClick={() => navigate('/vehicles/new')} size="sm"><Plus className="w-4 h-4" /> Novo Veículo</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="px-5 py-3.5">Placa</th>
                  <th className="px-5 py-3.5">Marca / Modelo</th>
                  <th className="px-5 py-3.5">Ano</th>
                  <th className="px-5 py-3.5">Cor</th>
                  <th className="px-5 py-3.5">Cadastrado em</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg text-xs">
                        {v.plate}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-800">{v.brand}</p>
                      <p className="text-xs text-slate-400">{v.model}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{v.year}</td>
                    <td className="px-5 py-3.5 text-slate-600 capitalize">{v.color}</td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {format(new Date(v.created_at), "dd/MM/yy", { locale: ptBR })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/vehicles/${v.id}/edit`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          aria-label="Editar veículo"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(v.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label="Excluir veículo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
        title="Excluir Veículo"
        description="Tem certeza que deseja excluir este veículo? Vistorias associadas serão preservadas."
        confirmLabel="Excluir"
      />
    </div>
  )
}
