import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'changez-moi')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'GestionStock2026SuperSecretKeyTresLongue')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///gestion.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = 86400