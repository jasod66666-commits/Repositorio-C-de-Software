import os, json, uuid
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
# ✅ Configuración CORS más permisiva para desarrollo local
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# -------------------- Persistencia --------------------
BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, "storage", "db.json")

def read_data():
    if not os.path.exists(DB_PATH):
        return {"perfiles": []}
    try:
        with open(DB_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"perfiles": []}

# Carga a memoria
_data = read_data()
perfiles = _data.get("perfiles", [])

def save_data(data=None):
    global perfiles
    if data is None:
        data = {"perfiles": perfiles}
    else:
        if "perfiles" in data:
            perfiles = data["perfiles"]
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def find_profile(pid):
    return next((p for p in perfiles if str(p.get("id")) == str(pid)), None)

# -------------------- Utilidades de stats --------------------
def ensure_stats(p):
    p.setdefault("stats", {
        "gamesPlayed": 0,
        "wins": 0,
        "losses": 0,
        "totalScore": 0,
        "bestStreak": 0
    })
    p.setdefault("history", [])
    # ✅ Asegurar que preferences existe
    p.setdefault("preferences", {"difficulty": "medium", "sound": True})
    return p

def apply_game_result(p, score, result, level=None, durationSec=None):
    ensure_stats(p)
    s = p["stats"]
    s["gamesPlayed"] = s.get("gamesPlayed", 0) + 1
    s["totalScore"] = s.get("totalScore", 0) + int(score)
    if result == "win":
        s["wins"] = s.get("wins", 0) + 1
    else:
        s["losses"] = s.get("losses", 0) + 1

    p["history"].append({
        "date": datetime.now().isoformat(timespec="seconds"),
        "score": int(score),
        "result": result,
        "level": level,
        "durationSec": durationSec
    })
    p["history"] = p["history"][-50:]

# -------------------- Rutas API --------------------
@app.route("/")
def root():
    return jsonify({"message": "API Atrapa al Copión (OK)", "version": "2.0"}), 200

@app.route("/api/perfiles", methods=["GET"], strict_slashes=False)
def list_perfiles():
    return jsonify(perfiles), 200

@app.route("/api/perfiles", methods=["POST"], strict_slashes=False)
def create_perfil():
    data = request.get_json(silent=True) or {}
    p = {
        "id": data.get("id") or str(uuid.uuid4()),
        "username": data.get("username", "").strip(),
        "email": data.get("email", "").strip(),
        "avatar": data.get("avatar", "👾"),
        "preferences": data.get("preferences") or data.get("prefs") or {
            "difficulty": "medium", 
            "sound": True,
            "rows": 6,
            "cols": 8,
            "time": 30
        },
    }
    ensure_stats(p)
    perfiles.append(p)
    save_data()
    return jsonify(p), 201

@app.route("/api/perfiles/<pid>", methods=["GET", "PUT", "PATCH", "DELETE"], strict_slashes=False)
def perfil_by_id(pid):
    p = find_profile(pid)
    if not p:
        return jsonify({"error": "Perfil no encontrado"}), 404

    if request.method == "GET":
        ensure_stats(p)
        return jsonify(p), 200

    if request.method in ["PUT", "PATCH"]:
        data = request.get_json(silent=True) or {}
        
        # ✅ Actualización completa (PUT) o parcial (PATCH)
        if request.method == "PUT":
            for k in ("username", "email", "avatar", "preferences", "stats", "history"):
                if k in data:
                    p[k] = data[k]
        else:  # PATCH - solo actualiza lo que viene
            if "preferences" in data or "prefs" in data:
                prefs_data = data.get("preferences") or data.get("prefs")
                if "preferences" not in p:
                    p["preferences"] = {}
                p["preferences"].update(prefs_data)
            
            for k in ("username", "email", "avatar"):
                if k in data:
                    p[k] = data[k]
        
        ensure_stats(p)
        save_data()
        return jsonify(p), 200

    if request.method == "DELETE":
        perfiles.remove(p)
        save_data()
        return jsonify({"message": "Perfil eliminado", "id": pid}), 200

