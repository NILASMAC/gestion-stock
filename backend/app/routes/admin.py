from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from app import db
from app.models import User, Product, ProductAssignment, Vente, Notification
from sqlalchemy import func, extract
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user = User.query.get(int(get_jwt_identity()))
        if not user or user.role != 'admin':
            return jsonify({'error': 'Accès réservé aux administrateurs'}), 403
        return fn(*args, **kwargs)
    return wrapper

# ─── GÉRANTS ──────────────────────────────────────────────

@admin_bp.route('/gerants', methods=['GET'])
@admin_required
def get_gerants():
    gerants = User.query.filter_by(role='gerant').all()
    return jsonify([g.to_dict(show_password=True) for g in gerants]), 200

@admin_bp.route('/gerants/<int:id>', methods=['GET'])
@admin_required
def get_gerant(id):
    g = User.query.filter_by(id=id, role='gerant').first_or_404()
    return jsonify(g.to_dict(show_password=True)), 200

@admin_bp.route('/gerants/<int:id>/toggle', methods=['PUT'])
@admin_required
def toggle_gerant(id):
    g = User.query.filter_by(id=id, role='gerant').first_or_404()
    g.is_active = not g.is_active
    db.session.commit()
    return jsonify({'message': f'Compte {"activé" if g.is_active else "désactivé"}', 'user': g.to_dict(show_password=True)}), 200

@admin_bp.route('/gerants/<int:id>', methods=['DELETE'])
@admin_required
def delete_gerant(id):
    g = User.query.filter_by(id=id, role='gerant').first_or_404()
    db.session.delete(g)
    db.session.commit()
    return jsonify({'message': 'Gérant supprimé avec succès'}), 200

# ─── PRODUITS ─────────────────────────────────────────────

@admin_bp.route('/produits', methods=['GET'])
@admin_required
def get_produits():
    produits = Product.query.all()
    return jsonify([p.to_dict() for p in produits]), 200

@admin_bp.route('/produits', methods=['POST'])
@admin_required
def create_produit():
    data = request.get_json()
    for champ in ['nom', 'reference']:
        if not data.get(champ):
            return jsonify({'error': f'Le champ {champ} est requis'}), 400
    if Product.query.filter_by(reference=data['reference']).first():
        return jsonify({'error': 'Référence déjà utilisée'}), 409
    p = Product(
        nom           = data['nom'],
        reference     = data['reference'],
        description   = data.get('description', ''),
        quantite      = int(data.get('quantite', 0)),
        prix_unitaire = float(data.get('prix_unitaire', 0)),
        prix_vente    = float(data.get('prix_vente', 0)),
        seuil_alerte  = int(data.get('seuil_alerte', 5)),
        image_base64  = data.get('image_base64', None),
        image_url     = data.get('image_url', ''),
        categorie     = data.get('categorie', '')
    )
    db.session.add(p)
    db.session.commit()
    return jsonify(p.to_dict()), 201

@admin_bp.route('/produits/<int:id>', methods=['PUT'])
@admin_required
def update_produit(id):
    p = Product.query.get_or_404(id)
    data = request.get_json()
    p.nom           = data.get('nom', p.nom)
    p.description   = data.get('description', p.description)
    p.quantite      = int(data.get('quantite', p.quantite))
    p.prix_unitaire = float(data.get('prix_unitaire', p.prix_unitaire))
    p.prix_vente    = float(data.get('prix_vente', p.prix_vente))
    p.seuil_alerte  = int(data.get('seuil_alerte', p.seuil_alerte))
    p.categorie     = data.get('categorie', p.categorie)
    if data.get('image_base64'):
        p.image_base64 = data['image_base64']
    if data.get('image_url'):
        p.image_url = data['image_url']
    db.session.commit()
    return jsonify(p.to_dict()), 200

@admin_bp.route('/produits/<int:id>', methods=['DELETE'])
@admin_required
def delete_produit(id):
    p = Product.query.get_or_404(id)
    db.session.delete(p)
    db.session.commit()
    return jsonify({'message': 'Produit supprimé avec succès'}), 200

