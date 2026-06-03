import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, UserCheck, UserX } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import type { Funcionario } from '../types'

export default function FuncionariosPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: '', usuario: '', senha: '', role: 'funcionario' })

  const { data: funcionarios = [], isLoading } = useQuery<Funcionario[]>({
    queryKey: ['funcionarios'],
    queryFn: () => api.get('/funcionarios').then(r => r.data)
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/funcionarios', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['funcionarios'] })
      setShowForm(false)
      setForm({ nome: '', usuario: '', senha: '', role: 'funcionario' })
      toast.success('Funcionário cadastrado!')
    },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { error?: string } } }).response?.data?.error || 'Erro ao cadastrar')
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => api.patch(`/funcionarios/${id}`, { ativo }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['funcionarios'] }),
    onError: () => toast.error('Erro ao atualizar')
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-saga-navy">Funcionários</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Novo Funcionário
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold text-saga-navy mb-4">Cadastrar Funcionário</h2>
          <form onSubmit={e => { e.preventDefault(); createMutation.mutate(form) }} className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nome completo</label>
              <input className="input" required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <label className="label">Usuário</label>
              <input className="input" required value={form.usuario} onChange={e => setForm({ ...form, usuario: e.target.value })} />
            </div>
            <div>
              <label className="label">Senha</label>
              <input className="input" type="password" required value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} />
            </div>
            <div>
              <label className="label">Perfil</label>
              <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="funcionario">Funcionário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={createMutation.isPending} className="btn-primary">
                {createMutation.isPending ? 'Salvando...' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {isLoading ? (
          <p className="text-gray-400 text-sm text-center py-8">Carregando...</p>
        ) : (
          <div className="space-y-2">
            {funcionarios.map(f => (
              <div key={f.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-saga-light">
                <div>
                  <span className="font-medium text-saga-navy">{f.nome}</span>
                  <span className="text-sm text-gray-400 ml-2">@{f.usuario}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${f.role === 'admin' ? 'bg-saga-navy/10 text-saga-navy' : 'bg-gray-100 text-gray-600'}`}>
                    {f.role === 'admin' ? 'Admin' : 'Funcionário'}
                  </span>
                </div>
                <button
                  onClick={() => toggleMutation.mutate({ id: f.id, ativo: !f.ativo })}
                  className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${f.ativo ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                >
                  {f.ativo ? <><UserX size={16} /> Desativar</> : <><UserCheck size={16} /> Ativar</>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
