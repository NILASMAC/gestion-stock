// Carte de statistique
export function StatCard({ label, value, sub, color = '#3b82f6', icon }) {
  return (
    <div style={{background:'#1e293b',borderRadius:12,padding:'20px 24px',border:'1px solid #334155',borderLeft:`4px solid ${color}`,display:'flex',alignItems:'center',gap:16}}>
      {icon && <div style={{width:44,height:44,borderRadius:10,background:`${color}20`,display:'flex',alignItems:'center',justifyContent:'center',color,fontSize:20,flexShrink:0}}>{icon}</div>}
      <div>
        <p style={{color:'#64748b',fontSize:12,margin:'0 0 4px',textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</p>
        <p style={{color:'#f1f5f9',fontSize:28,fontWeight:700,margin:'0 0 2px'}}>{value}</p>
        {sub && <p style={{color:'#475569',fontSize:12,margin:0}}>{sub}</p>}
      </div>
    </div>
  )
}

// Bouton
export function Btn({ children, onClick, variant='primary', size='md', disabled=false, type='button' }) {
  const colors = { primary:'#3b82f6', danger:'#ef4444', success:'#10b981', ghost:'transparent' }
  const sz = { sm:{padding:'6px 12px',fontSize:12}, md:{padding:'9px 18px',fontSize:14}, lg:{padding:'12px 24px',fontSize:15} }
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      background: variant==='ghost' ? 'transparent' : colors[variant],
      color: variant==='ghost' ? '#94a3b8' : '#fff',
      border: variant==='ghost' ? '1px solid #334155' : 'none',
      borderRadius:8, fontWeight:500, cursor:disabled?'not-allowed':'pointer',
      opacity:disabled?0.6:1, transition:'all 0.15s', ...sz[size]
    }}>{children}</button>
  )
}

// Input
export function Input({ label, value, onChange, type='text', placeholder='', required=false, disabled=false }) {
  return (
    <div style={{marginBottom:16}}>
      {label && <label style={{display:'block',color:'#94a3b8',fontSize:13,marginBottom:6,fontWeight:500}}>{label}{required && <span style={{color:'#ef4444',marginLeft:4}}>*</span>}</label>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        required={required} disabled={disabled}
        style={{width:'100%',padding:'10px 14px',background:'#0f172a',border:'1px solid #334155',borderRadius:8,
          color:'#f1f5f9',fontSize:14,boxSizing:'border-box',outline:'none',
          opacity:disabled?0.6:1}} />
    </div>
  )
}

// Select
export function Select({ label, value, onChange, options=[], required=false }) {
  return (
    <div style={{marginBottom:16}}>
      {label && <label style={{display:'block',color:'#94a3b8',fontSize:13,marginBottom:6,fontWeight:500}}>{label}{required && <span style={{color:'#ef4444',marginLeft:4}}>*</span>}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)} required={required}
        style={{width:'100%',padding:'10px 14px',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',fontSize:14,boxSizing:'border-box'}}>
        <option value="">— Choisir —</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// Textarea
export function Textarea({ label, value, onChange, placeholder='' }) {
  return (
    <div style={{marginBottom:16}}>
      {label && <label style={{display:'block',color:'#94a3b8',fontSize:13,marginBottom:6,fontWeight:500}}>{label}</label>}
      <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3}
        style={{width:'100%',padding:'10px 14px',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',fontSize:14,boxSizing:'border-box',resize:'vertical'}}/>
    </div>
  )
}

// Badge
export function Badge({ label, color='blue' }) {
  const colors = {
    blue:   {bg:'#1d4ed820',text:'#60a5fa'},
    green:  {bg:'#16653420',text:'#4ade80'},
    red:    {bg:'#991b1b20',text:'#f87171'},
    amber:  {bg:'#92400e20',text:'#fbbf24'},
    purple: {bg:'#4c1d9520',text:'#c084fc'},
  }
  const c = colors[color] || colors.blue
  return <span style={{background:c.bg,color:c.text,padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:500,whiteSpace:'nowrap'}}>{label}</span>
}

// Modal
export function Modal({ title, onClose, children, width=480 }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:500,padding:20}}>
      <div style={{background:'#1e293b',borderRadius:16,width:'100%',maxWidth:width,maxHeight:'90vh',overflowY:'auto',border:'1px solid #334155'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 24px',borderBottom:'1px solid #334155'}}>
          <h3 style={{color:'#f1f5f9',fontSize:16,fontWeight:600,margin:0}}>{title}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#64748b',fontSize:20,cursor:'pointer',lineHeight:1,padding:4}}>✕</button>
        </div>
        <div style={{padding:'24px'}}>{children}</div>
      </div>
    </div>
  )
}

// Table — supporte tableaux simples ET objets { style, cells }
export function Table({ headers, rows, emptyMsg='Aucune donnée' }) {
  return (
    <div style={{overflowX:'auto',borderRadius:10,border:'1px solid #334155'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}>
        <thead>
          <tr style={{background:'#0f172a'}}>
            {headers.map((h,i) => (
              <th key={i} style={{padding:'12px 16px',textAlign:'left',color:'#64748b',fontWeight:600,fontSize:12,textTransform:'uppercase',letterSpacing:'0.06em',whiteSpace:'nowrap'}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={headers.length} style={{padding:'40px',textAlign:'center',color:'#475569'}}>{emptyMsg}</td></tr>
            : rows.map((row, i) => {
                const isObj = row && typeof row === 'object' && !Array.isArray(row) && row.cells
                const cells = isObj ? row.cells : row
                const style = isObj ? row.style : {}
                return (
                  <tr key={i} style={{borderTop:'1px solid #1e293b', background:i%2===0?'#1a2744':'#1e293b', ...style}}>
                    {cells.map((cell, j) => (
                      <td key={j} style={{padding:'12px 16px',color:'#cbd5e1',verticalAlign:'middle'}}>{cell}</td>
                    ))}
                  </tr>
                )
              })
          }
        </tbody>
      </table>
    </div>
  )
}

// Alerte
export function Alert({ message, type='error', onClose }) {
  const colors = { error:{bg:'#450a0a',border:'#991b1b',text:'#fca5a5'}, success:{bg:'#052e16',border:'#166534',text:'#86efac'}, warning:{bg:'#451a03',border:'#92400e',text:'#fcd34d'} }
  const c = colors[type]
  return message ? (
    <div style={{background:c.bg,border:`1px solid ${c.border}`,borderRadius:8,padding:'12px 16px',marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <span style={{color:c.text,fontSize:14}}>{message}</span>
      {onClose && <button onClick={onClose} style={{background:'none',border:'none',color:c.text,cursor:'pointer',fontSize:16,padding:'0 4px'}}>✕</button>}
    </div>
  ) : null
}

// Page header
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28}}>
      <div>
        <h1 style={{color:'#f1f5f9',fontSize:24,fontWeight:700,margin:'0 0 6px'}}>{title}</h1>
        {subtitle && <p style={{color:'#64748b',fontSize:14,margin:0}}>{subtitle}</p>}
      </div>
      {action && <div style={{flexShrink:0,marginLeft:16}}>{action}</div>}
    </div>
  )
}