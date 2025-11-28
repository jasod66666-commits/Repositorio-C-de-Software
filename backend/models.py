from datetime import datetime
from database import db  # Importamos la db del archivo separado

class Profile(db.Model):
    __tablename__ = "profiles"

    id = db.Column(db.String(64), primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120))
    avatar = db.Column(db.String(255))
    
    # Preferencias
    difficulty = db.Column(db.String(20), default="medium")
    rows = db.Column(db.Integer, default=6)
    cols = db.Column(db.Integer, default=8)
    time = db.Column(db.Integer, default=30)

    # Stats acumuladas
    gamesPlayed = db.Column(db.Integer, default=0)
    wins = db.Column(db.Integer, default=0)
    losses = db.Column(db.Integer, default=0)
    totalScore = db.Column(db.Integer, default=0)
    
    # Relación
    history = db.relationship("ScoreHistory", backref="profile", lazy=True, cascade="all, delete-orphan")

class ScoreHistory(db.Model):
    __tablename__ = "scores"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    profile_id = db.Column(db.String(64), db.ForeignKey("profiles.id"), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    score = db.Column(db.Integer, nullable=False)
    difficulty = db.Column(db.String(20), default="medium")
    result = db.Column(db.String(10), default="loss")

# Helper para convertir a diccionario (JSON)
def profile_to_dict(p):
    return {
        "id": p.id,
        "username": p.username,
        "email": p.email,
        "avatar": p.avatar,
        "preferences": {
            "difficulty": p.difficulty, "rows": p.rows, "cols": p.cols, "time": p.time
        },
        "stats": {
            "gamesPlayed": p.gamesPlayed, "wins": p.wins, "losses": p.losses, "totalScore": p.totalScore
        }
    }