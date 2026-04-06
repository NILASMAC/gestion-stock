import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import ImageUpload from '../../components/ImageUpload'
import { PageHeader, Table, Badge, Btn, Modal, Alert, Input, Textarea, Select } from '../../components/UI'
import { getProduits, createProduit, updateProduit, deleteProduit } from '../../api/adminApi'

const CATS = ['Alimentaire','Électronique','Vêtements','Cosmétiques','Boissons','Matériel','Autre']
const EMPTY = { nom:'', reference:'', description:'', quantite:0, prix_unitaire:0, prix_vente:0, seuil_alerte:5, image_base64:'', categorie:'' }

export default function AdminProduits() {
  const [produits, setProduits] = useState([])
  const [modal, setModal]       = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [editing, setEditing]   = useState(null)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [confirmId, setConfirmId] = useState(null)

  const load = () => getProduits().then(r => setProduits(r.data))
  useEffect(() => { load() }, [])

  const set = k => v => setForm(f => ({ ...f, [k]: v }))

  const openAdd  = () => { setForm(EMPTY); setEditing(null); setError(''); setModal('form') }
  const openEdit = (p) => { setForm({ ...p, image_base64: p.image_base64 || '' }); setEditing(p); setError(''); setModal('form') }

  const handleSave = async () => {
    setError('')
    try {
      const d = { ...form, quantite: parseInt(form.quantite), prix_unitaire: parseFloat(form.prix_unitaire), prix_vente: parseFloat(form.prix_vente), seuil_alerte: parseInt(form.seuil_alerte) }
      editing ? await updateProduit(editing.id, d) : await createProduit(d)
      setSuccess(editing ? 'Produit modifié !' : 'Produit créé avec succès !')
      setModal(null); load()
    } catch (e) { setError(e.response?.data?.error || 'Erreur') }
  }

  const handleDelete = async (id) => {
    await deleteProduit(id)
    setConfirmId(null)
    setSuccess('Produit supprimé.')
    load()
  }

  const getImg = (p) => p.image_base64 || p.image_url || null

  const rows = produits.map(p => [
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      {getImg(p)
        ? <img src={getImg(p)} alt="" style={{ width:42, height:42, objectFit:'cover', borderRadius:8, border:'1px solid #334155', flexShrink:0 }}/>
        : <div style={{ width:42, height:42, background:'#1e3a5f', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>📦</div>
      }
      <div>
        <p style={{ color:'#e2e8f0', fontSize:14, fontWeight:500, margin:0 }}>{p.nom}</p>
        <p style={{ color:'#475569', fontSize:12, margin:0 }}>Réf: {p.reference}</p>
      </div>
    </div>,
    <Badge label={p.categorie || 'Non classé'} color="blue" />,
    <span style={{ color: p.stock_bas ? '#f87171' : '#4ade80', fontWeight:600 }}>{p.quantite}</span>,
    <span style={{ color:'#94a3b8', fontSize:13 }}>{(p.prix_unitaire || 0).toLocaleString()} F</span>,
    <span style={{ color:'#4ade80', fontSize:13, fontWeight:600 }}>{(p.prix_vente || 0).toLocaleString()} F</span>,
    <div style={{ display:'flex', gap:8 }}>
      <Btn size="sm" variant="ghost" onClick={() => openEdit(p)}>Modifier</Btn>
      <Btn size="sm" variant="danger" onClick={() => setConfirmId(p.id)}>Supprimer</Btn>
    </div>
  ])

  return (
    <Layout>
      <PageHeader
        title="Produits"
        subtitle={`${produits.length} produit(s) en catalogue`}
        action={<Btn onClick={openAdd}>+ Nouveau produit</Btn>}
      />
      <Alert message={success} type="success" onClose={() => setSuccess('')} />

      <Table
        headers={['Produit', 'Catégorie', 'Stock', 'Prix achat', 'Prix vente', 'Actions']}
        rows={rows}
        emptyMsg="Aucun produit. Ajoutez votre premier produit."
      />

      {/* Modal formulaire produit */}
      {modal === 'form' && (
        <Modal title={editing ? 'Modifier le produit' : 'Nouveau produit'} onClose={() => setModal(null)} width={580}>
          <Alert message={error} onClose={() => setError('')} />

          {/* Upload image locale */}
          <ImageUpload
            label="Photo du produit (depuis votre galerie)"
            value={form.image_base64}
            onChange={set('image_base64')}
            placeholder="Cliquez pour choisir une photo depuis votre appareil"
          />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <div style={{ gridColumn:'1/-1' }}>
              <Input label="Nom du produit" value={form.nom} onChange={set('nom')} required />
            </div>
            <Input label="Référence" value={form.reference} onChange={set('reference')} required disabled={!!editing} />
            <Select label="Catégorie" value={form.categorie} onChange={set('categorie')}
              options={CATS.map(c => ({ value:c, label:c }))} />
            <Input label="Quantité en stock" value={form.quantite} onChange={set('quantite')} type="number" />
            <Input label="Seuil d'alerte" value={form.seuil_alerte} onChange={set('seuil_alerte')} type="number" />
            <Input label="Prix d'achat (F)" value={form.prix_unitaire} onChange={set('prix_unitaire')} type="number" />
            <Input label="Prix de vente (F)" value={form.prix_vente} onChange={set('prix_vente')} type="number" />
            <div style={{ gridColumn:'1/-1' }}>
              <Textarea label="Description" value={form.description} onChange={set('description')} />
            </div>
          </div>

          <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:8 }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Annuler</Btn>
            <Btn onClick={handleSave}>{editing ? 'Enregistrer les modifications' : 'Créer le produit'}</Btn>
          </div>
        </Modal>
      )}

      {/* Modal confirmation suppression */}
      {confirmId && (
        <Modal title="Confirmer la suppression" onClose={() => setConfirmId(null)} width={400}>
          <div style={{ textAlign:'center', padding:'8px 0 20px' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🗑️</div>
            <p style={{ color:'#f1f5f9', fontSize:15, marginBottom:8 }}>Voulez-vous vraiment supprimer ce produit ?</p>
            <p style={{ color:'#64748b', fontSize:13 }}>Cette action est irréversible. Toutes les données associées seront supprimées.</p>
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
