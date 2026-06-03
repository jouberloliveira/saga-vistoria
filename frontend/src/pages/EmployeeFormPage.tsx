import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import api from '../api'
import type { Employee } from '../types'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'

interface EmployeeForm {
  name: string
  email: string
  password: string
  role: 'admin' | 'inspector'
}

export default function EmployeeFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: employee } = useQuery<Employee>({
    queryKey: ['employee', id],
    queryFn: () => api.get(`/employees/${id}`).then((r) => r.data),
    enabled: isEdit,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeForm>({ defaultValues: { role: 'inspector' } })

  useEffect(() => {
    if (employee) reset({ ...employee, password: '' })
  }, [employee, reset])

  const save = useMutation({
    mutationFn: (data: EmployeeForm) => {
      const payload: Record<string, unknown> = { name: data.name, email: data.email, role: data.role }
      if (data.password) payload.password = data.password
      return isEdit ? api.patch(`/employees/${id}`, payload) : api.post('/employees', payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      navigate('/employees')
    },
  })

  const onSubmit = (data: EmployeeForm) => save.mutate(data)

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Editar Funcionário' : 'Novo Funcionário'}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/employees')}>
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
        }
      />

      <Card className="p-6 max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Nome completo"
            placeholder="João da Silva"
            error={errors.name?.message}
            {...register('name', { required: 'Nome obrigatório' })}
          />
          <Input
            label="E-mail"
            type="email"
            placeholder="joao@empresa.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'E-mail obrigatório',
              pattern: { value: /^[^@]+@[^@]+$/, message: 'E-mail inválido' },
            })}
          />
          <Input
            label={isEdit ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
            type="password"
            placeholder={isEdit ? '••••••••' : 'Mínimo 6 caracteres'}
            error={errors.password?.message}
            {...register('password', {
              required: !isEdit ? 'Senha obrigatória' : false,
              minLength: { value: 6, message: 'Mínimo 6 caracteres' },
            })}
          />
          <Select
            label="Perfil"
            error={errors.role?.message}
            options={[
              { value: 'inspector', label: 'Inspetor' },
              { value: 'admin', label: 'Administrador' },
            ]}
            {...register('role', { required: 'Perfil obrigatório' })}
          />

          {save.isError && (
            <div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {(save.error as any)?.response?.data?.error ?? 'Erro ao salvar funcionário'}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => navigate('/employees')}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting || save.isPending}>
              {isEdit ? 'Salvar Alterações' : 'Cadastrar Funcionário'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
