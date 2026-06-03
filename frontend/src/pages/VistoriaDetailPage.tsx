import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Download, Car, User, Wrench } from 'lucide-react'
import { api } from '../services/api'
import type { Vistoria } from '../types'

const POSICAO_LABEL: Record<string, string> = {
  dianteiro_esquerdo: 'Dianteiro Esq.', dianteiro_direito: 'Dianteiro Dir.',
  traseiro_esquerdo: 'Traseiro Esq.', traseiro_direito: 'Traseiro Dir.', estepe: 'Estepe'
}

export default function VistoriaDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: vistoria, isLoading } = useQuery<Vistoria>({
    queryKey: ['vistoria', id],
    queryFn: () => api.get(`/vistorias/${id}`).then(r => r.data)
  })

  if (isLoading) return <div className="text-center py-20 text-gray-400">Carregando...</div>
  if (!vistoria) return <div className="text-center py-20 text-red-500">Vistoria não encontrada.</div>

  function downloadPdf() {
    window.open(`/vistorias/${id}/pdf`, '_blank')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-saga-navy">Vistoria #{id?.slice(-8)}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{new Date(vistoria.dataInicio).toLocaleString('pt-BR')}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={vistoria.status === 'finalizado' ? 'badge-finalizado' : 'badge-rascunho'}>
            {vistoria.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
          </span>
          {vistoria.status === 'finalizado' && (
            <button onClick={downloadPdf} className="btn-primary flex items-center gap-2">
              <Download size={16} /> PDF
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-3 text-saga-navy font-semibold">
            <Car size={16} /> Veículo
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Placa:</span> {vistoria.veiculo.placa}</p>
            <p><span className="font-medium">Marca/Modelo:</span> {vistoria.veiculo.marca} {vistoria.veiculo.modelo}</p>
            <p><span className="font-medium">Ano:</span> {vistoria.veiculo.ano} | <span className="font-medium">Cor:</span> {vistoria.veiculo.cor}</p>
            <p><span className="font-medium">KM:</span> {vistoria.veiculo.quilometragem.toLocaleString('pt-BR')}</p>
            {vistoria.veiculo.chassi && <p><span className="font-medium">Chassi:</span> {vistoria.veiculo.chassi}</p>}
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-3 text-saga-navy font-semibold">
            <User size={16} /> Cliente
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Nome:</span> {vistoria.cliente.nome}</p>
            <p><span className="font-medium">Documento:</span> {vistoria.cliente.documento}</p>
            {vistoria.cliente.telefone && <p><span className="font-medium">Telefone:</span> {vistoria.cliente.telefone}</p>}
            {vistoria.cliente.email && <p><span className="font-medium">E-mail:</span> {vistoria.cliente.email}</p>}
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <h2 className="font-semibold text-saga-navy mb-3">Estado dos Pneus</h2>
        <div className="grid grid-cols-5 gap-2">
          {vistoria.pneus.map(p => (
            <div key={p.id} className="text-center p-2 rounded-xl bg-saga-light">
              <p className="text-xs text-gray-500 mb-1">{POSICAO_LABEL[p.posicao]}</p>
              <span className={`badge-${p.estado}`}>{p.estado}</span>
            </div>
          ))}
        </div>
      </div>

      {vistoria.danos.length > 0 && (
        <div className="card mb-4">
          <h2 className="font-semibold text-saga-navy mb-3">Danos Registrados</h2>
          <div className="space-y-2">
            {vistoria.danos.map(d => (
              <div key={d.id} className="flex items-start justify-between p-3 rounded-xl bg-saga-light text-sm">
                <div>
                  <span className="font-medium capitalize">{d.tipo}</span>
                  <span className="text-gray-500 ml-2">em {d.localizacao}</span>
                  {d.descricao && <p className="text-gray-400 text-xs mt-0.5">{d.descricao}</p>}
                </div>
                <span className={`badge-${d.gravidade === 'leve' ? 'bom' : d.gravidade === 'moderado' ? 'desgastado' : 'furado'}`}>{d.gravidade}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {vistoria.itensFaltantes.length > 0 && (
        <div className="card mb-4">
          <h2 className="font-semibold text-saga-navy mb-3">Itens Faltantes</h2>
          <div className="flex flex-wrap gap-2">
            {vistoria.itensFaltantes.map(i => (
              <span key={i.id} className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-sm">{i.nome}</span>
            ))}
          </div>
        </div>
      )}

      {vistoria.fotos.length > 0 && (
        <div className="card mb-4">
          <h2 className="font-semibold text-saga-navy mb-3">Fotos ({vistoria.fotos.length})</h2>
          <div className="grid grid-cols-4 gap-3">
            {vistoria.fotos.map(f => (
              <a key={f.id} href={`/uploads/${f.caminho}`} target="_blank" rel="noopener noreferrer">
                <img src={`/uploads/${f.caminho}`} alt="Foto da vistoria" className="w-full h-24 object-cover rounded-xl hover:opacity-90 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      )}

      {vistoria.assinaturas.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-saga-navy mb-3">Assinaturas</h2>
          <div className="grid grid-cols-2 gap-4">
            {vistoria.assinaturas.map(a => (
              <div key={a.id} className="text-center">
                <p className="text-sm text-gray-500 mb-2">{a.tipo === 'funcionario' ? 'Funcionário' : 'Cliente'}</p>
                <img src={a.imagemBase64} alt={`Assinatura ${a.tipo}`} className="w-full border border-gray-200 rounded-xl bg-white" />
                <p className="text-xs text-gray-400 mt-1">{new Date(a.dataHora).toLocaleString('pt-BR')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
