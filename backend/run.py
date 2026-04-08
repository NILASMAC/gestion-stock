from app import create_app, db
import os

app = create_app()

# Fix PostgreSQL URL for Render
database_url = os.environ.get('DATABASE_URL')
if database_url and database_url.startswith('postgres://'):
    os.environ['DATABASE_URL'] = database_url.replace('postgres://', 'postgresql://', 1)
    # Update app config if needed
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']

# Create all database tables
with app.app_context():
    db.create_all()
    print("✅ Database tables created/verified")
    
    # Optional: Create admin user if not exists
    from app.models import User
    if not User.query.filter_by(email='admin@stock.com').first():
        admin = User(
            nom='Admin',
            email='admin@stock.com',
            role='admin',
            is_active=True
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin user created")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)