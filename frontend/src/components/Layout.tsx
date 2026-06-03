import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, ClipboardList, History, Users, LogOut, Car, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vistorias/nova', label: 'Nova Vistoria', icon: ClipboardList },
  { to: '/historico', label: 'Histórico', icon: History },
]

const adminItems = [
  { to: '/admin/funcionarios', label: 'Funcionários', icon: Users },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + '/')

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1e3a5f] text-white">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="bg-[#f97316] rounded-xl p-2">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-lg leading-none">SAGA</p>
            <p className="text-xs text-blue-200">Vistoria Veicular</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(to)
                  ? 'bg-[#f97316] text-white'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="pt-4 pb-2 px-3 text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Administração
              </div>
              {adminItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive(to)
                      ? 'bg-[#f97316] text-white'
                      : 'text-blue-100 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="px-3 pb-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#f97316] flex items-center justify-center text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-blue-300 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-blue-100 hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-[#1e3a5f] text-white flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="bg-[#f97316] rounded-lg p-1.5">
            <Car className="w-4 h-4" />
          </div>
          <span className="font-bold">SAGA Vistoria</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black/50" onClick={() => setMobileOpen(false)}>
          <aside className="w-64 h-full bg-[#1e3a5f] text-white" onClick={(e) => e.stopPropagation()}>
            <div className="pt-16 px-3 py-4 space-y-1">
              {[...navItems, ...(user?.role === 'admin' ? adminItems : [])].map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium ${
                    isActive(to) ? 'bg-[#f97316]' : 'text-blue-100 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm text-blue-100 hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto md:pt-0 pt-14">
        {children}
      </main>
    </div>
  )
}
