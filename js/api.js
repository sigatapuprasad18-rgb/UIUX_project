/* MindWallet — API Client for MongoDB Atlas Cloud Sync & Backend Services */

class MindWalletAPI {
    constructor() {
        this.baseUrl = window.location.origin;
        this.isConnected = false;
        this.lastSyncTime = null;
        this.statusListeners = [];
        this.checkTimer = null;
        this.init();
    }

    init() {
        // Initial health check
        this.checkHealth();
        // Periodic check every 30 seconds
        this.checkTimer = setInterval(() => this.checkHealth(), 30000);
    }

    onStatusChange(fn) {
        if (typeof fn === 'function') {
            this.statusListeners.push(fn);
            fn({ isConnected: this.isConnected, lastSyncTime: this.lastSyncTime });
        }
    }

    notifyStatus(extra = {}) {
        const payload = {
            isConnected: this.isConnected,
            lastSyncTime: this.lastSyncTime,
            ...extra
        };
        this.statusListeners.forEach(fn => {
            try { fn(payload); } catch (e) { console.error('Status listener error:', e); }
        });
    }

    async checkHealth() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const res = await fetch(`${this.baseUrl}/api/health`, {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                this.isConnected = data.database?.connected || false;
                this.notifyStatus({
                    database: data.database?.database || 'mindwallet',
                    host: data.database?.host,
                    counts: data.database?.counts
                });
                return data;
            } else {
                this.isConnected = false;
                this.notifyStatus();
                return null;
            }
        } catch (err) {
            this.isConnected = false;
            this.notifyStatus();
            return null;
        }
    }

    async postJson(endpoint, body) {
        try {
            const res = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            return { ok: res.ok, status: res.status, data };
        } catch (err) {
            return { ok: false, offline: true, error: err.message };
        }
    }

    async getJson(endpoint, params = {}) {
        try {
            const url = new URL(`${this.baseUrl}${endpoint}`);
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined && v !== null) url.searchParams.append(k, v);
            });
            const res = await fetch(url.toString(), {
                headers: { 'Accept': 'application/json' }
            });
            const data = await res.json();
            return { ok: res.ok, status: res.status, data };
        } catch (err) {
            return { ok: false, offline: true, error: err.message };
        }
    }

    /**
     * Two-way synchronization between client store and MongoDB Atlas
     */
    async syncAll(payload) {
        const res = await this.postJson('/api/sync', payload);
        if (res.ok && res.data?.success) {
            this.isConnected = true;
            this.lastSyncTime = new Date();
            this.notifyStatus({ syncSuccess: true });
            return res.data;
        }
        return null;
    }

    /**
     * Authenticate with MongoDB Atlas user record
     */
    async login(email, password, personaRole) {
        return this.postJson('/api/auth/login', { email, password, personaRole });
    }

    /**
     * Register new user account in MongoDB Atlas
     */
    async register(name, email, password, persona) {
        return this.postJson('/api/auth/register', { name, email, password, persona });
    }

    /**
     * Create demo guest session in MongoDB Atlas
     */
    async guestLogin(persona) {
        return this.postJson('/api/auth/guest', { persona });
    }

    /**
     * Switch active profile persona in MongoDB Atlas
     */
    async updatePersona(userId, personaKey) {
        return this.postJson('/api/auth/persona', { userId, personaKey });
    }

    /**
     * Save accessibility & display settings in MongoDB Atlas
     */
    async updateSettings(userId, settings) {
        return this.postJson('/api/auth/settings', { userId, settings });
    }

    /**
     * Fetch MongoDB Aggregation Analytics summary
     */
    async getAnalytics(userId, persona, month) {
        return this.getJson('/api/analytics/summary', { userId, persona, month });
    }
}

export const api = new MindWalletAPI();
