import { useForm } from '../../hooks/useForm'
import { useVistoria } from '../../contexts/VistoriaContext'
import { maskCpfCnpj, maskPhone } from '../../utils/format'

export default function Step2Cliente({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { data, updateData } = useVistoria()
  const { values, errors, handleChange, validate, setValue } = useForm(
    {
      clienteNome: data.clienteNome,
      clienteDocumento: data.clienteDocumento,
      clienteTelefone: data.clienteTelefone,
      clienteEmail: data.clienteEmail,
    },
    {
      clienteNome: (v) => (!v.trim() ? 'Nome obrigatório' : null),
      clienteDocumento: (v) => (!v.replace(/\D/g, '') ? 'CPF/CNPJ obrigatório' : null),
      clienteTelefone: (v) => (!v.replace(/\D/g, '') ? 'Telefone obrigatório' : null),
      clienteEmail: (v) => (v && !/\S+@\S+\.\S+/.test(v) ? 'E-mail inválido' : null),
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    updateData({
      clienteNome: values.clienteNome,
      clienteDocumento: values.clienteDocumento,
      clienteTelefone: values.clienteTelefone,
      clienteEmail: values.clienteEmail,
    })
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Nome completo *" error={errors.clienteNome} className="md:col-span-2">
          <input
            name="clienteNome"
            value={values.clienteNome}
            onChange={handleChange}
            placeholder="João da Silva"
            className={inputClass(errors.clienteNome)}
          />
        </Field>

        <Field label="CPF / CNPJ *" error={errors.clienteDocumento}>
          <input
            name="clienteDocumento"
            value={values.clienteDocumento}
            onChange={(e) => { setValue('clienteDocumento', maskCpfCnpj(e.target.value)) }}
            placeholder="000.000.000-00"
            className={inputClass(errors.clienteDocumento)}
          />
        </Field>

        <Field label="Telefone *" error={errors.clienteTelefone}>
          <input
            name="clienteTelefone"
            value={values.clienteTelefone}
            onChange={(e) => { setValue('clienteTelefone', maskPhone(e.target.value)) }}
            placeholder="(11) 99999-9999"
            className={inputClass(errors.clienteTelefone)}
          />
        </Field>

        <Field label="E-mail" error={errors.clienteEmail} className="md:col-span-2">
          <input
            name="clienteEmail"
            type="email"
            value={values.clienteEmail}
            onChange={handleChange}
            placeholder="joao@email.com"
            className={inputClass(errors.clienteEmail)}
          />
        </Field>
      </div>

      <div className="flex justify-between pt-4">
        <button type="button" onClick={onBack} className="px-8 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors min-h-[48px]">
          Voltar
        </button>
        <button type="submit" className="bg-[#1e3a5f] hover:bg-[#2d5a8e] text-white font-semibold px-8 py-3 rounded-xl transition-colors min-h-[48px]">
          Próximo
        </button>
      </div>
    </form>
  )
}

function Field({ label, error, children, className = '' }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function inputClass(error?: string) {
  return `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
    error ? 'border-red-400 focus:ring-2 focus:ring-red-300' : 'border-gray-200 focus:ring-2 focus:ring-[#f97316] focus:border-[#f97316]'
  }`
}
