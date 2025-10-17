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

  const UI2 = {
    profileSelect: document.getElementById('profileSelect'),
    username: document.getElementById('username'),
    email: document.getElementById('email'),
    avatar: document.getElementById('avatar'),
    createProfileBtn: document.getElementById('createProfileBtn'),
    savePrefsBtn: document.getElementById('savePrefsBtn'),
    deleteProfileBtn: document.getElementById('deleteProfileBtn'),
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
    profileId: localStorage.getItem('profileId') || null,
    apiBase: localStorage.getItem('apiBase') || 'http://localhost:5000',
  };

  UI2.apiBase && (UI2.apiBase.value = State.apiBase);
  const DIFF_TO_LEVEL = { easy: 1, medium: 2, hard: 3 };

  // ====================================================================
  // 3) FUNCIONES AUXILIARES
  // ====================================================================

  const rnd = (n) => Math.floor(Math.random() * n);
  const nowTime = () => new Date().toLocaleTimeString();

  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }

  function parseNumeric(value) {
    const match = String(value).match(/\d+/);
    return match ? parseInt(match[0], 10) : NaN;
  }

  // ====================================================================
  // 4) VALIDACIÓN DE CAMPOS
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
  // 5) API BACKEND
  // ====================================================================

async function api(path, options = {}) {
  const base = (UI2.apiBase && UI2.apiBase.value) || State.apiBase || 'http://localhost:5000';
  const url = base.replace(/\/$/, '') + path;
  const opts = { headers: { 'Content-Type': 'application/json' }, ...options };
  const res = await fetch(url, opts);

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${txt}`);
  }

  // 🔧 Manejo robusto: si no hay cuerpo (DELETE 204 o 200 sin JSON), no intentes parsear JSON
  const text = await res.text().catch(() => '');
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

async function loadProfiles() {
  try {
    const list = await api('/api/perfiles');
    if (UI2.profileSelect) {
      // 🔹 Limpia las opciones y agrega la opción por defecto
      UI2.profileSelect.innerHTML = '<option value="">— nuevo —</option>';

      // 🔹 Agrega las opciones con value = ID
      list.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;  // ✅ solo el ID, no el objeto completo
        opt.textContent = `${p.username} · ${p.email}`;
        UI2.profileSelect.appendChild(opt);
      });

      // 🔹 Si hay un perfil activo en memoria, selecciónalo
      if (State.profileId) {
        UI2.profileSelect.value = State.profileId;
        const p = list.find(x => x.id === State.profileId);
        if (p) fillProfileForm(p);
      }
    }
  } catch (e) {
    toast('⚠️ No se pudo cargar perfiles. Verifica el backend.');
    console.error(e);
  }
}

  async function loadLeaderboard() {
    try {
      const top = await api('/api/leaderboard');
      UI2.leaderboard.innerHTML = '';
      top.forEach((row, i) => {
        const li = document.createElement('li');
        li.textContent = `#${i + 1} ${row.username} — ${row.totalScore}`;
        UI2.leaderboard.appendChild(li);
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function loadLeaderboard() {
    try {
      const top = await api('/api/leaderboard');
      UI2.leaderboard.innerHTML = '';
      top.forEach((row, i) => {
        const li = document.createElement('li');
        li.textContent = `#${i + 1} ${row.username} — ${row.totalScore}`;
        UI2.leaderboard.appendChild(li);
      });
    } catch (e) {
      console.error(e);
    }
  }

  // ====================================================================
  // Nueva función: Cargar historial del jugador
  // ====================================================================

async function loadHistory() {
  if (!State.profileId) return;
  try {
    const p = await api(`/api/perfiles/${State.profileId}`);
    const list = p.history || [];
    UI.historyList.innerHTML = '';
    list.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.date} — Puntaje: ${item.score}`;
      UI.historyList.appendChild(li);
    });
  } catch (e) {
    console.error('Error cargando historial:', e);
  }
}

  // ====================================================================
  // 6) CRUD DE PERFILES
  // ====================================================================

  function renderStats(p) {
    if (!UI2.statsBox) return;
    const s = p.stats || {};
    UI2.statsBox.innerHTML = `
      <div><strong>Juegos:</strong> ${s.gamesPlayed ?? 0}</div>
      <div><strong>Ganadas:</strong> ${s.wins ?? 0} · <strong>Perdidas:</strong> ${s.losses ?? 0}</div>
      <div><strong>Puntaje total:</strong> ${s.totalScore ?? 0}</div>
      <div><strong>Mejor racha:</strong> ${s.bestStreak ?? 0}</div>
    `;
  }

  function fillProfileForm(p) {
    UI2.username.value = p.username || '';
    UI2.email.value = p.email || '';
    UI2.avatar.value = p.avatar || '';
    if (p.preferences?.difficulty) UI.difficulty.value = p.preferences.difficulty;
    renderStats(p);
  }

  async function createOrUpdateProfile() {

    // 🚨 VALIDACIÓN BLOQUEANTE DE USERNAME
    const usernameValue = UI2.username.value.trim();
    if (!validarUsername(usernameValue)) {
      toast("🔴 El username debe tener al menos 3 caracteres.");
      return; // <-- Esto DETIENE el envío al backend
    }
    // Mensaje estilo TDD VERDE ✅
    toast("✅ Username válido — Caso VERDE de TDD pasado");

  
    const body = {
      username: UI2.username.value.trim(),
      email: UI2.email.value.trim(),
      avatar: UI2.avatar.value.trim() || '👾',
      preferences: { difficulty: UI.difficulty.value || 'medium', sound: true },
    };
  
    try {
      let data;
      if (UI2.profileSelect.value) {
        data = await api(`/api/perfiles/${UI2.profileSelect.value}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        data = await api('/api/perfiles', { method: 'POST', body: JSON.stringify(body) });
      }
      State.profileId = data.id;
      localStorage.setItem('profileId', data.id);
      toast('✅ Perfil sincronizado');
      await loadProfiles();
    } catch (e) {
      toast('❌ Error al sincronizar');
      console.error(e);
    }
  }
  

  async function savePreferencesOnly() {
    if (!State.profileId) return toast('Selecciona un perfil primero');
    try {
      await api(`/api/perfiles/${State.profileId}`, {
        method: 'PUT',
        body: JSON.stringify({
          preferences: { difficulty: UI.difficulty.value || 'medium', sound: true },
        }),
      });
      toast('Preferencias guardadas');
    } catch (e) {
      toast('Error al guardar preferencias');
      console.error(e);
    }
  }

