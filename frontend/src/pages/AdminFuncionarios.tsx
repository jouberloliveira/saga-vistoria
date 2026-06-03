import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFuncionarios, createFuncionario, updateFuncionario, toggleFuncionario } from '../api/funcionarios'
import type { Funcionario, FuncionarioPayload } from '../api/funcionarios'
import { Plus, Pencil, ToggleLeft, ToggleRight, Loader2, X, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const emptyPayload = (): FuncionarioPayload & { confirmPassword: string } => ({
  name: '', username: '', email: '', password: '', role: 'funcionario', confirmPassword: '',
})

export default function AdminFuncionarios() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Funcionario | null>(null)
  const [form, setForm] = useState(emptyPayload())
  const [formErrors, setFormErrors] = useState<Partial<Record<string, string>>>({})

  const { data: funcionarios = [], isLoading } = useQuery({
    queryKey: ['funcionarios'],
    queryFn: getFuncionarios,
  })

  const createMut = useMutation({
    mutationFn: createFuncionario,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['funcionarios'] }); closeModal(); toast.success('Funcionário criado') },
    onError: () => toast.error('Erro ao criar funcionário'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<FuncionarioPayload> }) => updateFuncionario(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['funcionarios'] }); closeModal(); toast.success('Funcionário atualizado') },
    onError: () => toast.error('Erro ao atualizar funcionário'),
  })

  const toggleMut = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => toggleFuncionario(id, ativo),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['funcionarios'] }) },
    onError: () => toast.error('Erro ao alterar status'),
  })

  const openCreate = () => { setEditing(null); setForm(emptyPayload()); setFormErrors({}); setModalOpen(true) }
  const openEdit = (f: Funcionario) => { setEditing(f); setForm({ name: f.name, username: f.username, email: f.email, password: '', role: f.role, confirmPassword: '' }); setFormErrors({}); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const validate = () => {
    const e: typeof formErrors = {}
    if (!form.name.trim()) e.name = 'Nome obrigatório'
    if (!form.username.trim()) e.username = 'Usuário obrigatório'
    if (!form.email.trim()) e.email = 'E-mail obrigatório'
    if (!editing && !form.password) e.password = 'Senha obrigatória'
    if (form.password && form.password !== form.confirmPassword) e.confirmPassword = 'Senhas não coincidem'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const payload: FuncionarioPayload = { name: form.name, username: form.username, email: form.email, role: form.role }
    if (form.password) payload.password = form.password
    if (editing) {
      updateMut.mutate({ id: editing.id, payload })
    } else {
      createMut.mutate(payload)
    }
  }

  const saving = createMut.isPending || updateMut.isPending

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Funcionários</h1>
          <p className="text-gray-500 text-sm mt-1">{funcionarios.length} funcionário(s)</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-[#f97316] hover:bg-orange-600 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors min-h-[48px]">
          <Plus className="w-4 h-4" />
          Novo Funcionário
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : funcionarios.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum funcionário cadastrado</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {funcionarios.map((f) => (
              <div key={f.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-[#1e3a5f] font-bold text-sm">
                    {f.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{f.name}</p>
                    <p className="text-xs text-gray-500">{f.username} · {f.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${f.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                    {f.role}
                  </span>
                  <button
                    onClick={() => toggleMut.mutate({ id: f.id, ativo: !f.ativo })}
                    disabled={toggleMut.isPending}
                    title={f.ativo ? 'Desativar' : 'Ativar'}
                    className={`transition-colors ${f.ativo ? 'text-green-500 hover:text-green-600' : 'text-gray-300 hover:text-gray-400'}`}
                  >
                    {f.ativo ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                  <button onClick={() => openEdit(f)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-800">{editing ? 'Editar funcionário' : 'Novo funcionário'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name: 'name', label: 'Nome completo *', type: 'text', placeholder: 'João Silva' },
                { name: 'username', label: 'Usuário *', type: 'text', placeholder: 'joao.silva' },
                { name: 'email', label: 'E-mail *', type: 'email', placeholder: 'joao@empresa.com' },
              ].map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={(form as unknown as Record<string, string>)[name]}
                    onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
                    placeholder={placeholder}
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 ${formErrors[name] ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-[#f97316]'}`}
                  />
                  {formErrors[name] && <p className="text-red-500 text-xs mt-1">{formErrors[name]}</p>}
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as FuncionarioPayload['role'] }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#f97316]"
                >
                  <option value="funcionario">Funcionário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{editing ? 'Nova senha (deixe em branco para manter)' : 'Senha *'}</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 ${formErrors.password ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-[#f97316]'}`}
                />
                {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
              </div>

              {form.password && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 ${formErrors.confirmPassword ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-[#f97316]'}`}
                  />
                  {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 min-h-[48px]">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1e3a5f] text-white font-semibold hover:bg-[#2d5a8e] disabled:opacity-60 min-h-[48px]">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
