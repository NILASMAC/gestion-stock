from app import db
from datetime import datetime

class Vente(db.Model):
    __tablename__ = 'ventes'

    id              = db.Column(db.Integer, primary_key=True)
    numero_facture  = db.Column(db.String(20), unique=True, nullable=False)
    product_id      = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    gerant_id       = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    quantite        = db.Column(db.Integer, nullable=False)
    prix_unitaire   = db.Column(db.Float, nullable=False)
    prix_total      = db.Column(db.Float, nullable=False)
    note            = db.Column(db.String(200))
    # Informations client
    client_nom      = db.Column(db.String(100), nullable=False)
    client_telephone= db.Column(db.String(30), nullable=True)
    client_adresse  = db.Column(db.String(200), nullable=True)
    # Statut facture
    facture_envoyee = db.Column(db.Boolean, default=True)
    date_vente      = db.Column(db.DateTime, default=datetime.utcnow)
    # NOUVEAU CHAMP : Statut de validation par l'admin
    statut          = db.Column(db.String(20), default='en_attente')  # en_attente, validee, rejetee

    def to_dict(self):
        return {
            'id': self.id, 'numero_facture': self.numero_facture,
            'product_id': self.product_id, 'gerant_id': self.gerant_id,
            'quantite': self.quantite, 'prix_unitaire': self.prix_unitaire,
            'prix_total': self.prix_total, 'note': self.note,
            'client_nom': self.client_nom, 'client_telephone': self.client_telephone,
            'client_adresse': self.client_adresse, 'facture_envoyee': self.facture_envoyee,
            'date_vente': self.date_vente.isoformat(), 'statut': self.statut,
            'product': self.product.to_dict() if self.product else None,
        }


# ========== CLASSE NOTIFICATION (BIEN DÉSINDENTÉE) ==========

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.String(500), nullable=False)
    type = db.Column(db.String(50), default='warning')  # 'warning', 'error', 'success', 'info'
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relation
    user = db.relationship('User', backref='notifications')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat()
        }