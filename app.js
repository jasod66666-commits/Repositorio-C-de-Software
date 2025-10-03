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

  /** Límites (móvil vs escritorio) */
  const LIMIT = window.matchMedia('(max-width: 768px)').matches ? 6 : 15;

  /** Intervalos de salto por dificultad (ms) */
  const DIFFICULTY_INTERVALS = {
    easy:   [900, 1400],
    medium: [650, 1000],
    hard:   [380, 650],
  };

  /** Estado global del juego */
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

  // Pista visual de límites máximos
  UI.maxHint.textContent = `Máximo recomendado: ${LIMIT}×${LIMIT}`;

  // ====================================================================
  // 2) UTILIDADES GENERALES
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
    setTimeout(() => el.remove(), 2500);
  }

  // ====================================================================
  // 3) Burbujas (tooltips) para validación y avisos
  // ====================================================================

  /**
   * Crea un globo de texto temporal cerca de un elemento.
   * @param {HTMLElement} target - Elemento de referencia.
   * @param {string} text - Mensaje a mostrar.
   * @param {number} [offsetY=-10] - Desplazamiento vertical relativo.
   */
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

  // ====================================================================
  // 4) Validación de entradas (permisiva)
  // ====================================================================

  /**
   * Extrae el primer grupo de dígitos de una cadena.
   * Permite letras; si no hay dígitos, retorna NaN.
   */
  function parseNumeric(value) {
    const match = String(value).match(/\d+/);
    return match ? parseInt(match[0], 10) : NaN;
  }

  /**
   * Valida un input numérico contra [min, max].
   * - Permite letras: intenta extraer dígitos.
   * - Si es inválido, añade clase .invalid, actualiza errBox y muestra burbuja.
   * @returns {{ok:boolean, value?:number}}
   */
  function validateField(input, min, max) {
    const v = parseNumeric(input.value);
    if (Number.isNaN(v) || v < min || v > max) {
      input.classList.add('invalid');
      UI.errBox.textContent = `Debe ser un número entre ${min} y ${max}.`;
      showBubble(input, 'Valor inválido 😅');
      return { ok: false };
    }
    input.classList.remove('invalid');
    UI.errBox.textContent = '';
    return { ok: true, value: v };
  }

  // ====================================================================
  // 5) Construcción de grilla
  // ====================================================================

  /** Limpia el contenido del contenedor de la grilla. */
  function clearGrid() {
    UI.grid.innerHTML = '';
  }

  /**
   * Construye la grilla según State.rows × State.cols.
   * - Añade manejadores de click y teclado por celda.
   * - Si el juego no ha iniciado, muestra burbuja invitando a iniciar.
   */
  function buildGrid() {
    clearGrid();
    UI.grid.style.setProperty('--cols', State.cols);

    const total = State.rows * State.cols;
    for (let i = 0; i < total; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell normal';
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('tabindex', '0');

      // Click/tap
      cell.addEventListener('click', () => {
        if (!State.running) {
          showBubble(UI.grid, '¡Primero toca "Iniciar"! 🕹️', 10);
          return;
        }
        onCellClick(i, cell);
      });

      // Teclado (Enter/Espacio)
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

  // ====================================================================
  // 6) Copión (👀) y rastro
  // ====================================================================

  /** Coloca el copión (emoji 👀) en la celda indicada. */
  function setCopionAt(idx) {
    const cell = UI.grid.children[idx];
    if (!cell) return;
    cell.classList.add('copion');
    cell.innerHTML = '<span class="emoji" aria-hidden="true">👀</span>';
  }

  /** Quita el copión de la celda indicada. */
  function removeCopionAt(idx) {
    const cell = UI.grid.children[idx];
    if (!cell) return;
    cell.classList.remove('copion');
    cell.innerHTML = '';
  }

  /** Deja un rastro 👀 que se desvanece en 2s (animación CSS). */
  function leaveTrailAt(idx) {
    const cell = UI.grid.children[idx];
    if (!cell) return;
    const t = document.createElement('div');
    t.className = 'trail';
    t.textContent = '👀';
    cell.appendChild(t);
    setTimeout(() => t.remove(), 2000);
  }

  /** Coloca el copión en un índice aleatorio (limpia el anterior). */
  function placeCopion() {
    const total = State.rows * State.cols;
    const idx = rnd(total);
    if (State.currentIndex >= 0) removeCopionAt(State.currentIndex);
    State.currentIndex = idx;
    setCopionAt(idx);
  }

  /** Programa el próximo salto del copión según la dificultad activa. */
  function nextCopion() {
    const [min, max] = DIFFICULTY_INTERVALS[UI.difficulty.value] || DIFFICULTY_INTERVALS.medium;
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    placeCopion();
    clearTimeout(State.timers.next);
    State.timers.next = setTimeout(nextCopion, delay);
  }

  // ====================================================================
  // 7) Interacción de juego (click en celda) y tiempo
  // ====================================================================

  /**
   * Gestiona el click en una celda del índice i.
   * - Acierto: +1 punto, deja rastro y elimina copión.
   * - Fallo:   -1 punto (mín 0) y parpadeo visual.
   */
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
    UI.score.textContent = String(State.score);
  }

  /** Disminuye el tiempo y finaliza el juego al llegar a 0. */
  function tick() {
    State.timeLeft--;
    UI.time.textContent = String(State.timeLeft);
    if (State.timeLeft <= 0) {
      endGame();
    }
  }

  // ====================================================================
  // 8) Historial y mensajes
  // ====================================================================

  /** Guarda puntaje en historial (lista visual + array en memoria). */
  function saveHistory(score) {
    const li = document.createElement('li');
    li.textContent = `${nowTime()} → Puntaje: ${score}`;
    UI.historyList.appendChild(li);
    State.history.push({ t: Date.now(), score });
  }

  // ====================================================================
  // 9) Ciclo de juego: start / reset / end
  // ====================================================================

  /** Finaliza el juego, detiene timers, muestra puntaje y guarda historial. */
  function endGame() {
    State.running = false;
    clearInterval(State.timers.tick);
    clearTimeout(State.timers.next);
    toast(`⏰ Tiempo terminado. Puntaje: ${State.score}`);
    saveHistory(State.score);
  }

  /** Restablece estado y reconstruye la grilla. */
  function resetGame() {
    State.running = false;
    clearInterval(State.timers.tick);
    clearTimeout(State.timers.next);
    State.score = 0;
    State.timeLeft = parseNumeric(UI.timeInput.value) || 30;
    State.currentIndex = -1;
    UI.score.textContent = '0';
    UI.time.textContent = String(State.timeLeft);
    clearGrid();
    buildGrid();
  }

  /**
   * Inicia el juego si todas las entradas son válidas.
   * - Valida filas, columnas y tiempo (permite letras).
   * - Reinicia estado y activa timers de juego.
   */
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

  // Iniciar / Reiniciar / Pantalla completa
  UI.startBtn.addEventListener('click', startGame);
  UI.resetBtn.addEventListener('click', resetGame);
  UI.fsBtn.addEventListener('click', () => {
    const el = document.documentElement;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  });

  // Modo claro / oscuro
  if (UI.themeBtn) {
    UI.themeBtn.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-mode');
      UI.themeBtn.textContent = isLight ? 'Modo Oscuro' : 'Modo Claro';
      UI.themeBtn.setAttribute('aria-pressed', String(isLight));
    });
  }

  // Validación en tiempo real (permite letras; solo avisa con burbuja)
  [UI.rows, UI.cols, UI.timeInput].forEach((el) => {
    el.addEventListener('input', () => {
      const min = el === UI.timeInput ? 10 : 2;
      const max = el === UI.timeInput ? 90 : LIMIT;
      validateField(el, min, max);
    });
  });

  // ====================================================================
  
  // ====================================================================
  // 10.1) BLOQUEOS EN MEDIA PARTIDA (excepciones visibles)
  // - Si el juego está corriendo (State.running === true), impedimos:
  //   a) Cambiar la dificultad.
  //   b) Cambiar filas/columnas/tiempo.
  //   Mostramos un recuadro rojo en #errBox con el motivo.
  // ====================================================================

  /** Muestra un error en el recuadro rojo y lo oculta a los 2.5s */
  function showErrorBox(message) {
    if (!UI.errBox) return;
    UI.errBox.textContent = String(message);
    UI.errBox.classList.add('show');
    // Limpia después de 2.5s
    clearTimeout(UI.errBox._t);
    UI.errBox._t = setTimeout(() => {
      UI.errBox.classList.remove('show');
      UI.errBox.textContent = '';
    }, 2500);
  }

  /** Restaura el valor visual del input desde el estado actual */
  function restoreInputsFromState(targetEl) {
    if (targetEl === UI.rows) UI.rows.value = String(State.rows);
    if (targetEl === UI.cols) UI.cols.value = String(State.cols);
    if (targetEl === UI.timeInput) UI.timeInput.value = String(State.timeLeft);
    if (targetEl === UI.difficulty) UI.difficulty.value = (UI.difficulty.value in DIFFICULTY_INTERVALS) ? UI.difficulty.value : 'medium';
  }

  // Interceptar cambios mientras corre el juego
  const midGameGuard = (ev) => {
    if (!State.running) return;
    const el = ev.target;

    // Caso 1: dificultad
    if (el === UI.difficulty) {
      ev.preventDefault();
      restoreInputsFromState(el);
      showErrorBox('⛔ En plena partida no se puede cambiar dificultad.');
      return;
    }

    // Caso 2: tiempo/filas/columnas
    if (el === UI.timeInput || el === UI.rows || el === UI.cols) {
      ev.preventDefault();
      restoreInputsFromState(el);
      showErrorBox('⛔ Espere a que termine la partida para cambiar tiempo, filas o columnas.');
      return;
    }
  };

  // Escuchamos tanto 'input' como 'change' para máxima cobertura
  [UI.difficulty, UI.timeInput, UI.rows, UI.cols].forEach((el) => {
    if (!el) return;
    el.addEventListener('input', midGameGuard, true);
    el.addEventListener('change', midGameGuard, true);
  });

  // 11) ARRANQUE
  // ====================================================================
  buildGrid();
})();