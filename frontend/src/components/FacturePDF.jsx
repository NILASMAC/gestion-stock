/**
 * Génère une facture HTML et l'ouvre dans une fenêtre d'impression.
 * Appelé après une vente réussie.
 */
export function genererFacture(vente) {
  const date = new Date(vente.date_vente).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>Facture ${vente.numero_facture}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; color: #1e293b; background: #fff; padding: 40px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; padding-bottom:24px; border-bottom:3px solid #1e3a5f; }
  .brand { display:flex; flex-direction:column; }
  .brand-name { font-size:28px; font-weight:800; color:#1e3a5f; letter-spacing:-0.5px; }
  .brand-sub  { font-size:13px; color:#64748b; margin-top:4px; }
  .facture-info { text-align:right; }
  .facture-num  { font-size:22px; font-weight:700; color:#1e3a5f; }
  .facture-date { font-size:13px; color:#64748b; margin-top:4px; }
  .facture-badge { display:inline-block; background:#dcfce7; color:#166534; padding:3px 12px; border-radius:20px; font-size:12px; font-weight:600; margin-top:8px; }
  .section { margin-bottom:28px; }
  .section-title { font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:12px; }
  .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
  .info-card { background:#f8fafc; border-radius:10px; padding:16px 20px; border:1px solid #e2e8f0; }
  .info-card h3 { font-size:13px; font-weight:700; color:#1e3a5f; margin-bottom:10px; }
  .info-row { display:flex; justify-content:space-between; padding:4px 0; font-size:13px; border-bottom:1px solid #f1f5f9; }
  .info-row:last-child { border:none; }
  .info-label { color:#64748b; }
  .info-value { color:#1e293b; font-weight:500; }
  table { width:100%; border-collapse:collapse; margin-bottom:24px; border-radius:10px; overflow:hidden; }
  thead tr { background:#1e3a5f; }
  thead th { color:#fff; padding:12px 16px; text-align:left; font-size:13px; font-weight:600; }
  tbody tr:nth-child(even) { background:#f8fafc; }
  tbody td { padding:12px 16px; font-size:13px; color:#1e293b; border-bottom:1px solid #f1f5f9; }
  .total-zone { background:#1e3a5f; border-radius:10px; padding:20px 24px; color:#fff; text-align:right; }
  .total-label { font-size:14px; opacity:0.8; margin-bottom:6px; }
  .total-amount { font-size:32px; font-weight:800; letter-spacing:-1px; }
  .total-currency { font-size:16px; font-weight:400; opacity:0.8; margin-left:6px; }
  .footer { margin-top:40px; padding-top:20px; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; font-size:12px; color:#94a3b8; }
  @media print {
    body { padding:20px; }
    .no-print { display:none !important; }
  }
</style>
</head>
<body>

<div class="header">
  <div class="brand">
    <div class="brand-name">StockPro</div>
    <div class="brand-sub">${vente.gerant_boutique || 'Boutique'}</div>
    ${vente.gerant_adresse ? `<div class="brand-sub">${vente.gerant_adresse}</div>` : ''}
    ${vente.gerant_telephone ? `<div class="brand-sub">Tél: ${vente.gerant_telephone}</div>` : ''}
  </div>
  <div class="facture-info">
    <div class="facture-num">${vente.numero_facture}</div>
    <div class="facture-date">${date}</div>
    <div class="facture-badge">✓ Facture transmise à l'admin</div>
  </div>
</div>

<div class="section grid-2">
  <div class="info-card">
    <h3>VENDEUR (GÉRANT)</h3>
    <div class="info-row"><span class="info-label">Nom</span><span class="info-value">${vente.gerant_nom || '—'}</span></div>
    <div class="info-row"><span class="info-label">Boutique</span><span class="info-value">${vente.gerant_boutique || '—'}</span></div>
    <div class="info-row"><span class="info-label">Téléphone</span><span class="info-value">${vente.gerant_telephone || '—'}</span></div>
    <div class="info-row"><span class="info-label">Adresse</span><span class="info-value">${vente.gerant_adresse || '—'}</span></div>
  </div>
  <div class="info-card">
    <h3>CLIENT</h3>
    <div class="info-row"><span class="info-label">Nom</span><span class="info-value">${vente.client_nom}</span></div>
    <div class="info-row"><span class="info-label">Téléphone</span><span class="info-value">${vente.client_telephone || '—'}</span></div>
    <div class="info-row"><span class="info-label">Adresse</span><span class="info-value">${vente.client_adresse || '—'}</span></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Détail de la vente</div>
  <table>
    <thead>
      <tr>
        <th>Produit</th>
        <th>Référence</th>
        <th>Quantité</th>
        <th>Prix unitaire</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>${vente.product?.nom || '—'}</strong><br/><span style="color:#64748b;font-size:11px">${vente.product?.description || ''}</span></td>
        <td>${vente.product?.reference || '—'}</td>
        <td><strong>${vente.quantite}</strong></td>
        <td>${(vente.prix_unitaire || 0).toLocaleString('fr-FR')} F</td>
        <td><strong>${(vente.prix_total || 0).toLocaleString('fr-FR')} F</strong></td>
      </tr>
    </tbody>
  </table>

  <div class="total-zone">
    <div class="total-label">MONTANT TOTAL</div>
    <div><span class="total-amount">${(vente.prix_total || 0).toLocaleString('fr-FR')}</span><span class="total-currency">FCFA</span></div>
  </div>
</div>

${vente.note ? `<div class="section"><div class="section-title">Note</div><div style="background:#f8fafc;border-radius:8px;padding:12px 16px;font-size:13px;color:#475569">${vente.note}</div></div>` : ''}

<div class="footer">
  <span>StockPro — Système de gestion de stock</span>
  <span>Facture générée le ${new Date().toLocaleDateString('fr-FR')}</span>
  <span>${vente.numero_facture}</span>
</div>

<div class="no-print" style="text-align:center;margin-top:30px;display:flex;gap:12px;justify-content:center">
  <button onclick="window.print()" style="padding:12px 32px;background:#1e3a5f;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer">
    Imprimer / Enregistrer PDF
  </button>
  <button onclick="window.close()" style="padding:12px 24px;background:#f1f5f9;color:#1e293b;border:none;border-radius:8px;font-size:15px;cursor:pointer">
    Fermer
  </button>
</div>

</body>
</html>`

  const win = window.open('', '_blank', 'width=850,height=1000')
  win.document.write(html)
  win.document.close()
}
