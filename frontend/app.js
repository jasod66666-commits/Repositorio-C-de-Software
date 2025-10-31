/**
 * =====================================================================
 * ATRAPA AL COPIÓN — EDICIÓN NIÑOS (REFACTORIZADO)
 * ---------------------------------------------------------------------
 * OBJETIVO:
 * - Mejor legibilidad, orden y mantenibilidad.
 * - Eliminar código muerto y duplicaciones.
 * - Añadir anotaciones completas para cada bloque.
 *
 * FUNCIONALIDAD CLAVE (conservada):
 * - Grilla dinámica rows×cols
 * - Copión visible (emoji 👀) que salta según dificultad
 * - Rastro (👀) al atrapar que desaparece en 2s
 * - Cronómetro y puntaje
 * - Entradas permisivas (letras permitidas) con validación por globos
 * - Modo claro/oscuro con alto contraste en la grilla
 * - Aviso si se clickea la grilla sin iniciar
 * - Historial simple en sesión
 * - Pantalla completa
 * - GESTIÓN DE PERFILES Y API (Restaurada)
 * =====================================================================
 */

(() => {
  'use strict';

  // Animación de entrada
  document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '0';
    document.body.style.transform = 'translateY(10px)';
    document.body.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    setTimeout(() => {
      document.body.style.opacity = '1';
      document.body.style.transform = 'translateY(0)';
    }, 100);
  });

  // Selectores UI del juego
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

  // Selectores UI de Perfil/API
  const UI2 = {
    profileSelect: document.getElementById('profileSelect'),
    username: document.getElementById('username'),
    email: document.getElementById('email'),
    avatar: document.getElementById('avatar'),
    apiBase: document.getElementById('apiBase'),
    createProfileBtn: document.getElementById('createProfileBtn'),
    savePrefsBtn: document.getElementById('savePrefsBtn'),
    deleteProfileBtn: document.getElementById('deleteProfileBtn'),
    profileStatus: document.getElementById('profileStatus'),
    leaderboard: document.getElementById('leaderboard'),
    statsBox: document.getElementById('statsBox'),
  };

  const LIMIT = window.matchMedia('(max-width: 768px)').matches ? 6 : 15;
  const DIFFICULTY_INTERVALS = {
    easy:   [900, 1400],
    medium: [650, 1000],
    hard:   [380, 650],
  };

  const State = {
    rows: 6,
    cols: 8,
    running: false,
    score: 0,
    timeLeft: 30,
    currentIndex: -1,
    timers: { tick: null, next: null },
    history: [],
    profileId: null,
    apiBase: localStorage.getItem('apiBase') || 'http://localhost:5000',
  };

  if (UI.maxHint) {
    UI.maxHint.textContent = `Máximo recomendado: ${LIMIT}×${LIMIT}`;
  }

  // Utilidades
  const rnd = (n) => Math.floor(Math.random() * n);
  const nowTime = () => new Date().toLocaleTimeString();

  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }

  function showBubble(target, text, offsetY = -10) {
    const rect = target.getBoundingClientRect();
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    document.body.appendChild(bubble);
    const x = rect.left + rect.width / 2;
    const y = rect.top + window.scrollY + offsetY;
    bubble.style.left = x + 'px';
    bubble.style.top = (y + window.scrollY) + 'px';
    setTimeout(() => bubble.remove(), 2500);
  }

  function parseNumeric(value) {
    const match = String(value).match(/\d+/);
    return match ? parseInt(match[0], 10) : NaN;
  }

  function validateField(input, min, max) {
    const v = parseNumeric(input.value);
    if (Number.isNaN(v) || v < min || v > max) {
      input.classList.add('invalid');
      if (UI.errBox) {
        UI.errBox.textContent = `Debe ser un número entre ${min} y ${max}.`;
      }
      showBubble(input, 'Valor inválido 😅');
      return { ok: false };
    }
    input.classList.remove('invalid');
    if (UI.errBox) {
      UI.errBox.textContent = '';
    }
    return { ok: true, value: v };
  }

  // Construcción de grilla
  function clearGrid() {
    if (UI.grid) UI.grid.innerHTML = '';
  }

  function buildGrid() {
    clearGrid();
    if (!UI.grid) return;
    UI.grid.style.setProperty('--cols', State.cols);
    const total = State.rows * State.cols;
    for (let i = 0; i < total; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell normal';
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('tabindex', '0');
      cell.addEventListener('click', () => {
        if (!State.running) {
          showBubble(UI.grid, '¡Primero toca "Iniciar"! 🕹️', 10);
          return;
        }
        onCellClick(i, cell);
      });
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!State.running) {
            showBubble(UI.grid, '¡Primero toca "Iniciar"! 🕹️', 10);
            return;
          }
          onCellClick(i, cell);
        }
      });
      UI.grid.appendChild(cell);
    }
  }

  // Copión
  function setCopionAt(idx) {
    const cell = UI.grid.children[idx];
    if (!cell) return;
    cell.classList.add('copion');
    cell.innerHTML = '<span class="emoji" aria-hidden="true">👀</span>';
  }

  function removeCopionAt(idx) {
    const cell = UI.grid.children[idx];
    if (!cell) return;
    cell.classList.remove('copion');
    cell.innerHTML = '';
  }

  function leaveTrailAt(idx) {
    const cell = UI.grid.children[idx];
    if (!cell) return;
    const t = document.createElement('div');
    t.className = 'trail';
    t.textContent = '👀';
    cell.appendChild(t);
    setTimeout(() => t.remove(), 2000);
  }

  function placeCopion() {
    const total = State.rows * State.cols;
    const idx = rnd(total);
    if (State.currentIndex >= 0) removeCopionAt(State.currentIndex);
    State.currentIndex = idx;
    setCopionAt(idx);
  }

  function nextCopion() {
    const [min, max] = DIFFICULTY_INTERVALS[UI.difficulty.value] || DIFFICULTY_INTERVALS.medium;
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    placeCopion();
    clearTimeout(State.timers.next);
    State.timers.next = setTimeout(nextCopion, delay);
  }

  // Interacción de juego
  function onCellClick(i, cell) {
    if (!State.running) return;
    if (i === State.currentIndex) {
      State.score++;
      removeCopionAt(i);
      leaveTrailAt(i);
      State.currentIndex = -1;
    } else {
      State.score = Math.max(0, State.score - 1);
      cell.classList.add('miss');
      setTimeout(() => cell.classList.remove('miss'), 200);
    }
    if (UI.score) {
      UI.score.textContent = String(State.score);
    }
  }

  function tick() {
    State.timeLeft--;
    if (UI.time) {
      UI.time.textContent = String(State.timeLeft);
    }
    if (State.timeLeft <= 0) {
      endGame();
    }
  }

  // Historial
  function saveHistory(score) {
    if (!State.profileId && UI.historyList) {
      const li = document.createElement('li');
      li.textContent = `${nowTime()} → Puntaje: ${score}`;
      UI.historyList.appendChild(li);
    }
    State.history.push({ t: Date.now(), score });
  }

  // Ciclo de juego
  function endGame() {
    State.running = false;
    clearInterval(State.timers.tick);
    clearTimeout(State.timers.next);
    toast(`⏰ Tiempo terminado. Puntaje: ${State.score}`);
    saveHistory(State.score);
    if (State.profileId) {
      sendScoreToAPI(State.score);
    }
  }

  function resetGame() {
    State.running = false;
    clearInterval(State.timers.tick);
    clearTimeout(State.timers.next);
    State.score = 0;
    State.timeLeft = parseNumeric(UI.timeInput.value) || 30;
    State.currentIndex = -1;
    if (UI.score) UI.score.textContent = '0';
    if (UI.time) UI.time.textContent = String(State.timeLeft);
    clearGrid();
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
    State.score = 0;
    if (UI.score) UI.score.textContent = '0';
    if (UI.time) UI.time.textContent = String(State.timeLeft);

    buildGrid();
    State.running = true;
    clearInterval(State.timers.tick);
    clearTimeout(State.timers.next);
    State.timers.tick = setInterval(tick, 1000);
    nextCopion();
  }

  // Listeners de UI del juego
  if (UI.startBtn) UI.startBtn.addEventListener('click', startGame);
  if (UI.resetBtn) UI.resetBtn.addEventListener('click', resetGame);
  if (UI.fsBtn) {
    UI.fsBtn.addEventListener('click', () => {
      const el = document.documentElement;
      if (!document.fullscreenElement) el.requestFullscreen?.();
      else document.exitFullscreen?.();
    });
  }

  if (UI.themeBtn) {
    UI.themeBtn.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-mode');
      UI.themeBtn.textContent = isLight ? 'Modo Oscuro' : 'Modo Claro';
      UI.themeBtn.setAttribute('aria-pressed', String(isLight));
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
  }

  [UI.rows, UI.cols, UI.timeInput].forEach((el) => {
    if (!el) return;
    el.addEventListener('input', () => {
      const min = el === UI.timeInput ? 10 : 2;
      const max = el === UI.timeInput ? 90 : LIMIT;
      validateField(el, min, max);
    });
  });

  // Bloqueo en media partida
  function showErrorBox(message) {
    if (!UI.errBox) return;
    UI.errBox.textContent = String(message);
    UI.errBox.classList.add('show');
    clearTimeout(UI.errBox._t);
    UI.errBox._t = setTimeout(() => {
      UI.errBox.classList.remove('show');
      UI.errBox.textContent = '';
    }, 2500);
  }

  function restoreInputsFromState(targetEl) {
    if (targetEl === UI.rows) UI.rows.value = String(State.rows);
    if (targetEl === UI.cols) UI.cols.value = String(State.cols);
    if (targetEl === UI.timeInput) UI.timeInput.value = String(State.timeLeft);
    if (targetEl === UI.difficulty) UI.difficulty.value = (UI.difficulty.value in DIFFICULTY_INTERVALS) ? UI.difficulty.value : 'medium';
  }

  const midGameGuard = (ev) => {
    if (!State.running) return;
    const el = ev.target;
    if (el === UI.difficulty) {
      ev.preventDefault();
      restoreInputsFromState(el);
      showErrorBox('⛔ En plena partida no se puede cambiar dificultad.');
      return;
    }
    if (el === UI.timeInput || el === UI.rows || el === UI.cols) {
      ev.preventDefault();
      restoreInputsFromState(el);
      showErrorBox('⛔ Espere a que termine la partida para cambiar tiempo, filas o columnas.');
      return;
    }
  };

  [UI.difficulty, UI.timeInput, UI.rows, UI.cols].forEach((el) => {
    if (!el) return;
    el.addEventListener('input', midGameGuard, true);
    el.addEventListener('change', midGameGuard, true);
  });

  // ========== API Backend ==========
  async function api(path, options = {}) {
    try {
      options.headers = { 'Content-Type': 'application/json', ...options.headers };
      const response = await fetch(`${State.apiBase}${path}`, options);

      if (response.status === 204 || (response.status === 200 && options.method === 'DELETE')) {
        return { success: true };
      }
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      toast(`Error de API: ${error.message}`);
      return null;
    }
  }

  async function loadProfiles() {
    if (!UI2.profileSelect) return;
    const profiles = await api('/api/perfiles');
    if (!profiles) return;

    UI2.profileSelect.innerHTML = '<option value="">(Seleccionar Perfil)</option>';
    profiles.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.username;
      UI2.profileSelect.appendChild(opt);
    });

    const storedId = localStorage.getItem('profileId');
    if (storedId && profiles.some(p => String(p.id) === storedId)) {
      UI2.profileSelect.value = storedId;
      UI2.profileSelect.dispatchEvent(new Event('change'));
    }
  }

  // ✅ FIX: Usar preferences en lugar de prefs
  function fillProfileForm(p) {
    if (!p) return;
    if (UI2.username) UI2.username.value = p.username || '';
    if (UI2.email) UI2.email.value = p.email || '';
    if (UI2.avatar) UI2.avatar.value = p.avatar || '';
    if (UI2.profileStatus) UI2.profileStatus.textContent = `Perfil activo: ${p.username}`;
    
    // ✅ Acceder a preferences correctamente
    const prefs = p.preferences || {};
    if (UI.rows) UI.rows.value = prefs.rows || 6;
    if (UI.cols) UI.cols.value = prefs.cols || 8;
    if (UI.timeInput) UI.timeInput.value = prefs.time || 30;
    if (UI.difficulty) UI.difficulty.value = prefs.difficulty || 'medium';
  }

  async function createOrUpdateProfile() {
    const id = UI2.profileSelect.value;
    const method = id ? 'PUT' : 'POST';
    const path = id ? `/api/perfiles/${id}` : '/api/perfiles';

    const data = {
      username: UI2.username.value,
      email: UI2.email.value,
      avatar: UI2.avatar.value,
      preferences: {
        rows: parseNumeric(UI.rows.value) || 6,
        cols: parseNumeric(UI.cols.value) || 8,
        time: parseNumeric(UI.timeInput.value) || 30,
        difficulty: UI.difficulty.value || 'medium',
      }
    };

    const result = await api(path, { method, body: JSON.stringify(data) });
    if (result) {
      toast(`Perfil ${id ? 'actualizado' : 'creado'} con éxito.`);
      await loadProfiles();
      if (!id) {
        UI2.profileSelect.value = result.id;
        UI2.profileSelect.dispatchEvent(new Event('change'));
      }
    }
  }

  async function savePreferencesOnly() {
    const id = State.profileId;
    if (!id) {
      toast('Debe seleccionar o crear un perfil primero.');
      return;
    }

    const data = {
      preferences: {
        rows: parseNumeric(UI.rows.value) || 6,
        cols: parseNumeric(UI.cols.value) || 8,
        time: parseNumeric(UI.timeInput.value) || 30,
        difficulty: UI.difficulty.value || 'medium',
      }
    };
    
    const result = await api(`/api/perfiles/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    if (result) {
      toast('Preferencias de juego guardadas con éxito.');
    }
  }

  async function deleteProfile() {
    const id = State.profileId;
    if (!id || !confirm(`¿Está seguro de eliminar el perfil ${UI2.username.value}?`)) return;

    const result = await api(`/api/perfiles/${id}`, { method: 'DELETE' });
    if (result) {
      toast('Perfil eliminado.');
      localStorage.removeItem('profileId');
      UI2.profileSelect.value = '';
      State.profileId = null;
      UI2.profileSelect.dispatchEvent(new Event('change'));
      await loadProfiles();
    }
  }

  async function loadHistory() {
    if (!State.profileId || !UI.historyList) return;
    const scores = await api(`/api/scores/${State.profileId}`);
    if (!scores) return;

    UI.historyList.innerHTML = '';
    scores.forEach(s => {
      const li = document.createElement('li');
      const date = new Date(s.timestamp).toLocaleDateString() + ' ' + new Date(s.timestamp).toLocaleTimeString();
      li.textContent = `${date} → Puntaje: ${s.score} | Dificultad: ${s.difficulty}`;
      UI.historyList.appendChild(li);
    });

    loadLeaderboard();
    loadStats(scores);
  }

  async function loadLeaderboard() {
    if (!UI2.leaderboard) return;
    const leaderboard = await api('/api/leaderboard');
    if (!leaderboard) return;

    UI2.leaderboard.innerHTML = '';
    leaderboard.forEach((item, index) => {
      const li = document.createElement('li');
      li.textContent = `${index + 1}. ${item.username} - ${item.highScore} pts (${item.difficulty})`;
      UI2.leaderboard.appendChild(li);
    });
  }

  function loadStats(scores) {
    if (!UI2.statsBox || scores.length === 0) {
      if(UI2.statsBox) UI2.statsBox.innerHTML = '<p>No hay partidas registradas.</p>';
      return;
    }
    const total = scores.length;
    const maxScore = Math.max(...scores.map(s => s.score));
    const avgScore = (scores.reduce((sum, s) => sum + s.score, 0) / total).toFixed(1);

    UI2.statsBox.innerHTML = `
      <p>Partidas jugadas: <b>${total}</b></p>
      <p>Puntaje más alto: <b>${maxScore}</b></p>
      <p>Puntaje promedio: <b>${avgScore}</b></p>
    `;
  }

  async function sendScoreToAPI(score) {
    if (!State.profileId) return;

    const data = {
      score: score,
      difficulty: UI.difficulty.value,
      rows: State.rows,
      cols: State.cols,
      time: parseNumeric(UI.timeInput.value) || 30,
    };

    const result = await api(`/api/scores/${State.profileId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (result) {
      toast('Puntaje guardado en el servidor.');
      loadHistory();
    }
  }

  // Listeners de Perfil/API
  if (UI2.createProfileBtn) UI2.createProfileBtn.addEventListener('click', createOrUpdateProfile);
  if (UI2.savePrefsBtn) UI2.savePrefsBtn.addEventListener('click', savePreferencesOnly);
  if (UI2.deleteProfileBtn) UI2.deleteProfileBtn.addEventListener('click', deleteProfile);

  if (UI2.profileSelect) {
    UI2.profileSelect.addEventListener('change', async () => {
      const id = UI2.profileSelect.value;
      if (id) {
        State.profileId = id;
        localStorage.setItem('profileId', id);
        const p = await api(`/api/perfiles/${id}`);
        fillProfileForm(p);
        await loadHistory();
      } else {
        State.profileId = null;
        localStorage.removeItem('profileId');
        if (UI.historyList) UI.historyList.innerHTML = '';
        if (UI2.statsBox) UI2.statsBox.innerHTML = '';
        if (UI2.profileStatus) UI2.profileStatus.textContent = 'Ningún perfil activo.';
      }
    });
  }

  if (UI2.apiBase) {
    UI2.apiBase.value = State.apiBase;
    UI2.apiBase.addEventListener('input', () => {
      State.apiBase = UI2.apiBase.value;
      localStorage.setItem('apiBase', State.apiBase);
    });
  }

  // Arranque
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    if (UI.themeBtn) UI.themeBtn.textContent = 'Modo Oscuro';
    if (UI.themeBtn) UI.themeBtn.setAttribute('aria-pressed', 'true');
  }

  loadProfiles();
  buildGrid();
})();