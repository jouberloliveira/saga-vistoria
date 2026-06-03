import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../auth'
import api from '../api'
import Button from '../components/Button'
import Input from '../components/Input'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('')
      const res = await api.post('/auth/login', data)
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Erro ao fazer login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-3">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">SAGA Vistoria</h1>
            <p className="text-sm text-slate-500 mt-1">Sistema de Vistoria Veicular</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email', {
                required: 'E-mail obrigatório',
                pattern: { value: /^[^@]+@[^@]+$/, message: 'E-mail inválido' },
              })}
            />

            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password', { required: 'Senha obrigatória' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" loading={isSubmitting} size="lg" className="w-full mt-2">
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
