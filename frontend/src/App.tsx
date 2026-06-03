import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import NovaVistoriaPage from './pages/NovaVistoriaPage'
import VistoriaDetailPage from './pages/VistoriaDetailPage'
import HistoricoPage from './pages/HistoricoPage'
import FuncionariosPage from './pages/FuncionariosPage'
import Layout from './components/Layout'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<DashboardPage />} />
          <Route path="vistorias/nova" element={<NovaVistoriaPage />} />
          <Route path="vistorias/:id" element={<VistoriaDetailPage />} />
          <Route path="historico" element={<HistoricoPage />} />
          <Route path="funcionarios" element={<FuncionariosPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
