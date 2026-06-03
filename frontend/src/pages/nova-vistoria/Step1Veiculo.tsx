import { useForm } from '../../hooks/useForm'
import { useVistoria } from '../../contexts/VistoriaContext'

export default function Step1Veiculo({ onNext }: { onNext: () => void }) {
  const { data, updateData } = useVistoria()
  const { values, errors, handleChange, validate } = useForm(
    {
      placa: data.placa,
      marca: data.marca,
      modelo: data.modelo,
      ano: data.ano,
      cor: data.cor,
      quilometragem: data.quilometragem,
      chassi: data.chassi,
    },
    {
      placa: (v) => (!v.trim() ? 'Placa obrigatória' : v.trim().length < 7 ? 'Placa inválida' : null),
      marca: (v) => (!v.trim() ? 'Marca obrigatória' : null),
      modelo: (v) => (!v.trim() ? 'Modelo obrigatório' : null),
      ano: (v) => (!v ? 'Ano obrigatório' : Number(v) < 1950 || Number(v) > new Date().getFullYear() + 1 ? 'Ano inválido' : null),
      cor: (v) => (!v.trim() ? 'Cor obrigatória' : null),
      quilometragem: (v) => (!v ? 'Quilometragem obrigatória' : Number(v) < 0 ? 'Valor inválido' : null),
      chassi: () => null,
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    updateData({
      placa: values.placa.toUpperCase().replace(/[^A-Z0-9]/g, ''),
      marca: values.marca,
      modelo: values.modelo,
      ano: values.ano,
      cor: values.cor,
      quilometragem: values.quilometragem,
      chassi: values.chassi,
    })
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Placa *" error={errors.placa}>
          <input
            name="placa"
            value={values.placa}
            onChange={handleChange}
            placeholder="ABC1D23"
            maxLength={7}
            className={inputClass(errors.placa)}
          />
        </Field>
        <Field label="Marca *" error={errors.marca}>
          <input name="marca" value={values.marca} onChange={handleChange} placeholder="Toyota" className={inputClass(errors.marca)} />
        </Field>
        <Field label="Modelo *" error={errors.modelo}>
          <input name="modelo" value={values.modelo} onChange={handleChange} placeholder="Corolla" className={inputClass(errors.modelo)} />
        </Field>
        <Field label="Ano *" error={errors.ano}>
          <input name="ano" type="number" value={values.ano} onChange={handleChange} placeholder="2022" className={inputClass(errors.ano)} />
        </Field>
        <Field label="Cor *" error={errors.cor}>
          <input name="cor" value={values.cor} onChange={handleChange} placeholder="Prata" className={inputClass(errors.cor)} />
        </Field>
        <Field label="Quilometragem *" error={errors.quilometragem}>
          <input name="quilometragem" type="number" value={values.quilometragem} onChange={handleChange} placeholder="50000" className={inputClass(errors.quilometragem)} />
        </Field>
        <Field label="Chassi" error={errors.chassi} className="md:col-span-2">
          <input name="chassi" value={values.chassi} onChange={handleChange} placeholder="9BWZZZ377VT004251" maxLength={17} className={inputClass(errors.chassi)} />
        </Field>
      </div>

      <div className="flex justify-end pt-4">
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