# ─── ASSIGNATION produit → gérant ────────────────────────

@admin_bp.route('/assigner', methods=['POST'])
@admin_required
def assigner_produit():
    data       = request.get_json()
    product_id = data.get('product_id')
    gerant_id  = data.get('gerant_id')
    quantite   = int(data.get('quantite', 0))

    Product.query.get_or_404(product_id)
    User.query.filter_by(id=gerant_id, role='gerant').first_or_404()

    existing = ProductAssignment.query.filter_by(
        product_id=product_id, gerant_id=gerant_id
    ).first()

    p = Product.query.get(product_id)
    if p.quantite < quantite:
        return jsonify({'error': 'Stock insuffisant pour cette assignation'}), 400

    if existing:
        existing.quantite_assignee += quantite
    else:
        existing = ProductAssignment(
            product_id=product_id,
            gerant_id=gerant_id,
            quantite_assignee=quantite
        )
        db.session.add(existing)

    p.quantite -= quantite
    db.session.commit()
    return jsonify({'message': 'Produit assigné avec succès', 'assignment': existing.to_dict()}), 201

@admin_bp.route('/assignments', methods=['GET'])
@admin_required
def get_assignments():
    assignments = ProductAssignment.query.all()
    return jsonify([a.to_dict() for a in assignments]), 200

# ─── FACTURES / VENTES (version complète) ─────────────────

@admin_bp.route('/ventes', methods=['GET'])
@admin_required
def get_all_ventes():
    ventes = Vente.query.order_by(Vente.date_vente.desc()).all()
    result = []
    for v in ventes:
        d = v.to_dict()
        g = User.query.get(v.gerant_id)
        d['gerant_nom']      = g.nom if g else '—'
        d['gerant_boutique'] = g.nom_boutique if g else '—'
        result.append(d)
    return jsonify(result), 200

@admin_bp.route('/ventes/<int:id>', methods=['GET'])
@admin_required
def get_vente(id):
    v = Vente.query.get_or_404(id)
    d = v.to_dict()
    g = User.query.get(v.gerant_id)
    d['gerant_nom']       = g.nom if g else '—'
    d['gerant_boutique']  = g.nom_boutique if g else '—'
    d['gerant_telephone'] = g.telephone if g else '—'
    d['gerant_adresse']   = g.adresse if g else '—'
    return jsonify(d), 200

# ─── STATISTIQUES (version complète avec graphiques) ──────

@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_stats():
    aujourd_hui = datetime.utcnow()

    # 6 derniers mois
    mois_labels = []
    gerants_par_mois  = []
    inactifs_par_mois = []
    ventes_par_mois   = []

    for i in range(5, -1, -1):
        date_ref = aujourd_hui - timedelta(days=30 * i)
        m, y = date_ref.month, date_ref.year
        mois_labels.append(date_ref.strftime('%b'))

        gerants_par_mois.append(
            User.query.filter(
                User.role == 'gerant',
                User.is_active == True,
                extract('month', User.created_at) <= m,
                extract('year',  User.created_at) <= y
            ).count()
        )
        inactifs_par_mois.append(
            User.query.filter(
                User.role == 'gerant',
                User.is_active == False,
                extract('month', User.created_at) <= m,
                extract('year',  User.created_at) <= y
            ).count()
        )
        ventes_par_mois.append(
            Vente.query.filter(
                extract('month', Vente.date_vente) == m,
                extract('year',  Vente.date_vente) == y
            ).count()
        )

    # Stock par catégorie
    stock_cat = db.session.query(
        Product.categorie,
        func.sum(Product.quantite)
    ).group_by(Product.categorie).all()

    categories          = [row[0] or 'Non défini' for row in stock_cat]
    stock_par_categorie = [int(row[1] or 0) for row in stock_cat]

    # Alertes par catégorie
    alertes_critiques = []
    alertes_faibles   = []
    for cat in categories:
        alertes_critiques.append(
            Product.query.filter(
                Product.categorie == cat,
                Product.quantite <= Product.seuil_alerte
            ).count()
        )
        alertes_faibles.append(
            Product.query.filter(
                Product.categorie == cat,
                Product.quantite > Product.seuil_alerte,
                Product.quantite <= Product.seuil_alerte * 2
            ).count()
        )

    chiffre_affaires = db.session.query(func.sum(Vente.prix_total)).scalar() or 0

    return jsonify({
        # Stats de base
        'total_gerants':     User.query.filter_by(role='gerant').count(),
        'gerants_actifs':    User.query.filter_by(role='gerant', is_active=True).count(),
        'total_produits':    Product.query.count(),
        'total_ventes':      Vente.query.count(),
        'chiffre_affaires':  round(chiffre_affaires, 2),
        'alertes_stock':     Product.query.filter(Product.quantite <= Product.seuil_alerte).count(),

        # Données pour graphiques
        'mois_labels':          mois_labels,
        'gerants_par_mois':     gerants_par_mois,
        'inactifs_par_mois':    inactifs_par_mois,
        'ventes_par_mois':      ventes_par_mois,
        'categories':           categories,
        'stock_par_categorie':  stock_par_categorie,
        'alertes_critiques':    alertes_critiques,
        'alertes_faibles':      alertes_faibles,
    }), 200

