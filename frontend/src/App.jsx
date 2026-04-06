import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login            from './pages/Login'
import Register         from './pages/Register'
import Dashboard        from './pages/Dashboard'
import NotFound         from './pages/NotFound'

import AdminDashboard   from './pages/admin/AdminDashboard'
import AdminGerants     from './pages/admin/AdminGerants'
import AdminProduits    from './pages/admin/AdminProduits'
import AdminAssigner    from './pages/admin/AdminAssigner'
import AdminVentes      from './pages/admin/AdminVentes'

import GerantDashboard  from './pages/gerant/GerantDashboard'
import MesVentes        from './pages/gerant/MesVentes'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/"         element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin"           element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/gerants"   element={<ProtectedRoute adminOnly><AdminGerants /></ProtectedRoute>} />
          <Route path="/admin/produits"  element={<ProtectedRoute adminOnly><AdminProduits /></ProtectedRoute>} />
          <Route path="/admin/assigner"  element={<ProtectedRoute adminOnly><AdminAssigner /></ProtectedRoute>} />
          <Route path="/admin/ventes"    element={<ProtectedRoute adminOnly><AdminVentes /></ProtectedRoute>} />

          {/* Gérant */}
          <Route path="/dashboard/boutique" element={<ProtectedRoute><GerantDashboard /></ProtectedRoute>} />
          <Route path="/mes-ventes"         element={<ProtectedRoute><MesVentes /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
