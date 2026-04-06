from app import create_app, db
from app.models import User

app = create_app()
with app.app_context():
    # On vérifie si l'admin existe déjà pour éviter une erreur
    if not User.query.filter_by(email="admin@stock.com").first():
        a = User(nom="Admin", email="admin@stock.com", role="admin", is_active=True)
        a.set_password("admin123")
        db.session.add(a)
        db.session.commit()
        print("Félicitations : Utilisateur Admin créé avec succès !")
    else:
        print("L'utilisateur admin existe déjà dans la base.")