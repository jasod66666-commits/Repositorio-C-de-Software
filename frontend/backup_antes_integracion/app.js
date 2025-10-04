/**
 * =====================================================================
 * ATRAPA AL COPIÓN — EDICIÓN NIÑOS (REFACTORIZADO)
 * ---------------------------------------------------------------------
 * OBJETIVO:
 *  - Mejor legibilidad, orden y mantenibilidad.
 *  - Eliminar código muerto y duplicaciones.
 *  - Añadir anotaciones completas para cada bloque.
 *
 * FUNCIONALIDAD CLAVE (conservada):
 *  - Grilla dinámica rows×cols
 *  - Copión visible (emoji 👀) que salta según dificultad
 *  - Rastro (👀) al atrapar que desaparece en 2s
 *  - Cronómetro y puntaje
 *  - Entradas permisivas (letras permitidas) con validación por globos
 *  - Modo claro/oscuro con alto contraste en la grilla
 *  - Aviso si se clickea la grilla sin iniciar
 *  - Historial simple en sesión
 *  - Pantalla completa
 * =====================================================================
 */

(() => {
  'use strict';

// ====================================================================
// 0) ANIMACIÓN DE ENTRADA GLOBAL
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Pequeño retardo para permitir transiciones de entrada
  document.body.style.opacity = '0';
  document.body.style.transform = 'translateY(10px)';
  document.body.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
  setTimeout(() => {
    document.body.style.opacity = '1';
    document.body.style.transform = 'translateY(0)';
    document.body.classList.add('visible');
  }, 100);
});

// ====================================================================
// 1) SELECTORES Y CONSTANTES
// ====================================================================

/** Elementos de UI */
const UI = {
  grid: document.getElementById('grid'),
  score: document.getElementById('score'),
  time: document.getElementById('timeLeft'),
  rows: document.getElementById('rows'),
  cols: document.getElementById('cols'),
  timeInput: document.getElementById('timeInput'),
  difficulty: document.getElementById('difficulty'),
  startBtn: document.getElementById('startBtn'),
  resetBtn: document.getElementById('resetBtn'),
  fsBtn: document.getElementById('fsBtn'),
  themeBtn: document.getElementById('themeBtn'),
  errBox: document.getElementById('errBox'),
  maxHint: document.getElementById('maxHint'),
  historyList: document.getElementById('historyList'),
};

  // ------- Integración con Backend (API REST) -------
  const UI2 = {
    profileSelect: document.getElementById('profileSelect'),
    username: document.getElementById('username'),
    email: document.getElementById('email'),
    avatar: document.getElementById('avatar'),
    createProfileBtn: document.getElementById('createProfileBtn'),
    savePrefsBtn: document.getElementById('savePrefsBtn'),
    profileStatus: document.getElementById('profileStatus'),
    leaderboard: document.getElementById('leaderboard'),
    apiBase: document.getElementById('apiBase'),
    statsBox: document.getElementById('statsBox'),
  };

// ====================================================================
// 2) ESTADO GLOBAL
// ====================================================================

const LIMIT = 15;

