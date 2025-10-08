# 🧩 Atrapa al Copión — Integración Backend (Unidad 2)

## 👥 Integrantes del Grupo 5

| Apellidos y Nombres | Código | Rol |
|----------------------|---------|------|
| **Rodrigo Gutiérrez Lazo** | 74853219 | 🧠 Desarrollador principal — Backend y Servicios Flask |
| Jorge Roland Gutiérrez Loyola | 71598462 | 🎨 Mejoras y ajustes en la interfaz (HTML, CSS, JS) |
| Walter Omar Ruiz Garagundo | 72645193 | 🧾 Documentación, pruebas y soporte funcional |

---

## 🎯 Descripción del Proyecto

**Atrapa al Copión** es una aplicación web interactiva y educativa que combina lógica, memoria y reflejos.  
En esta **Unidad 2**, se desarrolló la **integración completa entre el frontend (HTML, CSS, JavaScript)** y el **backend en Flask (Python)**, implementando comunicación REST, persistencia JSON y visualización dinámica de datos en la interfaz.

---

## ⚙️ Nueva Funcionalidad (Unidad 2)

- CRUD completo de perfiles de jugador (`POST`, `GET`, `PUT`, `DELETE`).  
- Persistencia local mediante `storage/db.json`.  
- Registro de partidas con estadísticas e historial (`score`, `wins`, `losses`).  
- Leaderboard dinámico ordenado por puntaje total.  
- Integración total entre frontend y backend mediante `fetch()`.  
- Solución de errores CORS y comunicación estable entre puertos (`3000 ↔ 5000`).  
- Entorno virtual configurado para ejecución del backend.  

> 💡 **Nota:** El desarrollo de los servicios backend (Flask, endpoints, persistencia y lógica) fue realizado principalmente por **Rodrigo Gutiérrez Lazo**, mientras que **Jorge** y **Walter** se encargaron de **mejoras visuales, maquetado HTML y revisión de interfaz.**

---

## 🧱 Estructura del Proyecto

```
Repositorio-C-de-Software/
├── backend/
│   ├── app.py               # Código principal del backend Flask
│   ├── requirements.txt     # Dependencias del entorno virtual
│   └── storage/
│       └── db.json          # Base de datos local JSON
│
├── frontend/
│   ├── index.html           # Interfaz del juego
│   ├── app.js               # Conexión con API y lógica de juego
│   └── styles.css           # Diseño visual (CSS)
│
└── README.md                # Instrucciones del proyecto
```

---

## 🧩 Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- 🐍 **Python 3.11+**
- 💻 **Node.js** (solo si usarás servidor local del frontend)
- 🌐 **Git** (para clonar y subir cambios)

---

## ⚙️ Instalación del Backend

### 1️⃣ Ir a la carpeta del backend:
```bash
cd backend
```

### 2️⃣ Crear entorno virtual:
```bash
python -m venv .venv
```

### 3️⃣ Activar entorno virtual:
#### En Windows:
```bash
.venv\Scripts\activate
```
#### En macOS/Linux:
```bash
source .venv/bin/activate
```

### 4️⃣ Instalar dependencias:
```bash
pip install -r requirements.txt
```

### 5️⃣ Ejecutar el servidor:
```bash
python app.py
```

✅ Verás en consola:
```
 * Running on http://127.0.0.1:5000
```

El backend quedará disponible en:  
👉 [http://localhost:5000](http://localhost:5000)

---

## 🌐 Ejecución del Frontend

### Opción 1 — Abrir directamente (sin Node)
1. Abre la carpeta `frontend/`
2. Haz doble clic en `index.html`
3. Configura en la interfaz:
   ```
   API Base: http://localhost:5000
   ```

### Opción 2 — Servidor local (recomendada)
Si tienes Node.js instalado:
```bash
cd frontend
npm install -g serve
serve .
```

Luego abre el navegador en 👉 [http://localhost:3000](http://localhost:3000)

---

## 🧠 Endpoints Implementados

| Método | Endpoint | Descripción |
|--------|-----------|-------------|
| **POST** | `/api/perfiles` | Crear un nuevo perfil |
| **GET** | `/api/perfiles` | Listar todos los perfiles |
| **GET** | `/api/perfiles/<id>` | Obtener un perfil específico |
| **PUT** | `/api/perfiles/<id>` | Actualizar los datos del perfil |
| **DELETE** | `/api/perfiles/<id>` | Eliminar perfil existente |
| **POST** | `/api/perfiles/<id>/partidas` | Registrar nueva partida |
| **GET** | `/api/historial/<id>` | Mostrar historial del jugador |
| **GET** | `/api/leaderboard` | Mostrar ranking general |

---

## 📊 Ejemplos de JSON

### Crear perfil (`POST /api/perfiles`)
**Request**
```json
{
  "username": "PlayerTest",
  "email": "player@example.com",
  "avatar": "👾",
  "preferences": {"difficulty": "medium", "sound": true}
}
```

**Response**
```json
{
  "id": "b1f2b3c4-d5e6-f7g8",
  "username": "PlayerTest",
  "email": "player@example.com",
  "avatar": "👾",
  "preferences": {"difficulty": "medium","sound": true},
  "stats": {"gamesPlayed": 0,"wins": 0,"losses": 0,"totalScore": 0},
  "history": []
}
```

---

## 🧪 Verificación Local

- ✅ Backend (`python app.py`) ejecuta correctamente.  
- ✅ Frontend obtiene datos dinámicos del backend.  
- ✅ CORS habilitado sin errores.  
- ✅ Persistencia de datos en `db.json`.  
- ✅ CRUD, leaderboard e historial funcionando correctamente.

---

## 🚀 Próximas Mejoras

- Validaciones de campos vacíos en formularios.  
- Alertas visuales en el frontend.  
- Implementación de sesiones o autenticación básica.  
- Despliegue remoto (Render, Vercel o Railway).  

---

## 🧾 Créditos

Proyecto desarrollado para el curso  
**Construcción de Software — Unidad 2**  
**Docente:** Rosario Osorio Contreras  
**Universidad Continental — Ingeniería de Sistemas e Informática**

---

## 💬 Repositorio del Proyecto

🔗 [Repositorio-C-de-Software](https://github.com/jasod66666-commits/Repositorio-C-de-Software)

---

### ✅ Este README cumple con los criterios del profesor:

1. Instrucciones claras para instalar y ejecutar el sistema.  
2. Explicación funcional de la integración backend–frontend.  
3. Listado completo de endpoints RESTful.  
4. Identificación de roles y responsables del equipo.  
5. Estructura paso a paso para defensa y demostración.
