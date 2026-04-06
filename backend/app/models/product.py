from app import db
from datetime import datetime

class Product(db.Model):
    __tablename__ = 'products'

    id            = db.Column(db.Integer, primary_key=True)
    nom           = db.Column(db.String(150), nullable=False)
    reference     = db.Column(db.String(50), unique=True, nullable=False)
    description   = db.Column(db.Text)
    quantite      = db.Column(db.Integer, default=0)
    prix_unitaire = db.Column(db.Float, default=0.0)
    prix_vente    = db.Column(db.Float, default=0.0)
    seuil_alerte  = db.Column(db.Integer, default=5)
    image_base64  = db.Column(db.Text, nullable=True)   # image produit
    image_url     = db.Column(db.String(500), nullable=True)
    categorie     = db.Column(db.String(100), nullable=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    assignments = db.relationship('ProductAssignment', backref='product', lazy=True, cascade='all, delete-orphan')
    ventes      = db.relationship('Vente', backref='product', lazy=True)

    @property
    def stock_bas(self):
        return self.quantite <= self.seuil_alerte

    def to_dict(self):
        return {
            'id': self.id, 'nom': self.nom, 'reference': self.reference,
            'description': self.description, 'quantite': self.quantite,
            'prix_unitaire': self.prix_unitaire, 'prix_vente': self.prix_vente,
            'seuil_alerte': self.seuil_alerte, 'image_base64': self.image_base64,
            'image_url': self.image_url, 'categorie': self.categorie,
            'stock_bas': self.stock_bas, 'created_at': self.created_at.isoformat()
        }