# ✅ Endpoint CORRECTO para registrar partidas
@app.route("/api/perfiles/<pid>/partidas", methods=["POST"], strict_slashes=False)
def add_partida(pid):
    p = find_profile(pid)
    if not p:
        return jsonify({"error": "Perfil no encontrado"}), 404
    data = request.get_json(silent=True) or {}
    score = int(data.get("score", 0))
    result = data.get("result", "loss")
    level = data.get("level")
    durationSec = data.get("durationSec")
    apply_game_result(p, score, result, level, durationSec)
    save_data()
    return jsonify(p), 201

# ✅ Alias alternativo para compatibilidad (usa profileId en el body)
@app.route("/api/partidas", methods=["POST"], strict_slashes=False)
def create_partida():
    data = request.get_json(silent=True) or {}
    pid = data.get("profileId")
    if not pid:
        return jsonify({"error": "profileId requerido"}), 400
    p = find_profile(pid)
    if not p:
        return jsonify({"error": "Perfil no encontrado"}), 404
    score = int(data.get("score", 0))
    result = data.get("result", "loss")
    level = data.get("level")
    durationSec = data.get("durationSec")
    apply_game_result(p, score, result, level, durationSec)
    save_data()
    return jsonify(p), 201

# ✅ NUEVO: Endpoint para obtener scores (historial)
@app.route("/api/scores/<pid>", methods=["GET"], strict_slashes=False)
def get_scores(pid):
    """Retorna el historial de partidas con formato compatible"""
    p = find_profile(pid)
    if not p:
        return jsonify({"error": "Perfil no encontrado"}), 404
    ensure_stats(p)
    
    # Transformar history al formato esperado por el frontend
    scores = []
    for entry in p.get("history", []):
        scores.append({
            "timestamp": entry.get("date"),
            "score": entry.get("score", 0),
            "difficulty": p.get("preferences", {}).get("difficulty", "medium"),
            "result": entry.get("result", "loss")
        })
    
    return jsonify(scores), 200

# ✅ NUEVO: Endpoint POST para registrar score (alias mejorado)
@app.route("/api/scores/<pid>", methods=["POST"], strict_slashes=False)
def post_score(pid):
    """Registra un nuevo score en el perfil"""
    p = find_profile(pid)
    if not p:
        return jsonify({"error": "Perfil no encontrado"}), 404
    
    data = request.get_json(silent=True) or {}
    score = int(data.get("score", 0))
    difficulty = data.get("difficulty", "medium")
    result = "win" if score > 0 else "loss"
    
    # Guardar la dificultad en preferences si viene en el request
    if "difficulty" in data:
        if "preferences" not in p:
            p["preferences"] = {}
        p["preferences"]["difficulty"] = difficulty
    
    apply_game_result(p, score, result, 
                     level=data.get("rows"), 
                     durationSec=data.get("time"))
    save_data()
    
    return jsonify({
        "message": "Score registrado",
        "score": score,
        "profile": p
    }), 201

@app.route("/api/historial/<pid>", methods=["GET"], strict_slashes=False)
def get_historial(pid):
    p = find_profile(pid)
    if not p:
        return jsonify({"error": "Perfil no encontrado"}), 404
    ensure_stats(p)
    return jsonify(p.get("history", [])), 200

@app.route("/api/leaderboard", methods=["GET"], strict_slashes=False)
def leaderboard():
    """Retorna top 10 con formato mejorado"""
    enriched = []
    for p in perfiles:
        ensure_stats(p)
        enriched.append({
            "id": p["id"],
            "username": p.get("username", "Anónimo"),
            "totalScore": p["stats"].get("totalScore", 0),
            "highScore": max([h.get("score", 0) for h in p.get("history", [])], default=0),
            "difficulty": p.get("preferences", {}).get("difficulty", "medium"),
            "gamesPlayed": p["stats"].get("gamesPlayed", 0)
        })
    
    top = sorted(enriched, key=lambda x: x["totalScore"], reverse=True)[:10]
    return jsonify(top), 200

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)