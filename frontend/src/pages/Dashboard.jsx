import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuth()
  if (!user) return null
  return user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard/boutique" replace />
}
