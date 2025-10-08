# Atrapa al Copión — Entrega Unidad 2
# Grupo 5

## Integrantes
- Apellidos, Nombres — Código — Rol
- ...

## Nueva funcionalidad (Unidad 2)
- Persistencia JSON de perfiles
- Preferencias del jugador (difficulty, sound)
- Registro de partidas y Leaderboard
- **CRUD completo** de perfiles (incluye DELETE)

## Requisitos
- Python 3.11+
- Node (opcional para servir el frontend estático)

## Instalación backend
```bash
cd backend
python -m venv .venv
# Windows:
# .venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
python app.py  # http://localhost:5000
```

## Frontend
Abre `frontend/index.html` en un servidor estático o con doble clic.
- En la UI, ajusta **API Base** a `http://localhost:5000`.

## Endpoints
- `GET /api/perfiles`
- `GET /api/perfiles/{id}`
- `POST /api/perfiles`
- `PUT /api/perfiles/{id}`
- `DELETE /api/perfiles/{id}`
- `POST /api/perfiles/{id}/partidas`
- `GET /api/leaderboard`

## Estructura
```
backend/
  app.py
  storage/db.json
frontend/
  index.html
  app.js
docs/
  01_requerimientos.md
```

## Evidencias sugeridas
- Commits descriptivos
- Issues #1 (CRUD), #2 (README)
- Project “Entrega U2” (ToDo / Doing / Done)
- Último commit: "Entrega U2: CRUD completo + README final + evidencias"
