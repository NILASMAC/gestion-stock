import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { PageHeader, Table, Btn } from '../../components/UI'
import { getVentes, getGerants } from '../../api/adminApi'
import { genererFacture } from '../../components/FacturePDF'
import api from '../../api/axiosConfig'

export default function AdminVentes() {
  const [ventes,  setVentes]  = useState([])
  const [gerants, setGerants] = useState([])

  const load = () => {
    getVentes().then(r => setVentes(r.data))
    getGerants().then(r => setGerants(r.data))
  }

  useEffect(() => { load() }, [])

  const total = ventes.filter(v => v.statut === 'validee').reduce((s, v) => s + (v.prix_total || 0), 0)

  const validerVente = async (id) => {
    try {
      await api.put(`/admin/ventes/${id}/valider`)
      load()
    } catch (error) {
      console.error('Erreur lors de la validation:', error)
      alert('Erreur lors de la validation de la vente')
    }
  }

  const rejeterVente = async (id) => {
    try {
      await api.put(`/admin/ventes/${id}/rejeter`)
      load()
    } catch (error) {
      console.error('Erreur lors du rejet:', error)
      alert('Erreur lors du rejet de la vente')
    }
  }

  const telechargerExcel = async () => {
    try {
      const response = await api.get('/gerant/export-excel', {
        responseType: 'blob'
      })
      
      const blob = response.data
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `factures_${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erreur téléchargement Excel:', err)
      if (err.response?.status === 404) {
        alert("Aucune vente enregistrée aujourd'hui")
      } else {
        alert("Erreur lors du téléchargement du fichier Excel")
      }
    }
  }

  const rows = ventes.map(v => {
    const g = gerants.find(g => g.id === v.gerant_id)
    const rejete = v.statut === 'rejetee'
    const valide = v.statut === 'validee'
    const attente = v.statut === 'en_attente'
    const couleur = rejete ? '#ef4444' : '#e2e8f0'

    const rowStyle = rejete
      ? { background: '#450a0a', borderLeft: '4px solid #ef4444' }
      : valide
      ? { background: '#052e1630', borderLeft: '4px solid #22c55e' }
      : { borderLeft: '4px solid #f59e0b' }

    return {
      style: rowStyle,
      cells: [
        <div>
          <p style={{ color: couleur, fontSize: 13, fontWeight: 500, margin: 0 }}>{v.numero_facture}</p>
          <p style={{ color: rejete ? '#f87171' : '#475569', fontSize: 11, margin: '2px 0' }}>
            {new Date(v.date_vente).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
          {rejete && <span style={{ background: '#ef4444', color: 'white', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>REJETÉE</span>}
          {valide && <span style={{ background: '#16a34a', color: 'white', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>VALIDÉE</span>}
          {attente && <span style={{ background: '#d97706', color: 'white', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>EN ATTENTE</span>}
        </div>,
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {(v.product?.image_base64 || v.product?.image_url) && (
            <img 
              src={v.product.image_base64 || v.product.image_url} 
              alt="" 
              style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4 }} 
              onError={e => e.target.style.display = 'none'}
            />
          )}
          <span style={{ color: couleur, fontSize: 13 }}>{v.product?.nom || '—'}</span>
        </div>,
        <div>
          <p style={{ color: couleur, fontSize: 13, margin: 0 }}>{g?.nom_boutique || '—'}</p>
          <p style={{ color: rejete ? '#f87171' : '#475569', fontSize: 11, margin: 0 }}>{g?.nom || ''}</p>
        </div>,
        <div>
          <p style={{ color: couleur, fontSize: 13, margin: 0 }}>{v.client_nom || '—'}</p>
          <p style={{ color: rejete ? '#f87171' : '#475569', fontSize: 11, margin: 0 }}>{v.client_telephone || ''}</p>
        </div>,
        <span style={{ color: rejete ? '#ef4444' : '#60a5fa', fontWeight: 600 }}>{v.quantite}</span>,
        <span style={{ color: rejete ? '#ef4444' : '#4ade80', fontWeight: 700 }}>{(v.prix_total || 0).toLocaleString()} F</span>,
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Btn size="sm" variant="ghost" onClick={() => genererFacture({
            ...v,
            gerant_nom: g?.nom,
            gerant_boutique: g?.nom_boutique,
            gerant_telephone: g?.telephone,
            gerant_adresse: g?.adresse,
          })}>📄 Facture</Btn>
          {attente && <>
            <Btn size="sm" variant="success" onClick={() => validerVente(v.id)}>✅ Valider</Btn>
            <Btn size="sm" variant="danger" onClick={() => rejeterVente(v.id)}>❌ Rejeter</Btn>
          </>}
        </div>
      ]
    }
  })

  return (
    <Layout>
      <PageHeader
        title="Factures reçues"
        subtitle={`${ventes.length} vente(s) · CA validé : ${total.toLocaleString()} F`}
        action={<Btn onClick={telechargerExcel}>📥 Excel du jour</Btn>}
      />
      <Table
        headers={['Facture', 'Produit', 'Boutique', 'Client', 'Qté', 'Montant', 'Actions']}
        rows={rows}
        emptyMsg="Aucune vente enregistrée"
      />
    </Layout>
  )
}