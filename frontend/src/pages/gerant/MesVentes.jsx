import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { PageHeader, Table, Btn } from '../../components/UI'
import { getMesVentes } from '../../api/gerantApi'
import { genererFacture } from '../../components/FacturePDF'
import { useAuth } from '../../context/AuthContext'

export default function MesVentes() {
  const { user }         = useAuth()
  const [ventes, setVentes] = useState([])

  useEffect(() => { getMesVentes().then(r => setVentes(r.data)) }, [])

  const total = ventes.reduce((s, v) => s + v.prix_total, 0)

  const rows = ventes.map(v => [
    <div>
      <p style={{ color:'#e2e8f0', fontSize:13, fontWeight:500, margin:0 }}>{v.numero_facture}</p>
      <p style={{ color:'#475569', fontSize:11, margin:0 }}>{new Date(v.date_vente).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })}</p>
    </div>,
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      {(v.product?.image_base64 || v.product?.image_url) && (
        <img src={v.product.image_base64 || v.product.image_url} alt="" style={{ width:28, height:28, objectFit:'cover', borderRadius:4 }} onError={e => e.target.style.display='none'}/>
      )}
      <span style={{ color:'#e2e8f0', fontSize:13 }}>{v.product?.nom || '—'}</span>
    </div>,
    <div>
      <p style={{ color:'#e2e8f0', fontSize:13, margin:0 }}>{v.client_nom}</p>
      <p style={{ color:'#475569', fontSize:11, margin:0 }}>{v.client_telephone || '—'}</p>
    </div>,
    <span style={{ color:'#60a5fa', fontWeight:600 }}>{v.quantite}</span>,
    <span style={{ color:'#4ade80', fontWeight:700 }}>{(v.prix_total || 0).toLocaleString()} F</span>,
    <Btn size="sm" variant="ghost" onClick={() => genererFacture({
      ...v,
      gerant_nom:       user?.nom,
      gerant_boutique:  user?.nom_boutique,
      gerant_telephone: user?.telephone,
      gerant_adresse:   user?.adresse,
    })}>
      Facture
    </Btn>
  ])

  return (
    <Layout>
      <PageHeader
        title="Mes ventes"
        subtitle={`${ventes.length} vente(s) · Chiffre d'affaires : ${total.toLocaleString()} F`}
      />
      <Table
        headers={['Facture', 'Produit', 'Client', 'Qté', 'Montant', 'Action']}
        rows={rows}
        emptyMsg="Aucune vente enregistrée pour l'instant"
      />
    </Layout>
  )
}
