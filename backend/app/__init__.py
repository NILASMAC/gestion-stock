from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

db      = SQLAlchemy()
migrate = Migrate()
jwt     = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    CORS(app, 
         origins=["*"],
         allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         supports_credentials=True)

    from app.routes.auth   import auth_bp
    from app.routes.admin  import admin_bp
    from app.routes.gerant import gerant_bp

    app.register_blueprint(auth_bp,   url_prefix='/api/auth')
    app.register_blueprint(admin_bp,  url_prefix='/api/admin')
    app.register_blueprint(gerant_bp, url_prefix='/api/gerant')

    return app