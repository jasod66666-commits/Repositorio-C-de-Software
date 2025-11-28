// Constantes globales del juego
export const CONFIG = {
    LIMIT: window.matchMedia('(max-width: 768px)').matches ? 6 : 15,
    DIFFICULTY_INTERVALS: {
        easy: [900, 1400],
        medium: [650, 1000],
        hard: [380, 650]
    },
    // Intenta leer la URL guardada o usa localhost por defecto
    API_BASE: localStorage.getItem('apiBase') || 'http://localhost:5000'
};