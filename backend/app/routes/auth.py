from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        for champ in ['nom', 'email', 'password', 'nom_boutique']:
            if not data.get(champ):
                return jsonify({'error': f'Le champ {champ} est requis'}), 400
        
        # Check if email already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Cet email est déjà utilisé'}), 409
        
        # Create new user
        user = User(
            nom          = data['nom'],
            email        = data['email'],
            role         = 'gerant',
            is_active    = True,
            nom_boutique = data['nom_boutique'],
            telephone    = data.get('telephone', ''),
            adresse      = data.get('adresse', ''),
            photo_base64 = data.get('photo_base64', None)
        )
        
        # Set password (now only uses password_hash)
        user.set_password(data['password'])
        
        # Save to database
        db.session.add(user)
        db.session.commit()
        
        # Generate JWT token
        token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'token': token, 
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {str(e)}")
        return jsonify({'error': 'Erreur lors de l\'inscription'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email et mot de passe requis'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Email ou mot de passe incorrect'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Compte désactivé. Contactez l\'administrateur'}), 403
        
        token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'token': token, 
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': 'Erreur lors de la connexion'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    try:
        user = User.query.get_or_404(int(get_jwt_identity()))
        return jsonify(user.to_dict()), 200
    except Exception as e:
        print(f"Get me error: {str(e)}")
        return jsonify({'error': 'Erreur lors de la récupération du profil'}), 500