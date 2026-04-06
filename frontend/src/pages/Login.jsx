import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/authApi'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm]     = useState({ email:'', password:'' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await login(form)
      loginUser(res.data.token, res.data.user)
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard')
    } catch(err) { setError(err.response?.data?.error || 'Erreur de connexion') }
    finally { setLoading(false) }
  }

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',fontFamily:"'Inter',sans-serif"}}>
      {/* Panneau gauche décoratif */}
      <div style={{flex:1,background:'linear-gradient(135deg,#1e3a5f 0%,#0f172a 100%)',display:'flex',flexDirection:'column',justifyContent:'center',padding:'60px',display:'none'}}>
      </div>
      {/* Formulaire */}
      <div style={{width:'100%',maxWidth:480,margin:'auto',padding:'40px 32px'}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:56,height:56,background:'#3b82f6',borderRadius:16,marginBottom:20}}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeWidth="2" strokeLinecap="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96" strokeWidth="2"/><line x1="12" y1="22.08" x2="12" y2="12" strokeWidth="2"/></svg>
          </div>
          <h1 style={{color:'#f1f5f9',fontSize:28,fontWeight:700,margin:'0 0 8px'}}>StockPro</h1>
          <p style={{color:'#64748b',fontSize:15,margin:0}}>Connectez-vous à votre espace</p>
        </div>

        {error && <div style={{background:'#450a0a',border:'1px solid #991b1b',borderRadius:8,padding:'12px 16px',marginBottom:20,color:'#fca5a5',fontSize:14}}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {[['Email','email','email'],['Mot de passe','password','password']].map(([label,key,type]) => (
            <div key={key} style={{marginBottom:18}}>
              <label style={{display:'block',color:'#94a3b8',fontSize:13,fontWeight:500,marginBottom:7}}>{label}</label>
              <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}
                style={{width:'100%',padding:'12px 16px',background:'#1e293b',border:'1px solid #334155',borderRadius:10,color:'#f1f5f9',fontSize:14,boxSizing:'border-box',outline:'none'}}
                required />
            </div>
          ))}
          <button type="submit" disabled={loading}
            style={{width:'100%',padding:'13px',background:'#3b82f6',color:'#fff',border:'none',borderRadius:10,fontSize:15,fontWeight:600,cursor:'pointer',marginTop:8,opacity:loading?0.7:1}}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={{textAlign:'center',marginTop:24,color:'#64748b',fontSize:14}}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{color:'#3b82f6',textDecoration:'none',fontWeight:500}}>Créer un compte gérant</Link>
        </p>
      </div>
    </div>
  )
}
