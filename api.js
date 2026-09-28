/* ═══════════════════════════════════════════════════════════
   STARDUST — API Client
   Bulletproof: every call wrapped, never throws at import time
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var BASE = 'https://stardust-bot.onrender.com';

  async function request(path, options) {
    options = options || {};
    var url = BASE + path;
    var opts = {
      credentials: 'include',
      headers: Object.assign(
        { 'Content-Type': 'application/json' },
        options.headers || {}
      ),
      method: options.method || 'GET'
    };
    if (options.body) opts.body = options.body;

    try {
      var res = await fetch(url, opts);
      var text = '';
      try { text = await res.text(); } catch (e) { text = ''; }

      var json = {};
      if (text) {
        try { json = JSON.parse(text); }
        catch (e) {
          json = { success: false, error: { code: 'BAD_JSON', message: 'Invalid response' } };
        }
      }

      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          error: json.error || { code: 'HTTP_' + res.status, message: 'Request failed (' + res.status + ')' }
        };
      }

      return {
        ok: true,
        status: res.status,
        data: (json && json.data !== undefined) ? json.data : json
      };
    } catch (err) {
      return {
        ok: false,
        status: 0,
        error: {
          code: 'NETWORK',
          message: 'Backend unreachable. Render may be waking up — try again in 30 seconds.'
        }
      };
    }
  }

  var API = {
    base: BASE,
    request: request,

    login: function () {
      return request('/api/login').then(function (res) {
        if (res.ok && res.data && res.data.url) {
          window.location.href = res.data.url;
          return res;
        }
        throw new Error((res.error && res.error.message) || 'Login failed');
      });
    },

    me: function () { return request('/api/auth/me'); },
    servers: function () { return request('/api/auth/servers'); },
    logout: function () { return request('/api/logout', { method: 'POST' }); },

    overview: function (gid) { return request('/api/guilds/' + gid + '/overview'); },
    getConfig: function (gid) { return request('/api/guilds/' + gid + '/config'); },
    updateConfig: function (gid, patch) {
      return request('/api/guilds/' + gid + '/config', {
        method: 'PATCH',
        body: JSON.stringify(patch)
      });
    },

    automodWords: function (gid) { return request('/api/guilds/' + gid + '/automod/words'); },
    addAutomodWord: function (gid, word) {
      return request('/api/guilds/' + gid + '/automod/words', {
        method: 'POST',
        body: JSON.stringify({ word: word })
      });
    },
    removeAutomodWord: function (gid, word) {
      return request('/api/guilds/' + gid + '/automod/words', {
        method: 'DELETE',
        body: JSON.stringify({ word: word })
      });
    },

    economyLeaderboard: function (gid) { return request('/api/guilds/' + gid + '/economy/leaderboard'); },
    startGiveaway: function (gid, payload) {
      return request('/api/guilds/' + gid + '/giveaway', { method: 'POST', body: JSON.stringify(payload) });
    },
    sendEmbed: function (gid, payload) {
      return request('/api/guilds/' + gid + '/embed', { method: 'POST', body: JSON.stringify(payload) });
    },
    deployTicketPanel: function (gid, chId) {
      return request('/api/guilds/' + gid + '/tickets/deploy', {
        method: 'POST',
        body: JSON.stringify({ channel_id: chId })
      });
    },

    health: function () { return request('/api/health'); }
  };

  window.StardustAPI = API;

  if (window.console) console.log('[Stardust] api.js loaded');
})();
