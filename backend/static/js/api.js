import { CONFIG } from './config.js';
import { UI } from './ui.js';

// Wrapper genérico para fetch
async function fetchAPI(path, options = {}) {
    try {
        options.headers = { 'Content-Type': 'application/json', ...options.headers };
        // Usamos la configuración global de API Base
        const response = await fetch(`${CONFIG.API_BASE}${path}`, options);
        
        if (response.status === 204) return { success: true };
        if (!response.ok) throw new Error(await response.text());
        
        return response.json();
    } catch (error) {
        console.error('API Error:', error);
        UI.toast(`Error de Conexión: ${error.message}`);
        return null;
    }
}

// Métodos específicos
export const API = {
    async getProfiles() {
        return await fetchAPI('/api/perfiles');
    },

    async getProfile(id) {
        return await fetchAPI(`/api/perfiles/${id}`);
    },

    async createOrUpdateProfile(id, data) {
        const method = id ? 'PUT' : 'POST';
        const path = id ? `/api/perfiles/${id}` : '/api/perfiles';
        return await fetchAPI(path, { method, body: JSON.stringify(data) });
    },

    async getScores(profileId) {
        return await fetchAPI(`/api/scores/${profileId}`);
    },

    async sendScore(profileId, scoreData) {
        return await fetchAPI(`/api/scores/${profileId}`, {
            method: 'POST',
            body: JSON.stringify(scoreData)
        });
    }
};