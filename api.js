/* ═══════════════════════════════════════════════════════════
   STARDUST — Centralized API Client
   All frontend → backend communication flows through here.
   ═══════════════════════════════════════════════════════════ */

const StardustAPI = (() => {
  const BASE = 'https://stardust-bot.onrender.com';

  async function request(path, options = {}) {
    const url = `${BASE}${path}`;
    const opts = {
      credentials: 'include', // send cookies cross-domain
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    };

    try {
      const res = await fetch(url, opts);
      const text = await res.text();
      let json;
      try { json = text ? JSON.parse(text) : {}; }
      catch { json = { success: false, error: { code: 'BAD_JSON', message: 'Invalid response' } }; }

      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          error: json.error || { code: 'HTTP_' + res.status, message: 'Request failed' }
        };
      }
      return { ok: true, status: res.status, data: json.data ?? json };
    } catch (err) {
      return {
        ok: false,
        status: 0,
        error: { code: 'NETWORK', message: 'Backend unavailable. Render may be waking up.' }
      };
    }
  }

  return {
    base: BASE,

    // ─── Auth ───
    async login() {
      const res = await request('/api/login');
      if (res.ok && res.data?.url) {
        window.location.href = res.data.url;
      } else {
        throw new Error(res.error?.message || 'Login failed');
      }
    },

    async me() {
      return request('/api/auth/me');
    },

    async servers() {
      return request('/api/auth/servers');
    },

    async logout() {
      return request('/api/logout', { method: 'POST' });
    },

    // ─── Guild ───
    async overview(guildId) {
      return request(`/api/guilds/${guildId}/overview`);
    },

    async getConfig(guildId) {
      return request(`/api/guilds/${guildId}/config`);
    },

    async updateConfig(guildId, patch) {
      return request(`/api/guilds/${guildId}/config`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
    },

    async automodWords(guildId) {
      return request(`/api/guilds/${guildId}/automod/words`);
    },

    async addAutomodWord(guildId, word) {
      return request(`/api/guilds/${guildId}/automod/words`, {
        method: 'POST',
        body: JSON.stringify({ word }),
      });
    },

    async removeAutomodWord(guildId, word) {
      return request(`/api/guilds/${guildId}/automod/words`, {
        method: 'DELETE',
        body: JSON.stringify({ word }),
      });
    },

    async economyLeaderboard(guildId) {
      return request(`/api/guilds/${guildId}/economy/leaderboard`);
    },

    async startGiveaway(guildId, payload) {
      return request(`/api/guilds/${guildId}/giveaway`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async sendEmbed(guildId, payload) {
      return request(`/api/guilds/${guildId}/embed`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async deployTicketPanel(guildId, channelId) {
      return request(`/api/guilds/${guildId}/tickets/deploy`, {
        method: 'POST',
        body: JSON.stringify({ channel_id: channelId }),
      });
    },

    // ─── Public health ───
    async health() {
      return request('/api/health');
    },
  };
})();

window.StardustAPI = StardustAPI;
