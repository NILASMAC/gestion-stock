# setup_db.py
import os
import psycopg2
from app import create_app, db
from app.models import User, ProductAssignment, Vente, Notification

def setup_database():
    app = create_app()
    with app.app_context():
        # Drop all tables
        db.drop_all()
        print("✅ Dropped all tables")
        
        # Create all tables
        db.create_all()
        print("✅ Created all tables")
        
        # Create admin user
        if not User.query.filter_by(email='admin@stock.com').first():
            admin = User(
                nom='Admin',
                email='admin@stock.com',
                role='admin',
                is_active=True,
                nom_boutique=None
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print("✅ Created admin user")
        
        print("✅ Database setup complete!")

if __name__ == "__main__":
    setup_database()