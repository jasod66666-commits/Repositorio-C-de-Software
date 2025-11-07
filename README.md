# 🧩 Atrapa al Copión — Backend + Base de Datos SQL (Unidad 3)

## 👥 Integrantes del Grupo 5

| Apellidos y Nombres | Código | Rol |
|----------------------|---------|------|
| **Rodrigo Gutiérrez Lazo** | 73247464 | 🧠 Backend principal (Flask + API REST + integración BD SQL) |
| Jorge Roland Gutiérrez Loyola | 73050522 | 🎨 Interfaz y lógica visual (HTML, CSS, JS, UX del juego) |
| Walter Omar Ruiz Garagundo | 73025039 | ----------- |

---

## 🎯 Descripción General

**Atrapa al Copión** es un juego web interactivo que combina memoria, rapidez y lógica.  
En **Unidad 2**, los datos se guardaban en archivos JSON locales.  
En **Unidad 3**, se implementó una **base de datos SQL real (MariaDB)** administrada con **HeidiSQL**, lo que permite persistencia profesional y una arquitectura cliente-servidor completa:

```

Frontend (HTML/JS) ↔ Flask Backend ↔ MariaDB (SQLAlchemy + PyMySQL)

```

---

## 🆕 Cambios Clave en la Unidad 3

- ✅ Reemplazo del sistema JSON por **base de datos SQL real**.  
- ✅ Instalación y configuración de **MariaDB + HeidiSQL**.  
- ✅ Uso de **SQLAlchemy** para mapear modelos `profiles` y `scores`.  
- ✅ Creación automática de tablas y registros persistentes.  
- ✅ Pruebas de conexión, inserción y consultas en HeidiSQL.  
- ✅ Integración sin cambios en el frontend (API estable).  

---

## 🧱 Estructura del Proyecto

```

Repositorio-C-de-Software/
├── backend/
│   ├── app.py                # Backend Flask conectado a MariaDB
│   ├── requirements.txt      # Dependencias del entorno Flask
│   └── .venv/                # Entorno virtual (Python)
│
├── frontend/
│   ├── index.html            # Interfaz visual
│   ├── app.js                # Lógica y conexión con API Flask
│   └── styles.css            # Diseño CSS
│
└── README.md                 # Documentación del proyecto

````

---

## 🖥 Requisitos Previos

- 🐍 **Python 3.10+**
- 🧱 **MariaDB Server** (motor SQL)
- 🪶 **HeidiSQL** (cliente visual)
- 🌐 **Git** (para versionado)
- 💻 *(Opcional)* **Node.js** si quieres levantar el frontend con un servidor local.

---

## 🛠 Instalación de MariaDB y HeidiSQL

### 1️⃣ Instalar MariaDB
- Descarga desde: [https://mariadb.org/download/](https://mariadb.org/download/)
- Instala con:
  - Usuario: `root`
  - Contraseña: `root1234`
  - Puerto: `3306`
  - Marca “Install as service” ✅

### 2️⃣ Verificar instalación
En la terminal:
```bash
mysql -u root -p
````

Si ves `Welcome to the MariaDB monitor...`, está todo correcto.

### 3️⃣ Instalar HeidiSQL

