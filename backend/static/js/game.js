import { CONFIG } from './config.js';
import { UI } from './ui.js';
import { rnd, nowTime } from './utils.js';
import { API } from './api.js';

// Estado interno del juego
const State = {
    running: false,
    score: 0,
    timeLeft: 30,
    rows: 6,
    cols: 8,
    currentIndex: -1,
    profileId: null,
    timers: { tick: null, next: null }
};

// --- Lógica del Juego ---

export function initGame(rows, cols, time) {
    State.rows = rows;
    State.cols = cols;
    State.timeLeft = time;
    State.score = 0;
    State.running = true;

    // UI Inicial
    UI.updateHUD(0, time);
    
    // Callback para cuando el usuario hace click en una celda
    UI.buildGrid(rows, cols, (idx, cell) => handleCellClick(idx, cell));

    // Timers
    clearInterval(State.timers.tick);
    clearTimeout(State.timers.next);
    
    State.timers.tick = setInterval(tick, 1000);
    nextCopion();
}

export function stopGame() {
    State.running = false;
    clearInterval(State.timers.tick);
    clearTimeout(State.timers.next);
    if (State.currentIndex >= 0) UI.hideCopion(State.currentIndex);
}

function tick() {
    State.timeLeft--;
    UI.updateHUD(State.score, State.timeLeft);
    if (State.timeLeft <= 0) endGame();
}

function nextCopion() {
    if (!State.running) return;
    
    // Calcular dificultad
    const difficulty = UI.elements.difficulty.value;
    const [min, max] = CONFIG.DIFFICULTY_INTERVALS[difficulty] || CONFIG.DIFFICULTY_INTERVALS.medium;
    
    // Mover copion
    const idx = rnd(State.rows * State.cols);
    if (State.currentIndex >= 0) UI.hideCopion(State.currentIndex);
    
    State.currentIndex = idx;
    UI.showCopion(idx);
    
    // Programar siguiente
    clearTimeout(State.timers.next);
    State.timers.next = setTimeout(nextCopion, Math.floor(Math.random() * (max - min + 1)) + min);
}

function handleCellClick(idx, cell) {
    if (!State.running) {
        UI.toast('¡Presiona Iniciar primero!');
        return;
    }

    if (idx === State.currentIndex) {
        // Acierto
        State.score++;
        UI.hideCopion(idx);
        UI.showTrail(idx);
        State.currentIndex = -1;
        
        // Forzar siguiente inmediato
        clearTimeout(State.timers.next);
        nextCopion();
    } else {
        // Fallo
        State.score = Math.max(0, State.score - 1);
        UI.showMiss(cell);
    }
    
    UI.updateHUD(State.score, State.timeLeft);
}

async function endGame() {
    stopGame();
    UI.toast(`¡Fin del juego! Puntaje: ${State.score}`);
    
    // Guardar en historial local (visual)
    const li = document.createElement('li');
    li.textContent = `${nowTime()} -> ${State.score} pts`;
    UI.elements.historyList.appendChild(li);

    // Guardar en Base de Datos
    if (State.profileId) {
        await API.sendScore(State.profileId, {
            score: State.score,
            difficulty: UI.elements.difficulty.value
        });
        // Recargar historial desde BD
        refreshHistory();
    }
}

// --- Gestión de Perfil en el Juego ---
export function setProfileId(id) {
    State.profileId = id;
}

export async function refreshHistory() {
    if (!State.profileId) return;
    const scores = await API.getScores(State.profileId);
    if (scores) {
        UI.elements.historyList.innerHTML = '';
        scores.forEach(s => {
            const li = document.createElement('li');
            li.textContent = `${new Date(s.timestamp).toLocaleTimeString()} -> ${s.score} (${s.difficulty})`;
            UI.elements.historyList.appendChild(li);
        });
        
        // Stats box
        if (scores.length > 0) {
            const max = Math.max(...scores.map(s => s.score));
            const avg = (scores.reduce((a, b) => a + b.score, 0) / scores.length).toFixed(1);
            UI.elements.statsBox.innerHTML = `<p>Max: <b>${max}</b> | Prom: <b>${avg}</b></p>`;
        } else {
            UI.elements.statsBox.innerHTML = 'Sin partidas.';
        }
    }
}