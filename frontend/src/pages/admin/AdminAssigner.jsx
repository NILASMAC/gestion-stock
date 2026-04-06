import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { PageHeader, Alert, Btn, Select, Input, Table, Badge } from '../../components/UI'
import { getProduits, getGerants, assignerProduit, getAssignments } from '../../api/adminApi'

export default function AdminAssigner() {
  const [produits,     setProduits]     = useState([])
  const [gerants,      setGerants]      = useState([])
  const [assignments,  setAssignments]  = useState([])
  const [form,         setForm]         = useState({ product_id:'', gerant_id:'', quantite:1 })
  const [error,        setError]        = useState('')
  const [success,      setSuccess]      = useState('')
  const [loading,      setLoading]      = useState(false)

  const load = async () => {
    const [p, g, a] = await Promise.all([getProduits(), getGerants(), getAssignments()])
    setProduits(p.data)
    setGerants(g.data)
    setAssignments(a.data)
  }
  useEffect(() => { load() }, [])

  const selectedProduit = produits.find(p => p.id === parseInt(form.product_id))

  const handleAssigner = async () => {
    if (!form.product_id || !form.gerant_id) return setError('Sélectionnez un produit et un gérant')
    setError(''); setLoading(true)
    try {
      await assignerProduit({ product_id: parseInt(form.product_id), gerant_id: parseInt(form.gerant_id), quantite: parseInt(form.quantite) })
      setSuccess('Produit assigné avec succès !'); setForm({ product_id:'', gerant_id:'', quantite:1 }); load()
    } catch(e) { setError(e.response?.data?.error || 'Erreur') }
    finally { setLoading(false) }
  }

  const assRows = assignments.map(a => [
    <div style={{display:'flex',alignItems:'center',gap:10}}>
      {a.product?.image_url
        ? <img src={a.product.image_url} alt="" style={{width:36,height:36,objectFit:'cover',borderRadius:6,border:'1px solid #334155'}}/>
        : <div style={{width:36,height:36,background:'#1e3a5f',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center'}}>📦</div>
      }
      <span style={{color:'#e2e8f0',fontSize:14}}>{a.product?.nom}</span>
    </div>,
    <span style={{color:'#94a3b8',fontSize:13}}>{gerants.find(g=>g.id===a.gerant_id)?.nom_boutique || '—'}</span>,
    <span style={{color:'#60a5fa',fontWeight:600}}>{a.quantite_assignee}</span>,
    <span style={{color:'#475569',fontSize:12}}>{new Date(a.assigned_at).toLocaleDateString('fr-FR')}</span>
  ])

  return (
    <Layout>
      <PageHeader title="Assigner des produits" subtitle="Chargez des produits pour vos gérants" />

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,marginBottom:32}}>
        {/* Formulaire */}
        <div style={{background:'#1e293b',borderRadius:12,border:'1px solid #334155',padding:24}}>
          <h3 style={{color:'#f1f5f9',fontSize:15,fontWeight:600,margin:'0 0 20px'}}>Nouvelle assignation</h3>
          <Alert message={error} onClose={() => setError('')} />
          <Alert message={success} type="success" onClose={() => setSuccess('')} />

          <Select label="Produit à assigner" value={form.product_id} onChange={v => setForm(f=>({...f,product_id:v}))}
            options={produits.map(p => ({ value:p.id, label:`${p.nom} (stock: ${p.quantite})` }))} required />

          {selectedProduit && (
            <div style={{background:'#0f172a',borderRadius:8,padding:12,marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
              {selectedProduit.image_url && <img src={selectedProduit.image_url} alt="" style={{width:48,height:48,objectFit:'cover',borderRadius:8}} onError={e=>e.target.style.display='none'}/>}
              <div>
                <p style={{color:'#e2e8f0',fontSize:13,fontWeight:500,margin:0}}>{selectedProduit.nom}</p>
                <p style={{color:'#475569',fontSize:12,margin:'2px 0 0'}}>Stock disponible : <span style={{color:'#4ade80',fontWeight:600}}>{selectedProduit.quantite}</span> · Prix vente : {selectedProduit.prix_vente?.toLocaleString()} F</p>
              </div>
            </div>
          )}

          <Select label="Gérant destinataire" value={form.gerant_id} onChange={v => setForm(f=>({...f,gerant_id:v}))}
            options={gerants.filter(g=>g.is_active).map(g => ({ value:g.id, label:`${g.nom} — ${g.nom_boutique}` }))} required />

          <Input label="Quantité à assigner" value={form.quantite} onChange={v => setForm(f=>({...f,quantite:v}))} type="number" />

          <Btn onClick={handleAssigner} disabled={loading} size="lg">
            {loading ? 'Assignation...' : 'Assigner les produits'}
          </Btn>
        </div>

        {/* Gérants actifs */}
        <div style={{background:'#1e293b',borderRadius:12,border:'1px solid #334155',padding:24}}>
          <h3 style={{color:'#f1f5f9',fontSize:15,fontWeight:600,margin:'0 0 20px'}}>Gérants actifs ({gerants.filter(g=>g.is_active).length})</h3>
          <div style={{display:'flex',flexDirection:'column',gap:10,maxHeight:360,overflowY:'auto'}}>
            {gerants.filter(g=>g.is_active).map(g => (
              <div key={g.id} style={{background:'#0f172a',borderRadius:8,padding:'12px 14px',display:'flex',alignItems:'center',gap:10,cursor:'pointer',border:`1px solid ${form.gerant_id==g.id?'#3b82f6':'transparent'}`}}
                onClick={() => setForm(f=>({...f,gerant_id:String(g.id)}))}>
                <div style={{width:36,height:36,borderRadius:'50%',background:'#3b82f620',display:'flex',alignItems:'center',justifyContent:'center',color:'#60a5fa',fontWeight:700,flexShrink:0}}>
                  {g.nom.charAt(0).toUpperCase()}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{color:'#e2e8f0',fontSize:13,fontWeight:500,margin:0}}>{g.nom}</p>
                  <p style={{color:'#475569',fontSize:12,margin:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{g.nom_boutique}</p>
                </div>
                {form.gerant_id==g.id && <span style={{color:'#3b82f6',fontSize:18}}>✓</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{background:'#1e293b',borderRadius:12,border:'1px solid #334155',padding:24}}>
        <h3 style={{color:'#f1f5f9',fontSize:15,fontWeight:600,margin:'0 0 16px'}}>Historique des assignations</h3>
        <Table headers={['Produit','Boutique','Quantité assignée','Date']} rows={assRows} emptyMsg="Aucune assignation" />
      </div>
    </Layout>
  )
}
