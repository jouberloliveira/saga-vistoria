import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import api from '../api'
import type { Inspection, Vehicle } from '../types'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Input from '../components/Input'
import Select from '../components/Select'
import Textarea from '../components/Textarea'
import Button from '../components/Button'

interface InspForm {
  vehicle_id: string
  client_name: string
  client_cpf: string
  mileage: number | ''
  notes: string
}

export default function InspectionFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: () => api.get('/vehicles').then((r) => r.data),
  })

  const { data: inspection } = useQuery<Inspection>({
    queryKey: ['inspection', id],
    queryFn: () => api.get(`/inspections/${id}`).then((r) => r.data),
    enabled: isEdit,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InspForm>()

  useEffect(() => {
    if (inspection) {
      reset({
        vehicle_id: inspection.vehicle_id,
        client_name: inspection.client_name,
        client_cpf: inspection.client_cpf,
        mileage: inspection.mileage ?? '',
        notes: inspection.notes ?? '',
      })
    }
  }, [inspection, reset])

  const save = useMutation({
    mutationFn: (data: InspForm) => {
      const payload = {
        ...data,
        mileage: data.mileage === '' ? undefined : Number(data.mileage),
      }
      return isEdit
        ? api.patch(`/inspections/${id}`, payload)
        : api.post('/inspections', payload)
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['inspections'] })
      const newId = res.data?.id ?? id
      navigate(`/inspections/${newId}`)
    },
  })

  const vehicleOptions = vehicles.map((v) => ({
    value: v.id,
    label: `${v.plate} — ${v.brand} ${v.model} (${v.year})`,
  }))

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Editar Vistoria' : 'Nova Vistoria'}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/inspections')}>
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
        }
      />

      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit((d) => save.mutate(d))} noValidate className="space-y-4">
          <Select
            label="Veículo"
            placeholder="Selecione um veículo..."
            options={vehicleOptions}
            error={errors.vehicle_id?.message}
            {...register('vehicle_id', { required: 'Selecione um veículo' })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nome do Cliente"
              placeholder="Nome completo"
              error={errors.client_name?.message}
              {...register('client_name', { required: 'Nome do cliente obrigatório' })}
            />
            <Input
              label="CPF do Cliente"
              placeholder="000.000.000-00"
              error={errors.client_cpf?.message}
              {...register('client_cpf', { required: 'CPF obrigatório' })}
            />
          </div>

          <Input
            label="Quilometragem (opcional)"
            type="number"
            placeholder="Ex: 45000"
            {...register('mileage')}
          />

          <Textarea
            label="Observações (opcional)"
            placeholder="Anote informações adicionais sobre esta vistoria..."
            rows={4}
            {...register('notes')}
          />

          {save.isError && (
            <div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {(save.error as any)?.response?.data?.error ?? 'Erro ao salvar vistoria'}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => navigate('/inspections')}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting || save.isPending}>
              {isEdit ? 'Salvar Alterações' : 'Criar Vistoria'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
