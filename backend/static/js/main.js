import { UI } from './ui.js';
import { validateInputs, parseNumeric } from './utils.js';
import { initGame, stopGame, setProfileId, refreshHistory } from './game.js';
import { API } from './api.js';
import { CONFIG } from './config.js';

// Variable local para controlar el bloqueo (Para la documentación)
let isGameRunning = false;  // <--- NUEVO: Control de estado

document.addEventListener('DOMContentLoaded', () => {
    if (UI.elements.maxHint) {
        UI.elements.maxHint.textContent = `Máx: ${CONFIG.LIMIT}x${CONFIG.LIMIT}`;
    }
    loadProfilesIntoUI();
    UI.buildGrid(6, 8, () => UI.toast('¡Dale a Iniciar!'));
    
    // <--- NUEVO: Agregamos el guardián aquí mismo al iniciar
    addSafetyGuards(); 
});

// --- FUNCIONALIDAD DE BLOQUEO (MIDGAMEGUARD) ---
function addSafetyGuards() {
    const inputs = [
        UI.elements.rows, 
        UI.elements.cols, 
        UI.elements.timeInput, 
        UI.elements.difficulty
    ];

    // Esta es la función que debes capturar para tu informe
    const midGameGuard = (e) => {
        if (isGameRunning) {
            e.preventDefault();  // Evita escribir
            e.stopPropagation(); // Evita clics
            UI.toast('⛔ Detén el juego antes de editar');
            return false;
        }
    };

    inputs.forEach(el => {
        // Bloqueamos escritura y clics si el juego corre
        el.addEventListener('keydown', midGameGuard);
        el.addEventListener('mousedown', midGameGuard);
    });
}

// --- Event Listeners del Juego ---

UI.elements.startBtn.addEventListener('click', () => {
    if (!validateInputs({
        rowsInput: UI.elements.rows,
        colsInput: UI.elements.cols,
        timeInput: UI.elements.timeInput,
        errBox: UI.elements.errBox
    })) return;

    const rows = parseNumeric(UI.elements.rows.value);
    const cols = parseNumeric(UI.elements.cols.value);
    const time = parseNumeric(UI.elements.timeInput.value);

    // Activamos el bloqueo
    isGameRunning = true; // <--- NUEVO
    initGame(rows, cols, time);
    
    // Desactivar bloqueo automáticamente al terminar el tiempo
    setTimeout(() => { isGameRunning = false; }, time * 1000);
});

UI.elements.resetBtn.addEventListener('click', () => {
    stopGame();
    isGameRunning = false; // <--- NUEVO: Liberamos el bloqueo
    UI.updateHUD(0, 0);
    
    if (validateInputs({
        rowsInput: UI.elements.rows,
        colsInput: UI.elements.cols,
        timeInput: UI.elements.timeInput
    })) {
        const rows = parseNumeric(UI.elements.rows.value);
        const cols = parseNumeric(UI.elements.cols.value);
        UI.buildGrid(rows, cols, () => UI.toast('¡Dale a Iniciar!'));
    }
});

// Validación en tiempo real (Solo visual)
[UI.elements.rows, UI.elements.cols, UI.elements.timeInput].forEach(el => {
    el.addEventListener('input', () => validateInputs({
        rowsInput: UI.elements.rows,
        colsInput: UI.elements.cols,
        timeInput: UI.elements.timeInput,
        errBox: UI.elements.errBox
    }));
});

// --- Event Listeners de Perfil ---

async function loadProfilesIntoUI() {
    const list = await API.getProfiles();
    if (list) {
        UI.elements.profileSelect.innerHTML = '<option value="">(Seleccionar)</option>';
        list.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.username;
            UI.elements.profileSelect.appendChild(opt);
        });
    }
}

UI.elements.createBtn.addEventListener('click', async () => {
    if (!validateInputs({
        rowsInput: UI.elements.rows,
        colsInput: UI.elements.cols,
        timeInput: UI.elements.timeInput,
        errBox: UI.elements.errBox
    })) return UI.toast('Configuración inválida');

    const id = UI.elements.profileSelect.value;
    const data = {
        username: UI.elements.username.value,
        email: UI.elements.email.value,
        avatar: UI.elements.avatar.value,
        preferences: {
            rows: parseNumeric(UI.elements.rows.value),
            cols: parseNumeric(UI.elements.cols.value),
            time: parseNumeric(UI.elements.timeInput.value),
            difficulty: UI.elements.difficulty.value
        }
    };

    const res = await API.createOrUpdateProfile(id, data);
    if (res) {
        UI.toast('Guardado con éxito');
        loadProfilesIntoUI();
    }
});

UI.elements.profileSelect.addEventListener('change', async () => {
    const id = UI.elements.profileSelect.value;
    setProfileId(id || null);
    
    if (id) {
        const p = await API.getProfile(id);
        if (p) {
            UI.elements.username.value = p.username;
            UI.elements.email.value = p.email;
            UI.elements.avatar.value = p.avatar;
            if (p.preferences) {
                UI.elements.rows.value = p.preferences.rows || 6;
                UI.elements.cols.value = p.preferences.cols || 8;
                UI.elements.timeInput.value = p.preferences.time || 30;
                UI.elements.difficulty.value = p.preferences.difficulty || 'medium';
            }
            refreshHistory();
        }
    }
});

// --- Tema y Pantalla Completa ---
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    UI.elements.themeBtn.textContent = 'Modo Oscuro';
}
UI.elements.themeBtn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    UI.elements.themeBtn.textContent = isLight ? 'Modo Oscuro' : 'Modo Claro';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

UI.elements.fsBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
});