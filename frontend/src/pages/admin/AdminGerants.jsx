import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { PageHeader, Table, Badge, Btn, Modal, Alert } from '../../components/UI'
import { getGerants, toggleGerant, deleteGerant } from '../../api/adminApi'

export default function AdminGerants() {
  const [gerants, setGerants]     = useState([])
  const [selected, setSelected]   = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')

  const load = () => getGerants().then(r => setGerants(r.data))
  useEffect(() => { load() }, [])

  const handleToggle = async (id) => { await toggleGerant(id); load() }

  const handleDelete = async (id) => {
    try {
      await deleteGerant(id)
      setConfirmId(null)
      setSuccess('Gérant supprimé avec succès.')
      load()
    } catch (e) { setError(e.response?.data?.error || 'Erreur lors de la suppression') }
  }

  const rows = gerants.map(g => [
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      {g.photo_base64
        ? <img src={g.photo_base64} alt="" style={{ width:40, height:40, borderRadius:'50%', objectFit:'cover', border:'2px solid #334155', flexShrink:0 }}/>
        : <div style={{ width:40, height:40, borderRadius:'50%', background:'#1e3a5f', display:'flex', alignItems:'center', justifyContent:'center', color:'#60a5fa', fontWeight:700, fontSize:16, flexShrink:0 }}>
            {g.nom.charAt(0).toUpperCase()}
          </div>
      }
      <div>
        <p style={{ color:'#e2e8f0', fontSize:14, fontWeight:500, margin:0 }}>{g.nom}</p>
        <p style={{ color:'#475569', fontSize:12, margin:0 }}>{g.email}</p>
      </div>
    </div>,
    <span style={{ color:'#94a3b8', fontSize:13 }}>{g.nom_boutique}</span>,
    <span style={{ color:'#94a3b8', fontSize:13 }}>{g.telephone || '—'}</span>,
    <Badge label={g.is_active ? 'Actif' : 'Inactif'} color={g.is_active ? 'green' : 'red'} />,
    <span style={{ color:'#475569', fontSize:12 }}>{new Date(g.created_at).toLocaleDateString('fr-FR')}</span>,
    <div style={{ display:'flex', gap:8 }}>
      <Btn size="sm" variant="ghost" onClick={() => setSelected(g)}>Voir</Btn>
      <Btn size="sm" variant={g.is_active ? 'danger' : 'success'} onClick={() => handleToggle(g.id)}>
        {g.is_active ? 'Désactiver' : 'Activer'}
      </Btn>
      <Btn size="sm" variant="danger" onClick={() => setConfirmId(g.id)}>Supprimer</Btn>
    </div>
  ])

  return (
    <Layout>
      <PageHeader title="Gérants" subtitle={`${gerants.length} gérant(s) inscrit(s)`} />
      <Alert message={success} type="success" onClose={() => setSuccess('')} />
      <Alert message={error} onClose={() => setError('')} />

      <Table
        headers={['Gérant', 'Boutique', 'Téléphone', 'Statut', 'Inscription', 'Actions']}
        rows={rows}
        emptyMsg="Aucun gérant inscrit"
      />

      {/* Fiche gérant complète */}
      {selected && (
        <Modal title="Fiche gérant complète" onClose={() => setSelected(null)} width={480}>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24,
            padding:'16px', background:'#0f172a', borderRadius:12 }}>
            {selected.photo_base64
              ? <img src={selected.photo_base64} alt="" style={{ width:72, height:72, borderRadius:'50%', objectFit:'cover', border:'3px solid #3b82f6', flexShrink:0 }}/>
              : <div style={{ width:72, height:72, borderRadius:'50%', background:'#1e3a5f', display:'flex', alignItems:'center', justifyContent:'center', color:'#60a5fa', fontWeight:700, fontSize:28, flexShrink:0 }}>
                  {selected.nom.charAt(0).toUpperCase()}
                </div>
            }
            <div>
              <p style={{ color:'#f1f5f9', fontSize:18, fontWeight:700, margin:'0 0 4px' }}>{selected.nom}</p>
              <p style={{ color:'#60a5fa', fontSize:13, margin:0 }}>{selected.nom_boutique}</p>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
            {[
              ['Email',        selected.email],
              ['Téléphone',    selected.telephone || '—'],
              ['Adresse',      selected.adresse || '—'],
              ['Statut',       selected.is_active ? '✅ Actif' : '❌ Inactif'],
              ['Inscription',  new Date(selected.created_at).toLocaleDateString('fr-FR')],
            ].map(([k, v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #1e293b' }}>
                <span style={{ color:'#64748b', fontSize:13 }}>{k}</span>
                <span style={{ color:'#e2e8f0', fontSize:13, fontWeight:500 }}>{v}</span>
              </div>
            ))}

            {/* Mot de passe visible par admin */}
            <div style={{ marginTop:16, padding:'14px 16px', background:'#0f172a',
              borderRadius:10, border:'1px solid #ef444430' }}>
              <p style={{ color:'#f87171', fontSize:11, fontWeight:600, margin:'0 0 8px',
                textTransform:'uppercase', letterSpacing:'0.08em' }}>Mot de passe (confidentiel)</p>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <code style={{ color:'#fcd34d', fontSize:18, fontWeight:700, letterSpacing:'0.08em', flex:1 }}>
                  {selected.password_plain || '••••••••'}
                </code>
                <button onClick={() => { navigator.clipboard.writeText(selected.password_plain || '') }}
                  style={{ background:'#1e293b', border:'1px solid #334155', color:'#94a3b8',
                    padding:'4px 10px', borderRadius:6, fontSize:12, cursor:'pointer' }}>
                  Copier
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation suppression */}
      {confirmId && (
        <Modal title="Confirmer la suppression" onClose={() => setConfirmId(null)} width={400}>
          <div style={{ textAlign:'center', padding:'8px 0 20px' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
            <p style={{ color:'#f1f5f9', fontSize:15, marginBottom:8 }}>Supprimer ce gérant ?</p>
            <p style={{ color:'#64748b', fontSize:13 }}>Toutes ses ventes et assignations seront aussi supprimées. Cette action est irréversible.</p>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
            <Btn variant="ghost" onClick={() => setConfirmId(null)}>Annuler</Btn>
            <Btn variant="danger" onClick={() => handleDelete(confirmId)}>Oui, supprimer</Btn>
          </div>
        </Modal>
      )}
    </Layout>
  )
}
