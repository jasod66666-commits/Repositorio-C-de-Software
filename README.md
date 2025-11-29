# 🧩 Atrapa al Copión — **Versión 4.0 (Arquitectura Modular)**

<div align="center">

🎮 **Proyecto Gamificado | Unidad 4 — Desarrollo Modular**
🌐 **Flask + MariaDB + JS ES6 + Arquitectura MVC**
✨ *“Atrapa al Copión antes de que copie el examen…”*

</div>

---

## 👥 **Integrantes — Grupo 5**

| Integrante                        | Código   | Rol                                                      |
| --------------------------------- | -------- | -------------------------------------------------------- |
| **Rodrigo Gutiérrez Lazo**        | 73247464 | 🧠 Arquitectura de Software (Backend Modular + API REST) |
| **Jorge Roland Gutiérrez Loyola** | 73050522 | 🎨 Frontend Developer (UI/UX, Diseño Atómico, Sprites)   |

---

# 🎯 **Descripción General**

**Atrapa al Copión v4.0** es un sistema web educativo gamificado que pone a prueba rapidez y atención.
En esta versión, la aplicación evolucionó de un script monolítico a una **Arquitectura Profesional Modular**, aplicando:

* MVC (Modelo – Vista – Controlador)
* Frontend con JS Módular (ES6)
* Backend con Flask + SQLAlchemy
* Pixel art propio
* Modo light/dark dinámico
* API REST completa

---

# 🚀 **Novedades de la Versión 4.0**

## 🏗️ Backend — Refactorización Profesional

* 📦 **Blueprints:** rutas separadas (`routes.py`)
* 🧩 **Modelos dedicados:** ORM limpio (`models.py`)
* 🔐 **config.py aislado:** variables y credenciales
* 🏭 **Factory Pattern:** `create_app()` para instancias seguras

## 🎨 Frontend — Modularización ES6

* 📁 **JS por responsabilidad:**

  * `api.js` → comunicación backend
  * `game.js` → mecánica del juego
  * `ui.js` → renderizado
  * `utils.js` → validaciones
* 🎨 **CSS modular:** variables, componentes y estilos por vistas
* 🌙 **Motor de temas:** Light/Dark mode con CSS nativo
* 🧱 **Pixel Art renovado:** sprites animados

---

# 🧱 **Estructura del Proyecto**

```
Repositorio-C-de-Software/
├── backend/
│   ├── .venv/               
│   ├── app.py                  
│   ├── config.py               
│   ├── database.py             
│   ├── models.py               
│   ├── routes.py               
│   ├── requirements.txt        
│   │
│   ├── static/                 
│   │   ├── assets/             
│   │   ├── css/                
│   │   └── js/                 
│   │
│   └── templates/              
│       ├── base.html           
│       └── components/         
│
└── README.md               
```

---

# 🛠️ **Guía de Instalación y Ejecución**

## 1️⃣ Crear Base de Datos (MariaDB)

1. Instala **MariaDB + HeidiSQL**
2. Conéctate como root
3. Crea la BD:

```
game_db
```

⚠️ **No crees tablas.** El sistema las genera solo.

---

## 2️⃣ Configurar Entorno Virtual

```bash
cd backend
python -m venv .venv
```

Activar:

**Windows**

```bash
.venv\Scripts\activate
```

**Mac/Linux**

```bash
source .venv/bin/activate
```

Instalar dependencias:

```bash
pip install -r requirements.txt
```

---

## 3️⃣ Configurar Credenciales (config.py)

```python
SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:root1234@127.0.0.1:3306/game_db"
```

---

## 4️⃣ Ejecutar Servidor

```bash
python app.py
```

URL del sistema:
👉 [http://127.0.0.1:5000](http://127.0.0.1:5000)

---

# 🎮 **Cómo Jugar**

* **Crea un perfil** en el panel izquierdo
* Configura: filas, columnas, tiempo
* Presiona **INICIAR**
* Encuentra al 👀 *Copión*
* Evita hacer clic en los alumnos correctos
* Revisa tus resultados y estadísticas

---

# 📡 **Documentación de la API**

| Método | Endpoint             | Descripción       |
| ------ | -------------------- | ----------------- |
| GET    | `/api/perfiles`      | Lista perfiles    |
| POST   | `/api/perfiles`      | Crear perfil      |
| PUT    | `/api/perfiles/<id>` | Actualizar perfil |
| POST   | `/api/scores/<pid>`  | Guardar puntaje   |
| GET    | `/api/scores/<pid>`  | Obtener historial |
| GET    | `/api/leaderboard`   | Top 10 jugadores  |

---

# 🧩 **Requerimientos Implementados**

## ✔️ REQ-01 — Gestión de Perfiles

CRUD de usuarios con validación y persistencia.

## ✔️ REQ-02 — Configuración con Validación

Rangos correctos, inputs reactivos, estilos de error.

## ✔️ REQ-03 — Mecánica del Juego (Core Loop)

Sprites dinámicos, aparición aleatoria, puntaje.

## ✔️ REQ-04 — Persistencia de Puntuaciones

Historial vinculado a cada jugador.

## ✔️ REQ-05 — Estadísticas e Historial

Máximo, promedio, últimos resultados.

## ✔️ REQ-06 — Motor de Temas

Modo Light/Dark con CSS variables.

## ✔️ REQ-07 — Sistema de Notificaciones

Toasts minimalistas integrados.

---

# 🧠 **Defensa Técnica (Para el Docente)**

* Separación limpia entre capas: **Frontend / Backend / DB**
* Backend independiente del HTML → ideal para futura **App Móvil**
* Lógica del juego en cliente → menor latencia, interacción en tiempo real
* ORM SQLAlchemy → integridad referencial garantizada
* Arquitectura escalable, mantenible y documentada

---

<div align="center">

## 🏫 Universidad Continental — 2025

Desarrollo de Software — Unidad 4
**Atrapa al Copión: Arquitectura Modular**

</div>

