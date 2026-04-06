import { useRef } from 'react'

export default function ImageUpload({ label, value, onChange, shape = 'rect', placeholder = 'Cliquez pour choisir une image' }) {
  const inputRef = useRef()

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return alert('Veuillez choisir un fichier image.')
    if (file.size > 5 * 1024 * 1024) return alert('Image trop lourde (max 5 Mo).')
    const reader = new FileReader()
    reader.onload = (ev) => onChange(ev.target.result)
    reader.readAsDataURL(file)
  }

  const isCircle = shape === 'circle'

  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display:'block', color:'#94a3b8', fontSize:13, fontWeight:500, marginBottom:8 }}>{label}</label>}
      <div
        onClick={() => inputRef.current.click()}
        style={{
          cursor: 'pointer',
          border: `2px dashed ${value ? '#3b82f6' : '#334155'}`,
          borderRadius: isCircle ? '50%' : 12,
          width: isCircle ? 100 : '100%',
          height: isCircle ? 100 : 160,
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0f172a',
          position: 'relative',
          transition: 'border-color 0.2s',
        }}
      >
        {value ? (
          <>
            <img src={value} alt="aperçu" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            <div style={{
              position:'absolute', inset:0, background:'rgba(0,0,0,0.5)',
              display:'flex', alignItems:'center', justifyContent:'center',
              opacity:0, transition:'opacity 0.2s',
              fontSize:12, color:'#fff', fontWeight:500
            }}
              onMouseEnter={e => e.currentTarget.style.opacity=1}
              onMouseLeave={e => e.currentTarget.style.opacity=0}
            >Changer la photo</div>
          </>
        ) : (
          <>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#334155" style={{ marginBottom:8 }}>
              <path strokeWidth="1.5" strokeLinecap="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            <span style={{ color:'#475569', fontSize:12, textAlign:'center', padding:'0 16px' }}>{placeholder}</span>
            <span style={{ color:'#334155', fontSize:11, marginTop:4 }}>JPG, PNG, WEBP — max 5 Mo</span>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display:'none' }} />
      {value && !isCircle && (
        <button onClick={() => onChange('')} style={{ marginTop:6, background:'none', border:'none', color:'#f87171', fontSize:12, cursor:'pointer', padding:0 }}>
          ✕ Supprimer l'image
        </button>
      )}
    </div>
  )
}
