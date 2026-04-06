import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0f172a'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:48,height:48,border:'3px solid #334155',borderTopColor:'#3b82f6',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 16px'}}/>
        <p style={{color:'#64748b',fontSize:14}}>Chargement...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}
