import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { api } from '../services/api'
import type { VistoriaListItem } from '../types'

export default function HistoricoPage() {
  const navigate = useNavigate()
  const [placa, setPlaca] = useState('')
  const [cliente, setCliente] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [page, setPage] = useState(1)

  const params = new URLSearchParams({ page: String(page), limit: '20' })
  if (placa) params.set('placa', placa)
  if (cliente) params.set('cliente', cliente)
  if (dataInicio) params.set('dataInicio', dataInicio)
  if (dataFim) params.set('dataFim', dataFim)

  const { data, isLoading } = useQuery({
    queryKey: ['vistorias', placa, cliente, dataInicio, dataFim, page],
    queryFn: () => api.get(`/vistorias?${params}`).then(r => r.data)
  })

  const items: VistoriaListItem[] = data?.items ?? []
  const total: number = data?.total ?? 0
  const totalPages = Math.ceil(total / 20)

  return (
    <div>
      <h1 className="text-2xl font-bold text-saga-navy mb-6">Histórico de Vistorias</h1>

      <div className="card mb-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div>
            <label className="label">Placa</label>
            <input className="input" placeholder="ABC-1234" value={placa} onChange={e => { setPlaca(e.target.value); setPage(1) }} />
          </div>
          <div>
            <label className="label">Cliente</label>
            <input className="input" placeholder="Nome do cliente" value={cliente} onChange={e => { setCliente(e.target.value); setPage(1) }} />
          </div>
          <div>
            <label className="label">De</label>
            <input className="input" type="date" value={dataInicio} onChange={e => { setDataInicio(e.target.value); setPage(1) }} />
          </div>
          <div>
            <label className="label">Até</label>
            <input className="input" type="date" value={dataFim} onChange={e => { setDataFim(e.target.value); setPage(1) }} />
          </div>
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <p className="text-gray-400 text-sm text-center py-8">Carregando...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Nenhuma vistoria encontrada.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Placa</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Veículo</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Cliente</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Funcionário</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Data</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(v => (
                    <tr key={v.id} onClick={() => navigate(`/vistorias/${v.id}`)} className="border-b border-gray-50 hover:bg-saga-light cursor-pointer transition-colors">
                      <td className="py-3 px-3 font-semibold text-saga-navy">{v.veiculo.placa}</td>
                      <td className="py-3 px-3 text-gray-600">{v.veiculo.marca} {v.veiculo.modelo} {v.veiculo.ano}</td>
                      <td className="py-3 px-3 text-gray-600">{v.cliente.nome}</td>
                      <td className="py-3 px-3 text-gray-600">{v.funcionario.nome}</td>
                      <td className="py-3 px-3 text-gray-500">{new Date(v.dataInicio).toLocaleDateString('pt-BR')}</td>
                      <td className="py-3 px-3">
                        <span className={v.status === 'finalizado' ? 'badge-finalizado' : 'badge-rascunho'}>
                          {v.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">{total} vistorias encontradas</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm px-3 py-1.5 min-h-0 disabled:opacity-40">Anterior</button>
                  <span className="text-sm text-gray-600 self-center px-2">{page} / {totalPages}</span>
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm px-3 py-1.5 min-h-0 disabled:opacity-40">Próxima</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
