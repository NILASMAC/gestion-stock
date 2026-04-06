import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { PageHeader, Modal, Btn, Input, Textarea, Alert } from '../../components/UI'
import { getMesProduits, vendre } from '../../api/gerantApi'
import { genererFacture } from '../../components/FacturePDF'
import { useAuth } from '../../context/AuthContext'

const EMPTY_CLIENT = { client_nom:'', client_telephone:'', client_adresse:'', quantite:1, note:'' }

export default function GerantDashboard() {
  const { user, token }          = useAuth()
  const [produits, setProduits]  = useState([])
  const [modal, setModal]        = useState(null)
  const [selected, setSelected]  = useState(null)
  const [form, setForm]          = useState(EMPTY_CLIENT)
  const [error, setError]        = useState('')
  const [success, setSuccess]    = useState('')
  const [factureData, setFactureData] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [nonLues, setNonLues] = useState(0)
  const [loadingNotif, setLoadingNotif] = useState(false)

  const getToken = () => token || localStorage.getItem('access_token') || localStorage.getItem('token')

  const load = () => getMesProduits().then(r => setProduits(r.data))
  useEffect(() => { load() }, [])

  const chargerNotifications = async () => {
    const t = getToken()
    if (!t) return
    setLoadingNotif(true)
    try {
      const response = await fetch('/api/gerant/mes-notifications', {
        headers: {
          'Authorization': `Bearer ${t}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) return
      const data = await response.json()
      setNotifications(data)
      setNonLues(data.filter(n => !n.is_read).length)
    } catch (err) {
      console.error('Erreur notifications:', err)
    } finally {
      setLoadingNotif(false)
    }
  }

  const marquerLue = async (id) => {
    const t = getToken()
    if (!t) return
    try {
      await fetch(`/api/gerant/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${t}` }
      })
      chargerNotifications()
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const marquerToutesLues = async () => {
    const t = getToken()
    if (!t) return
    try {
      await fetch('/api/gerant/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${t}` }
      })
      chargerNotifications()
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  useEffect(() => { chargerNotifications() }, [])

  const set = k => v => setForm(f => ({ ...f, [k]: v }))

  const openVente = (assignment) => {
    setSelected(assignment)
    setForm(EMPTY_CLIENT)
    setError('')
    setModal('vente')
  }

  const handleVente = async () => {
    setError('')
    if (!form.client_nom.trim()) return setError('Le nom du client est obligatoire')
    if (parseInt(form.quantite) <= 0) return setError('La quantité doit être positive')
    try {
      const res = await vendre({
        product_id:       selected.product_id,
        quantite:         parseInt(form.quantite),
        note:             form.note,
        client_nom:       form.client_nom,
        client_telephone: form.client_telephone,
        client_adresse:   form.client_adresse,
      })
      setModal(null)
      setSuccess(`Vente enregistrée — Facture ${res.data.vente.numero_facture} transmise à l'admin`)
      setFactureData(res.data.vente)
      load()
    } catch (e) { setError(e.response?.data?.error || 'Erreur') }
  }

  const totalProduits = produits.length
  const totalStock    = produits.reduce((s, p) => s + p.quantite_assignee, 0)
  const alertes       = produits.filter(p => p.quantite_assignee <= (p.product?.seuil_alerte || 5))
  const getImg = (p) => p.image_base64 || p.image_url || null

  return (
    <Layout>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ color:'#f1f5f9', fontSize:24, fontWeight:700, margin:'0 0 4px' }}>
          {user?.nom_boutique}
        </h1>
        <p style={{ color:'#64748b', fontSize:14, margin:0 }}>
          Gérant : {user?.nom} · {new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })}
        </p>
      </div>

      {/* NOTIFICATIONS */}
      <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, margin: 0 }}>
            🔔 Mes Notifications {nonLues > 0 && `(${nonLues} non lue${nonLues > 1 ? 's' : ''})`}
          </h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={chargerNotifications} style={{ background: '#334155', border: 'none', color: 'white', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
              🔄 Actualiser
            </button>
            {nonLues > 0 && (
              <button onClick={marquerToutesLues} style={{ background: '#3b82f6', border: 'none', color: 'white', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                ✅ Tout marquer comme lu
              </button>
            )}
          </div>
        </div>

        {loadingNotif ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>Chargement des notifications...</p>
        ) : notifications.length === 0 ? (
          <div style={{ background: '#0f172a', borderRadius: 10, padding: '30px', textAlign: 'center' }}>
            <p style={{ color: '#475569', margin: 0 }}>✅ Aucune notification</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifications.map(notif => (
              <div
                key={notif.id}
                style={{
                  background: notif.is_read ? '#0f172a' : '#1e3a5f20',
                  borderRadius: 10,
                  border: notif.is_read ? '1px solid #1e293b' : '1px solid #f59e0b',
                  padding: '14px 16px',
                  cursor: !notif.is_read ? 'pointer' : 'default',
                  transition: 'all 0.2s'
                }}
                onClick={() => !notif.is_read && marquerLue(notif.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 22 }}>
                    {notif.type === 'error' ? '❌' : notif.type === 'success' ? '✅' : '⚠️'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#e2e8f0', fontSize: 14, margin: '0 0 4px' }}>{notif.message}</p>
                    <p style={{ color: '#475569', fontSize: 11, margin: 0 }}>{new Date(notif.created_at).toLocaleString()}</p>
                  </div>
                  {!notif.is_read && (
                    <span style={{ background: '#ef4444', color: 'white', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                      NOUVEAU
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, marginBottom:28 }}>
        {[
          { label:'Produits assignés', value:totalProduits, color:'#3b82f6' },
          { label:'Total en stock',    value:totalStock,    color:'#10b981' },
          { label:'Alertes stock bas', value:alertes.length, color:'#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ background:'#1e293b', borderRadius:12, padding:'18px 20px', border:'1px solid #334155', borderLeft:`4px solid ${s.color}` }}>
            <p style={{ color:'#64748b', fontSize:12, margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</p>
            <p style={{ color:'#f1f5f9', fontSize:26, fontWeight:700, margin:0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Bouton voir facture après vente */}
      {factureData && (
        <div style={{ background:'#052e16', border:'1px solid #166534', borderRadius:10, padding:'14px 20px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <p style={{ color:'#4ade80', fontWeight:600, margin:'0 0 2px' }}>{success}</p>
            <p style={{ color:'#166534', fontSize:13, margin:0 }}>Cliquez pour voir et imprimer la facture</p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <Btn variant="success" onClick={() => genererFacture(factureData)}>Voir la facture</Btn>
            <button onClick={() => { setFactureData(null); setSuccess('') }} style={{ background:'none', border:'none', color:'#166534', cursor:'pointer', fontSize:18 }}>✕</button>
          </div>
        </div>
      )}

      {/* Alertes stock bas */}
      {alertes.length > 0 && (
        <div style={{ background:'#451a0320', border:'1px solid #92400e', borderRadius:10, padding:'12px 16px', marginBottom:20 }}>
          <p style={{ color:'#fcd34d', fontSize:13, fontWeight:600, margin:'0 0 6px' }}>⚠ Produits en stock bas</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {alertes.map(a => (
              <span key={a.id} style={{ background:'#92400e30', color:'#fbbf24', padding:'3px 10px', borderRadius:20, fontSize:12 }}>
                {a.product?.nom} — {a.quantite_assignee} restant(s)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Grille produits */}
      {produits.length === 0
        ? <div style={{ background:'#1e293b', borderRadius:12, border:'1px solid #334155', padding:'60px', textAlign:'center' }}>
            <p style={{ fontSize:40, margin:'0 0 12px' }}>📦</p>
            <p style={{ color:'#475569', fontSize:15 }}>Aucun produit assigné pour l'instant.</p>
            <p style={{ color:'#334155', fontSize:13 }}>L'administrateur vous assignera des produits bientôt.</p>
          </div>
        : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
            {produits.map(a => (
              <div key={a.id} style={{ background:'#1e293b', borderRadius:12, border:'1px solid #334155', overflow:'hidden' }}>
                {getImg(a.product)
                  ? <img src={getImg(a.product)} alt={a.product?.nom} style={{ width:'100%', height:160, objectFit:'cover' }} onError={e => e.target.style.display='none'}/>
                  : <div style={{ height:120, background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40 }}>📦</div>
                }
                <div style={{ padding:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <h3 style={{ color:'#f1f5f9', fontSize:15, fontWeight:600, margin:0, flex:1 }}>{a.product?.nom}</h3>
                    <span style={{
                      background: a.quantite_assignee <= (a.product?.seuil_alerte || 5) ? '#450a0a' : '#052e16',
                      color:      a.quantite_assignee <= (a.product?.seuil_alerte || 5) ? '#f87171' : '#4ade80',
                      padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:500, marginLeft:8, flexShrink:0
                    }}>
                      {a.quantite_assignee} en stock
                    </span>
                  </div>
                  {a.product?.description && (
                    <p style={{ color:'#64748b', fontSize:12, margin:'0 0 10px', lineHeight:1.5 }}>{a.product.description}</p>
                  )}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                    <span style={{ color:'#475569', fontSize:12 }}>Réf: {a.product?.reference}</span>
                    <span style={{ color:'#4ade80', fontSize:16, fontWeight:700 }}>{(a.product?.prix_vente || 0).toLocaleString()} F</span>
                  </div>
                  <button
                    onClick={() => openVente(a)}
                    disabled={a.quantite_assignee <= 0}
                    style={{ width:'100%', padding:'10px', background: a.quantite_assignee <= 0 ? '#1e293b' : '#3b82f6',
                      color: a.quantite_assignee <= 0 ? '#475569' : '#fff',
                      border: a.quantite_assignee <= 0 ? '1px solid #334155' : 'none',
                      borderRadius:8, cursor: a.quantite_assignee <= 0 ? 'not-allowed' : 'pointer', fontSize:14, fontWeight:500 }}>
                    {a.quantite_assignee <= 0 ? 'Rupture de stock' : '+ Enregistrer une vente'}
                  </button>
                </div>
              </div>
            ))}
          </div>
      }

      {/* Modal vente */}
      {modal === 'vente' && selected && (
        <Modal title="Nouvelle vente" onClose={() => setModal(null)} width={520}>
          <div style={{ display:'flex', alignItems:'center', gap:14, padding:14, background:'#0f172a', borderRadius:10, marginBottom:20 }}>
            {getImg(selected.product) && (
              <img src={getImg(selected.product)} alt="" style={{ width:52, height:52, objectFit:'cover', borderRadius:8 }} onError={e => e.target.style.display='none'}/>
            )}
            <div>
              <p style={{ color:'#f1f5f9', fontSize:15, fontWeight:600, margin:0 }}>{selected.product?.nom}</p>
              <p style={{ color:'#64748b', fontSize:13, margin:'3px 0 0' }}>
                Stock dispo : <span style={{ color:'#4ade80', fontWeight:600 }}>{selected.quantite_assignee}</span>
                &nbsp;·&nbsp; Prix : <span style={{ color:'#4ade80', fontWeight:600 }}>{(selected.product?.prix_vente || 0).toLocaleString()} F</span>
              </p>
            </div>
          </div>

          <Alert message={error} onClose={() => setError('')} />

          <div style={{ background:'#0f172a', borderRadius:10, padding:'14px 16px', marginBottom:16, borderLeft:'3px solid #8b5cf6' }}>
            <p style={{ color:'#a78bfa', fontSize:12, fontWeight:600, margin:'0 0 12px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Informations du client</p>
            <Input label="Nom du client" value={form.client_nom} onChange={set('client_nom')} required placeholder="Nom complet" />
            <Input label="Téléphone" value={form.client_telephone} onChange={set('client_telephone')} placeholder="+237 6xx xxx xxx" />
            <Input label="Adresse" value={form.client_adresse} onChange={set('client_adresse')} placeholder="Quartier, ville..." />
          </div>

          <Input label="Quantité vendue" value={form.quantite} onChange={set('quantite')} type="number" />

          {parseInt(form.quantite) > 0 && (
            <div style={{ background:'#052e16', borderRadius:8, padding:'12px 16px', marginBottom:16, border:'1px solid #166534' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ color:'#4ade80', fontSize:13 }}>Total à encaisser</span>
                <span style={{ color:'#4ade80', fontSize:22, fontWeight:700 }}>
                  {(parseInt(form.quantite || 0) * (selected.product?.prix_vente || 0)).toLocaleString()} F
                </span>
              </div>
            </div>
          )}

          <Textarea label="Note (optionnel)" value={form.note} onChange={set('note')} placeholder="Remarque sur la vente..." />

          <div style={{ background:'#1e3a5f20', borderRadius:8, padding:'10px 14px', marginBottom:16, border:'1px solid #1e3a5f' }}>
            <p style={{ color:'#60a5fa', fontSize:12, margin:0 }}>
              ✓ Une facture sera automatiquement générée et transmise à l'administrateur.
            </p>
          </div>

          <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Annuler</Btn>
            <Btn variant="success" onClick={handleVente}>Confirmer et générer la facture</Btn>
          </div>
        </Modal>
      )}
    </Layout>
  )
}