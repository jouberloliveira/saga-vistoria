import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Car, Users, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../auth'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inspections', icon: ClipboardList, label: 'Vistorias' },
  { to: '/vehicles', icon: Car, label: 'Veículos' },
  { to: '/employees', icon: Users, label: 'Funcionários' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-7 h-7 text-blue-400" />
          <div>
            <p className="font-bold text-sm leading-tight">SAGA Vistoria</p>
            <p className="text-xs text-slate-400">Sistema Veicular</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-slate-700 pt-4">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs font-medium text-white truncate">{user?.name}</p>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          <span className="mt-1 inline-block px-2 py-0.5 rounded-full bg-slate-700 text-xs text-slate-300 capitalize">
            {user?.role === 'admin' ? 'Administrador' : 'Inspetor'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </aside>
  )
}
