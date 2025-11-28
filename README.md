🧩 Atrapa al Copión — Edición Modular (Unidad 4)

👥 Integrantes del Grupo 5

Apellidos y Nombres

Código

Rol

Rodrigo Gutiérrez Lazo

73247464

🧠 Arquitectura de Software (Backend Modular + API REST)

Jorge Roland Gutiérrez Loyola

73050522

🎨 Frontend Developer (UI/UX, Diseño Atómico, Sprites)

🎯 Descripción General

Atrapa al Copión (v4.0) es un sistema web educativo gamificado que pone a prueba la atención y velocidad del usuario.

En esta Unidad 4, el proyecto ha evolucionado de un script monolítico a una Arquitectura de Software Profesional basada en módulos. Se ha implementado el patrón MVC (Modelo-Vista-Controlador) adaptado a la web moderna, separando la lógica de negocio (Python/Flask), la persistencia de datos (MariaDB/SQLAlchemy) y la interfaz de usuario (JS Modular ES6 + CSS Variables).

🚀 Novedades de la Versión 4.0 (Arquitectura Modular)

🏗️ Refactorización Backend

Blueprints: Separación de rutas en routes.py para no saturar el app.py.

Modelos Dedicados: Definición de tablas SQL en models.py.

Configuración Aislada: Credenciales de base de datos en config.py.

Factory Pattern: Uso de create_app() para inicializar la aplicación de forma segura.

🎨 Refactorización Frontend

JS Modular (ES6): División lógica en api.js (Red), game.js (Lógica), ui.js (Renderizado) y utils.js (Validaciones).

CSS Modular: Estilos separados por responsabilidad (variables.css, components.css, game.css).

Motor de Temas: Sistema Light/Dark mode basado en variables CSS nativas.

Pixel Art: Nuevos sprites animados y escalables para los personajes.

🧱 Estructura del Proyecto (Árbol de Directorios)

Esta estructura cumple con los estándares de despliegue de Flask:

Repositorio-C-de-Software/
├── backend/
│   ├── .venv/                  # Entorno Virtual Python
│   ├── app.py                  # Entry Point (Punto de arranque)
│   ├── config.py               # Configuración de BD y Claves
│   ├── database.py             # Instancia de SQLAlchemy
│   ├── models.py               # Modelos de Datos (Profile, Score)
│   ├── routes.py               # Controladores (API Endpoints)
│   ├── requirements.txt        # Dependencias (Flask, PyMySQL, etc)
│   │
│   ├── static/                 # Recuros Públicos (Frontend)
│   │   ├── assets/             # Imágenes (Sprites Pixel Art)
│   │   ├── css/                # Hojas de estilo modulares
│   │   └── js/                 # Módulos JavaScript (ES6)
│   │
│   └── templates/              # Vistas HTML (Jinja2)
│       ├── base.html           # Layout Principal
│       └── components/         # Fragmentos reutilizables (Navbar, etc)
│
└── README.md                   # Documentación Técnica


🛠️ Guía de Instalación y Ejecución

Sigue estos pasos estrictamente para levantar el entorno de desarrollo.

1️⃣ Preparación de la Base de Datos

Instala MariaDB y HeidiSQL.

Abre HeidiSQL y conéctate como root (Contraseña sugerida: root1234).

Crea una base de datos vacía llamada game_db.

Nota: No necesitas crear tablas, el sistema las crea automáticamente al iniciar.

2️⃣ Configuración del Entorno Python

Abre tu terminal en la carpeta Repositorio-C-de-Software y ejecuta:

# 1. Entrar a la carpeta del backend
cd backend

# 2. Crear entorno virtual (si no existe)
python -m venv .venv

# 3. Activar entorno
# En Windows:
.venv\Scripts\activate
# En Mac/Linux:
source .venv/bin/activate

# 4. Instalar librerías
pip install -r requirements.txt


3️⃣ Configuración de Credenciales

Abre el archivo backend/config.py y verifica que la contraseña coincida con la de tu MariaDB:

# Ejemplo: usuario 'root' y contraseña 'root1234'
SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:root1234@127.0.0.1:3306/game_db"


4️⃣ Ejecución del Servidor

Con el entorno activado y dentro de la carpeta backend, ejecuta:

python app.py


Deberías ver: Running on http://127.0.0.1:5000.

5️⃣ Jugar

Abre tu navegador (Chrome/Edge) e ingresa a:
👉 http://127.0.0.1:5000

🎮 Manual de Usuario Rápido

Perfil: En el panel izquierdo, crea tu usuario. ¡Es obligatorio para guardar puntajes!

Configuración:

Filas/Columnas: Tamaño del tablero (Min: 2x2).

Tiempo: Duración de la partida (10s - 90s).

Nota: Si pones números inválidos, el borde se pondrá rojo.

Jugar:

Dale a INICIAR.

Busca al estudiante con celular (el Copión) y haz clic.

¡Cuidado! Si haces clic en los que estudian, pierdes puntos.

Resultados: Al terminar, revisa tu historial y estadísticas en el panel derecho.

📡 Documentación de API (Endpoints Principales)

El frontend se comunica con el backend exclusivamente a través de JSON.

Método

Endpoint

Descripción

GET

/api/perfiles

Lista todos los usuarios registrados.

POST

/api/perfiles

Crea un nuevo usuario.

PUT

/api/perfiles/<id>