* Descarga desde: [https://www.heidisql.com/download.php](https://www.heidisql.com/download.php)
* Abre HeidiSQL → Crea nueva sesión:

  ```
  Host/IP: 127.0.0.1
  Puerto: 3306
  Usuario: root
  Contraseña: root1234
  ```
* Conéctate.

### 4️⃣ Crear base de datos `game_db`

En HeidiSQL:

1. Clic derecho en el servidor → “Crear nueva base de datos…”
2. Nombre: `game_db`
3. Collation: `utf8mb4_uca1400_ai_ci`
4. Aceptar ✅

---

## ⚙️ Configuración del Backend

### 1️⃣ Entrar a la carpeta

```bash
cd backend
```

### 2️⃣ Crear entorno virtual

```bash
python -m venv .venv
```

### 3️⃣ Activar entorno virtual

Windows:

```bash
.venv\Scripts\activate
```

Si sale error:
```bash
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Volver a escribir

```bash
.venv\Scripts\Activate.ps1
```

### 4️⃣ Instalar dependencias

```bash
pip install -r requirements.txt
```

### 5️⃣ Ejecutar el backend

```bash
python app.py
```

✔ Flask iniciará en `http://localhost:5000`
✔ Las tablas `profiles` y `scores` se crearán automáticamente en `game_db`.

---

## 📦 requirements.txt (final)

```txt
Flask==3.0.3
Flask-Cors==4.0.0
Flask-SQLAlchemy==3.1.1
PyMySQL==1.1.0
```

---

## 🔌 Conexión Flask ↔ MariaDB

En `app.py`:

```python
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:root1234@127.0.0.1:3306/game_db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
```

* `root:root1234` → usuario y contraseña del servidor MariaDB.
* `game_db` → base de datos creada en HeidiSQL.

---

## 🧩 Tablas Automáticas

* **profiles**
  Guarda los datos y estadísticas del jugador.

* **scores**
  Historial de partidas (puntaje, dificultad, resultado, etc.)

Estas tablas se crean solas al ejecutar el backend por primera vez.

---

## 🧠 Endpoints REST Implementados

| Método     | Endpoint             | Descripción               |
| ---------- | -------------------- | ------------------------- |
| **POST**   | `/api/perfiles`      | Crear nuevo perfil        |
| **GET**    | `/api/perfiles`      | Listar perfiles           |
| **GET**    | `/api/perfiles/<id>` | Obtener perfil específico |
| **PATCH**  | `/api/perfiles/<id>` | Actualizar perfil         |
| **DELETE** | `/api/perfiles/<id>` | Eliminar perfil           |
| **POST**   | `/api/scores/<id>`   | Registrar partida         |
| **GET**    | `/api/scores/<id>`   | Ver historial de partidas |
| **GET**    | `/api/leaderboard`   | Mostrar ranking general   |

---

## 🧾 Ejemplo — Crear Perfil

**Request:**

```http
POST /api/perfiles
Content-Type: application/json
```

**Body:**

```json
{
  "username": "Pingoro",
  "email": "pingoro@demo.com",
  "avatar": "😎",
  "preferences": {
    "difficulty": "easy",
    "rows": 6,
    "cols": 8,
    "time": 30
  }
}
```

**Response:**

```json
{
  "id": "b1f2b3c4-d5e6-f7g8",
  "username": "Pingoro",
  "email": "pingoro@demo.com",
  "avatar": "😎",
  "preferences": {
    "difficulty": "easy",
    "rows": 6,
    "cols": 8,
    "time": 30
  },
  "stats": {
    "gamesPlayed": 0,
    "wins": 0,
    "losses": 0,
    "totalScore": 0,
    "bestStreak": 0
  }
}
```

Verifica en HeidiSQL → tabla `profiles` → datos insertados ✅

---

## 🌐 Frontend

1. Abre `frontend/index.html` en tu navegador.
2. Asegúrate que en `app.js` las peticiones apunten a:

   ```js
   const API = "http://localhost:5000";
   ```
3. Crea un jugador, juega, y observa cómo los datos se guardan en `game_db`.

---

## ✅ Checklist de Implementación (Unidad 3)

| Tarea                              | Estado |
| ---------------------------------- | ------ |
| Conexión Flask ↔ MariaDB (PyMySQL) | ✅      |
| Tablas automáticas en `game_db`    | ✅      |
| HeidiSQL funcional y conectado     | ✅      |
| Persistencia SQL en vez de JSON    | ✅      |
| CRUD + Leaderboard + Historial     | ✅      |
| Código limpio sin `storage/`       | ✅      |

---

## 🧠 Defensa ante el Docente

> “En esta Unidad 3 migramos la persistencia de datos a una base SQL real con MariaDB.
> Flask usa SQLAlchemy para manejar las tablas `profiles` y `scores`.
> Cada vez que un jugador se crea o juega, se inserta una fila en la base `game_db`, visible desde HeidiSQL.
> Ya no usamos archivos JSON, sino un sistema cliente-servidor real.”

---

## 📚 Curso y Docente

**Curso:** Construcción de Software — Unidad 3
**Docente:** Rosario Osorio Contreras
**Universidad Continental — Ingeniería de Sistemas e Informática**

---

## 🔗 Repositorio del Proyecto

🔗 [Repositorio-C-de-Software](https://github.com/jasod66666-commits/Repositorio-C-de-Software)
