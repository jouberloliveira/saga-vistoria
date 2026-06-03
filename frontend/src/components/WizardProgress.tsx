import { Check } from 'lucide-react'

const STEPS = [
  'Veículo',
  'Cliente',
  'Pneus',
  'Danos',
  'Sujeira',
  'Fotos',
  'Revisão',
  'Assinaturas',
]

export default function WizardProgress({ current }: { current: number }) {
  return (
    <div className="w-full">
      {/* Mobile: show only current step label */}
      <div className="md:hidden flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">Etapa {current} de {STEPS.length}</span>
        <span className="text-sm font-semibold text-[#1e3a5f]">{STEPS[current - 1]}</span>
      </div>

      {/* Desktop: full step bar */}
      <div className="hidden md:flex items-center w-full mb-8">
        {STEPS.map((label, i) => {
          const step = i + 1
          const done = step < current
          const active = step === current
          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    done
                      ? 'bg-[#f97316] text-white'
                      : active
                      ? 'bg-[#1e3a5f] text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {done ? <Check className="w-4 h-4" /> : step}
                </div>
                <span className={`text-xs mt-1 whitespace-nowrap ${active ? 'text-[#1e3a5f] font-semibold' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 ${done ? 'bg-[#f97316]' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile progress bar */}
      <div className="md:hidden w-full bg-gray-200 rounded-full h-1.5 mb-6">
        <div
          className="bg-[#f97316] h-1.5 rounded-full transition-all"
          style={{ width: `${((current - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}
