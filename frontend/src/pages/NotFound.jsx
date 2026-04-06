import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:"'Inter',sans-serif"}}>
      <p style={{fontSize:72,fontWeight:800,color:'#1e293b',margin:'0 0 8px'}}>404</p>
      <h2 style={{color:'#f1f5f9',margin:'0 0 8px'}}>Page introuvable</h2>
      <p style={{color:'#64748b',marginBottom:24}}>Cette page n'existe pas.</p>
      <Link to="/" style={{background:'#3b82f6',color:'#fff',padding:'10px 24px',borderRadius:8,textDecoration:'none',fontSize:14}}>Retour</Link>
    </div>
  )
}
