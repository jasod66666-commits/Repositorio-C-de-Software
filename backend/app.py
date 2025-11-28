from flask import Flask
from flask_cors import CORS
from database import db
from config import Config
from routes import main_bp

def create_app():
    app = Flask(__name__)
    
    # 1. Cargar configuración
    app.config.from_object(Config)
    
    # 2. Inicializar extensiones
    CORS(app)
    db.init_app(app)
    
    # 3. Registrar Rutas (Blueprint)
    app.register_blueprint(main_bp)
    
    # 4. Crear tablas si no existen
    with app.app_context():
        db.create_all()
        
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)