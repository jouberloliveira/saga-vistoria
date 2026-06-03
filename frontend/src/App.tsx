import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NovaVistoria from './pages/NovaVistoria'
import DetalheVistoria from './pages/DetalheVistoria'
import Historico from './pages/Historico'
import AdminFuncionarios from './pages/AdminFuncionarios'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/vistorias/nova" element={
              <ProtectedRoute><NovaVistoria /></ProtectedRoute>
            } />
            <Route path="/vistorias/:id" element={
              <ProtectedRoute><DetalheVistoria /></ProtectedRoute>
            } />
            <Route path="/historico" element={
              <ProtectedRoute><Historico /></ProtectedRoute>
            } />
            <Route path="/admin/funcionarios" element={
              <ProtectedRoute adminOnly><AdminFuncionarios /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '12px', fontSize: '14px' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  )
}
