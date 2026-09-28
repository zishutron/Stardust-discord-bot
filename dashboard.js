/* ═══════════════════════════════════════════════════════════
   STARDUST DASHBOARD — server selector
   Uses StardustAPI (api.js) + theme/helpers from app.js
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var state = {
    user: null,
    servers: [],
    filter: 'all',
    query: ''
  };

  // ─── DOM refs (safe lookups) ───
  var els = {};

  function $(id) { return document.getElementById(id); }

  function cacheRefs() {
    els.loadingState = $('loadingState');
    els.errorState = $('errorState');
    els.unauthState = $('unauthState');
    els.mainContent = $('mainContent');
    els.errorTitle = $('errorTitle');
    els.errorMessage = $('errorMessage');
    els.retryBtn = $('retryBtn');
    els.loginFromDash = $('loginFromDash');
    els.serverGrid = $('serverGrid');
    els.emptyState = $('emptyState');
    els.emptyTitle = $('emptyTitle');
    els.emptyMessage = $('emptyMessage');
    els.serverSearch = $('serverSearch');
    els.countAll = $('countAll');
    els.countManageable = $('countManageable');
    els.countMissing = $('countMissing');
    els.userMenu = $('userMenu');
    els.userChip = $('userChip');
    els.userAvatar = $('userAvatar');
    els.userName = $('userName');
    els.logoutBtn = $('logoutBtn');
    els.addBotBtn = $('addBotBtn');
  }

  // ─── UI state switching ───
  function showOnly(name) {
    ['loadingState', 'errorState', 'unauthState', 'mainContent'].forEach(function (k) {
      if (els[k]) els[k].hidden = (k !== name);
    });
  }

  function showError(title, msg) {
    if (els.errorTitle) els.errorTitle.textContent = title;
    if (els.errorMessage) els.errorMessage.textContent = msg;
    showOnly('errorState');
  }

  // ─── User menu ───
  function initUserMenu() {
    if (!els.userChip || !els.userMenu) return;
    els.userChip.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = els.userMenu.classList.toggle('open');
      els.userChip.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!els.userMenu.contains(e.target)) {
        els.userMenu.classList.remove('open');
        els.userChip.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        els.userMenu.classList.remove('open');
        els.userChip.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ─── Logout ───
  function initLogout() {
    if (!els.logoutBtn) return;
    els.logoutBtn.addEventListener('click', async function () {
      els.logoutBtn.disabled = true;
      try { await window.StardustAPI.logout(); } catch (e) {}
      window.location.href = 'index.html';
    });
  }

  // ─── Add-bot default link ───
  function setAddBotLink() {
    if (!els.addBotBtn) return;
    els.addBotBtn.href =
      'https://discord.com/oauth2/authorize' +
      '?client_id=1517046273037832342' +
      '&permissions=8' +
      '&integration_type=0' +
      '&scope=bot';
    els.addBotBtn.target = '_blank';
  }

  // ─── Login from empty state ───
  function initLoginFromDash() {
    if (!els.loginFromDash) return;
    els.loginFromDash.addEventListener('click', async function () {
      els.loginFromDash.disabled = true;
      try {
        await window.StardustAPI.login();
      } catch (err) {
        els.loginFromDash.disabled = false;
        if (window.stardustToast) window.stardustToast('Login failed. Try again.', 'error');
      }
    });
  }

  // ─── Retry ───
  function initRetry() {
    if (!els.retryBtn) return;
    els.retryBtn.addEventListener('click', function () {
      loadEverything();
    });
  }

  // ─── Filter tabs ───
  function initFilterTabs() {
    document.querySelectorAll('.filter-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.filter-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        state.filter = tab.dataset.filter || 'all';
        render();
      });
    });
  }

  // ─── Search ───
  function initSearch() {
    if (!els.serverSearch) return;
    var t = null;
    els.serverSearch.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        state.query = (els.serverSearch.value || '').trim().toLowerCase();
        render();
      }, 120);
    });
  }

  // ─── Helpers ───
  function serverIconUrl(server) {
    if (!server || !server.icon) return null;
    return 'https://cdn.discordapp.com/icons/' + server.id + '/' + server.icon + '.png?size=128';
  }

  function initials(name) {
    if (!name) return '?';
    var parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  // ─── Rendering ───
  function filteredServers() {
    return state.servers.filter(function (s) {
      // filter
      if (state.filter === 'manageable' && !(s.bot_present && s.can_manage)) return false;
      if (state.filter === 'missing' && !(s.can_manage && !s.bot_present)) return false;

      // search
      if (state.query) {
        var n = (s.name || '').toLowerCase();
        if (n.indexOf(state.query) === -1) return false;
      }
      return true;
    });
  }

  function counts() {
    var all = state.servers.length;
    var manageable = 0, missing = 0;
    state.servers.forEach(function (s) {
      if (s.bot_present && s.can_manage) manageable++;
      if (s.can_manage && !s.bot_present) missing++;
    });
    return { all: all, manageable: manageable, missing: missing };
  }

  function renderCounts() {
    var c = counts();
    if (els.countAll) els.countAll.textContent = c.all;
    if (els.countManageable) els.countManageable.textContent = c.manageable;
    if (els.countMissing) els.countMissing.textContent = c.missing;
  }

  function renderServerCard(s) {
    var iconUrl = serverIconUrl(s);
    var canManage = s.can_manage && s.bot_present;
    var canInstall = s.can_manage && !s.bot_present;
    var noPerm = !s.can_manage;

    var iconHtml = iconUrl
      ? '<img class="server-icon" src="' + iconUrl + '" alt="">'
      : '<div class="server-icon-fallback">' + escapeHtml(initials(s.name)) + '</div>';

    var badges = '';
    if (s.bot_present) {
      badges += '<span class="server-badge ok">● Active</span>';
    } else if (s.can_manage) {
      badges += '<span class="server-badge warn">● Not installed</span>';
    }
    if (s.owner) badges += '<span class="server-badge owner">Owner</span>';
    if (noPerm) badges += '<span class="server-badge">No permission</span>';

    var actions = '';
    if (canManage) {
      actions =
        '<button class="btn btn-primary" data-action="manage" data-id="' + s.id + '">Manage</button>';
    } else if (canInstall) {
      actions =
        '<a class="btn btn-primary" target="_blank" rel="noopener" ' +
        'href="https://discord.com/oauth2/authorize?client_id=1517046273037832342&permissions=8&integration_type=0&scope=bot&guild_id=' + s.id + '&disable_guild_select=true">' +
        'Add Stardust</a>';
    } else {
      actions =
        '<button class="btn btn-secondary" disabled>No access</button>';
    }

    return (
      '<div class="server-card' + (noPerm ? ' no-perm' : '') + '">' +
        '<div class="server-card-head">' +
          iconHtml +
          '<div class="server-meta">' +
            '<div class="server-name">' + escapeHtml(s.name) + '</div>' +
            '<div class="server-badges">' + badges + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="server-card-actions">' + actions + '</div>' +
      '</div>'
    );
  }

  function render() {
    if (!els.serverGrid) return;
    var list = filteredServers();
    renderCounts();

    if (list.length === 0) {
      els.serverGrid.innerHTML = '';
      els.emptyState.hidden = false;
      if (state.query) {
        els.emptyTitle.textContent = 'No matches';
        els.emptyMessage.textContent = 'No servers match "' + state.query + '".';
      } else if (state.filter === 'manageable') {
        els.emptyTitle.textContent = 'No manageable servers';
        els.emptyMessage.textContent = "You don't manage any servers with Stardust installed.";
      } else if (state.filter === 'missing') {
        els.emptyTitle.textContent = 'All set';
        els.emptyMessage.textContent = 'Stardust is already on every server you manage.';
      } else {
        els.emptyTitle.textContent = 'No servers found';
        els.emptyMessage.textContent = "You don't have any Discord servers yet.";
      }
      return;
    }

    els.emptyState.hidden = true;
    els.serverGrid.innerHTML = list.map(renderServerCard).join('');
  }

  // ─── Card actions (event delegation) ───
  function initCardActions() {
    if (!els.serverGrid) return;
    els.serverGrid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action="manage"]');
      if (!btn) return;
      var id = btn.getAttribute('data-id');
      if (!id) return;
      window.location.href = 'server.html?guild=' + encodeURIComponent(id);
    });
  }

  // ─── Data loading ───
  async function loadEverything() {
    showOnly('loadingState');

    // 1. Auth check
    var meRes = await window.StardustAPI.me();
    if (!meRes.ok) {
      if (meRes.status === 401) {
        showOnly('unauthState');
        return;
      }
      showError('Session error', meRes.error && meRes.error.message || 'Please try again.');
      return;
    }
    state.user = meRes.data;
    renderUser();

    // 2. Servers
    var srvRes = await window.StardustAPI.servers();
    if (!srvRes.ok) {
      if (srvRes.status === 401) {
        showOnly('unauthState');
        return;
      }
      if (srvRes.status === 0 || srvRes.status === 503) {
        showError('Backend unavailable', 'Stardust is waking up on Render. Try again in ~30 seconds.');
        return;
      }
      showError('Could not load servers', srvRes.error && srvRes.error.message || 'Unexpected error.');
      return;
    }
    state.servers = Array.isArray(srvRes.data) ? srvRes.data : [];

    showOnly('mainContent');
    render();
  }

  function renderUser() {
    var u = state.user;
    if (!u) return;
    if (els.userMenu) els.userMenu.hidden = false;

    var name = u.global_name || u.username || 'User';
    if (els.userName) els.userName.textContent = name;

    if (els.userAvatar) {
      var url = u.avatar
        ? 'https://cdn.discordapp.com/avatars/' + u.id + '/' + u.avatar + '.png?size=64'
        : 'https://cdn.discordapp.com/embed/avatars/0.png';
      els.userAvatar.src = url;
      els.userAvatar.alt = name;
    }
  }

  // ─── Boot ───
  function boot() {
    cacheRefs();
    setAddBotLink();
    initUserMenu();
    initLogout();
    initLoginFromDash();
    initRetry();
    initFilterTabs();
    initSearch();
    initCardActions();
    loadEverything();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
