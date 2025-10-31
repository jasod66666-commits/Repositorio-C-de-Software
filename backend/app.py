from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from sqlalchemy import func

app = Flask(__name__)

# 🔗 CONEXIÓN A MARIADB
# Ajusta la contraseña root1234 a la que tú pusiste al instalar MariaDB.
# game_db = la base que creaste en HeidiSQL.
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:root1234@127.0.0.1:3306/game_db"

# Evitar warnings innecesarios
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Permitir que tu frontend (localhost) hable con esta API
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Inicializamos el ORM
db = SQLAlchemy(app)


# =============== MODELOS (TABLAS) ===============

class Profile(db.Model):
    __tablename__ = "profiles"

    id = db.Column(db.String(64), primary_key=True)        # UUID
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120))
    avatar = db.Column(db.String(255))

    # preferencias del juego
    difficulty = db.Column(db.String(20), default="medium")
    rows = db.Column(db.Integer, default=6)
    cols = db.Column(db.Integer, default=8)
    time = db.Column(db.Integer, default=30)

    # estadísticas acumuladas
    gamesPlayed = db.Column(db.Integer, default=0)
    wins = db.Column(db.Integer, default=0)
    losses = db.Column(db.Integer, default=0)
    totalScore = db.Column(db.Integer, default=0)
    bestStreak = db.Column(db.Integer, default=0)

    # relación 1:N con partidas jugadas
    history = db.relationship(
        "ScoreHistory",
        backref="profile",
        lazy=True,
        cascade="all, delete-orphan"
    )


class ScoreHistory(db.Model):
    __tablename__ = "scores"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    profile_id = db.Column(db.String(64), db.ForeignKey("profiles.id"), nullable=False)

    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    score = db.Column(db.Integer, nullable=False)
    difficulty = db.Column(db.String(20), default="medium")
    result = db.Column(db.String(10), default="loss")   # "win" o "loss"

    # metadata opcional de la partida
    level_rows = db.Column(db.Integer)
    level_cols = db.Column(db.Integer)
    durationSec = db.Column(db.Integer)


# =============== HELPERS (FORMATO RESPUESTA JSON) ===============

def profile_to_dict(p: Profile):
    return {
        "id": p.id,
        "username": p.username,
        "email": p.email,
        "avatar": p.avatar,
        "preferences": {
            "difficulty": p.difficulty,
            "rows": p.rows,
            "cols": p.cols,
            "time": p.time
        },
        "stats": {
            "gamesPlayed": p.gamesPlayed,
            "wins": p.wins,
            "losses": p.losses,
            "totalScore": p.totalScore,
            "bestStreak": p.bestStreak
        }
    }


# =============== ENDPOINTS: PERFILES ===============

@app.route("/api/perfiles", methods=["GET", "POST"])
def perfiles_handler():
    # LISTAR PERFILES
    if request.method == "GET":
        profiles = Profile.query.all()
        return jsonify([profile_to_dict(p) for p in profiles]), 200

    # CREAR PERFIL
    if request.method == "POST":
        data = request.get_json() or {}
        prefs = data.get("preferences", {}) or {}

        new_profile = Profile(
            id=str(uuid.uuid4()),
            username=data.get("username", "Anónimo"),
            email=data.get("email", ""),
            avatar=data.get("avatar", "🙂"),

            difficulty=prefs.get("difficulty", "medium"),
            rows=prefs.get("rows", 6),
            cols=prefs.get("cols", 8),
            time=prefs.get("time", 30),

            gamesPlayed=0,
            wins=0,
            losses=0,
            totalScore=0,
            bestStreak=0
        )

        db.session.add(new_profile)
        db.session.commit()

        return jsonify(profile_to_dict(new_profile)), 201


@app.route("/api/perfiles/<pid>", methods=["GET", "PATCH", "DELETE"])
def perfil_by_id(pid):
    profile = Profile.query.get(pid)
    if not profile:
        return jsonify({"error": "Perfil no encontrado"}), 404

    # LEER UN PERFIL
    if request.method == "GET":
        return jsonify(profile_to_dict(profile)), 200

    # ACTUALIZAR PERFIL
    if request.method == "PATCH":
        data = request.get_json() or {}

        if "username" in data:
            profile.username = data["username"]
        if "email" in data:
            profile.email = data["email"]
        if "avatar" in data:
            profile.avatar = data["avatar"]

        prefs = data.get("preferences") or data.get("prefs") or {}
        if "difficulty" in prefs:
            profile.difficulty = prefs["difficulty"]
        if "rows" in prefs:
            profile.rows = prefs["rows"]
        if "cols" in prefs:
            profile.cols = prefs["cols"]
        if "time" in prefs:
            profile.time = prefs["time"]

        db.session.commit()
        return jsonify(profile_to_dict(profile)), 200

    # ELIMINAR PERFIL
    if request.method == "DELETE":
        db.session.delete(profile)
        db.session.commit()
        return jsonify({"message": "Perfil eliminado", "id": pid}), 200


# =============== ENDPOINTS: SCORES / HISTORIAL ===============

@app.route("/api/scores/<pid>", methods=["POST", "GET"])
def scores_handler(pid):
    profile = Profile.query.get(pid)
    if not profile:
        return jsonify({"error": "Perfil no encontrado"}), 404

    # REGISTRAR PARTIDA
    if request.method == "POST":
        body = request.get_json() or {}

        score_val = int(body.get("score", 0))
        diff_val = body.get("difficulty", profile.difficulty)
        result_val = "win" if score_val > 0 else "loss"

        # 1. Guardar la partida en tabla scores
        partida = ScoreHistory(
            profile_id=pid,
            score=score_val,
            difficulty=diff_val,
            result=result_val,
            level_rows=body.get("rows"),
            level_cols=body.get("cols"),
            durationSec=body.get("time")
        )
        db.session.add(partida)

        # 2. Actualizar stats acumuladas
        profile.gamesPlayed = (profile.gamesPlayed or 0) + 1
        profile.totalScore = (profile.totalScore or 0) + score_val
        if result_val == "win":
            profile.wins = (profile.wins or 0) + 1
        else:
            profile.losses = (profile.losses or 0) + 1

        # Guardar última dificultad usada
        profile.difficulty = diff_val

        db.session.commit()

        return jsonify(profile_to_dict(profile)), 201

    # OBTENER HISTORIAL DE PARTIDAS
    if request.method == "GET":
        partidas = ScoreHistory.query.filter_by(profile_id=pid).all()
        out = []
        for r in partidas:
            out.append({
                "timestamp": r.timestamp.isoformat(timespec="seconds"),
                "score": r.score,
                "difficulty": r.difficulty,
                "result": r.result
            })
        return jsonify(out), 200


# =============== ENDPOINT: LEADERBOARD ===============

@app.route("/api/leaderboard", methods=["GET"])
def leaderboard():
    # top 10 ordenado por totalScore
    players = Profile.query.order_by(Profile.totalScore.desc()).limit(10).all()

    data = []
    for p in players:
        # mejor score individual (highScore)
        high = db.session.query(func.max(ScoreHistory.score)) \
                         .filter_by(profile_id=p.id).scalar() or 0

        data.append({
            "id": p.id,
            "username": p.username,
            "totalScore": p.totalScore,
            "highScore": high,
            "difficulty": p.difficulty,
            "gamesPlayed": p.gamesPlayed
        })

    return jsonify(data), 200


# =============== ARRANQUE DEL SERVIDOR ===============

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # crea las tablas en MariaDB si no existen
    app.run(debug=True)