async function deleteProfile() {
  // toma id del state o del select (por si el state está limpio)
  const id = (State.profileId && String(State.profileId)) || (UI2.profileSelect?.value || '').trim();
  if (!id) {
    toast('Selecciona un perfil.');
    return;
  }

  const ok = confirm('¿Eliminar este perfil? Esta acción no se puede deshacer.');
  if (!ok) return;

  try {
    await api(`/api/perfiles/${encodeURIComponent(id)}`, { method: 'DELETE' });

    toast('Perfil eliminado.');
    // Reset estado + UI
    State.profileId = null;
    localStorage.removeItem('profileId');
    if (UI2.profileSelect) UI2.profileSelect.value = '';
    UI2.username && (UI2.username.value = '');
    UI2.email && (UI2.email.value = '');
    UI2.avatar && (UI2.avatar.value = '');
    UI.difficulty && (UI.difficulty.value = 'medium');
    UI2.statsBox && (UI2.statsBox.innerHTML = '');

    await loadProfiles();
    await loadLeaderboard();
  } catch (e) {
    console.error(e);
    toast('No se pudo eliminar.');
  }
}

  // ====================================================================
  // 7) JUEGO
  // ====================================================================

  function cellIndex(r, c) { return r * State.cols + c; }

  function buildGrid() {
    UI.grid.innerHTML = '';
    UI.grid.style.setProperty('--cols', State.cols);
    for (let r = 0; r < State.rows; r++) {
      for (let c = 0; c < State.cols; c++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cell';
        btn.addEventListener('click', () => onCellClick(cellIndex(r, c)));
        UI.grid.appendChild(btn);
      }
    }
  }

  function nextCopion() {
    const total = State.rows * State.cols;
    let idx;
    do { idx = rnd(total); } while (idx === State.currentIndex);
    State.currentIndex = idx;
    const cells = UI.grid.querySelectorAll('.cell');
    cells.forEach((c, i) => c.textContent = i === idx ? '👀' : '');
    const diff = UI.difficulty.value;
    const speed = diff === 'easy' ? 1200 : diff === 'hard' ? 600 : 900;
    clearTimeout(State.timers.next);
    State.timers.next = setTimeout(nextCopion, speed);
  }

  function onCellClick(i) {
    if (!State.running) return toast('Presiona Iniciar');
    if (i === State.currentIndex) {
      State.score += 10;
      UI.score.textContent = State.score;
      nextCopion();
    } else {
      State.score = Math.max(0, State.score - 5);
      UI.score.textContent = State.score;
    }
  }

  function tick() {
    State.timeLeft--;
    UI.time.textContent = State.timeLeft;
    if (State.timeLeft <= 0) endGame();
  }

// ====================================================================
// Nueva función: registrar partida en backend
// ====================================================================

