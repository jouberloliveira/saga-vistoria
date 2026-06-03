import { useRef, useEffect, useState } from 'react'
import SignaturePad from 'signature_pad'
import { useVistoria } from '../../contexts/VistoriaContext'
import { createVistoria, finalizarVistoria } from '../../api/vistorias'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Loader2, RotateCcw, CheckCircle } from 'lucide-react'

export default function Step8Assinaturas({ onBack }: { onBack: () => void }) {
  const { data, updateData } = useVistoria()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const canvasFuncRef = useRef<HTMLCanvasElement>(null)
  const canvasClienteRef = useRef<HTMLCanvasElement>(null)
  const padFuncRef = useRef<SignaturePad | null>(null)
  const padClienteRef = useRef<SignaturePad | null>(null)

  useEffect(() => {
    const init = (canvasRef: React.RefObject<HTMLCanvasElement | null>, padRef: React.MutableRefObject<SignaturePad | null>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ratio = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * ratio
      canvas.height = canvas.offsetHeight * ratio
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(ratio, ratio)
      padRef.current = new SignaturePad(canvas, { penColor: '#1e3a5f', backgroundColor: 'rgba(255,255,255,0)' })
    }
    init(canvasFuncRef, padFuncRef)
    init(canvasClienteRef, padClienteRef)
  }, [])

  const clearPad = (padRef: React.MutableRefObject<SignaturePad | null>) => {
    padRef.current?.clear()
  }

  const handleFinalizar = async () => {
    const funcEmpty = padFuncRef.current?.isEmpty()
    const clienteEmpty = padClienteRef.current?.isEmpty()

    if (funcEmpty) { toast.error('Assinatura do funcionário obrigatória'); return }
    if (clienteEmpty) { toast.error('Assinatura do cliente obrigatória'); return }

    const assinaturaFuncionario = padFuncRef.current!.toDataURL()
    const assinaturaCliente = padClienteRef.current!.toDataURL()

    setLoading(true)
    try {
      let vistoriaId = data.vistoriaId
      if (!vistoriaId) {
        const created = await createVistoria({
          placa: data.placa,
          marca: data.marca,
          modelo: data.modelo,
          ano: Number(data.ano),
          cor: data.cor,
          quilometragem: Number(data.quilometragem),
          chassi: data.chassi,
          clienteNome: data.clienteNome,
          clienteDocumento: data.clienteDocumento,
          clienteTelefone: data.clienteTelefone,
          clienteEmail: data.clienteEmail,
          pneus: data.pneus,
          danos: data.danos,
          sujeira: data.sujeira,
          itensFaltantes: data.itensFaltantes,
        })
        vistoriaId = created.id
        updateData({ vistoriaId })
      }

      await finalizarVistoria(vistoriaId, { funcionario: assinaturaFuncionario, cliente: assinaturaCliente })
      toast.success('Vistoria finalizada com sucesso!')
      navigate(`/vistorias/${vistoriaId}`)
    } catch {
      toast.error('Erro ao finalizar vistoria')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
        <p className="text-sm text-green-700">Revise os dados antes de assinar. As assinaturas finalizam a vistoria.</p>
      </div>

      {/* Assinatura Funcionário */}
      <SignatureBlock
        label="Assinatura do Funcionário"
        canvasRef={canvasFuncRef}
        onClear={() => clearPad(padFuncRef)}
      />

      {/* Assinatura Cliente */}
      <SignatureBlock
        label="Assinatura do Cliente"
        canvasRef={canvasClienteRef}
        onClear={() => clearPad(padClienteRef)}
      />

      <div className="flex justify-between pt-4">
        <button type="button" onClick={onBack} disabled={loading} className="px-8 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors min-h-[48px] disabled:opacity-50">
          Voltar
        </button>
        <button
          type="button"
          onClick={handleFinalizar}
          disabled={loading}
          className="flex items-center gap-2 bg-[#f97316] hover:bg-orange-600 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl transition-colors min-h-[48px]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Salvando...' : 'Finalizar Vistoria'}
        </button>
      </div>
    </div>
  )
}

function SignatureBlock({ label, canvasRef, onClear }: {
  label: string
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  onClear: () => void
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-gray-800 text-sm">{label}</p>
        <button type="button" onClick={onClear} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
          <RotateCcw className="w-3 h-3" /> Limpar
        </button>
      </div>
      <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white overflow-hidden" style={{ height: 180 }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none"
          style={{ height: 180 }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">Use o dedo ou mouse para assinar</p>
    </div>
  )
}
