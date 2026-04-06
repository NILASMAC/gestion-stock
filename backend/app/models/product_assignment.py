from app import db
from datetime import datetime

class ProductAssignment(db.Model):
    """Lien entre un produit et un gérant — assigé par l'admin."""
    __tablename__ = 'product_assignments'

    id          = db.Column(db.Integer, primary_key=True)
    product_id  = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    gerant_id   = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    quantite_assignee = db.Column(db.Integer, default=0)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':               self.id,
            'product_id':       self.product_id,
            'gerant_id':        self.gerant_id,
            'quantite_assignee': self.quantite_assignee,
            'assigned_at':      self.assigned_at.isoformat(),
            'product':          self.product.to_dict() if self.product else None
        }
