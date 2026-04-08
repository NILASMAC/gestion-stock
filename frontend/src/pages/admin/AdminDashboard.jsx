import { useEffect, useState } from 'react'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js'
import Layout from '../../components/Layout'
import { StatCard, PageHeader } from '../../components/UI'
import { getStats, getGerants } from '../../api/adminApi'
import api from '../../api/axiosConfig'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler)

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#f97316']
const gridColor   = 'rgba(51,65,85,0.6)'
const tickColor   = '#64748b'
const tooltipStyle = { backgroundColor: '#0f172a', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: '#334155', borderWidth: 1 }
const baseScales  = {
  x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 } } },
  y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 } } }
}

const ChartCard = ({ title, sub, legend, children }) => (
  <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', padding: 20 }}>
    <p style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>{title}</p>
    <p style={{ color: '#64748b', fontSize: 12, margin: '0 0 12px' }}>{sub}</p>
    {legend && (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
        {legend.map(l => (
          <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, display: 'inline-block' }} />
            {l.label}
          </span>
        ))}
      </div>
    )}
    <div style={{ position: 'relative', height: 200 }}>{children}</div>
  </div>
)

const Empty = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
    <p style={{ color: '#475569', fontSize: 13 }}>Aucune donnée disponible</p>
  </div>
)

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null)
  const [gerants, setGerants] = useState([])
  const [loading, setLoading] = useState(true)
  
  // États pour les ventes en attente
  const [ventesEnAttente, setVentesEnAttente] = useState([])
  const [loadingVentes, setLoadingVentes] = useState(false)

  useEffect(() => {
    Promise.all([getStats(), getGerants()])
      .then(([sRes, gRes]) => {
        setStats(sRes.data)
        setGerants(gRes.data)
      })
      .finally(() => setLoading(false))
    
    // Charger les ventes en attente
    chargerVentesEnAttente()
  }, [])

  // Fonction pour charger les ventes en attente
  const chargerVentesEnAttente = async () => {
    setLoadingVentes(true)
    try {
      const response = await api.get('/admin/ventes/en-attente')
      setVentesEnAttente(response.data)
    } catch (error) {
      console.error('Erreur chargement ventes:', error)
      if (error.response?.status === 404) {
        console.warn('Endpoint /admin/ventes/en-attente not found')
      }
    } finally {
      setLoadingVentes(false)
    }
  }

  // Fonction pour valider une vente
  const validerVente = async (venteId) => {
    try {
      const response = await api.put(`/admin/ventes/${venteId}/valider`)
      alert('✅ Vente validée avec succès !')
      chargerVentesEnAttente()
      // Rafraîchir les stats
      const statsResponse = await getStats()
      setStats(statsResponse.data)
    } catch (error) {
      console.error('Erreur lors de la validation:', error)
      if (error.response?.data?.error) {
        alert(`Erreur: ${error.response.data.error}`)
      } else if (error.response?.status === 404) {
        alert('Erreur: L\'API de validation n\'est pas disponible. Vérifiez que le backend est à jour.')
      } else {
        alert('Erreur lors de la validation de la vente')
      }
    }
  }

  // Fonction pour rejeter une vente
  const rejeterVente = async (venteId) => {
    if (!confirm('Êtes-vous sûr de vouloir rejeter cette vente ? Le stock sera restauré.')) return
    
    try {
      const response = await api.put(`/admin/ventes/${venteId}/rejeter`)
      alert('❌ Vente rejetée, stock restauré')
      chargerVentesEnAttente()
      // Rafraîchir les stats
      const statsResponse = await getStats()
      setStats(statsResponse.data)
    } catch (error) {
      console.error('Erreur lors du rejet:', error)
      if (error.response?.data?.error) {
        alert(`Erreur: ${error.response.data.error}`)
      } else if (error.response?.status === 404) {
        alert('Erreur: L\'API de rejet n\'est pas disponible. Vérifiez que le backend est à jour.')
      } else {
        alert('Erreur lors du rejet de la vente')
      }
    }
  }

  // Labels dynamiques depuis le backend
  const moisLabels  = stats?.mois_labels        ?? []
  const categories  = stats?.categories         ?? []

  // Données graphique gérants
  const gerantsPar  = stats?.gerants_par_mois   ?? []
  const inactifsPar = stats?.inactifs_par_mois  ?? []

  // Données graphique ventes
  const ventesPar   = stats?.ventes_par_mois    ?? []

  // Données graphique stock
  const stockCat    = stats?.stock_par_categorie ?? []
  const stockColors = categories.map((_, i) => COLORS[i % COLORS.length])

  // Légende dynamique stock
  const legendStock = categories.map((cat, i) => {
    const total = stockCat.reduce((a, b) => a + b, 0)
    const pct   = total > 0 ? Math.round((stockCat[i] / total) * 100) : 0
    return { label: `${cat} ${pct}%`, color: COLORS[i % COLORS.length] }
  })

  // Données graphique alertes
  const alertesCritiques = stats?.alertes_critiques ?? []
  const alertesFaibles   = stats?.alertes_faibles   ?? []

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <p style={{ color: '#64748b', fontSize: 14 }}>Chargement des données...</p>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <PageHeader title="Tableau de bord" subtitle="Vue globale de votre activité" />

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total gérants"     value={stats?.total_gerants  ?? '—'} color="#3b82f6" icon="👥" sub={`${stats?.gerants_actifs ?? 0} actifs`} />
        <StatCard label="Produits en stock" value={stats?.total_produits ?? '—'} color="#10b981" icon="📦" />
        <StatCard label="Ventes totales"    value={stats?.total_ventes   ?? '—'} color="#8b5cf6" icon="📈" />
        <StatCard label="Alertes stock"     value={stats?.alertes_stock  ?? '—'} color="#ef4444" icon="⚠️" sub="Produits en rupture" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 16, marginBottom: 16 }}>

        {/* Gérants actifs/inactifs par mois */}
        <ChartCard
          title="Évolution des gérants"
          sub="6 derniers mois"
          legend={[{ label: 'Actifs', color: '#3b82f6' }, { label: 'Inactifs', color: '#475569' }]}
        >
          {moisLabels.length > 0 ? (
            <Bar
              data={{
                labels: moisLabels,
                datasets: [
                  { label: 'Actifs',   data: gerantsPar,  backgroundColor: '#3b82f6aa', borderRadius: 4 },
                  { label: 'Inactifs', data: inactifsPar, backgroundColor: '#47556980', borderRadius: 4 }
                ]
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: tooltipStyle },
                scales: { ...baseScales, x: { ...baseScales.x, stacked: true }, y: { ...baseScales.y, stacked: true } }
              }}
            />
          ) : <Empty />}
        </ChartCard>

        {/* Répartition stock par catégorie */}
        <ChartCard
          title="Répartition du stock"
          sub="Par catégorie"
          legend={legendStock}
        >
          {categories.length > 0 ? (
            <Doughnut
              data={{
                labels: categories,
                datasets: [{
                  data: stockCat,
                  backgroundColor: stockColors,
                  borderWidth: 0,
                  hoverOffset: 6
                }]
              }}
              options={{
                responsive: true, maintainAspectRatio: false, cutout: '68%',
                plugins: { legend: { display: false }, tooltip: tooltipStyle }
              }}
            />
          ) : <Empty />}
        </ChartCard>

        {/* Volume des ventes par mois */}
        <ChartCard
          title="Volume des ventes"
          sub="6 derniers mois"
          legend={[{ label: 'Ventes', color: '#8b5cf6' }]}
        >
          {moisLabels.length > 0 ? (
            <Line
              data={{
                labels: moisLabels,
                datasets: [{
                  label: 'Ventes',
                  data: ventesPar,
                  borderColor: '#8b5cf6',
                  backgroundColor: '#8b5cf615',
                  borderWidth: 2,
                  pointBackgroundColor: '#8b5cf6',
                  pointRadius: 4,
                  fill: true,
                  tension: 0.4
                }]
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: tooltipStyle },
                scales: baseScales
              }}
            />
          ) : <Empty />}
        </ChartCard>

        {/* Alertes rupture par catégorie */}
        <ChartCard
          title="Alertes rupture de stock"
          sub="Par catégorie"
          legend={[{ label: 'Critique', color: '#ef4444' }, { label: 'Faible', color: '#f97316' }]}
        >
          {categories.length > 0 ? (
            <Bar
              data={{
                labels: categories,
                datasets: [
                  { label: 'Critique', data: alertesCritiques, backgroundColor: '#ef4444bb', borderRadius: 4 },
                  { label: 'Faible',   data: alertesFaibles,   backgroundColor: '#f97316bb', borderRadius: 4 }
                ]
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: tooltipStyle },
                scales: {
                  ...baseScales,
                  x: { ...baseScales.x, stacked: true },
                  y: { ...baseScales.y, stacked: true, beginAtZero: true }
                }
              }}
            />
          ) : <Empty />}
        </ChartCard>

      </div>

      {/* SECTION: Ventes en attente de validation - EN ROUGE */}
      <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', padding: 24, marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, margin: 0 }}>
            ⚠️ Ventes en attente de validation ({ventesEnAttente.length})
          </h2>
          <button 
            onClick={chargerVentesEnAttente}
            style={{
              background: '#3b82f6',
              border: 'none',
              color: 'white',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            🔄 Actualiser
          </button>
        </div>
        
        {loadingVentes ? (
          <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
            Chargement des ventes en attente...
          </p>
        ) : ventesEnAttente.length === 0 ? (
          <div style={{ 
            background: '#0f172a', 
            borderRadius: 10, 
            padding: '30px',
            textAlign: 'center',
            border: '1px solid #1e293b'
          }}>
            <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>
              ✅ Aucune vente en attente de validation
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {ventesEnAttente.map(vente => (
              <div key={vente.id} style={{ 
                background: '#0f172a', 
                borderRadius: 10, 
                border: '2px solid #ef4444',
                padding: '16px',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 12 }}>
                  {/* Informations de la vente */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span style={{ 
                        background: '#ef4444',
                        color: 'white', 
                        padding: '2px 10px', 
                        borderRadius: 20, 
                        fontSize: 11, 
                        fontWeight: 600 
                      }}>
                        ⚠️ EN ATTENTE
                      </span>
                      <span style={{ color: '#f87171', fontSize: 14, fontWeight: 600 }}>
                        {vente.numero_facture}
                      </span>
                      <span style={{ color: '#64748b', fontSize: 12 }}>
                        {new Date(vente.date_vente).toLocaleString()}
                      </span>
                    </div>
                    
                    <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 4px' }}>
                      <strong>Client:</strong> {vente.client_nom} 
                      {vente.client_telephone && ` · ${vente.client_telephone}`}
                    </p>
                    
                    <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 4px' }}>
                      <strong>Gérant:</strong> {vente.gerant_nom} ({vente.gerant_boutique})
                    </p>
                    
                    <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
                      <strong>Produit:</strong> {vente.product?.nom || `ID: ${vente.product_id}`} · 
                      Quantité: {vente.quantite} · 
                      Total: {vente.prix_total?.toLocaleString()} FCFA
                    </p>
                    
                    {vente.note && (
                      <p style={{ color: '#f97316', fontSize: 12, margin: '8px 0 0', fontStyle: 'italic' }}>
                        📝 Note: {vente.note}
                      </p>
                    )}
                  </div>
                  
                  {/* Boutons d'action */}
                  <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                    <button
                      onClick={() => validerVente(vente.id)}
                      style={{
                        background: '#10b981',
                        border: 'none',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      ✅ Valider
                    </button>
                    <button
                      onClick={() => rejeterVente(vente.id)}
                      style={{
                        background: '#ef4444',
                        border: 'none',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      ❌ Rejeter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gérants récents */}
      <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', padding: 24, marginTop: 16 }}>
        <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, margin: '0 0 20px' }}>Gérants récents</h2>
        {gerants.length === 0
          ? <p style={{ color: '#475569', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>Aucun gérant inscrit pour l'instant.</p>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {gerants.slice(0, 5).map(g => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#3b82f620', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                    {g.nom.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 500, margin: '0 0 2px' }}>{g.nom}</p>
                    <p style={{ color: '#475569', fontSize: 12, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.nom_boutique} · {g.email}</p>
                  </div>
                  <span style={{ background: g.is_active ? '#052e1640' : '#450a0a40', color: g.is_active ? '#4ade80' : '#f87171', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, flexShrink: 0 }}>
                    {g.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              ))}
            </div>
        }
      </div>
    </Layout>
  )
}