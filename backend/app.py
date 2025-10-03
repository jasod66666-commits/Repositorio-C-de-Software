import json, os
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, UTC
from uuid import uuid4

app = Flask(__name__)
CORS(app)

DB_FILE = os.path.join("storage", "db.json")

# -------- Funciones de persistencia ----------
def load_data():
    if not os.path.exists(DB_FILE):
        return {"perfiles": []}
    with open(DB_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {"perfiles": []}

def save_data(data):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# -------- Base de datos (archivo JSON) ----------
db = load_data()
perfiles = db["perfiles"]

# -------- Helpers ----------
def find_profile(pid):
    return next((p for p in perfiles if p["id"] == pid), None)

def current_time():
    return datetime.now(UTC).isoformat()

# -------- Endpoints ----------
@app.route("/", methods=["GET"])
def home():
    return {"message": "API de gestión de usuarios con persistencia JSON 🚀"}

# 1) GET: listar perfiles
@app.route("/api/perfiles", methods=["GET"])
def get_perfiles():
    return jsonify(perfiles)

# 2) GET: obtener un perfil por ID
@app.route("/api/perfiles/<string:pid>", methods=["GET"])
def get_perfil(pid):
    perfil = find_profile(pid)
    if perfil:
        return jsonify(perfil)
    return jsonify({"error": "Perfil no encontrado"}), 404

# 3) POST: crear perfil
@app.route("/api/perfiles", methods=["POST"])
def create_perfil():
    data = request.get_json()
    if not data or "username" not in data or "email" not in data:
        return jsonify({"error": "username y email son requeridos"}), 400
    
    perfil = {
        "id": str(uuid4()),
        "username": data["username"],
        "email": data["email"],
        "avatar": data.get("avatar", "👾"),
        "preferences": data.get("preferences", {"difficulty": "normal", "sound": True}),
        "stats": {"gamesPlayed": 0, "wins": 0, "losses": 0, "totalScore": 0, "bestStreak": 0},
        "history": [],
        "createdAt": current_time(),
        "updatedAt": current_time()
    }
    perfiles.append(perfil)
    save_data({"perfiles": perfiles})   # guardar en JSON
    return jsonify(perfil), 201

# 4) PUT: actualizar perfil
@app.route("/api/perfiles/<string:pid>", methods=["PUT"])
def update_perfil(pid):
    perfil = find_profile(pid)
    if not perfil:
        return jsonify({"error": "Perfil no encontrado"}), 404
    
    data = request.get_json()
    if "avatar" in data:
        perfil["avatar"] = data["avatar"]
    if "preferences" in data:
        perfil["preferences"] = data["preferences"]
    perfil["updatedAt"] = current_time()
    
    save_data({"perfiles": perfiles})   # guardar cambios
    return jsonify(perfil)

# 5) POST: registrar partida y actualizar stats
@app.route("/api/perfiles/<string:pid>/partidas", methods=["POST"])
def add_partida(pid):
    perfil = find_profile(pid)
    if not perfil:
        return jsonify({"error": "Perfil no encontrado"}), 404
    
    data = request.get_json()
    if not data or "score" not in data or "result" not in data:
        return jsonify({"error": "score y result son requeridos"}), 400
    
    partida = {
        "id": str(uuid4()),
        "date": current_time(),
        "score": data["score"],
        "result": data["result"],  # "win" o "loss"
        "level": data.get("level", 1),
        "durationSec": data.get("durationSec", 0)
    }
    perfil["history"].append(partida)
    
    # actualizar estadísticas
    perfil["stats"]["gamesPlayed"] += 1
    if data["result"] == "win":
        perfil["stats"]["wins"] += 1
    else:
        perfil["stats"]["losses"] += 1
    perfil["stats"]["totalScore"] += data["score"]
    
    # actualizar mejor racha
    streak = 0
    best = perfil["stats"]["bestStreak"]
    for h in reversed(perfil["history"]):
        if h["result"] == "win":
            streak += 1
            best = max(best, streak)
        else:
            break
    perfil["stats"]["bestStreak"] = best
    
    perfil["updatedAt"] = current_time()
    save_data({"perfiles": perfiles})   # guardar partida
    return jsonify(perfil)

# Extra: Leaderboard
@app.route("/api/leaderboard", methods=["GET"])
def leaderboard():
    top = sorted(perfiles, key=lambda p: p["stats"]["totalScore"], reverse=True)
    return jsonify([{"username": p["username"], "totalScore": p["stats"]["totalScore"]} for p in top[:10]])

if __name__ == "__main__":
    app.run(debug=True, port=5000)
