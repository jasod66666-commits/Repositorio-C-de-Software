# 🕹️ Sistema de Gestión de Usuarios – Proyecto Backend

Este proyecto implementa una **API REST con Flask** que permite gestionar perfiles de usuarios, actualizar información y registrar partidas.  
Los datos se guardan de forma persistente en un archivo JSON (`backend/storage/db.json`).

---

## 📌 Instalación y ejecución

1. Clona el repositorio y cambia a la rama de trabajo:
   ```bash
   git clone https://github.com/jasod66666-commits/Repositorio-C-de-Software.git
   cd Repositorio-C-de-Software/backend
   git checkout rama-rodrigo

2. Crea un entorno virtual:

python -m venv .venv

3. Activa el entorno virtual:

En PowerShell:

.venv\Scripts\Activate


En Git Bash:

source .venv/Scripts/activate

4. Instala dependencias:

pip install -r requirements.txt

5. Inicia el servidor:

python app.py

Por defecto el backend estará en:
👉 http://127.0.0.1:5000




## 📌 Endpoints principales (5 servicios)

GET /api/perfiles
## ➡️ Listar todos los perfiles.
Ejemplo respuesta:

[
  { "id": "...", "username": "Junior", "email": "junior@example.com", ... }
]


GET /api/perfiles/<id>
## ➡️ Obtener un perfil por ID.
Ejemplo respuesta:

{
  "id": "12d6...",
  "username": "Junior",
  "email": "junior@example.com",
  "stats": {...},
  "history": []
}


POST /api/perfiles
## ➡️ Crear un nuevo perfil.
Ejemplo request:

{ "username": "Junior", "email": "junior@example.com" }


Ejemplo respuesta:

{ "id": "12d6...", "username": "Junior", "email": "junior@example.com", "stats": {...} }


PUT /api/perfiles/<id>
## ➡️ Actualizar datos del perfil (avatar, preferencias, etc.).
Ejemplo request:

{ "avatar": "🛡️", "preferences": {"difficulty": "hard", "sound": false} }


Ejemplo respuesta:

{ "id": "12d6...", "avatar": "🛡️", "preferences": {"difficulty": "hard","sound": false} }


POST /api/perfiles/<id>/partidas
## ➡️ Registrar una partida y actualizar estadísticas.
Ejemplo request:

{ "score": 200, "result": "win", "level": 3, "durationSec": 120 }


Ejemplo respuesta:

{ "id": "12d6...", "stats": {"gamesPlayed": 1, "wins": 1, "totalScore": 200, ...}, "history": [ {...} ] }

📌 Servicio extra (plus)

GET /api/leaderboard
## ➡️ Ranking de jugadores ordenado por puntaje total.
Ejemplo respuesta:

[
  { "username": "Junior", "totalScore": 200 }
]




🔹 Ejemplos rápidos en PowerShell


# Crear un perfil
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:5000/api/perfiles" -Body (@{username="Junior"; email="junior@example.com"} | ConvertTo-Json) -ContentType "application/json"

# Listar perfiles
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/perfiles"

# Obtener perfil por ID
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/perfiles/<ID>"

# Actualizar perfil
Invoke-RestMethod -Method Put -Uri "http://127.0.0.1:5000/api/perfiles/<ID>" -Body (@{avatar="🛡️"} | ConvertTo-Json) -ContentType "application/json"

# Registrar partida
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:5000/api/perfiles/<ID>/partidas" -Body (@{score=200; result="win"; level=3; durationSec=120} | ConvertTo-Json) -ContentType "application/json"

# Ver leaderboard
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/leaderboard"



📂 Estructura del proyecto
Repositorio-C-de-Software/
│
├── backend/
│   ├── app.py              # Código principal del servidor Flask
│   ├── requirements.txt    # Dependencias del backend
│   └── storage/
│       └── db.json         # Base de datos en formato JSON (persistencia)
│
├── frontend/               # Carpeta para el frontend (si aplica)
├── docs/                   # Documentación adicional
└── README.md               # Este archivo



✅ Estado actual

✔️ CRUD básico de perfiles (crear, leer, actualizar).

✔️ Registro de partidas con estadísticas.

✔️ Persistencia en JSON.

✔️ Leaderboard de jugadores.

Este README documenta los 5 servicios principales solicitados en la práctica, más un servicio extra para el ranking.


---

👉 Con esto tu repositorio ya tiene la **documentación completa y formal** del proyecto.  

¿Quieres que además te prepare un **diagrama en Mermaid** (para que se vea en el README como gráfico de flujo de endpoints)?
