from flask import Blueprint, request, jsonify, render_template
from database import db
from models import Profile, ScoreHistory, profile_to_dict
from sqlalchemy import func
import uuid

# Creamos el Blueprint
main_bp = Blueprint('main', __name__)

# --- RUTA PARA SERVIR EL HTML ---
@main_bp.route('/')
def index():
    return render_template('base.html')

# --- API PERFILES ---
@main_bp.route("/api/perfiles", methods=["GET", "POST"])
def perfiles_handler():
    # LISTAR TODOS
    if request.method == "GET":
        profiles = Profile.query.all()
        return jsonify([profile_to_dict(p) for p in profiles]), 200

    # CREAR NUEVO
    if request.method == "POST":
        data = request.get_json() or {}
        prefs = data.get("preferences", {}) or {}
        
        new_profile = Profile(
            id=str(uuid.uuid4()),
            username=data.get("username", "Anónimo"),
            email=data.get("email", ""),
            avatar=data.get("avatar", ""),
            difficulty=prefs.get("difficulty", "medium"),
            rows=prefs.get("rows", 6),
            cols=prefs.get("cols", 8),
            time=prefs.get("time", 30)
        )
        db.session.add(new_profile)
        db.session.commit()
        return jsonify(profile_to_dict(new_profile)), 201

@main_bp.route("/api/perfiles/<pid>", methods=["GET", "PUT"])
def perfil_by_id(pid):
    profile = Profile.query.get(pid)
    if not profile:
        return jsonify({"error": "No encontrado"}), 404

    # OBTENER UNO
    if request.method == "GET":
        return jsonify(profile_to_dict(profile)), 200

    # ACTUALIZAR
    if request.method == "PUT":
        data = request.get_json() or {}
        
        # Actualizar datos básicos si vienen
        if "username" in data: profile.username = data["username"]
        if "email" in data: profile.email = data["email"]
        if "avatar" in data: profile.avatar = data["avatar"]
        
        # Actualizar preferencias si vienen
        prefs = data.get("preferences", {})
        if prefs:
            if "rows" in prefs: profile.rows = prefs["rows"]
            if "cols" in prefs: profile.cols = prefs["cols"]
            if "time" in prefs: profile.time = prefs["time"]
            if "difficulty" in prefs: profile.difficulty = prefs["difficulty"]
            
        db.session.commit()
        return jsonify(profile_to_dict(profile)), 200

# --- API SCORES (Resultados) ---
@main_bp.route("/api/scores/<pid>", methods=["POST", "GET"])
def scores_handler(pid):
    profile = Profile.query.get(pid)
    if not profile: return jsonify({"error": "No encontrado"}), 404

    # GUARDAR PUNTAJE
    if request.method == "POST":
        body = request.get_json() or {}
        score_val = int(body.get("score", 0))
        
        # Guardar historial
        partida = ScoreHistory(
            profile_id=pid,
            score=score_val,
            difficulty=body.get("difficulty", "medium"),
            result="win" if score_val > 0 else "loss"
        )
        db.session.add(partida)
        
        # Actualizar estadísticas acumuladas del perfil
        profile.gamesPlayed += 1
        profile.totalScore += score_val
        if score_val > 0:
            profile.wins += 1
        else:
            profile.losses += 1
            
        db.session.commit()
        return jsonify({"success": True}), 201

    # OBTENER HISTORIAL
    if request.method == "GET":
        history = ScoreHistory.query.filter_by(profile_id=pid).order_by(ScoreHistory.timestamp.desc()).all()
        return jsonify([{
            "timestamp": h.timestamp.isoformat(),
            "score": h.score,
            "difficulty": h.difficulty
        } for h in history]), 200

# --- API LEADERBOARD (RANKING) --- <--- ¡AQUÍ ESTÁ EL CÓDIGO QUE FALTABA!
@main_bp.route("/api/leaderboard", methods=["GET"])
def leaderboard():
    # Obtener los top 10 jugadores ordenados por puntaje total
    players = Profile.query.order_by(Profile.totalScore.desc()).limit(10).all()

    data = []
    for p in players:
        # Calcular el puntaje más alto (High Score) individual de este jugador
        # Usamos func.max de SQLAlchemy
        high = db.session.query(func.max(ScoreHistory.score)).filter_by(profile_id=p.id).scalar() or 0

        data.append({
            "id": p.id,
            "username": p.username,
            "totalScore": p.totalScore,
            "highScore": high,
            "difficulty": p.difficulty,
            "gamesPlayed": p.gamesPlayed
        })

    return jsonify(data), 200