import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import api from '../api'
import type { Vehicle } from '../types'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'

interface VehicleForm {
  plate: string
  brand: string
  model: string
  year: number
  color: string
}

const CURRENT_YEAR = 2025

export default function VehicleFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: vehicle } = useQuery<Vehicle>({
    queryKey: ['vehicle', id],
    queryFn: () => api.get(`/vehicles/${id}`).then((r) => r.data),
    enabled: isEdit,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleForm>({ defaultValues: { year: CURRENT_YEAR } })

  useEffect(() => {
    if (vehicle) reset(vehicle)
  }, [vehicle, reset])

  const save = useMutation({
    mutationFn: (data: VehicleForm) =>
      isEdit
        ? api.put(`/vehicles/${id}`, data)
        : api.post('/vehicles', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      navigate('/vehicles')
    },
  })

  const onSubmit = (data: VehicleForm) => save.mutate(data)

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Editar Veículo' : 'Novo Veículo'}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/vehicles')}>
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
        }
      />

      <Card className="p-6 max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Placa"
            placeholder="ABC1234"
            error={errors.plate?.message}
            {...register('plate', { required: 'Placa obrigatória' })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Marca"
              placeholder="Toyota"
              error={errors.brand?.message}
              {...register('brand', { required: 'Marca obrigatória' })}
            />
            <Input
              label="Modelo"
              placeholder="Corolla"
              error={errors.model?.message}
              {...register('model', { required: 'Modelo obrigatório' })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ano"
              type="number"
              placeholder="2024"
              error={errors.year?.message}
              {...register('year', {
                required: 'Ano obrigatório',
                valueAsNumber: true,
                min: { value: 1900, message: 'Ano inválido' },
                max: { value: CURRENT_YEAR + 1, message: 'Ano inválido' },
              })}
            />
            <Input
              label="Cor"
              placeholder="Prata"
              error={errors.color?.message}
              {...register('color', { required: 'Cor obrigatória' })}
            />
          </div>

          {save.isError && (
            <div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {(save.error as any)?.response?.data?.error ?? 'Erro ao salvar veículo'}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => navigate('/vehicles')}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting || save.isPending}>
              {isEdit ? 'Salvar Alterações' : 'Cadastrar Veículo'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
