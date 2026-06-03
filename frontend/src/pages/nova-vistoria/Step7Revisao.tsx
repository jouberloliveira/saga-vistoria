import { useVistoria } from '../../contexts/VistoriaContext'
import { format } from '../../utils/format'
import { Car, User, Circle, AlertTriangle, Trash, Camera } from 'lucide-react'

const pneuStatusColor: Record<string, string> = {
  bom: 'text-green-600',
  desgastado: 'text-yellow-600',
  careca: 'text-orange-600',
  furado: 'text-red-600',
}

export default function Step7Revisao({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { data, setStep } = useVistoria()

  return (
    <div className="space-y-5">
      {/* Veículo */}
      <Section title="Veículo" icon={Car} onEdit={() => setStep(1)}>
        <Grid>
          <Info label="Placa" value={data.placa} />
          <Info label="Marca" value={data.marca} />
          <Info label="Modelo" value={data.modelo} />
          <Info label="Ano" value={data.ano} />
          <Info label="Cor" value={data.cor} />
          <Info label="Km" value={data.quilometragem ? format.km(Number(data.quilometragem)) : '—'} />
          {data.chassi && <Info label="Chassi" value={data.chassi} className="col-span-2" />}
        </Grid>
      </Section>

      {/* Cliente */}
      <Section title="Cliente" icon={User} onEdit={() => setStep(2)}>
        <Grid>
          <Info label="Nome" value={data.clienteNome} className="col-span-2" />
          <Info label="Documento" value={data.clienteDocumento} />
          <Info label="Telefone" value={data.clienteTelefone} />
          {data.clienteEmail && <Info label="E-mail" value={data.clienteEmail} className="col-span-2" />}
        </Grid>
      </Section>

      {/* Pneus */}
      <Section title="Pneus" icon={Circle} onEdit={() => setStep(3)}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {data.pneus.map((p) => (
            <div key={p.posicao} className="text-center bg-gray-50 rounded-xl py-3">
              <p className="text-xs text-gray-500 mb-1">{p.posicao}</p>
              <p className={`text-sm font-semibold capitalize ${pneuStatusColor[p.status]}`}>{p.status}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Danos */}
      <Section title={`Danos (${data.danos.length})`} icon={AlertTriangle} onEdit={() => setStep(4)}>
        {data.danos.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum dano registrado</p>
        ) : (
          <div className="space-y-2">
            {data.danos.map((d, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{d.localizacao}</p>
                  <p className="text-xs text-gray-500 capitalize">{d.tipo} · {d.gravidade}</p>
                  <p className="text-xs text-gray-600 mt-1">{d.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Sujeira/Itens */}
      <Section title="Sujeira e Itens" icon={Trash} onEdit={() => setStep(5)}>
        {data.sujeira.length === 0 && data.itensFaltantes.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum registro</p>
        ) : (
          <>
            {data.sujeira.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {data.sujeira.map((s) => (
                  <div key={s.area} className="bg-gray-50 rounded-xl px-3 py-2 flex items-center justify-between">
                    <span className="text-xs text-gray-600">{s.area}</span>
                    <span className={`text-xs font-medium capitalize ${s.nivel === 'limpo' ? 'text-green-600' : s.nivel === 'sujo' ? 'text-yellow-600' : 'text-red-600'}`}>{s.nivel.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            )}
            {data.itensFaltantes.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Itens faltantes:</p>
                <div className="flex flex-wrap gap-2">
                  {data.itensFaltantes.map((i) => (
                    <span key={i} className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full">{i}</span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Section>

      {/* Fotos */}
      <Section title="Fotos" icon={Camera} onEdit={() => setStep(6)}>
        <p className="text-sm text-gray-500">Fotos serão vinculadas após finalizar</p>
      </Section>

      <div className="flex justify-between pt-4">
        <button type="button" onClick={onBack} className="px-8 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors min-h-[48px]">
          Voltar
        </button>
        <button type="button" onClick={onNext} className="bg-[#f97316] hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors min-h-[48px]">
          Ir para assinaturas
        </button>
      </div>
    </div>
  )
}

function Section({ title, icon: Icon, onEdit, children }: { title: string; icon: React.ElementType; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-[#1e3a5f]" />
          <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
        </div>
        <button type="button" onClick={onEdit} className="text-[#f97316] text-xs font-medium hover:underline">Editar</button>
      </div>
      {children}
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>
}

function Info({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
    </div>
  )
}
