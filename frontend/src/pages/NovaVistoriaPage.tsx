import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import SignaturePad from 'signature_pad'
import { useEffect } from 'react'
import { api } from '../services/api'

const STEPS = ['Veículo', 'Cliente', 'Pneus', 'Danos', 'Sujeira / Itens', 'Fotos', 'Resumo', 'Assinaturas']
const POSICOES = ['dianteiro_esquerdo', 'dianteiro_direito', 'traseiro_esquerdo', 'traseiro_direito', 'estepe']
const POSICAO_LABEL: Record<string, string> = {
  dianteiro_esquerdo: 'Dianteiro Esq.', dianteiro_direito: 'Dianteiro Dir.',
  traseiro_esquerdo: 'Traseiro Esq.', traseiro_direito: 'Traseiro Dir.', estepe: 'Estepe'
}
const ITENS_COMUNS = ['Estepe', 'Macaco', 'Chave de roda', 'Tapetes', 'Manual', 'Segunda chave', 'Triângulo']

export default function NovaVistoriaPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [vistoriaId, setVistoriaId] = useState<string | null>(null)

  const [veiculo, setVeiculo] = useState({ placa: '', marca: '', modelo: '', ano: new Date().getFullYear(), cor: '', chassi: '', quilometragem: 0 })
  const [cliente, setCliente] = useState({ nome: '', documento: '', telefone: '', email: '' })
  const [pneus, setPneus] = useState<Record<string, string>>(Object.fromEntries(POSICOES.map(p => [p, 'bom'])))
  const [danos, setDanos] = useState<Array<{ tipo: string; localizacao: string; gravidade: string; descricao: string }>>([])
  const [sujeiraInterna, setSujeiraInterna] = useState('limpo')
  const [sujeiraExterna, setSujeiraExterna] = useState('limpo')
  const [itensFaltantes, setItensFaltantes] = useState<string[]>([])
  const [fotos, setFotos] = useState<File[]>([])
  const [observacoes, setObservacoes] = useState('')

  const canvasFuncRef = useRef<HTMLCanvasElement>(null)
  const canvasClienteRef = useRef<HTMLCanvasElement>(null)
  const sigFuncRef = useRef<SignaturePad | null>(null)
  const sigClienteRef = useRef<SignaturePad | null>(null)

  useEffect(() => {
    if (step === 7) {
      setTimeout(() => {
        if (canvasFuncRef.current) sigFuncRef.current = new SignaturePad(canvasFuncRef.current)
        if (canvasClienteRef.current) sigClienteRef.current = new SignaturePad(canvasClienteRef.current)
      }, 100)
    }
  }, [step])

  const createMutation = useMutation({
    mutationFn: () => api.post('/vistorias', { veiculo, cliente, observacoesGerais: observacoes }),
    onSuccess: async (res) => {
      const id = res.data.id
      setVistoriaId(id)
      await api.patch(`/vistorias/${id}`, {
        pneus: POSICOES.map(p => ({ posicao: p, estado: pneus[p] })),
        danos,
        itensFaltantes: itensFaltantes.map(nome => ({ nome })),
        nivelSujeiraInterna: sujeiraInterna,
        nivelSujeiraExterna: sujeiraExterna,
      })
      for (const foto of fotos) {
        const fd = new FormData()
        fd.append('foto', foto)
        await api.post(`/vistorias/${id}/fotos`, fd)
      }
      setStep(7)
    },
    onError: () => toast.error('Erro ao criar vistoria')
  })

  const finalizarMutation = useMutation({
    mutationFn: () => {
      if (!sigFuncRef.current || sigFuncRef.current.isEmpty()) throw new Error('Assinatura do funcionário obrigatória')
      if (!sigClienteRef.current || sigClienteRef.current.isEmpty()) throw new Error('Assinatura do cliente obrigatória')
      return api.post(`/vistorias/${vistoriaId}/finalizar`, {
        assinaturaFuncionario: sigFuncRef.current.toDataURL(),
        assinaturaCliente: sigClienteRef.current.toDataURL(),
      })
    },
    onSuccess: (res) => {
      toast.success('Vistoria finalizada!')
      navigate(`/vistorias/${res.data.id}`)
    },
    onError: (e: unknown) => toast.error((e as Error).message || 'Erro ao finalizar')
  })

  function addDano() {
    setDanos([...danos, { tipo: 'amassado', localizacao: '', gravidade: 'leve', descricao: '' }])
  }

  function goNext() {
    if (step === 6) { createMutation.mutate(); return }
    setStep(s => s + 1)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-saga-navy mb-2">Nova Vistoria</h1>

      {/* Stepper */}
      <div className="flex gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? 'bg-saga-navy' : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className="text-sm text-gray-500 mb-6">Etapa {step + 1} de {STEPS.length}: <span className="font-medium text-saga-navy">{STEPS[step]}</span></p>

      {/* Etapa 1 - Veículo */}
      {step === 0 && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-saga-navy">Dados do Veículo</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Placa *</label><input className="input" required value={veiculo.placa} onChange={e => setVeiculo({ ...veiculo, placa: e.target.value.toUpperCase() })} placeholder="ABC-1234" /></div>
            <div><label className="label">Marca *</label><input className="input" required value={veiculo.marca} onChange={e => setVeiculo({ ...veiculo, marca: e.target.value })} placeholder="Toyota" /></div>
            <div><label className="label">Modelo *</label><input className="input" required value={veiculo.modelo} onChange={e => setVeiculo({ ...veiculo, modelo: e.target.value })} placeholder="Corolla" /></div>
            <div><label className="label">Ano *</label><input className="input" type="number" required value={veiculo.ano} onChange={e => setVeiculo({ ...veiculo, ano: Number(e.target.value) })} /></div>
            <div><label className="label">Cor *</label><input className="input" required value={veiculo.cor} onChange={e => setVeiculo({ ...veiculo, cor: e.target.value })} placeholder="Prata" /></div>
            <div><label className="label">KM *</label><input className="input" type="number" required value={veiculo.quilometragem} onChange={e => setVeiculo({ ...veiculo, quilometragem: Number(e.target.value) })} /></div>
            <div className="col-span-2"><label className="label">Chassi</label><input className="input" value={veiculo.chassi} onChange={e => setVeiculo({ ...veiculo, chassi: e.target.value })} placeholder="Opcional" /></div>
          </div>
        </div>
      )}

      {/* Etapa 2 - Cliente */}
      {step === 1 && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-saga-navy">Dados do Cliente</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="label">Nome completo *</label><input className="input" required value={cliente.nome} onChange={e => setCliente({ ...cliente, nome: e.target.value })} /></div>
            <div className="col-span-2"><label className="label">CPF / CNPJ *</label><input className="input" required value={cliente.documento} onChange={e => setCliente({ ...cliente, documento: e.target.value })} /></div>
            <div><label className="label">Telefone</label><input className="input" value={cliente.telefone} onChange={e => setCliente({ ...cliente, telefone: e.target.value })} /></div>
            <div><label className="label">E-mail</label><input className="input" type="email" value={cliente.email} onChange={e => setCliente({ ...cliente, email: e.target.value })} /></div>
          </div>
        </div>
      )}

      {/* Etapa 3 - Pneus */}
      {step === 2 && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-saga-navy">Estado dos Pneus</h2>
          <div className="space-y-3">
            {POSICOES.map(p => (
              <div key={p} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{POSICAO_LABEL[p]}</span>
                <div className="flex gap-2">
                  {['bom', 'desgastado', 'careca', 'furado'].map(estado => (
                    <button
                      key={estado}
                      type="button"
                      onClick={() => setPneus({ ...pneus, [p]: estado })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${pneus[p] === estado ? `badge-${estado} ring-2 ring-offset-1 ring-saga-navy` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {estado}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Etapa 4 - Danos */}
      {step === 3 && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-saga-navy">Danos</h2>
            <button type="button" onClick={addDano} className="btn-secondary text-sm px-3 py-1.5 min-h-0">+ Adicionar dano</button>
          </div>
          {danos.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Nenhum dano registrado.</p>}
          {danos.map((d, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Tipo</label>
                  <select className="input" value={d.tipo} onChange={e => { const nd = [...danos]; nd[i] = { ...d, tipo: e.target.value }; setDanos(nd) }}>
                    <option value="amassado">Amassado</option>
                    <option value="arranhado">Arranhado</option>
                  </select>
                </div>
                <div>
                  <label className="label">Gravidade</label>
                  <select className="input" value={d.gravidade} onChange={e => { const nd = [...danos]; nd[i] = { ...d, gravidade: e.target.value }; setDanos(nd) }}>
                    <option value="leve">Leve</option>
                    <option value="moderado">Moderado</option>
                    <option value="grave">Grave</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Localização *</label>
                  <input className="input" placeholder="Ex: para-choque dianteiro esquerdo" value={d.localizacao} onChange={e => { const nd = [...danos]; nd[i] = { ...d, localizacao: e.target.value }; setDanos(nd) }} />
                </div>
                <div className="col-span-2">
                  <label className="label">Descrição</label>
                  <input className="input" placeholder="Detalhes adicionais" value={d.descricao} onChange={e => { const nd = [...danos]; nd[i] = { ...d, descricao: e.target.value }; setDanos(nd) }} />
                </div>
              </div>
              <button type="button" onClick={() => setDanos(danos.filter((_, j) => j !== i))} className="text-red-500 text-xs hover:text-red-700">Remover</button>
            </div>
          ))}
        </div>
      )}

      {/* Etapa 5 - Sujeira e Itens Faltantes */}
      {step === 4 && (
        <div className="card space-y-6">
          <div>
            <h2 className="font-semibold text-saga-navy mb-3">Nível de Sujeira</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Interna</label>
                <select className="input" value={sujeiraInterna} onChange={e => setSujeiraInterna(e.target.value)}>
                  {['limpo', 'pouco sujo', 'sujo', 'muito sujo'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Externa</label>
                <select className="input" value={sujeiraExterna} onChange={e => setSujeiraExterna(e.target.value)}>
                  {['limpo', 'pouco sujo', 'sujo', 'muito sujo'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-saga-navy mb-3">Itens Faltantes</h2>
            <div className="flex flex-wrap gap-2">
              {ITENS_COMUNS.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setItensFaltantes(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${itensFaltantes.includes(item) ? 'bg-red-100 text-red-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Observações gerais</label>
            <textarea className="input h-24 resize-none" value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Observações adicionais sobre o veículo..." />
          </div>
        </div>
      )}

      {/* Etapa 6 - Fotos */}
      {step === 5 && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-saga-navy">Fotos do Veículo</h2>
          <div>
            <label className="label">Adicionar fotos</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-saga-navy file:text-white hover:file:bg-opacity-90 cursor-pointer"
              onChange={e => setFotos(prev => [...prev, ...Array.from(e.target.files || [])])}
            />
          </div>
          {fotos.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {fotos.map((f, i) => (
                <div key={i} className="relative">
                  <img src={URL.createObjectURL(f)} alt="" className="w-full h-20 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => setFotos(fotos.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Etapa 7 - Resumo */}
      {step === 6 && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-saga-navy">Resumo da Vistoria</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium">Veículo:</span> {veiculo.placa} — {veiculo.marca} {veiculo.modelo} {veiculo.ano}</p>
            <p><span className="font-medium">Cliente:</span> {cliente.nome} ({cliente.documento})</p>
            <p><span className="font-medium">Pneus:</span> {POSICOES.map(p => `${POSICAO_LABEL[p]}: ${pneus[p]}`).join(' | ')}</p>
            <p><span className="font-medium">Danos:</span> {danos.length === 0 ? 'Nenhum' : `${danos.length} registrados`}</p>
            <p><span className="font-medium">Itens faltantes:</span> {itensFaltantes.length === 0 ? 'Nenhum' : itensFaltantes.join(', ')}</p>
            <p><span className="font-medium">Fotos:</span> {fotos.length}</p>
            <p><span className="font-medium">Sujeira:</span> Interna: {sujeiraInterna} | Externa: {sujeiraExterna}</p>
            {observacoes && <p><span className="font-medium">Obs:</span> {observacoes}</p>}
          </div>
          <p className="text-xs text-gray-400 border-t pt-3">Ao confirmar, a vistoria será salva e prosseguirá para coleta de assinaturas.</p>
        </div>
      )}

      {/* Etapa 8 - Assinaturas */}
      {step === 7 && (
        <div className="card space-y-6">
          <h2 className="font-semibold text-saga-navy">Assinaturas Digitais</h2>
          {['Funcionário SAGA', 'Cliente'].map((label, i) => {
            const ref = i === 0 ? canvasFuncRef : canvasClienteRef
            const sigRef = i === 0 ? sigFuncRef : sigClienteRef
            return (
              <div key={label}>
                <label className="label">{label}</label>
                <canvas
                  ref={ref}
                  width={600}
                  height={180}
                  className="w-full border-2 border-gray-200 rounded-xl bg-white touch-none"
                />
                <button type="button" onClick={() => sigRef.current?.clear()} className="text-xs text-gray-400 hover:text-gray-600 mt-1">Limpar</button>
              </div>
            )
          })}
          <button
            onClick={() => finalizarMutation.mutate()}
            disabled={finalizarMutation.isPending}
            className="btn-orange w-full"
          >
            {finalizarMutation.isPending ? 'Finalizando...' : 'Finalizar Vistoria'}
          </button>
        </div>
      )}

      {/* Navegação */}
      {step < 7 && (
        <div className="flex justify-between mt-6">
          <button disabled={step === 0} onClick={() => setStep(s => s - 1)} className="btn-secondary disabled:opacity-40">Voltar</button>
          <button onClick={goNext} disabled={createMutation.isPending} className="btn-primary">
            {step === 6 ? (createMutation.isPending ? 'Salvando...' : 'Salvar e Assinar') : 'Próxima Etapa'}
          </button>
        </div>
      )}
    </div>
  )
}
