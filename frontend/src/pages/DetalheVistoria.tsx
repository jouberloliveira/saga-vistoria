import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getVistoria, getVistoriaPdf } from '../api/vistorias'
import { format } from '../utils/format'
import { ArrowLeft, Download, Car, User, Circle, AlertTriangle, Loader2, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function DetalheVistoria() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  const { data: vistoria, isLoading, error } = useQuery({
    queryKey: ['vistoria', id],
    queryFn: () => getVistoria(id!),
    enabled: !!id,
  })

  const handleDownloadPdf = async () => {
    if (!id) return
    setDownloadingPdf(true)
    try {
      const blob = await getVistoriaPdf(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vistoria-${vistoria?.placa}-${id.slice(0, 8)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Erro ao gerar PDF')
    } finally {
      setDownloadingPdf(false)
    }
  }

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  )

  if (error || !vistoria) return (
    <div className="p-6 text-center text-red-500">Vistoria não encontrada</div>
  )

  const pneuStatusColor: Record<string, string> = {
    bom: 'text-green-600', desgastado: 'text-yellow-600', careca: 'text-orange-600', furado: 'text-red-600',
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar</span>
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
          className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#2d5a8e] disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors min-h-[44px]"
        >
          {downloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download PDF
        </button>
      </div>

      {/* Title card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-[#1e3a5f]" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{vistoria.placa}</h1>
            </div>
            <p className="text-gray-500 text-sm ml-13">{vistoria.marca} {vistoria.modelo} {vistoria.ano} · {vistoria.cor}</p>
          </div>
          <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
            vistoria.status === 'finalizado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {vistoria.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
          </span>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><p className="text-gray-500 text-xs">Quilometragem</p><p className="font-medium">{format.km(vistoria.quilometragem)}</p></div>
          <div><p className="text-gray-500 text-xs">Data</p><p className="font-medium">{format.datetime(vistoria.createdAt)}</p></div>
          <div><p className="text-gray-500 text-xs">Funcionário</p><p className="font-medium">{vistoria.funcionarioNome}</p></div>
          {vistoria.chassi && <div><p className="text-gray-500 text-xs">Chassi</p><p className="font-medium font-mono text-xs">{vistoria.chassi}</p></div>}
        </div>
      </div>

      {/* Cliente */}
      <Section title="Cliente" icon={User}>
        <Grid>
          <Info label="Nome" value={vistoria.clienteNome} className="col-span-2" />
          <Info label="Documento" value={vistoria.clienteDocumento} />
          <Info label="Telefone" value={vistoria.clienteTelefone} />
          {vistoria.clienteEmail && <Info label="E-mail" value={vistoria.clienteEmail} className="col-span-2" />}
        </Grid>
      </Section>

      {/* Pneus */}
      <Section title="Pneus" icon={Circle}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {vistoria.pneus.map((p) => (
            <div key={p.posicao} className="text-center bg-gray-50 rounded-xl py-3">
              <p className="text-xs text-gray-500 mb-1">{p.posicao}</p>
              <p className={`text-sm font-semibold capitalize ${pneuStatusColor[p.status]}`}>{p.status}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Danos */}
      <Section title={`Danos (${vistoria.danos.length})`} icon={AlertTriangle}>
        {vistoria.danos.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum dano registrado</p>
        ) : (
          <div className="space-y-3">
            {vistoria.danos.map((d, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">{d.tipo}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${d.gravidade === 'leve' ? 'bg-green-100 text-green-700' : d.gravidade === 'moderado' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{d.gravidade}</span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-700">{d.localizacao}</span>
                </div>
                <p className="text-sm text-gray-700">{d.descricao}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Assinaturas */}
      {(vistoria.assinaturaFuncionario || vistoria.assinaturaCliente) && (
        <Section title="Assinaturas" icon={FileText}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vistoria.assinaturaFuncionario && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Funcionário</p>
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <img src={vistoria.assinaturaFuncionario} alt="Assinatura funcionário" className="w-full" />
                </div>
              </div>
            )}
            {vistoria.assinaturaCliente && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Cliente</p>
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <img src={vistoria.assinaturaCliente} alt="Assinatura cliente" className="w-full" />
                </div>
              </div>
            )}
          </div>
        </Section>
      )}
    </div>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-[#1e3a5f]" />
        <h2 className="font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}

function Info({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
    </div>
  )
}
