import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/authApi'
import { useAuth } from '../context/AuthContext'
import ImageUpload from '../components/ImageUpload'

export default function Register() {
  const [form, setForm] = useState({
    nom:'', email:'', password:'', nom_boutique:'', telephone:'', adresse:'', photo_base64:''
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { loginUser }         = useAuth()
  const navigate              = useNavigate()

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await register(form)
      loginUser(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription')
    } finally { setLoading(false) }
  }

  const field = (label, key, type = 'text', required = false, placeholder = '') => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display:'block', color:'#94a3b8', fontSize:13, fontWeight:500, marginBottom:6 }}>
        {label}{required && <span style={{ color:'#ef4444', marginLeft:4 }}>*</span>}
      </label>
      <input type={type} value={form[key]} onChange={e => set(key)(e.target.value)}
        placeholder={placeholder} required={required}
        style={{ width:'100%', padding:'11px 14px', background:'#1e293b', border:'1px solid #334155',
          borderRadius:8, color:'#f1f5f9', fontSize:14, boxSizing:'border-box', outline:'none' }}/>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#0f172a', display:'flex', alignItems:'center',
      justifyContent:'center', padding:20, fontFamily:"'Inter',sans-serif" }}>
      <div style={{ width:'100%', maxWidth:560, background:'#1e293b', borderRadius:16,
        border:'1px solid #334155', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ background:'#0f172a', padding:'28px 32px', borderBottom:'1px solid #334155',
          display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:'#3b82f6',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white">
              <path strokeWidth="2" strokeLinecap="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <h2 style={{ color:'#f1f5f9', fontSize:20, fontWeight:700, margin:0 }}>Créer un compte gérant</h2>
            <p style={{ color:'#64748b', fontSize:13, margin:'3px 0 0' }}>Remplissez tous les champs pour accéder à votre espace</p>
          </div>
        </div>

        <div style={{ padding:'28px 32px' }}>
          {error && (
            <div style={{ background:'#450a0a', border:'1px solid #991b1b', borderRadius:8,
              padding:'12px 16px', marginBottom:20, color:'#fca5a5', fontSize:14 }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Photo de profil */}
            <div style={{ background:'#0f172a', borderRadius:10, padding:'16px 20px',
              marginBottom:20, borderLeft:'3px solid #f59e0b' }}>
              <p style={{ color:'#fbbf24', fontSize:12, fontWeight:600, margin:'0 0 14px',
                textTransform:'uppercase', letterSpacing:'0.06em' }}>Photo de profil</p>
              <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                <ImageUpload
                  value={form.photo_base64}
                  onChange={set('photo_base64')}
                  shape="circle"
                  placeholder="Photo"
                />
                <div style={{ flex:1 }}>
                  <p style={{ color:'#94a3b8', fontSize:13, lineHeight:1.6, margin:0 }}>
                    Choisissez une photo depuis votre galerie ou votre appareil photo. Elle sera visible par l'administrateur.
                  </p>
                  <p style={{ color:'#475569', fontSize:12, marginTop:6 }}>Format : JPG, PNG · Max 5 Mo</p>
                </div>
              </div>
            </div>

            {/* Infos boutique */}
            <div style={{ background:'#0f172a', borderRadius:10, padding:'16px 20px',
              marginBottom:20, borderLeft:'3px solid #3b82f6' }}>
              <p style={{ color:'#60a5fa', fontSize:12, fontWeight:600, margin:'0 0 14px',
                textTransform:'uppercase', letterSpacing:'0.06em' }}>Informations boutique</p>
              {field('Nom de la boutique', 'nom_boutique', 'text', true, 'Ex: Boutique Central')}
              {field('Adresse de la boutique', 'adresse', 'text', false, 'Quartier, ville...')}
            </div>

            {/* Infos personnelles */}
            <div style={{ background:'#0f172a', borderRadius:10, padding:'16px 20px',
              marginBottom:20, borderLeft:'3px solid #10b981' }}>
              <p style={{ color:'#34d399', fontSize:12, fontWeight:600, margin:'0 0 14px',
                textTransform:'uppercase', letterSpacing:'0.06em' }}>Informations personnelles</p>
              {field('Nom complet', 'nom', 'text', true, 'Jean Dupont')}
              {field('Téléphone', 'telephone', 'tel', false, '+237 6xx xxx xxx')}
            </div>

            {/* Identifiants */}
            <div style={{ background:'#0f172a', borderRadius:10, padding:'16px 20px',
              marginBottom:24, borderLeft:'3px solid #8b5cf6' }}>
              <p style={{ color:'#a78bfa', fontSize:12, fontWeight:600, margin:'0 0 14px',
                textTransform:'uppercase', letterSpacing:'0.06em' }}>Identifiants de connexion</p>
              {field('Email', 'email', 'email', true, 'votre@email.com')}
              {field('Mot de passe', 'password', 'password', true, 'Minimum 6 caractères')}
            </div>

            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:13, background:'#3b82f6', color:'#fff',
                border:'none', borderRadius:10, fontSize:15, fontWeight:600,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Création du compte...' : 'Créer mon compte'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, color:'#64748b', fontSize:14 }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color:'#3b82f6', textDecoration:'none', fontWeight:500 }}>Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
