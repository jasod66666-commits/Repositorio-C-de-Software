// Manejo de Interfaz de Usuario (DOM)
export const UI = {
    // Selectores cacheados
    elements: {
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
        // Perfil
        profileSelect: document.getElementById('profileSelect'),
        username: document.getElementById('username'),
        email: document.getElementById('email'),
        avatar: document.getElementById('avatar'),
        apiBase: document.getElementById('apiBase'),
        createBtn: document.getElementById('createProfileBtn'),
        statsBox: document.getElementById('statsBox'),
    },

    // Mostrar mensaje flotante
    toast(msg) {
        const el = document.createElement('div');
        el.className = 'toast';
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2500);
    },

    // Limpiar grilla
    clearGrid() {
        if (this.elements.grid) this.elements.grid.innerHTML = '';
    },

    // Construir la grilla visualmente
    buildGrid(rows, cols, onCellClickCallback) {
        this.clearGrid();
        this.elements.grid.style.setProperty('--cols', cols);
        const total = rows * cols;

        for (let i = 0; i < total; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            // Por defecto: escribiendo
            cell.innerHTML = '<span class="pixel-sprite sprite-escribiendo"></span>';
            
            // Asignar evento click que llama al callback del juego
            cell.addEventListener('click', () => onCellClickCallback(i, cell));
            
            this.elements.grid.appendChild(cell);
        }
    },

    // Actualizar HUD
    updateHUD(score, time) {
        this.elements.score.textContent = score;
        this.elements.time.textContent = time;
    },

    // Sprites visuales
    showCopion(idx) {
        const cell = this.elements.grid.children[idx];
        if (cell) {
            cell.classList.add('copion');
            cell.innerHTML = '<span class="pixel-sprite sprite-copiando"></span>';
        }
    },

    hideCopion(idx) {
        const cell = this.elements.grid.children[idx];
        if (cell) {
            cell.classList.remove('copion');
            cell.innerHTML = '<span class="pixel-sprite sprite-escribiendo"></span>';
        }
    },

    showTrail(idx) {
        const cell = this.elements.grid.children[idx];
        if (cell) {
            const t = document.createElement('div');
            t.className = 'trail';
            t.innerHTML = '<span class="pixel-sprite sprite-copiando"></span>';
            cell.appendChild(t);
            setTimeout(() => t.remove(), 1000);
        }
    },
    
    showMiss(cell) {
        cell.classList.add('miss'); 
        setTimeout(() => cell.classList.remove('miss'), 200);
    }
};