const State = {
  rows: 6,
  cols: 8,
  running: false,
  score: 0,
  timeLeft: 30,
  currentIndex: -1,
  timers: { tick: null, next: null },
  history: [],
};

  State.profileId = localStorage.getItem('profileId') || null;
  State.apiBase = localStorage.getItem('apiBase') || 'http://localhost:5000';
  UI2.apiBase && (UI2.apiBase.value = State.apiBase);

  const DIFF_TO_LEVEL = { easy: 1, medium: 2, hard: 3 };

  async function api(path, options = {}) {
    const base = (UI2.apiBase && UI2.apiBase.value) || State.apiBase || 'http://localhost:5000';
    const url = base.replace(/\/$/, '') + path;
    const opts = { headers: { 'Content-Type': 'application/json' }, ...options };
    const res = await fetch(url, opts);
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`${res.status} ${res.statusText}: ${txt}`);
    }
    return res.json();
  }

  async function loadProfiles() {
    try {
      const list = await api('/api/perfiles');
      if (UI2.profileSelect) {
        UI2.profileSelect.innerHTML = '<option value="">— nuevo —</option>';
        list.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.id;
          opt.textContent = `${p.username} · ${p.email}`;
          UI2.profileSelect.appendChild(opt);
        });
        if (State.profileId) {
          UI2.profileSelect.value = State.profileId;
          const p = list.find(x => x.id === State.profileId);
          if (p) fillProfileForm(p);
        }
      }
    } catch (e) {
      toast('No se pudo cargar perfiles. Verifica el backend.');
      console.error(e);
    }
  }

  function fillProfileForm(p) {
    UI2.username && (UI2.username.value = p.username || '');
    UI2.email && (UI2.email.value = p.email || '');
    UI2.avatar && (UI2.avatar.value = p.avatar || '');
    renderStats(p);
  }

  function renderStats(p) {
    if (!UI2.statsBox || !p) return;
    const s = p.stats || {};
    UI2.statsBox.innerHTML = `
      <div><strong>Juegos:</strong> ${s.gamesPlayed ?? 0}</div>
      <div><strong>Ganadas:</strong> ${s.wins ?? 0} · <strong>Perdidas:</strong> ${s.losses ?? 0}</div>
      <div><strong>Puntaje total:</strong> ${s.totalScore ?? 0}</div>
      <div><strong>Mejor racha:</strong> ${s.bestStreak ?? 0}</div>
    `;
  }

  async function createOrUpdateProfile() {
    const body = {
      username: UI2.username?.value?.trim(),
      email: UI2.email?.value?.trim(),
      avatar: UI2.avatar?.value?.trim() || '👾',
      preferences: {
        difficulty: UI.difficulty?.value || 'medium',
        sound: true
      }
    };
    let data;
    try {
      if (UI2.profileSelect?.value) {
        // actualizar
        data = await api(`/api/perfiles/${UI2.profileSelect.value}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        // crear
        data = await api('/api/perfiles', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }
      State.profileId = data.id;
      localStorage.setItem('profileId', State.profileId);
      UI2.profileStatus && (UI2.profileStatus.textContent = '✅ Perfil sincronizado');
      await loadProfiles();
    } catch (e) {
      UI2.profileStatus && (UI2.profileStatus.textContent = '❌ Error al sincronizar el perfil');
      console.error(e);
    }
  }

  async function savePreferencesOnly() {
    if (!State.profileId) {
      toast('Crea o selecciona un perfil primero.');
      return;
    }
    try {
      const data = await api(`/api/perfiles/${State.profileId}`, {
        method: 'PUT',
        body: JSON.stringify({
          preferences: {
            difficulty: UI.difficulty?.value || 'medium',
            sound: true
          }
        }),
      });
      renderStats(data);
      toast('Preferencias guardadas.');
    } catch (e) {
      console.error(e);
      toast('No se pudo guardar preferencias.');
    }
  }

  async function postPartida(score, result, level, durationSec) {
    if (!State.profileId) return; // opcional
    try {
      const data = await api(`/api/perfiles/${State.profileId}/partidas`, {
        method: 'POST',
        body: JSON.stringify({ score, result, level, durationSec }),
      });
      renderStats(data);
      await loadLeaderboard();
    } catch (e) {
      console.error(e);
      toast('No se pudo registrar la partida.');
    }
  }

  async function loadLeaderboard() {
    try {
      const top = await api('/api/leaderboard');
      if (UI2.leaderboard) {
        UI2.leaderboard.innerHTML = '';
        top.forEach((row, i) => {
          const li = document.createElement('li');
          li.textContent = `#${i+1} ${row.username} — ${row.totalScore}`;
          UI2.leaderboard.appendChild(li);
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  // listeners
  UI2.createProfileBtn?.addEventListener('click', createOrUpdateProfile);
  UI2.savePrefsBtn?.addEventListener('click', savePreferencesOnly);
  UI2.profileSelect?.addEventListener('change', async () => {
    const id = UI2.profileSelect.value;
    if (id) {
      State.profileId = id;
      localStorage.setItem('profileId', id);
      try {
        const p = await api(`/api/perfiles/${id}`);
        fillProfileForm(p);
      } catch (e) {}
    } else {
      State.profileId = null;
      localStorage.removeItem('profileId');
      UI2.username && (UI2.username.value = '');
      UI2.email && (UI2.email.value = '');
      UI2.avatar && (UI2.avatar.value = '');
      UI2.statsBox && (UI2.statsBox.innerHTML = '');
    }
  });

  UI2.apiBase?.addEventListener('change', () => {
    State.apiBase = UI2.apiBase.value.trim() || 'http://localhost:5000';
    localStorage.setItem('apiBase', State.apiBase);
    toast('API Base guardada.');
  });

  document.addEventListener('DOMContentLoaded', () => {
    loadProfiles();
    loadLeaderboard();
  });

// ====================================================================
// 3) UTILIDADES GENERALES
// ====================================================================

/** Número entero aleatorio en [0..n-1] */
const rnd = (n) => Math.floor(Math.random() * n);

/** Hora local amigable (para historial) */
const nowTime = () => new Date().toLocaleTimeString();

/** Muestra un toast (mensaje breve no bloqueante) */
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

/**
 * Permite letras; si no hay dígitos, retorna NaN.
 */
function parseNumeric(value) {
  const match = String(value).match(/\d+/);
  return match ? parseInt(match[0], 10) : NaN;
}

// ====================================================================
// 4) VALIDACIÓN Y GLOBOS DE AYUDA
// ====================================================================

function showError(input, message) {
  const span = document.createElement('span');
  span.className = 'bubble';
  span.textContent = message;
  input.after(span);
  setTimeout(() => span.remove(), 1600);
}

function validateField(input, min, max) {
  const value = parseNumeric(input.value);
  if (isNaN(value) || value < min || value > max) {
    showError(input, `Usa números entre ${min} y ${max}`);
    input.focus();
    return { ok: false };
  }
  return { ok: true, value };
}

// ====================================================================
// 5) CONSTRUCCIÓN DE LA GRILLA
// ====================================================================

function cellIndex(r, c) { return r * State.cols + c; }

function buildGrid() {
  UI.grid.innerHTML = '';
  UI.grid.style.setProperty('--cols', String(State.cols));
  for (let r = 0; r < State.rows; r++) {
    for (let c = 0; c < State.cols; c++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cell';
      btn.setAttribute('role', 'gridcell');
      btn.setAttribute('aria-label', `Celda ${r+1},${c+1}`);
      btn.addEventListener('click', () => onCellClick(cellIndex(r, c)));
      UI.grid.appendChild(btn);
    }
  }
}

// ====================================================================
// 6) LÓGICA DEL JUEGO
// ====================================================================

function placeCopion(index) {
  const prev = UI.grid.querySelector('.cell.is-copion');
  if (prev) {
    prev.classList.remove('is-copion');
    const ghost = document.createElement('span');
    ghost.className = 'ghost';
    ghost.textContent = '👀';
    prev.appendChild(ghost);
    setTimeout(() => ghost.remove(), 1800);
  }
  const cells = UI.grid.querySelectorAll('.cell');
  const btn = cells[index];
  if (!btn) return;
  btn.classList.add('is-copion');
  btn.textContent = '👀';
}

function onCellClick(index) {
  if (!State.running) {
    toast('Primero presiona Iniciar');
    return;
  }
  if (index === State.currentIndex) {
    State.score += 10;
    UI.score.textContent = String(State.score);
    nextCopion();
  } else {
    State.score = Math.max(0, State.score - 5);
    UI.score.textContent = String(State.score);
  }
}

function nextCopion() {
  const total = State.rows * State.cols;
  let idx;
  do { idx = rnd(total); } while (idx === State.currentIndex);
  State.currentIndex = idx;
  placeCopion(idx);

  const diff = UI.difficulty.value;
  const speed = diff === 'easy' ? 1200 : (diff === 'hard' ? 600 : 900);
  clearTimeout(State.timers.next);
  State.timers.next = setTimeout(nextCopion, speed);
}

// ====================================================================
// 7) CRONÓMETRO
// ====================================================================

function tick() {
  State.timeLeft--;
  UI.time.textContent = String(State.timeLeft);
  if (State.timeLeft <= 0) endGame();
}

// ====================================================================
// 8) HISTORIAL Y MENSAJES
// ====================================================================

function saveHistory(score) {
  const li = document.createElement('li');
  li.textContent = `${nowTime()} → Puntaje: ${score}`;
  UI.historyList.appendChild(li);
  State.history.push({ t: Date.now(), score });
}

// ====================================================================
// 9) CICLO DE JUEGO: start / reset / end
// ====================================================================

function endGame() {
  State.running = false;
  clearInterval(State.timers.tick);
  clearTimeout(State.timers.next);
  toast(`⏰ Tiempo terminado. Puntaje: ${State.score}`);
  saveHistory(State.score);
  const level = DIFF_TO_LEVEL[UI.difficulty?.value || 'medium'] || 2;
  const planned = State.durationPlanned || (parseInt(UI.timeInput?.value) || 30);
  const result = State.score > 0 ? 'win' : 'loss';
  postPartida(State.score, result, level, planned);
}

function resetGame() {
  State.running = false;
  clearInterval(State.timers.tick);
  clearTimeout(State.timers.next);
  State.score = 0;
  State.timeLeft = parseNumeric(UI.timeInput.value) || 30;
  UI.score.textContent = '0';
  UI.time.textContent = String(State.timeLeft);
  buildGrid();
}

function startGame() {
  const vr = validateField(UI.rows, 2, LIMIT);
  const vc = validateField(UI.cols, 2, LIMIT);
  const vt = validateField(UI.timeInput, 10, 90);
  if (!vr.ok || !vc.ok || !vt.ok) return;

  State.rows = vr.value;
  State.cols = vc.value;
  State.timeLeft = vt.value;
  State.durationPlanned = vt.value;
  State.score = 0;
  UI.score.textContent = '0';
  UI.time.textContent = String(State.timeLeft);

  buildGrid();

  State.running = true;
  clearInterval(State.timers.tick);
  clearTimeout(State.timers.next);
  State.timers.tick = setInterval(tick, 1000);
  nextCopion();
}

// ====================================================================
// 10) LISTENERS DE UI
// ====================================================================

UI.startBtn.addEventListener('click', startGame);
UI.resetBtn.addEventListener('click', resetGame);
UI.fsBtn.addEventListener('click', () => {
  const el = document.documentElement;
  if (!document.fullscreenElement) el.requestFullscreen?.();
  else document.exitFullscreen?.();
});

if (UI.themeBtn) {
  UI.themeBtn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    UI.themeBtn.textContent = isLight ? 'Modo Oscuro' : 'Modo Claro';
  });
}

  // Construcción inicial de la grilla
  buildGrid();

  // listeners de backend
  UI2.createProfileBtn?.addEventListener('click', createOrUpdateProfile);
  UI2.savePrefsBtn?.addEventListener('click', savePreferencesOnly);
  UI2.apiBase?.addEventListener('change', () => {
    State.apiBase = UI2.apiBase.value.trim() || 'http://localhost:5000';
    localStorage.setItem('apiBase', State.apiBase);
  });

  // carga inicial de datos remotos
  loadProfiles();
  loadLeaderboard();

})();