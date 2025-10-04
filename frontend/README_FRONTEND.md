# Frontend integrado con Backend

Este frontend implementa:
- Formulario de perfil (crear/actualizar) + selector de API.
- Persistencia de **preferencias** (dificultad/sonido) en el backend.
- Registro de **partidas** al finalizar el juego.
- **Leaderboard** en tiempo real.

## Configuración rápida
1. Inicia el backend Flask (CORS activo) en `http://localhost:5000`.
2. Abre `index.html` con Live Server.
3. Ajusta “API Base” si es necesario.
4. Crea o selecciona un perfil y juega.

## Archivos tocados
- `index.html` → nuevo bloque de “Perfil” y “Leaderboard”.
- `app.js` → capa de **API** (fetch), sincronización de partidas, y listeners.
- `styles.css` → estilos mínimos para los nuevos elementos.

_No se rompen_ las funciones ni el estilo del juego original.
