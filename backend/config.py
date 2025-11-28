import os

class Config:
    # Ajusta tu contraseña aquí (root:root1234, etc.)
    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:root1234@127.0.0.1:3306/game_db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.urandom(24) # Para seguridad de sesiones si hiciera falta