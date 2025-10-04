# Resumen técnico — Integración Frontend ⇄ Backend (rama-rodrigo)

## 1) Backend (Flask) — Servicios expuestos
Base URL por defecto: `http://localhost:5000`

- `GET /` → Estado de la API (mensaje).
- `GET /api/perfiles` → Lista todos los perfiles.
- `GET /api/perfiles/<id>` → Devuelve un perfil por ID.
- `POST /api/perfiles` → Crea un perfil. **JSON requerido**:
  ```json
  {
    "username": "Junior",
    "email": "junior@example.com",
    "avatar": "👾",
    "preferences": { "difficulty": "normal", "sound": true }
  }
  ```
- `PUT /api/perfiles/<id>` → Actualiza campos de un perfil (username, email, avatar, preferences).
- `POST /api/perfiles/<id>/partidas` → Registra una partida y recalcula estadísticas.
  **JSON requerido**:
  ```json
  {
    "score": 200,
    "result": "win",
    "level": 3,
    "durationSec": 120
  }
  ```
- `GET /api/leaderboard` → Top 10 por `stats.totalScore`:
  ```json
  [{ "username": "Junior", "totalScore": 200 }]
  ```

> CORS ya está habilitado en `app.py` con `flask_cors.CORS(app)`.

## 2) Persistencia/Storage
Archivo: `backend/storage/db.json`.

Estructura:
```json
{
  "perfiles": [
    {
      "id": "<uuid4>",
      "username": "Junior",
      "email": "junior@example.com",
      "avatar": "👾",
      "preferences": { "difficulty": "normal", "sound": true },
      "stats": { "gamesPlayed": 1, "wins": 1, "losses": 0, "totalScore": 200, "bestStreak": 1 },
      "history": [
        { "id": "<uuid4>", "date": "2025-10-03T18:13:03Z", "score": 200, "result": "win", "level": 3, "durationSec": 120 }
      ],
      "createdAt": "2025-10-03T18:08:39Z",
      "updatedAt": "2025-10-03T18:13:03Z"
    }
  ]
}
```

## 3) Qué implementé en el **frontend**
- **Formulario de Perfil** (panel izquierdo): seleccionar perfil existente, crear/actualizar (username, email, avatar) y **guardar preferencias** (dificultad/sonido).
- **Sincronización de partidas** al finalizar cada juego (`endGame()`):
  - Envía `score`, `result` (win si puntaje > 0), `level` (easy=1, medium=2, hard=3) y `durationSec` (tiempo total configurado).
  - Actualiza estadísticas del perfil y **recarga el leaderboard**.
- **Leaderboard** (Top 10) visible en el mismo panel.
- **Selector de API Base** para apuntar al backend (por defecto `http://localhost:5000`). Se guarda en `localStorage`.

> El juego original y su estilo **no se modifican**; solo se añaden paneles y llamadas `fetch`.

## 4) Cómo ejecutar
1. **Backend**
   ```bash
   cd backend
   python -m venv .venv && . .venv/bin/activate  # (Windows: .venv\Scripts\activate)
   pip install -r requirements.txt
   python app.py   # escucha en http://localhost:5000
   ```
2. **Frontend**
   - Abre `frontend/index.html` con Live Server (VS Code) o un servidor estático.
   - En “Configuración → API Base”, verifica `http://localhost:5000`.
   - Crea o selecciona un perfil, inicia una partida, y al terminar revisa:
     - **Historial local** (a la derecha).
     - **Estadísticas del perfil** y **Leaderboard** (panel izquierdo).

## 5) Puntos de extensión
- Agregar “sonido” real en UI (el backend ya guarda `preferences.sound`).
- Mostrar historial del backend en un panel separado.
- Botón “Eliminar perfil” (requiere endpoint DELETE si se desea).
