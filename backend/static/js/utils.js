import { CONFIG } from './config.js';

// Generar número aleatorio
export const rnd = (n) => Math.floor(Math.random() * n);

// Parsear input a número
export const parseNumeric = (value) => {
    const match = String(value).match(/\d+/);
    return match ? parseInt(match[0], 10) : NaN;
};

// Obtener hora actual formateada
export const nowTime = () => new Date().toLocaleTimeString();

// Validador universal de inputs
export function validateInputs(uiElements) {
    let errorMsg = null;
    const { rowsInput, colsInput, timeInput, errBox } = uiElements;

    // 1. Filas
    const r = parseNumeric(rowsInput.value);
    if (Number.isNaN(r) || r < 2 || r > CONFIG.LIMIT) {
        rowsInput.classList.add('invalid');
        if (!errorMsg) errorMsg = `Filas: Mínimo 2, Máximo ${CONFIG.LIMIT}`;
    } else {
        rowsInput.classList.remove('invalid');
    }

    // 2. Columnas
    const c = parseNumeric(colsInput.value);
    if (Number.isNaN(c) || c < 2 || c > CONFIG.LIMIT) {
        colsInput.classList.add('invalid');
        if (!errorMsg) errorMsg = `Columnas: Mínimo 2, Máximo ${CONFIG.LIMIT}`;
    } else {
        colsInput.classList.remove('invalid');
    }

    // 3. Tiempo
    const t = parseNumeric(timeInput.value);
    if (Number.isNaN(t) || t < 10 || t > 90) {
        timeInput.classList.add('invalid');
        if (!errorMsg) errorMsg = `Tiempo: Mínimo 10s, Máximo 90s`;
    } else {
        timeInput.classList.remove('invalid');
    }

    // Visualizar error
    if (errorMsg) {
        if (errBox) {
            errBox.textContent = errorMsg;
            errBox.classList.add('show');
        }
        return false;
    } else {
        if (errBox) {
            errBox.textContent = '';
            errBox.classList.remove('show');
        }
        return true;
    }
}