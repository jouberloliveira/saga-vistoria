import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Car, LayoutDashboard, History, Users, LogOut } from 'lucide-react'

export default function Layout() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/historico', icon: History, label: 'Histórico' },
    { to: '/funcionarios', icon: Users, label: 'Funcionários' },
  ]

  return (
    <div className="min-h-screen flex bg-saga-light">
      <aside className="w-60 bg-saga-navy flex flex-col shadow-lg">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <Car className="text-saga-orange" size={28} />
          <span className="text-white font-bold text-lg tracking-tight">SAGA Vistoria</span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all w-full"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
