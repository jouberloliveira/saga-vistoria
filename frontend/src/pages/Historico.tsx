import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getVistorias } from '../api/vistorias'
import { format } from '../utils/format'
import { Search, Car, ChevronRight, ChevronLeft, Filter, Loader2 } from 'lucide-react'

export default function Historico() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState({ placa: '', cliente: '', dataInicio: '', dataFim: '' })
  const [applied, setApplied] = useState(search)

  const { data, isLoading } = useQuery({
    queryKey: ['vistorias', applied, page],
    queryFn: () => getVistorias({ ...applied, page, limit: 10 }),
    retry: false,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setApplied(search)
  }

  const totalPages = data ? Math.ceil(data.total / 10) : 0

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Histórico de Vistorias</h1>
        <p className="text-gray-500 text-sm mt-1">{data?.total ?? 0} vistoria(s) encontrada(s)</p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">Filtros</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Placa</label>
            <input
              value={search.placa}
              onChange={(e) => setSearch((p) => ({ ...p, placa: e.target.value }))}
              placeholder="ABC1D23"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#f97316]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cliente</label>
            <input
              value={search.cliente}
              onChange={(e) => setSearch((p) => ({ ...p, cliente: e.target.value }))}
              placeholder="Nome do cliente"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#f97316]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Data início</label>
            <input
              type="date"
              value={search.dataInicio}
              onChange={(e) => setSearch((p) => ({ ...p, dataInicio: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#f97316]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Data fim</label>
            <input
              type="date"
              value={search.dataFim}
              onChange={(e) => setSearch((p) => ({ ...p, dataFim: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#f97316]"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button type="submit" className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#2d5a8e] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors min-h-[44px]">
            <Search className="w-4 h-4" />
            Buscar
          </button>
          <button
            type="button"
            onClick={() => { setSearch({ placa: '', cliente: '', dataInicio: '', dataFim: '' }); setApplied({ placa: '', cliente: '', dataInicio: '', dataFim: '' }); setPage(1) }}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors min-h-[44px]"
          >
            Limpar
          </button>
        </div>
      </form>

      {/* Results */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : !data?.data?.length ? (
          <div className="text-center py-12 text-gray-400">
            <Car className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma vistoria encontrada</p>
          </div>
        ) : (
          <>
            {/* Table desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Placa</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Veículo</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.data.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-800 text-sm">{v.placa}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{v.marca} {v.modelo}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{v.clienteNome}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{format.date(v.createdAt)}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${v.status === 'finalizado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {v.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Link to={`/vistorias/${v.id}`} className="text-[#f97316] hover:text-orange-600">
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* List mobile */}
            <div className="md:hidden divide-y divide-gray-50">
              {data.data.map((v) => (
                <Link key={v.id} to={`/vistorias/${v.id}`} className="flex items-center justify-between px-4 py-4 hover:bg-gray-50">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{v.placa}</p>
                    <p className="text-xs text-gray-500">{v.clienteNome} · {v.marca} {v.modelo}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{format.date(v.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${v.status === 'finalizado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {v.status === 'finalizado' ? 'OK' : 'Draft'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Página {page} de {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
