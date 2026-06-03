import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../services/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { usuario, senha })
      localStorage.setItem('token', data.token)
      navigate('/')
    } catch {
      toast.error('Usuário ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-saga-light flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-saga-navy rounded-2xl mb-4 shadow-lg">
            <Car className="text-saga-orange" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-saga-navy">SAGA Vistoria</h1>
          <p className="text-gray-500 text-sm mt-1">Sistema de Vistoria Prévia Veicular</p>
        </div>
        <div className="card shadow-md">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Usuário</label>
              <input
                className="input"
                type="text"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                placeholder="seu.usuario"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label">Senha</label>
              <input
                className="input"
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
