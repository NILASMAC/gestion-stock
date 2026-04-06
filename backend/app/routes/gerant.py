from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, ProductAssignment, Vente, Notification
from datetime import datetime
from app.excel_export import ajouter_vente_excel, get_chemin_fichier_jour
import os

gerant_bp = Blueprint('gerant', __name__)

def current_user():
    return User.query.get(int(get_jwt_identity()))

def generer_numero_facture():
    today = datetime.utcnow().strftime('%Y%m%d')
    count = Vente.query.filter(Vente.numero_facture.like(f'FAC-{today}-%')).count()
    return f'FAC-{today}-{str(count + 1).zfill(4)}'

@gerant_bp.route('/mes-produits', methods=['GET'])
@jwt_required()
def mes_produits():
    user = current_user()
    if user.role != 'gerant':
        return jsonify({'error': 'Accès refusé'}), 403
    assignments = ProductAssignment.query.filter_by(gerant_id=user.id).all()
    return jsonify([a.to_dict() for a in assignments]), 200

@gerant_bp.route('/vendre', methods=['POST'])
@jwt_required()
def vendre():
    user = current_user()
    if user.role != 'gerant':
        return jsonify({'error': 'Accès refusé'}), 403

    data       = request.get_json()
    product_id = data.get('product_id')
    quantite   = int(data.get('quantite', 1))

    if not data.get('client_nom'):
        return jsonify({'error': 'Le nom du client est requis'}), 400

    assignment = ProductAssignment.query.filter_by(product_id=product_id, gerant_id=user.id).first()
    if not assignment:
        return jsonify({'error': 'Produit non assigné à ce gérant'}), 404
    if assignment.quantite_assignee < quantite:
        return jsonify({'error': 'Stock insuffisant'}), 400

    prix_u     = assignment.product.prix_vente
    prix_total = prix_u * quantite
    assignment.quantite_assignee -= quantite

    vente = Vente(
        numero_facture   = generer_numero_facture(),
        product_id       = product_id,
        gerant_id        = user.id,
        quantite         = quantite,
        prix_unitaire    = prix_u,
        prix_total       = prix_total,
        note             = data.get('note', ''),
        client_nom       = data['client_nom'],
        client_telephone = data.get('client_telephone', ''),
        client_adresse   = data.get('client_adresse', ''),
        facture_envoyee  = False,
        statut           = 'en_attente'
    )
    db.session.add(vente)
    db.session.commit()

    # ✅ EXPORT EXCEL AUTOMATIQUE
    try:
        produit = assignment.product
        ajouter_vente_excel(vente, user, produit)
    except Exception as e:
        print(f"Erreur export Excel: {e}")

    return jsonify({
        'message': "Vente enregistrée, en attente de validation par l'administrateur",
        'numero_facture': vente.numero_facture
    }), 201

@gerant_bp.route('/mes-ventes', methods=['GET'])
@jwt_required()
def mes_ventes():
    user = current_user()
    if user.role != 'gerant':
        return jsonify({'error': 'Accès refusé'}), 403

    ventes = Vente.query.filter_by(gerant_id=user.id, statut='validee').order_by(Vente.date_vente.desc()).all()

    result = []
    for v in ventes:
        d = v.to_dict()
        d['gerant_nom']       = user.nom
        d['gerant_boutique']  = user.nom_boutique
        d['gerant_telephone'] = user.telephone
        d['gerant_adresse']   = user.adresse
        result.append(d)
    return jsonify(result), 200

@gerant_bp.route('/mon-profil', methods=['GET'])
@jwt_required()
def mon_profil():
    return jsonify(current_user().to_dict()), 200

# ─── EXPORT EXCEL ─────────────────────────────────────────

@gerant_bp.route('/export-excel', methods=['GET'])
@jwt_required()
def export_excel():
    user = current_user()
    if user.role not in ('gerant', 'admin'):
        return jsonify({'error': 'Accès refusé'}), 403

    chemin = get_chemin_fichier_jour()
    if not os.path.exists(chemin):
        return jsonify({'error': "Aucune vente enregistrée aujourd'hui"}), 404

    return send_file(
        chemin,
        as_attachment=True,
        download_name=f"factures_{datetime.utcnow().strftime('%Y-%m-%d')}.xlsx"
    )

# ─── NOTIFICATIONS ────────────────────────────────────────

@gerant_bp.route('/mes-notifications', methods=['GET'])
@jwt_required()
def mes_notifications():
    user = current_user()
    if user.role != 'gerant':
        return jsonify({'error': 'Accès refusé'}), 403

    notifications = Notification.query.filter_by(user_id=user.id).order_by(Notification.created_at.desc()).all()
    return jsonify([n.to_dict() for n in notifications]), 200

@gerant_bp.route('/notifications/<int:id>/read', methods=['PUT'])
@jwt_required()
def marquer_notification_lue(id):
    user = current_user()
    if user.role != 'gerant':
        return jsonify({'error': 'Accès refusé'}), 403

    notification = Notification.query.filter_by(id=id, user_id=user.id).first_or_404()
    notification.is_read = True
    db.session.commit()
    return jsonify({'message': 'Notification marquée comme lue'}), 200

@gerant_bp.route('/notifications/read-all', methods=['PUT'])
@jwt_required()
def marquer_toutes_notifications_lues():
    user = current_user()
    if user.role != 'gerant':
        return jsonify({'error': 'Accès refusé'}), 403

    Notification.query.filter_by(user_id=user.id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'message': 'Toutes les notifications ont été marquées comme lues'}), 200

@gerant_bp.route('/notifications/non-lues/count', methods=['GET'])
@jwt_required()
def count_notifications_non_lues():
    user = current_user()
    if user.role != 'gerant':
        return jsonify({'error': 'Accès refusé'}), 403

    count = Notification.query.filter_by(user_id=user.id, is_read=False).count()
    return jsonify({'non_lues': count}), 200