Actualiza datos o preferencias de un usuario.

POST

/api/scores/<pid>

Guarda el puntaje al terminar la partida.

GET

/api/scores/<pid>

Obtiene el historial de un jugador.

GET

/api/leaderboard

Devuelve el Top 10 de mejores jugadores.

🧩 Detalle de Funcionalidades Implementadas

A continuación, se describen en profundidad las funcionalidades clave del sistema, explicando su propósito, flujo de uso y componentes técnicos involucrados.

1. Gestión de Perfiles de Jugador (REQ-01)

Descripción: Permite a los usuarios crear una identidad única en el juego para guardar su progreso y estadísticas. Los datos se almacenan de forma persistente en la base de datos game_db.

Componentes:

Frontend: Formulario de registro en el panel izquierdo (settings.html), lógica de validación y envío en main.js y api.js.

Backend: Endpoint POST /api/perfiles en routes.py, modelo Profile en models.py.

Base de Datos: Tabla profiles en MariaDB.

Flujo: El usuario ingresa sus datos -> main.js valida -> api.js envía POST -> routes.py recibe y usa SQLAlchemy para guardar -> MariaDB confirma la transacción.

2. Configuración de Partida con Validación (REQ-02)

Descripción: Ofrece al usuario control total sobre la experiencia de juego, permitiendo ajustar la dificultad, el tamaño del tablero y la duración. Incluye un sistema de validación robusto para evitar configuraciones erróneas.

Componentes:

Frontend: Inputs numéricos y selectores en settings.html, lógica de validación en tiempo real en utils.js y main.js, estilos de error en components.css.

Flujo: El usuario modifica un valor -> utils.js verifica rangos -> Si es inválido, aplica estilo .invalid y bloquea el inicio -> Si es válido, habilita el juego.

3. Mecánica del Juego (Core Loop) (REQ-03)

Descripción: El núcleo interactivo del sistema. Genera una grilla dinámica de sprites, controla el tiempo y gestiona la aparición aleatoria del objetivo ("Copión").

Componentes:

Frontend: Lógica del bucle de juego en game.js, renderizado del DOM en ui.js, estilos y animaciones en game.css.

Flujo: Usuario inicia -> ui.js construye la grilla -> game.js inicia temporizador y ciclo de nextCopion -> Usuario interactúa (clic) -> game.js evalúa acierto/fallo y actualiza puntaje.

4. Persistencia de Puntuaciones (REQ-04)

Descripción: Garantiza que el desempeño del jugador quede registrado permanentemente. Al finalizar una partida, el puntaje se envía automáticamente al servidor.

Componentes:

Frontend: Detección de fin de juego en game.js, envío de datos en api.js.

Backend: Endpoint POST /api/scores/<pid> en routes.py, modelo ScoreHistory en models.py.

Base de Datos: Tabla scores en MariaDB (relación 1:N con profiles).

Flujo: Tiempo = 0 -> game.js captura puntaje -> api.js envía POST -> routes.py guarda registro vinculado al perfil -> MariaDB almacena.

5. Visualización de Historial y Estadísticas (REQ-05)

Descripción: Permite al usuario consultar su historial de partidas y ver estadísticas calculadas en tiempo real (puntaje máximo y promedio).

Componentes:

Frontend: Petición de datos en api.js, cálculo matemático y renderizado de lista en game.js y ui.js.

Backend: Endpoint GET /api/scores/<pid> en routes.py.

Flujo: Usuario selecciona perfil -> api.js solicita historial -> routes.py consulta DB y devuelve JSON -> game.js procesa datos, calcula estadísticas y ui.js actualiza la vista.

6. Motor de Temas (Interfaz Adaptativa) (REQ-06)

Descripción: Proporciona un modo claro y oscuro para mejorar la accesibilidad y preferencia del usuario. Utiliza variables CSS nativas para un cambio instantáneo sin recarga.

Componentes:

Frontend: Definición de variables en variables.css, lógica de cambio de clase en main.js.

Flujo: Usuario clic en botón -> main.js alterna clase .light-mode en body y guarda en localStorage -> Navegador repinta interfaz con nuevos valores de variables CSS.

7. Sistema de Notificaciones (Feedback UX) (REQ-07)

Descripción: Informa al usuario sobre el estado de sus acciones (guardado exitoso, errores, advertencias) mediante mensajes flotantes no intrusivos ("Toasts").

Componentes:

Frontend: Función generadora en ui.js, estilos en components.css.

Flujo: Evento ocurre (ej. error de red) -> Código llama a UI.toast('Mensaje') -> ui.js crea elemento DOM -> CSS anima entrada -> setTimeout elimina elemento tras unos segundos.

🧠 Defensa Técnica (Para el Docente)

¿Por qué esta arquitectura?
Hemos desacoplado el sistema para garantizar mantenibilidad y escalabilidad.

El Backend no "sabe" nada de HTML, solo sirve datos JSON y renderiza la plantilla base. Esto permite que en el futuro se pueda cambiar el frontend por una App Móvil sin tocar el servidor.

El Frontend gestiona toda la lógica del juego en el cliente (Client-Side Logic), lo que reduce la latencia al hacer clic, mejorando la experiencia de juego crítica.

La Base de Datos asegura la integridad referencial entre Jugadores y Puntajes mediante llaves foráneas (ForeignKey).

Universidad Continental — 2025