async function postPartida(score, result, level, durationSec) {
  if (!State.profileId) {
    toast('No hay perfil activo: la partida no se registrará en el leaderboard.');
    return false;
  }
  try {
    const data = await api(`/api/perfiles/${State.profileId}/partidas`, {
      method: 'POST',
      body: JSON.stringify({ score, result, level, durationSec }),
    });
    renderStats(data);
    await loadLeaderboard();
    return true;
  } catch (e) {
    console.error(e);
    toast('No se pudo registrar la partida en el backend.');
    return false;
  }
}



  function startGame() {
    const vr = validateField(UI.rows, 2, LIMIT);
    const vc = validateField(UI.cols, 2, LIMIT);
    const vt = validateField(UI.timeInput, 10, 90);
    if (!vr.ok || !vc.ok || !vt.ok) return;
    State.rows = vr.value;
    State.cols = vc.value;
    State.timeLeft = vt.value;
    State.score = 0;
    UI.score.textContent = '0';
    UI.time.textContent = State.timeLeft;
    buildGrid();
    State.running = true;
    clearInterval(State.timers.tick);
    clearTimeout(State.timers.next);
    State.timers.tick = setInterval(tick, 1000);
    nextCopion();
  }

// ====================================================================
// Reemplazo de endGame() para registrar partida + actualizar tablero
// ====================================================================

async function endGame() {
  State.running = false;
  clearInterval(State.timers.tick);
  clearTimeout(State.timers.next);

  toast(`⏰ Tiempo terminado. Puntaje: ${State.score}`);

  // Guarda entrada en historial local de la vista (inmediato)
  const li = document.createElement('li');
  li.textContent = `${new Date().toLocaleTimeString()} — Puntaje: ${State.score}`;
  UI.historyList.appendChild(li);

  const level = { easy: 1, medium: 2, hard: 3 }[UI.difficulty?.value || 'medium'] || 2;
  const planned = parseInt(UI.timeInput?.value) || 30;
  const result = State.score > 0 ? 'win' : 'loss';

  // Registrar en backend y refrescar leaderboard
  await postPartida(State.score, result, level, planned);

  // Recargar historial desde el backend (ya con persistencia)
  await loadHistory();
}

  function resetGame() {
    clearInterval(State.timers.tick);
    clearTimeout(State.timers.next);
    State.running = false;
    State.score = 0;
    UI.score.textContent = '0';
    UI.time.textContent = UI.timeInput.value;
    buildGrid();
  }

  // ====================================================================
  // 8) EVENTOS PRINCIPALES
  // ====================================================================

  UI.startBtn.addEventListener('click', startGame);
  UI.resetBtn.addEventListener('click', resetGame);
  UI.fsBtn.addEventListener('click', () => {
    const el = document.documentElement;
    if (!document.fullscreenElement) el.requestFullscreen();
    else document.exitFullscreen();
  });

  if (UI.themeBtn) {
    UI.themeBtn.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-mode');
      UI.themeBtn.textContent = isLight ? 'Modo Oscuro' : 'Modo Claro';
    });
  }

  UI2.createProfileBtn.addEventListener('click', createOrUpdateProfile);
  UI2.savePrefsBtn.addEventListener('click', savePreferencesOnly);
  UI2.deleteProfileBtn.addEventListener('click', deleteProfile);

UI2.profileSelect.addEventListener('change', async () => {
  const id = UI2.profileSelect.value;
  if (id) {
    State.profileId = id;
    localStorage.setItem('profileId', id);
    const p = await api(`/api/perfiles/${id}`);
    fillProfileForm(p);
    await loadHistory(); // 👈
  } else {
    State.profileId = null;
    localStorage.removeItem('profileId');
    UI.historyList.innerHTML = ''; // limpia historial
  }
});

  UI2.apiBase.addEventListener('change', () => {
    State.apiBase = UI2.apiBase.value.trim();
    localStorage.setItem('apiBase', State.apiBase);
    toast('API Base actualizada');
  });

  buildGrid();
  loadProfiles();
  loadLeaderboard();




// ====================================================================
// 🔴🟢♻ TDD - VALIDACIÓN DE USERNAME (Sólo Frontend – Fase ROJO → VERDE → REFACTOR)
// ====================================================================

console.log("=== TDD Username Validation: Rojo → Verde → Refactor ===");

// 🔴 ROJO - Test manual que falla si la función no existe o no cumple
try {
  if (validarUsername("Jo") !== false) {
    console.error("❌ Test FALLÓ: 'Jo' (2 letras) debería ser inválido");
  } else {
    console.log("✅ Test ROJO superado para 'Jo' (detectado como inválido)");
  }
} catch (e) {
  console.error("❌ La función validarUsername aún no está definida para ROJO");
}

// 🟢 VERDE - Test manual para un username válido
try {
  if (validarUsername("Juan") !== true) {
    console.error("❌ Test FALLÓ: 'Juan' (4 letras) debería ser válido");
  } else {
    console.log("✅ Test VERDE: 'Juan' es un username válido");
  }
} catch (e) {
  console.error("❌ La función validarUsername aún no está definida para VERDE");
}

// 🟢 Versión mínima para pasar casos (ya está, solo referencial)
function validarUsername(nombre) {
  return typeof nombre === "string" && nombre.length >= 3;
}

// ♻ REFACTOR - versión mejorada con limpieza y robustez
function validarUsername(nombre) {
  if (typeof nombre !== "string") return false;
  const limpio = nombre.trim();
  return limpio.length >= 3;
}

})();

