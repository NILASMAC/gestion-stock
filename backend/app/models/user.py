from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'

    id             = db.Column(db.Integer, primary_key=True)
    nom            = db.Column(db.String(100), nullable=False)
    email          = db.Column(db.String(120), unique=True, nullable=False)
    password_hash  = db.Column(db.String(256), nullable=False)
    role           = db.Column(db.String(20), default='gerant')
    is_active      = db.Column(db.Boolean, default=True)
    nom_boutique   = db.Column(db.String(150), nullable=True)
    telephone      = db.Column(db.String(20), nullable=True)
    adresse        = db.Column(db.String(200), nullable=True)
    photo_base64   = db.Column(db.Text, nullable=True)   # photo profil gérant
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)

    produits_assignes = db.relationship('ProductAssignment', backref='gerant', lazy=True, cascade='all, delete-orphan')
    ventes            = db.relationship('Vente', backref='gerant', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self, show_password=False):
        d = {
            'id': self.id, 
            'nom': self.nom, 
            'email': self.email,
            'role': self.role, 
            'is_active': self.is_active,
            'nom_boutique': self.nom_boutique, 
            'telephone': self.telephone,
            'adresse': self.adresse, 
            'photo_base64': self.photo_base64,
            'created_at': self.created_at.isoformat()
        }
        return d