# ─── VALIDATION DES VENTES ─────────────────────────────────

@admin_bp.route('/ventes/en-attente', methods=['GET'])
@admin_required
def get_ventes_en_attente():
    """Récupère toutes les ventes en attente de validation"""
    ventes = Vente.query.filter_by(statut='en_attente').order_by(Vente.date_vente.asc()).all()
    result = []
    for v in ventes:
        d = v.to_dict()
        g = User.query.get(v.gerant_id)
        d['gerant_nom']      = g.nom if g else '—'
        d['gerant_boutique'] = g.nom_boutique if g else '—'
        d['gerant_telephone'] = g.telephone if g else '—'
        result.append(d)
    return jsonify(result), 200

@admin_bp.route('/ventes/<int:id>/valider', methods=['PUT'])
@admin_required
def valider_vente(id):
    """Valide une vente (l'admin confirme)"""
    vente = Vente.query.get_or_404(id)
    
    if vente.statut != 'en_attente':
        return jsonify({'error': 'Cette vente a déjà été traitée'}), 400
    
    vente.statut = 'validee'
    vente.facture_envoyee = True
    db.session.commit()
    
    return jsonify({
        'message': 'Vente validée avec succès',
        'vente': vente.to_dict()
    }), 200

@admin_bp.route('/ventes/<int:id>/rejeter', methods=['PUT'])
@admin_required
def rejeter_vente(id):
    """Rejette une vente et remet le stock avec notification au gérant"""
    vente = Vente.query.get_or_404(id)
    
    if vente.statut != 'en_attente':
        return jsonify({'error': 'Cette vente a déjà été traitée'}), 400
    
    # Remettre le stock au gérant
    assignment = ProductAssignment.query.filter_by(
        product_id=vente.product_id, 
        gerant_id=vente.gerant_id
    ).first()
    
    if assignment:
        assignment.quantite_assignee += vente.quantite
    
    vente.statut = 'rejetee'
    
    # Créer une notification pour le gérant
    notification = Notification(
        user_id=vente.gerant_id,
        message=f"❌ Votre vente N°{vente.numero_facture} du {vente.date_vente.strftime('%d/%m/%Y')} a été REJETÉE par l'administrateur.",
        type='error'
    )
    db.session.add(notification)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Vente rejetée, stock restauré et notification envoyée au gérant',
        'notification_envoyee': True
    }), 200

@admin_bp.route('/ventes/toutes', methods=['GET'])
@admin_required
def get_all_ventes_complete():
    """L'admin voit toutes les ventes (quel que soit le statut)"""
    ventes = Vente.query.order_by(Vente.date_vente.desc()).all()
    result = []
    for v in ventes:
        d = v.to_dict()
        g = User.query.get(v.gerant_id)
        d['gerant_nom']      = g.nom if g else '—'
        d['gerant_boutique'] = g.nom_boutique if g else '—'
        d['gerant_telephone'] = g.telephone if g else '—'
        result.append(d)
    return jsonify(result), 200