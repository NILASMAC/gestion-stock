import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const S = {
  wrap:    { display:'flex', minHeight:'100vh', background:'#0f172a', fontFamily:"'Inter',sans-serif" },
  sidebar: { width:260, background:'#1e293b', display:'flex', flexDirection:'column', borderRight:'1px solid #334155', flexShrink:0 },
  sidebarMobile: { width:260, background:'#1e293b', display:'flex', flexDirection:'column', borderRight:'1px solid #334155', flexShrink:0, position:'fixed', top:0, left:0, height:'100vh', zIndex:200 },
  logo:    { padding:'28px 24px 20px', borderBottom:'1px solid #334155' },
  logoTitle:{ color:'#fff', fontSize:20, fontWeight:700, margin:0 },
  logoSub: { color:'#64748b', fontSize:12, marginTop:4 },
  nav:     { flex:1, padding:'16px 12px', overflowY:'auto' },
  navLabel:{ color:'#475569', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', padding:'8px 12px 4px' },
  navItem: (active) => ({
    display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8,
    color: active ? '#fff' : '#94a3b8', background: active ? '#3b82f6' : 'transparent',
    textDecoration:'none', fontSize:14, fontWeight: active ? 500 : 400,
    marginBottom:2, transition:'all 0.15s', cursor:'pointer', border:'none', width:'100%', textAlign:'left'
  }),
  icon:    { width:18, height:18, flexShrink:0 },
  bottom:  { padding:'16px 12px', borderTop:'1px solid #334155' },
  user:    { display:'flex', alignItems:'center', gap:10, padding:'10px 12px', marginBottom:8 },
  avatar:  { width:36, height:36, borderRadius:'50%', background:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:14, fontWeight:600, flexShrink:0 },
  main:    { flex:1, display:'flex', flexDirection:'column', overflow:'auto' },
  topbar:  { background:'#1e293b', borderBottom:'1px solid #334155', padding:'0 24px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 },
  content: { flex:1, padding:'28px 24px', overflowY:'auto' },
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:199 }
}

const ICONS = {
  dashboard: <svg style={S.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="1.8"/></svg>,
  users:     <svg style={S.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth="1.8" strokeLinecap="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4" strokeWidth="1.8"/><path strokeWidth="1.8" strokeLinecap="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  box:       <svg style={S.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96" strokeWidth="1.8"/><line x1="12" y1="22.08" x2="12" y2="12" strokeWidth="1.8"/></svg>,
  assign:    <svg style={S.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth="1.8" strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>,
  sales:     <svg style={S.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  store:     <svg style={S.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth="1.8" strokeLinecap="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22" strokeWidth="1.8"/></svg>,
  logout:    <svg style={S.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth="1.8" strokeLinecap="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  menu:      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
}

const ADMIN_MENU = [
  { label:'Dashboard',  to:'/admin',           icon:'dashboard' },
  { label:'Gérants',    to:'/admin/gerants',   icon:'users' },
  { label:'Produits',   to:'/admin/produits',  icon:'box' },
  { label:'Assigner',   to:'/admin/assigner',  icon:'assign' },
  { label:'Ventes',     to:'/admin/ventes',    icon:'sales' },
]
const GERANT_MENU = [
  { label:'Ma boutique', to:'/dashboard',       icon:'store' },
  { label:'Mes ventes',  to:'/mes-ventes',      icon:'sales' },
]

export default function Layout({ children }) {
  const { user, logoutUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const menu = user?.role === 'admin' ? ADMIN_MENU : GERANT_MENU

  const handleLogout = () => { logoutUser(); navigate('/login') }

  const SidebarContent = () => (
    <>
      <div style={S.logo}>
        <p style={S.logoTitle}>StockPro</p>
        <p style={S.logoSub}>{user?.role === 'admin' ? 'Administration' : user?.nom_boutique}</p>
      </div>
      <nav style={S.nav}>
        <p style={S.navLabel}>Menu</p>
        {menu.map(item => (
          <Link key={item.to} to={item.to} style={S.navItem(location.pathname === item.to)} onClick={() => setOpen(false)}>
            {ICONS[item.icon]}{item.label}
          </Link>
        ))}
      </nav>
      <div style={S.bottom}>
        <div style={S.user}>
          <div style={S.avatar}>{user?.nom?.charAt(0).toUpperCase()}</div>
          <div style={{overflow:'hidden'}}>
            <p style={{color:'#e2e8f0',fontSize:13,fontWeight:500,margin:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.nom}</p>
            <p style={{color:'#64748b',fontSize:11,margin:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{...S.navItem(false), color:'#f87171', width:'100%'}}>
          {ICONS.logout} Déconnexion
        </button>
      </div>
    </>
  )

  return (
    <div style={S.wrap}>
      {/* Sidebar desktop */}
      <div style={{...S.sidebar, display: window.innerWidth < 768 ? 'none' : 'flex'}}>
        <SidebarContent />
      </div>

      {/* Sidebar mobile */}
      {open && <div style={S.overlay} onClick={() => setOpen(false)}/>}
      {open && <div style={S.sidebarMobile}><SidebarContent /></div>}

      <div style={S.main}>
        <div style={S.topbar}>
          <button onClick={() => setOpen(!open)} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',display:'flex',alignItems:'center',padding:4}}>
            {ICONS.menu}
          </button>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <span style={{color:'#64748b',fontSize:13}}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</span>
            <div style={{...S.avatar,width:32,height:32,fontSize:12}}>{user?.nom?.charAt(0).toUpperCase()}</div>
          </div>
        </div>
        <div style={S.content}>{children}</div>
      </div>
    </div>
  )
}
