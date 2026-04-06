from app import create_app, db
from app.models import User

app = create_app()
with app.app_context():
    db.create_all()
    if not User.query.filter_by(email="admin@stock.com").first():
        a = User(nom="Admin", email="admin@stock.com", role="admin", is_active=True)
        a.set_password("admin123")
        db.session.add(a)
        db.session.commit()
        print("Admin créé avec succès !")
    else:
        print("Admin existe déjà.")