/* ═══════════════════════════════════════════════════════════
   STARDUST — Server dashboard logic (v4)
   SVG icons, image upload via Catbox, full config wiring.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var API = window.StardustAPI;
  function $(id) { return document.getElementById(id); }

  // ─────────────────────────────────────────────
  // INLINE SVG ICONS (no emoji)
  // ─────────────────────────────────────────────
  var SVG_USERS   = '<svg class="stat-svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
  var SVG_CHANNEL = '<svg class="stat-svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  var SVG_TAG     = '<svg class="stat-svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><path d="M7 7h.01"/></svg>';
  var SVG_ZAP     = '<svg class="stat-svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>';
  var SVG_COIN    = '<svg class="stat-svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a2 2 0 0 1 0 4h-3a2 2 0 0 0 0 4h4"/></svg>';

  var state = {
    guildId: null,
    user: null,
    overview: null,
    config: {},
    words: [],
    autoresponders: {},
    customCommands: {},
    channels: [],
    roles: [],
    activeTab: 'overview',
    loaded: { economy: false }
  };

  var els = {};

  // ─────────────────────────────────────────────
  // CACHE
  // ─────────────────────────────────────────────
  function cache() {
    els.loading = $('serverLoading');
    els.error = $('serverError');
    els.errorTitle = $('serverErrorTitle');
    els.errorMessage = $('serverErrorMessage');
    els.retryBtn = $('serverRetryBtn');
    els.content = $('serverContent');
    els.crumb = $('crumbServer');
    els.sidebar = $('serverSidebar');
    els.sidebarServer = $('sidebarServer');
    els.overlay = $('serverOverlay');
    els.mobileMenu = $('serverMobileMenu');
    els.userMenu = $('userMenu');
    els.userChip = $('userChip');
    els.userAvatar = $('userAvatar');
    els.userName = $('userName');
    els.logoutBtn = $('logoutBtn');

    els.panels = document.querySelectorAll('.tab-panel');
    els.links = document.querySelectorAll('.sidebar-link[data-tab]');

    els.serverHeroIcon = $('serverHeroIcon');
    els.serverHeroName = $('serverHeroName');
    els.serverHeroStats = $('serverHeroStats');
    els.statsRow = $('statsRow');
    els.modulesGrid = $('modulesGrid');

    els.welcomeEnabled = $('welcomeEnabled');
    els.welcomeChannel = $('welcomeChannel');
    els.welcomeMention = $('welcomeMention');
    els.welcomeDm = $('welcomeDm');
    els.welcomeMessage = $('welcomeMessage');
    els.welcomeUseEmbed = $('welcomeUseEmbed');
    els.welcomeEmbedTitle = $('welcomeEmbedTitle');
    els.welcomeEmbedDescription = $('welcomeEmbedDescription');
    els.welcomeEmbedColor = $('welcomeEmbedColor');
    els.welcomeEmbedColorPicker = $('welcomeEmbedColorPicker');
    els.welcomeEmbedImage = $('welcomeEmbedImage');
    els.welcomePreviewBar = $('welcomePreviewBar');
    els.welcomePreviewTitle = $('welcomePreviewTitle');
    els.welcomePreviewDesc = $('welcomePreviewDesc');
    els.welcomePreviewImgWrap = $('welcomePreviewImgWrap');
    els.welcomePreviewImg = $('welcomePreviewImg');
    els.welcomeSaveBtn = $('welcomeSaveBtn');
    els.welcomeTestBtn = $('welcomeTestBtn');

    els.leaveEnabled = $('leaveEnabled');
    els.leaveChannel = $('leaveChannel');
    els.leaveUseEmbed = $('leaveUseEmbed');
    els.leaveMessage = $('leaveMessage');
    els.leaveEmbedTitle = $('leaveEmbedTitle');
    els.leaveEmbedDescription = $('leaveEmbedDescription');
    els.leaveEmbedColor = $('leaveEmbedColor');
    els.leaveEmbedColorPicker = $('leaveEmbedColorPicker');
    els.leaveEmbedImage = $('leaveEmbedImage');
    els.leavePreviewBar = $('leavePreviewBar');
    els.leavePreviewTitle = $('leavePreviewTitle');
    els.leavePreviewDesc = $('leavePreviewDesc');
    els.leavePreviewImgWrap = $('leavePreviewImgWrap');
    els.leavePreviewImg = $('leavePreviewImg');
    els.leaveSaveBtn = $('leaveSaveBtn');

    els.boosterEnabled = $('boosterEnabled');
    els.boosterChannel = $('boosterChannel');
    els.boosterUseEmbed = $('boosterUseEmbed');
    els.boosterReward = $('boosterReward');
    els.boosterBadge = $('boosterBadge');
    els.boosterMessage = $('boosterMessage');
    els.boosterEmbedTitle = $('boosterEmbedTitle');
    els.boosterEmbedDescription = $('boosterEmbedDescription');
    els.boosterEmbedColor = $('boosterEmbedColor');
    els.boosterEmbedColorPicker = $('boosterEmbedColorPicker');
    els.boosterEmbedImage = $('boosterEmbedImage');
    els.boosterSaveBtn = $('boosterSaveBtn');

    els.levelEnabled = $('levelEnabled');
    els.levelXpMin = $('levelXpMin');
    els.levelXpMax = $('levelXpMax');
    els.levelCooldown = $('levelCooldown');
    els.levelBaseXp = $('levelBaseXp');
    els.levelMultiplier = $('levelMultiplier');
    els.levelAnnounceEnabled = $('levelAnnounceEnabled');
    els.levelChannel = $('levelChannel');
    els.levelMsg = $('levelMsg');
    els.levelUseCard = $('levelUseCard');
    els.levelSaveBtn = $('levelSaveBtn');

    els.economyEnabled = $('economyEnabled');
    els.economyCurrencyName = $('economyCurrencyName');
    els.economyCurrencySymbol = $('economyCurrencySymbol');
    els.economyDailyAmount = $('economyDailyAmount');
    els.economyDailyCooldown = $('economyDailyCooldown');
    els.economyRewardChannel = $('economyRewardChannel');
    els.economyRewardChance = $('economyRewardChance');
    els.economyRewardMin = $('economyRewardMin');
    els.economyRewardMax = $('economyRewardMax');
    els.economyLb = $('economyLb');
    els.economySaveBtn = $('economySaveBtn');

    els.automodEnabled = $('automodEnabled');
    els.automodIgnoreStaff = $('automodIgnoreStaff');
    els.automodAction = $('automodAction');
    els.automodWarnExpiry = $('automodWarnExpiry');
    els.wordInput = $('wordInput');
    els.wordAddBtn = $('wordAddBtn');
    els.wordChips = $('wordChips');
    els.wordEmpty = $('wordEmpty');
    els.wordCount = $('wordCount');
    els.automodSaveBtn = $('automodSaveBtn');

    els.autoresponderEnabled = $('autoresponderEnabled');
    els.arTriggerInput = $('arTriggerInput');
    els.arResponseInput = $('arResponseInput');
    els.arAddBtn = $('arAddBtn');
    els.arList = $('arList');
    els.arEmpty = $('arEmpty');
    els.arCount = $('arCount');
    els.autoresponderSaveBtn = $('autoresponderSaveBtn');

    els.loggingEnabled = $('loggingEnabled');
    els.loggingChannel = $('loggingChannel');
    els.logMsgDelete = $('logMsgDelete');
    els.logMsgEdit = $('logMsgEdit');
    els.logMemberJoin = $('logMemberJoin');
    els.logMemberLeave = $('logMemberLeave');
    els.logVoice = $('logVoice');
    els.loggingSaveBtn = $('loggingSaveBtn');

    els.ticketEnabled = $('ticketEnabled');
    els.ticketPanelChannel = $('ticketPanelChannel');
    els.ticketPanelTitle = $('ticketPanelTitle');
    els.ticketPanelDescription = $('ticketPanelDescription');
    els.ticketStaffRole = $('ticketStaffRole');
    els.ticketCategory = $('ticketCategory');
    els.ticketLogChannel = $('ticketLogChannel');
    els.ticketAutoPing = $('ticketAutoPing');
    els.ticketWelcomeTitle = $('ticketWelcomeTitle');
    els.ticketWelcomeMessage = $('ticketWelcomeMessage');
    els.ticketSaveBtn = $('ticketSaveBtn');
    els.ticketDeployBtn = $('ticketDeployBtn');

    els.ccTriggerInput = $('ccTriggerInput');
    els.ccResponseInput = $('ccResponseInput');
    els.ccAddBtn = $('ccAddBtn');
    els.ccList = $('ccList');
    els.ccEmpty = $('ccEmpty');
    els.ccCount = $('ccCount');

    els.emTitle = $('emTitle');
    els.emDescription = $('emDescription');
    els.emColor = $('emColor');
    els.emColorPicker = $('emColorPicker');
    els.emImage = $('emImage');
    els.emChannel = $('emChannel');
    els.emPreviewBtn = $('emPreviewBtn');
    els.emSendBtn = $('emSendBtn');
    els.emPreviewBar = $('emPreviewBar');
    els.emPreviewTitle = $('emPreviewTitle');
    els.emPreviewDesc = $('emPreviewDesc');
    els.emPreviewImgWrap = $('emPreviewImgWrap');
    els.emPreviewImg = $('emPreviewImg');

    els.gwPrize = $('gwPrize');
    els.gwDuration = $('gwDuration');
    els.gwWinners = $('gwWinners');
    els.gwChannel = $('gwChannel');
    els.gwStartBtn = $('gwStartBtn');

    els.setGuildId = $('setGuildId');
    els.setBotPresence = $('setBotPresence');
    els.setBotLatency = $('setBotLatency');

    els.modalOverlay = $('modalOverlay');
    els.modalTitle = $('modalTitle');
    els.modalBody = $('modalBody');
    els.modalCancel = $('modalCancel');
    els.modalConfirm = $('modalConfirm');
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────
  function showOnly(name) {
    if (els.loading) els.loading.hidden = name !== 'loading';
    if (els.error) els.error.hidden = name !== 'error';
    if (els.content) els.content.hidden = name !== 'content';
  }
  function toast(msg, type) {
    if (window.stardustToast) window.stardustToast(msg, type || 'info');
    else console.log('[toast]', type, msg);
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function initials(name) {
    if (!name) return '?';
    var p = String(name).trim().split(/\s+/);
    if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
    return (p[0][0] + p[1][0]).toUpperCase();
  }
  function avatarUrl(id, hash) {
    if (!hash) return 'https://cdn.discordapp.com/embed/avatars/0.png';
    return 'https://cdn.discordapp.com/avatars/' + id + '/' + hash + '.png?size=64';
  }
  function setToggle(el, on) { if (el) el.setAttribute('aria-checked', on ? 'true' : 'false'); }
  function getToggle(el) { return el && el.getAttribute('aria-checked') === 'true'; }
  function hexOk(v) {
    if (!v) return false;
    v = String(v).trim();
    return /^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(v);
  }
  function normalizeHex(v, fallback) {
    if (!v) return fallback;
    var h = String(v).trim();
    if (h[0] !== '#') h = '#' + h;
    if (!/^#[0-9a-fA-F]{6}$/.test(h)) return fallback;
    return h.toLowerCase();
  }

// ─────────────────────────────────────────────
// IMAGE UPLOAD (ImgBB API)
// ─────────────────────────────────────────────
var IMGBB_API_KEY = '98718c328ac688477bd3728382dd690c';

async function uploadImageToCdn(file) {
  // 1) Convert to base64
  var base64 = await new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function () {
      var result = reader.result || '';
      // Strip "data:image/...;base64," prefix
      var comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // 2) Upload to ImgBB
  var fd = new FormData();
  fd.append('key', IMGBB_API_KEY);
  fd.append('image', base64);
  fd.append('name', 'stardust-' + Date.now());

  var res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: fd });
  if (!res.ok) {
    var txt = await res.text().catch(function () { return ''; });
    console.error('[UPLOAD] ImgBB HTTP error:', res.status, txt);
    throw new Error('Upload failed: HTTP ' + res.status);
  }

  var json = await res.json();
  if (!json || !json.success || !json.data || !json.data.url) {
    console.error('[UPLOAD] ImgBB response:', json);
    throw new Error((json && json.error && json.error.message) || 'ImgBB upload failed');
  }
  return json.data.url;
}

  // ─────────────────────────────────────────────
  // CONFIRM MODAL
  // ─────────────────────────────────────────────
  var _confirmResolve = null;
  function confirmAction(title, body) {
    return new Promise(function (resolve) {
      if (!els.modalOverlay) return resolve(true);
      els.modalTitle.textContent = title;
      els.modalBody.textContent = body;
      els.modalOverlay.hidden = false;
      _confirmResolve = resolve;
    });
  }
  function closeModal(result) {
    if (els.modalOverlay) els.modalOverlay.hidden = true;
    if (_confirmResolve) { _confirmResolve(result); _confirmResolve = null; }
  }

  // ─────────────────────────────────────────────
  // TAB NAV
  // ─────────────────────────────────────────────
  function initSidebar() {
    document.querySelectorAll('.sidebar-link[data-tab]').forEach(function (link) {
      if (link.dataset.bound) return;
      link.dataset.bound = '1';
      link.addEventListener('click', function (e) {
        e.preventDefault();
        switchTab(link.dataset.tab);
        if (window.innerWidth <= 900) closeSidebar();
      });
    });
    if (els.mobileMenu && !els.mobileMenu.dataset.bound) {
      els.mobileMenu.dataset.bound = '1';
      els.mobileMenu.addEventListener('click', openSidebar);
    }
    if (els.overlay && !els.overlay.dataset.bound) {
      els.overlay.dataset.bound = '1';
      els.overlay.addEventListener('click', closeSidebar);
    }
    document.querySelectorAll('.quick-action').forEach(function (b) {
      if (b.dataset.bound) return;
      b.dataset.bound = '1';
      b.addEventListener('click', function () { switchTab(b.dataset.goto); });
    });
  }

  function switchTab(name) {
    if (!name) return;
    state.activeTab = name;
    els.links.forEach(function (l) { l.classList.toggle('active', l.dataset.tab === name); });
    els.panels.forEach(function (p) { p.classList.toggle('active', p.dataset.panel === name); });
    try { history.replaceState({}, '', '#' + name); } catch (e) {}
    if (name === 'economy' && !state.loaded.economy) loadEconomy();
  }

  function openSidebar() {
    if (els.sidebar) els.sidebar.classList.add('open');
    if (els.overlay) els.overlay.classList.add('active');
  }
  function closeSidebar() {
    if (els.sidebar) els.sidebar.classList.remove('open');
    if (els.overlay) els.overlay.classList.remove('active');
  }

  // ─────────────────────────────────────────────
  // LOAD
  // ─────────────────────────────────────────────
  async function loadEverything() {
    showOnly('loading');

    var me = await API.me();
    if (!me.ok) {
      if (me.status === 401) { window.location.href = 'dashboard.html'; return; }
      return showError('Session error', 'Please log in again.');
    }
    state.user = me.data;
    renderUser();

    var ov = await API.overview(state.guildId);
    if (!ov.ok) {
      if (ov.status === 401) { window.location.href = 'dashboard.html'; return; }
      if (ov.status === 403) return showError('Access denied', 'You do not have permission to manage this server.');
      if (ov.status === 409) return showError('Bot not installed', 'Stardust is not on this server. Re-invite it first.');
      if (ov.status === 0 || ov.status === 503) return showError('Backend unavailable', 'Stardust is waking up. Try again in ~30 seconds.');
      return showError('Could not load server', (ov.error && ov.error.message) || 'Unexpected error.');
    }
    state.overview = ov.data;

    var cfg = await API.getConfig(state.guildId);
    if (cfg.ok) state.config = cfg.data || {};

    var results = await Promise.all([
      API.request('/api/guilds/' + state.guildId + '/channels'),
      API.request('/api/guilds/' + state.guildId + '/roles'),
      API.automodWords(state.guildId),
      API.request('/api/guilds/' + state.guildId + '/autoresponder'),
      API.request('/api/guilds/' + state.guildId + '/custom_commands')
    ]);

    state.channels = (results[0].ok && Array.isArray(results[0].data)) ? results[0].data : [];
    state.roles = (results[1].ok && Array.isArray(results[1].data)) ? results[1].data : [];
    state.words = (results[2].ok && Array.isArray(results[2].data)) ? results[2].data : [];
    state.autoresponders = (results[3].ok && results[3].data) ? results[3].data : {};
    state.customCommands = (results[4].ok && results[4].data) ? results[4].data : {};

    populateChannelSelects();
    populateRoleSelects();
    renderServer();
    applyConfig();
    renderWords();
    renderAutoresponders();
    renderCustomCommands();

    showOnly('content');
  }

  function showError(title, msg) {
    if (els.errorTitle) els.errorTitle.textContent = title;
    if (els.errorMessage) els.errorMessage.textContent = msg;
    showOnly('error');
  }

  function renderUser() {
    var u = state.user; if (!u) return;
    if (els.userMenu) els.userMenu.hidden = false;
    var name = u.global_name || u.username || 'User';
    if (els.userName) els.userName.textContent = name;
    if (els.userAvatar) {
      els.userAvatar.src = avatarUrl(u.id, u.avatar);
      els.userAvatar.alt = name;
    }
  }

  // ─────────────────────────────────────────────
  // DROPDOWNS
  // ─────────────────────────────────────────────
  function populateChannelSelects() {
    var textChannels = state.channels.filter(function (c) {
      return c.type === 'text' && c.can_send;
    });
    var categories = state.channels.filter(function (c) { return c.type === 'category'; });

    var selects = [
      els.welcomeChannel, els.leaveChannel, els.boosterChannel,
      els.levelChannel, els.economyRewardChannel, els.loggingChannel,
      els.ticketPanelChannel, els.ticketLogChannel, els.gwChannel, els.emChannel
    ];

    selects.forEach(function (sel) {
      if (!sel) return;
      while (sel.options.length > 1) sel.remove(1);
      textChannels.forEach(function (ch) {
        var opt = document.createElement('option');
        opt.value = ch.id;
        opt.textContent = '#' + ch.name;
        sel.appendChild(opt);
      });
    });

    if (els.ticketCategory) {
      while (els.ticketCategory.options.length > 1) els.ticketCategory.remove(1);
      categories.forEach(function (c) {
        var opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        els.ticketCategory.appendChild(opt);
      });
    }
  }

  function populateRoleSelects() {
    if (!els.ticketStaffRole) return;
    while (els.ticketStaffRole.options.length > 1) els.ticketStaffRole.remove(1);
    state.roles.forEach(function (r) {
      var opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = '@' + r.name + (r.assignable ? '' : ' (above bot)');
      if (!r.assignable) opt.disabled = true;
      els.ticketStaffRole.appendChild(opt);
    });
  }

  function setSelectValue(sel, value) {
    if (!sel) return;
    value = value == null ? '' : String(value);
    var exists = Array.from(sel.options).some(function (o) { return o.value === value; });
    if (!exists && value) {
      var opt = document.createElement('option');
      opt.value = value;
      opt.textContent = 'ID: ' + value;
      sel.appendChild(opt);
    }
    sel.value = value;
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  function renderServer() {
    var ov = state.overview; if (!ov) return;
    if (els.crumb) els.crumb.textContent = ov.name;

    if (els.sidebarServer) {
      var icon = ov.icon
        ? '<img class="sidebar-server-icon" src="' + esc(ov.icon) + '" alt="">'
        : '<div class="sidebar-server-fallback">' + initials(ov.name) + '</div>';
      els.sidebarServer.innerHTML = icon +
        '<div style="flex:1;min-width:0;">' +
        '<div class="sidebar-server-name">' + esc(ov.name) + '</div>' +
        '<div class="sidebar-server-meta">' + (ov.member_count || 0).toLocaleString() + ' members</div>' +
        '</div>';
    }

    if (els.serverHeroIcon) {
      els.serverHeroIcon.innerHTML = ov.icon
        ? '<img src="' + esc(ov.icon) + '" alt="">'
        : initials(ov.name);
    }
    if (els.serverHeroName) els.serverHeroName.textContent = ov.name;

    if (els.serverHeroStats) {
      els.serverHeroStats.innerHTML =
        '<span>' + SVG_USERS + ' ' + (ov.member_count || 0).toLocaleString() + ' members</span>' +
        '<span>' + SVG_CHANNEL + ' ' + (ov.channel_count || 0) + ' channels</span>' +
        '<span>' + SVG_TAG + ' ' + (ov.role_count || 0) + ' roles</span>' +
        '<span>' + SVG_ZAP + ' ' + (ov.bot_latency_ms || '—') + 'ms</span>';
    }

    if (els.statsRow) {
      els.statsRow.innerHTML =
        tile(SVG_USERS + 'Members', (ov.member_count || 0).toLocaleString()) +
        tile(SVG_CHANNEL + 'Channels', ov.channel_count || 0) +
        tile(SVG_TAG + 'Roles', ov.role_count || 0) +
        tile(SVG_ZAP + 'Latency', (ov.bot_latency_ms || '—') + 'ms');
    }

    renderModules(ov.modules || {});

    if (els.setGuildId) els.setGuildId.textContent = ov.id;
    if (els.setBotPresence) els.setBotPresence.textContent = ov.bot_present ? 'Online' : 'Offline';
    if (els.setBotLatency) els.setBotLatency.textContent = (ov.bot_latency_ms || '—') + 'ms';
  }

  function tile(label, value) {
    return '<div class="stat-tile"><div class="stat-tile-label">' + label +
      '</div><div class="stat-tile-value">' + esc(value) + '</div></div>';
  }

  function renderModules(mods) {
    if (!els.modulesGrid) return;
    var tiles = [
      { key: 'welcome',       label: 'Welcome',        tab: 'welcome' },
      { key: 'leave',         label: 'Leave',          tab: 'leave' },
      { key: 'booster',       label: 'Booster',        tab: 'booster' },
      { key: 'automod',       label: 'AutoMod',        tab: 'automod' },
      { key: 'autoresponder', label: 'Auto-Responder', tab: 'autoresponder' },
      { key: 'leveling',      label: 'Leveling',       tab: 'leveling' },
      { key: 'economy',       label: 'Economy',        tab: 'economy' },
      { key: 'tickets',       label: 'Tickets',        tab: 'tickets' },
      { key: 'logging',       label: 'Logging',        tab: 'logging' }
    ];
    els.modulesGrid.innerHTML = tiles.map(function (t) {
      var on = !!mods[t.key];
      return '<button class="module-tile" data-tab="' + t.tab + '">' +
        '<span class="module-dot ' + (on ? 'on' : 'off') + '"></span>' +
        '<div class="module-info"><strong>' + t.label + '</strong>' +
        '<span>' + (on ? 'Enabled' : 'Not configured') + '</span></div></button>';
    }).join('');
    els.modulesGrid.querySelectorAll('.module-tile').forEach(function (t) {
      t.addEventListener('click', function () { switchTab(t.dataset.tab); });
    });
  }

  function applyConfig() {
    var c = state.config || {};

    setToggle(els.welcomeEnabled, !!c.welcome_enabled);
    setSelectValue(els.welcomeChannel, c.welcome_channel);
    setToggle(els.welcomeMention, c.welcome_mention !== false);
    setToggle(els.welcomeDm, !!c.welcome_dm);
    if (els.welcomeMessage) els.welcomeMessage.value = c.welcome_message || '';
    setToggle(els.welcomeUseEmbed, c.welcome_use_embed !== false);
    if (els.welcomeEmbedTitle) els.welcomeEmbedTitle.value = c.welcome_embed_title || '';
    if (els.welcomeEmbedDescription) els.welcomeEmbedDescription.value = c.welcome_embed_description || '';
    if (els.welcomeEmbedColor) els.welcomeEmbedColor.value = c.welcome_embed_color || '';
    if (els.welcomeEmbedColorPicker) els.welcomeEmbedColorPicker.value = normalizeHex(c.welcome_embed_color, '#2f3136');
    if (els.welcomeEmbedImage) els.welcomeEmbedImage.value = c.welcome_embed_image || '';

    setToggle(els.leaveEnabled, !!c.leave_enabled);
    setSelectValue(els.leaveChannel, c.leave_channel);
    setToggle(els.leaveUseEmbed, c.leave_use_embed !== false);
    if (els.leaveMessage) els.leaveMessage.value = c.leave_message || '';
    if (els.leaveEmbedTitle) els.leaveEmbedTitle.value = c.leave_embed_title || '';
    if (els.leaveEmbedDescription) els.leaveEmbedDescription.value = c.leave_embed_description || '';
    if (els.leaveEmbedColor) els.leaveEmbedColor.value = c.leave_embed_color || '';
    if (els.leaveEmbedColorPicker) els.leaveEmbedColorPicker.value = normalizeHex(c.leave_embed_color, '#99aab5');
    if (els.leaveEmbedImage) els.leaveEmbedImage.value = c.leave_embed_image || '';

    setToggle(els.boosterEnabled, c.booster_enabled !== false);
    setSelectValue(els.boosterChannel, c.booster_channel);
    setToggle(els.boosterUseEmbed, c.booster_use_embed !== false);
    if (els.boosterReward) els.boosterReward.value = c.booster_reward != null ? c.booster_reward : 10000;
    if (els.boosterBadge) els.boosterBadge.value = c.booster_badge || '';
    if (els.boosterMessage) els.boosterMessage.value = c.booster_message || '';
    if (els.boosterEmbedTitle) els.boosterEmbedTitle.value = c.booster_embed_title || '';
    if (els.boosterEmbedDescription) els.boosterEmbedDescription.value = c.booster_embed_description || '';
    if (els.boosterEmbedColor) els.boosterEmbedColor.value = c.booster_embed_color || '';
    if (els.boosterEmbedColorPicker) els.boosterEmbedColorPicker.value = normalizeHex(c.booster_embed_color, '#f47fff');
    if (els.boosterEmbedImage) els.boosterEmbedImage.value = c.booster_embed_image || '';

    setToggle(els.levelEnabled, c.level_enabled !== false);
    if (els.levelXpMin) els.levelXpMin.value = c.level_xp_min != null ? c.level_xp_min : 15;
    if (els.levelXpMax) els.levelXpMax.value = c.level_xp_max != null ? c.level_xp_max : 25;
    if (els.levelCooldown) els.levelCooldown.value = c.level_cooldown != null ? c.level_cooldown : 60;
    if (els.levelBaseXp) els.levelBaseXp.value = c.level_base_xp != null ? c.level_base_xp : 100;
    if (els.levelMultiplier) els.levelMultiplier.value = c.level_multiplier != null ? c.level_multiplier : 1;
    setToggle(els.levelAnnounceEnabled, c.level_announce_enabled !== false);
    setSelectValue(els.levelChannel, c.level_channel);
    if (els.levelMsg) els.levelMsg.value = c.level_msg || '';
    setToggle(els.levelUseCard, c.level_use_card !== false);

    setToggle(els.economyEnabled, c.economy_enabled !== false);
    if (els.economyCurrencyName) els.economyCurrencyName.value = c.economy_currency_name || '';
    if (els.economyCurrencySymbol) els.economyCurrencySymbol.value = c.economy_currency_symbol || '';
    if (els.economyDailyAmount) els.economyDailyAmount.value = c.economy_daily_amount != null ? c.economy_daily_amount : 200;
    if (els.economyDailyCooldown) els.economyDailyCooldown.value = c.economy_daily_cooldown != null ? c.economy_daily_cooldown : 86400;
    setSelectValue(els.economyRewardChannel, c.economy_reward_channel);
    if (els.economyRewardChance) els.economyRewardChance.value = c.economy_reward_chance != null ? c.economy_reward_chance : 10;
    if (els.economyRewardMin) els.economyRewardMin.value = c.economy_reward_min != null ? c.economy_reward_min : 5000;
    if (els.economyRewardMax) els.economyRewardMax.value = c.economy_reward_max != null ? c.economy_reward_max : 75000;

    setToggle(els.automodEnabled, c.automod_enabled !== false);
    setToggle(els.automodIgnoreStaff, c.automod_ignore_staff !== false);
    if (els.automodAction) els.automodAction.value = c.automod_action || 'delete_warn';
    if (els.automodWarnExpiry) els.automodWarnExpiry.value = c.automod_warn_expiry != null ? c.automod_warn_expiry : 4;

    setToggle(els.autoresponderEnabled, c.autoresponder_enabled !== false);

    setToggle(els.loggingEnabled, !!c.logging_enabled);
    setSelectValue(els.loggingChannel, c.logging_channel);
    setToggle(els.logMsgDelete, c.logging_message_delete !== false);
    setToggle(els.logMsgEdit, c.logging_message_edit !== false);
    setToggle(els.logMemberJoin, !!c.logging_member_join);
    setToggle(els.logMemberLeave, !!c.logging_member_leave);
    setToggle(els.logVoice, c.logging_voice !== false);

    setToggle(els.ticketEnabled, !!c.ticket_enabled);
    setSelectValue(els.ticketPanelChannel, c.ticket_panel_channel);
    if (els.ticketPanelTitle) els.ticketPanelTitle.value = c.ticket_panel_title || '';
    if (els.ticketPanelDescription) els.ticketPanelDescription.value = c.ticket_panel_description || '';
    setSelectValue(els.ticketStaffRole, c.ticket_staff_role);
    setSelectValue(els.ticketCategory, c.ticket_category);
    setSelectValue(els.ticketLogChannel, c.ticket_log_channel);
    setToggle(els.ticketAutoPing, c.ticket_auto_ping_staff !== false);
    if (els.ticketWelcomeTitle) els.ticketWelcomeTitle.value = c.ticket_welcome_title || '';
    if (els.ticketWelcomeMessage) els.ticketWelcomeMessage.value = c.ticket_welcome_message || '';

    renderWelcomePreview();
    renderLeavePreview();
  }

  // ─────────────────────────────────────────────
  // PREVIEWS
  // ─────────────────────────────────────────────
  function fmt(t) {
    if (!t) return '';
    var u = state.user;
    var name = u ? (u.global_name || u.username) : 'User';
    return t
      .replace(/\{member\}/g, '@' + name)
      .replace(/\{user\}/g, '@' + name)
      .replace(/\{name\}/g, name)
      .replace(/\{server\}/g, (state.overview && state.overview.name) || 'Server')
      .replace(/\{count\}/g, (state.overview && state.overview.member_count) || 0)
      .replace(/\{level\}/g, '5');
  }

  function renderWelcomePreview() {
    var title = fmt(els.welcomeEmbedTitle ? els.welcomeEmbedTitle.value : '');
    var desc = fmt(els.welcomeEmbedDescription ? els.welcomeEmbedDescription.value : '');
    var color = els.welcomeEmbedColor ? els.welcomeEmbedColor.value : '';
    var img = els.welcomeEmbedImage ? els.welcomeEmbedImage.value : '';
    if (els.welcomePreviewTitle) els.welcomePreviewTitle.textContent = title || ' ';
    if (els.welcomePreviewDesc) els.welcomePreviewDesc.textContent = desc || ' ';
    if (els.welcomePreviewBar) els.welcomePreviewBar.style.background = hexOk(color) ? color : '#7c5cff';
    if (els.welcomePreviewImgWrap && els.welcomePreviewImg) {
      if (img && /^https?:/.test(img)) {
        els.welcomePreviewImg.src = img;
        els.welcomePreviewImgWrap.hidden = false;
      } else {
        els.welcomePreviewImgWrap.hidden = true;
      }
    }
  }

  function renderLeavePreview() {
    var title = fmt(els.leaveEmbedTitle ? els.leaveEmbedTitle.value : '');
    var desc = fmt(els.leaveEmbedDescription ? els.leaveEmbedDescription.value : '');
    var color = els.leaveEmbedColor ? els.leaveEmbedColor.value : '';
    var img = els.leaveEmbedImage ? els.leaveEmbedImage.value : '';
    if (els.leavePreviewTitle) els.leavePreviewTitle.textContent = title || ' ';
    if (els.leavePreviewDesc) els.leavePreviewDesc.textContent = desc || ' ';
    if (els.leavePreviewBar) els.leavePreviewBar.style.background = hexOk(color) ? color : '#99aab5';
    if (els.leavePreviewImgWrap && els.leavePreviewImg) {
      if (img && /^https?:/.test(img)) {
        els.leavePreviewImg.src = img;
        els.leavePreviewImgWrap.hidden = false;
      } else {
        els.leavePreviewImgWrap.hidden = true;
      }
    }
  }

  // ─────────────────────────────────────────────
  // SAVE + TOGGLES
  // ─────────────────────────────────────────────
  async function saveConfig(patch, successMsg) {
    var res = await API.updateConfig(state.guildId, patch);
    if (!res.ok) {
      toast((res.error && res.error.message) || 'Save failed.', 'error');
      return false;
    }
    if (res.data) state.config = res.data;
    toast(successMsg || 'Settings saved.', 'success');
    return true;
  }

  function bindToggle(el, key, transform) {
    if (!el) return;
    el.addEventListener('click', function () {
      var current = getToggle(el);
      var next = !current;
      setToggle(el, next);
      var value = transform ? transform(next) : next;
      var patch = {}; patch[key] = value;
      saveConfig(patch).then(function (ok) {
        if (!ok) setToggle(el, current);
      });
    });
  }

  // ─────────────────────────────────────────────
  // WELCOME TAB
  // ─────────────────────────────────────────────
  function initWelcomeTab() {
    bindToggle(els.welcomeEnabled, 'welcome_enabled');
    bindToggle(els.welcomeMention, 'welcome_mention');
    bindToggle(els.welcomeDm, 'welcome_dm');
    bindToggle(els.welcomeUseEmbed, 'welcome_use_embed');

    ['welcomeEmbedTitle','welcomeEmbedDescription','welcomeEmbedColor','welcomeEmbedImage'].forEach(function (k) {
      if (els[k]) els[k].addEventListener('input', renderWelcomePreview);
    });

    if (els.welcomeEmbedColorPicker && els.welcomeEmbedColor) {
      els.welcomeEmbedColorPicker.addEventListener('input', function () {
        els.welcomeEmbedColor.value = els.welcomeEmbedColorPicker.value;
        renderWelcomePreview();
      });
      els.welcomeEmbedColor.addEventListener('input', function () {
        if (hexOk(els.welcomeEmbedColor.value)) {
          els.welcomeEmbedColorPicker.value = normalizeHex(els.welcomeEmbedColor.value, '#2f3136');
        }
        renderWelcomePreview();
      });
    }

    if (els.welcomeSaveBtn) {
      els.welcomeSaveBtn.addEventListener('click', async function () {
        els.welcomeSaveBtn.disabled = true;
        await saveConfig({
          welcome_channel: els.welcomeChannel.value || null,
          welcome_message: els.welcomeMessage.value || '',
          welcome_embed_title: els.welcomeEmbedTitle.value || '',
          welcome_embed_description: els.welcomeEmbedDescription.value || '',
          welcome_embed_color: els.welcomeEmbedColor.value || '',
          welcome_embed_image: els.welcomeEmbedImage.value || ''
        });
        els.welcomeSaveBtn.disabled = false;
      });
    }

    if (els.welcomeTestBtn) {
      els.welcomeTestBtn.addEventListener('click', async function () {
        var ch = els.welcomeChannel.value;
        if (!ch) return toast('Select a welcome channel first.', 'error');
        var ok = await confirmAction('Send test welcome?', 'Post a test welcome message?');
        if (!ok) return;
        els.welcomeTestBtn.disabled = true;
        var res = await API.sendEmbed(state.guildId, {
          channel_id: ch,
          title: fmt(els.welcomeEmbedTitle.value || ''),
          description: fmt(els.welcomeEmbedDescription.value || ''),
          color: els.welcomeEmbedColor.value || '',
          image_url: els.welcomeEmbedImage.value || ''
        });
        els.welcomeTestBtn.disabled = false;
        if (!res.ok) return toast((res.error && res.error.message) || 'Failed.', 'error');
        toast('Test welcome sent.', 'success');
      });
    }
  }

  // ─────────────────────────────────────────────
  // LEAVE TAB
  // ─────────────────────────────────────────────
  function initLeaveTab() {
    bindToggle(els.leaveEnabled, 'leave_enabled');
    bindToggle(els.leaveUseEmbed, 'leave_use_embed');
    ['leaveEmbedTitle','leaveEmbedDescription','leaveEmbedColor','leaveEmbedImage'].forEach(function (k) {
      if (els[k]) els[k].addEventListener('input', renderLeavePreview);
    });
    if (els.leaveEmbedColorPicker && els.leaveEmbedColor) {
      els.leaveEmbedColorPicker.addEventListener('input', function () {
        els.leaveEmbedColor.value = els.leaveEmbedColorPicker.value;
        renderLeavePreview();
      });
      els.leaveEmbedColor.addEventListener('input', function () {
        if (hexOk(els.leaveEmbedColor.value)) {
          els.leaveEmbedColorPicker.value = normalizeHex(els.leaveEmbedColor.value, '#99aab5');
        }
        renderLeavePreview();
      });
    }
    if (els.leaveSaveBtn) {
      els.leaveSaveBtn.addEventListener('click', async function () {
        els.leaveSaveBtn.disabled = true;
        await saveConfig({
          leave_channel: els.leaveChannel.value || null,
          leave_message: els.leaveMessage.value || '',
          leave_embed_title: els.leaveEmbedTitle.value || '',
          leave_embed_description: els.leaveEmbedDescription.value || '',
          leave_embed_color: els.leaveEmbedColor.value || '',
          leave_embed_image: els.leaveEmbedImage.value || ''
        });
        els.leaveSaveBtn.disabled = false;
      });
    }
  }

  // ─────────────────────────────────────────────
  // BOOSTER TAB
  // ─────────────────────────────────────────────
  function initBoosterTab() {
    bindToggle(els.boosterEnabled, 'booster_enabled');
    bindToggle(els.boosterUseEmbed, 'booster_use_embed');
    if (els.boosterEmbedColorPicker && els.boosterEmbedColor) {
      els.boosterEmbedColorPicker.addEventListener('input', function () {
        els.boosterEmbedColor.value = els.boosterEmbedColorPicker.value;
      });
      els.boosterEmbedColor.addEventListener('input', function () {
        if (hexOk(els.boosterEmbedColor.value)) {
          els.boosterEmbedColorPicker.value = normalizeHex(els.boosterEmbedColor.value, '#f47fff');
        }
      });
    }
    if (els.boosterSaveBtn) {
      els.boosterSaveBtn.addEventListener('click', async function () {
        els.boosterSaveBtn.disabled = true;
        await saveConfig({
          booster_channel: els.boosterChannel.value || null,
          booster_message: els.boosterMessage.value || '',
          booster_embed_title: els.boosterEmbedTitle.value || '',
          booster_embed_description: els.boosterEmbedDescription.value || '',
          booster_embed_color: els.boosterEmbedColor.value || '',
          booster_embed_image: els.boosterEmbedImage.value || '',
          booster_reward: parseInt(els.boosterReward.value || '0', 10),
          booster_badge: els.boosterBadge.value || ''
        });
        els.boosterSaveBtn.disabled = false;
      });
    }
  }

  // ─────────────────────────────────────────────
  // LEVELING TAB
  // ─────────────────────────────────────────────
  function initLevelingTab() {
    bindToggle(els.levelEnabled, 'level_enabled');
    bindToggle(els.levelAnnounceEnabled, 'level_announce_enabled');
    bindToggle(els.levelUseCard, 'level_use_card');
    if (els.levelSaveBtn) {
      els.levelSaveBtn.addEventListener('click', async function () {
        els.levelSaveBtn.disabled = true;
        await saveConfig({
          level_channel: els.levelChannel.value || null,
          level_msg: els.levelMsg.value || '',
          level_xp_min: parseInt(els.levelXpMin.value || '15', 10),
          level_xp_max: parseInt(els.levelXpMax.value || '25', 10),
          level_cooldown: parseInt(els.levelCooldown.value || '60', 10),
          level_base_xp: parseInt(els.levelBaseXp.value || '100', 10),
          level_multiplier: parseFloat(els.levelMultiplier.value || '1')
        });
        els.levelSaveBtn.disabled = false;
      });
    }
  }

  // ─────────────────────────────────────────────
  // ECONOMY TAB
  // ─────────────────────────────────────────────
  function initEconomyTab() {
    bindToggle(els.economyEnabled, 'economy_enabled');
    if (els.economySaveBtn) {
      els.economySaveBtn.addEventListener('click', async function () {
        els.economySaveBtn.disabled = true;
        await saveConfig({
          economy_currency_name: els.economyCurrencyName.value || 'Stardust Coins',
          economy_currency_symbol: els.economyCurrencySymbol.value || '🪙',
          economy_daily_amount: parseInt(els.economyDailyAmount.value || '200', 10),
          economy_daily_cooldown: parseInt(els.economyDailyCooldown.value || '86400', 10),
          economy_reward_channel: els.economyRewardChannel.value || null,
          economy_reward_chance: parseInt(els.economyRewardChance.value || '10', 10),
          economy_reward_min: parseInt(els.economyRewardMin.value || '5000', 10),
          economy_reward_max: parseInt(els.economyRewardMax.value || '75000', 10)
        });
        els.economySaveBtn.disabled = false;
      });
    }
  }

  async function loadEconomy() {
    state.loaded.economy = true;
    if (!els.economyLb) return;
    els.economyLb.innerHTML = '<div class="empty-mini">Loading…</div>';
    var res = await API.economyLeaderboard(state.guildId);
    if (!res.ok) {
      els.economyLb.innerHTML = '<div class="empty-mini">Could not load leaderboard.</div>';
      return;
    }
    var list = Array.isArray(res.data) ? res.data : [];
    if (!list.length) {
      els.economyLb.innerHTML = '<div class="empty-mini">No economy data yet.</div>';
      return;
    }
    els.economyLb.innerHTML = '<div class="lb-list">' + list.map(function (u, i) {
      var cls = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
      var av = u.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png';
      return '<div class="lb-row">' +
        '<div class="lb-rank ' + cls + '">#' + (i + 1) + '</div>' +
        '<img class="lb-avatar" src="' + esc(av) + '" alt="">' +
        '<div class="lb-name">' + esc(u.name) + '</div>' +
        '<div class="lb-balance">' + SVG_COIN + ' ' + (u.balance || 0).toLocaleString() + '</div>' +
        '</div>';
    }).join('') + '</div>';
  }

  // ─────────────────────────────────────────────
  // AUTOMOD TAB
  // ─────────────────────────────────────────────
  function initAutomodTab() {
    bindToggle(els.automodEnabled, 'automod_enabled');
    bindToggle(els.automodIgnoreStaff, 'automod_ignore_staff');
    if (els.wordAddBtn) els.wordAddBtn.addEventListener('click', addWord);
    if (els.wordInput) {
      els.wordInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); addWord(); }
      });
    }
    if (els.automodSaveBtn) {
      els.automodSaveBtn.addEventListener('click', async function () {
        els.automodSaveBtn.disabled = true;
        await saveConfig({
          automod_action: els.automodAction.value || 'delete_warn',
          automod_warn_expiry: parseInt(els.automodWarnExpiry.value || '4', 10)
        });
        els.automodSaveBtn.disabled = false;
      });
    }
  }

  async function addWord() {
    if (!els.wordInput) return;
    var w = (els.wordInput.value || '').trim().toLowerCase();
    if (!w) return;
    els.wordInput.value = '';
    var res = await API.addAutomodWord(state.guildId, w);
    if (!res.ok) return toast((res.error && res.error.message) || 'Add failed.', 'error');
    state.words = res.data || state.words;
    renderWords();
    toast('Word added.', 'success');
  }

  async function removeWord(w) {
    var ok = await confirmAction('Remove blocked word?', 'Remove "' + w + '" from the block list?');
    if (!ok) return;
    var res = await API.removeAutomodWord(state.guildId, w);
    if (!res.ok) return toast((res.error && res.error.message) || 'Remove failed.', 'error');
    state.words = res.data || state.words;
    renderWords();
    toast('Word removed.', 'success');
  }

  function renderWords() {
    if (!els.wordChips) return;
    if (els.wordCount) els.wordCount.textContent = String(state.words.length);
    if (!state.words.length) {
      els.wordChips.innerHTML = '';
      if (els.wordEmpty) els.wordEmpty.hidden = false;
      return;
    }
    if (els.wordEmpty) els.wordEmpty.hidden = true;
    els.wordChips.innerHTML = state.words.map(function (w) {
      return '<span class="word-chip">' + esc(w) +
        ' <button data-word="' + esc(w) + '" aria-label="Remove">×</button></span>';
    }).join('');
    els.wordChips.querySelectorAll('button[data-word]').forEach(function (b) {
      b.addEventListener('click', function () { removeWord(b.dataset.word); });
    });
  }

  // ─────────────────────────────────────────────
  // AUTO-RESPONDER TAB
  // ─────────────────────────────────────────────
  function initAutoresponderTab() {
    bindToggle(els.autoresponderEnabled, 'autoresponder_enabled');
    if (els.arAddBtn) els.arAddBtn.addEventListener('click', addAutoresponder);
    if (els.autoresponderSaveBtn) {
      els.autoresponderSaveBtn.addEventListener('click', function () {
        toast('Trigger changes are saved automatically.', 'info');
      });
    }
  }

  async function addAutoresponder() {
    var trigger = (els.arTriggerInput.value || '').trim().toLowerCase();
    var response = (els.arResponseInput.value || '').trim();
    if (!trigger || !response) return toast('Both trigger and response are required.', 'error');
    els.arTriggerInput.value = '';
    els.arResponseInput.value = '';
    var res = await API.request('/api/guilds/' + state.guildId + '/autoresponder', {
      method: 'POST',
      body: JSON.stringify({ trigger: trigger, response: response })
    });
    if (!res.ok) return toast((res.error && res.error.message) || 'Add failed.', 'error');
    state.autoresponders = res.data || state.autoresponders;
    renderAutoresponders();
    toast('Trigger added.', 'success');
  }

  async function removeAutoresponder(trigger) {
    var ok = await confirmAction('Remove trigger?', 'Remove "' + trigger + '"?');
    if (!ok) return;
    var res = await API.request('/api/guilds/' + state.guildId + '/autoresponder', {
      method: 'DELETE',
      body: JSON.stringify({ trigger: trigger })
    });
    if (!res.ok) return toast((res.error && res.error.message) || 'Remove failed.', 'error');
    state.autoresponders = res.data || state.autoresponders;
    renderAutoresponders();
    toast('Trigger removed.', 'success');
  }

  function renderAutoresponders() {
    if (!els.arList) return;
    var keys = Object.keys(state.autoresponders || {});
    if (els.arCount) els.arCount.textContent = String(keys.length);
    if (!keys.length) {
      els.arList.innerHTML = '';
      if (els.arEmpty) els.arEmpty.hidden = false;
      return;
    }
    if (els.arEmpty) els.arEmpty.hidden = true;
    els.arList.innerHTML = keys.map(function (k) {
      return '<div class="list-row">' +
        '<code>' + esc(k) + '</code>' +
        '<span>' + esc(state.autoresponders[k]) + '</span>' +
        '<button data-trigger="' + esc(k) + '" aria-label="Remove">×</button>' +
        '</div>';
    }).join('');
    els.arList.querySelectorAll('button[data-trigger]').forEach(function (b) {
      b.addEventListener('click', function () { removeAutoresponder(b.dataset.trigger); });
    });
  }

  // ─────────────────────────────────────────────
  // LOGGING TAB
  // ─────────────────────────────────────────────
  function initLoggingTab() {
    bindToggle(els.loggingEnabled, 'logging_enabled');
    bindToggle(els.logMsgDelete, 'logging_message_delete');
    bindToggle(els.logMsgEdit, 'logging_message_edit');
    bindToggle(els.logMemberJoin, 'logging_member_join');
    bindToggle(els.logMemberLeave, 'logging_member_leave');
    bindToggle(els.logVoice, 'logging_voice');
    if (els.loggingSaveBtn) {
      els.loggingSaveBtn.addEventListener('click', async function () {
        els.loggingSaveBtn.disabled = true;
        await saveConfig({ logging_channel: els.loggingChannel.value || null });
        els.loggingSaveBtn.disabled = false;
      });
    }
  }

  // ─────────────────────────────────────────────
  // TICKETS TAB
  // ─────────────────────────────────────────────
  function initTicketsTab() {
    bindToggle(els.ticketEnabled, 'ticket_enabled');
    bindToggle(els.ticketAutoPing, 'ticket_auto_ping_staff');
    if (els.ticketSaveBtn) {
      els.ticketSaveBtn.addEventListener('click', async function () {
        els.ticketSaveBtn.disabled = true;
        await saveConfig({
          ticket_panel_channel: els.ticketPanelChannel.value || null,
          ticket_staff_role: els.ticketStaffRole.value || null,
          ticket_category: els.ticketCategory.value || null,
          ticket_log_channel: els.ticketLogChannel.value || null,
          ticket_panel_title: els.ticketPanelTitle.value || '',
          ticket_panel_description: els.ticketPanelDescription.value || '',
          ticket_welcome_title: els.ticketWelcomeTitle.value || '',
          ticket_welcome_message: els.ticketWelcomeMessage.value || ''
        });
        els.ticketSaveBtn.disabled = false;
      });
    }
    if (els.ticketDeployBtn) {
      els.ticketDeployBtn.addEventListener('click', async function () {
        var ch = els.ticketPanelChannel.value;
        if (!ch) return toast('Select a panel channel first.', 'error');
        var ok = await confirmAction('Deploy ticket panel?', 'Post a ticket launcher in the selected channel?');
        if (!ok) return;
        els.ticketDeployBtn.disabled = true;
        var res = await API.deployTicketPanel(state.guildId, ch);
        els.ticketDeployBtn.disabled = false;
        if (!res.ok) return toast((res.error && res.error.message) || 'Deploy failed.', 'error');
        toast('Ticket panel deployed.', 'success');
      });
    }
  }

  // ─────────────────────────────────────────────
  // CUSTOM COMMANDS TAB
  // ─────────────────────────────────────────────
  function initCustomCommandsTab() {
    if (els.ccAddBtn) els.ccAddBtn.addEventListener('click', addCustomCommand);
  }

  async function addCustomCommand() {
    var trigger = (els.ccTriggerInput.value || '').trim().toLowerCase();
    var response = (els.ccResponseInput.value || '').trim();
    if (!trigger || !response) return toast('Both trigger and response are required.', 'error');
    els.ccTriggerInput.value = '';
    els.ccResponseInput.value = '';
    var res = await API.request('/api/guilds/' + state.guildId + '/custom_commands', {
      method: 'POST',
      body: JSON.stringify({ trigger: trigger, response: response })
    });
    if (!res.ok) return toast((res.error && res.error.message) || 'Add failed.', 'error');
    state.customCommands = res.data || state.customCommands;
    renderCustomCommands();
    toast('Custom command added.', 'success');
  }

  async function removeCustomCommand(trigger) {
    var ok = await confirmAction('Remove custom command?', 'Remove "' + trigger + '"?');
    if (!ok) return;
    var res = await API.request('/api/guilds/' + state.guildId + '/custom_commands', {
      method: 'DELETE',
      body: JSON.stringify({ trigger: trigger })
    });
    if (!res.ok) return toast((res.error && res.error.message) || 'Remove failed.', 'error');
    state.customCommands = res.data || state.customCommands;
    renderCustomCommands();
    toast('Removed.', 'success');
  }

  function renderCustomCommands() {
    if (!els.ccList) return;
    var keys = Object.keys(state.customCommands || {});
    if (els.ccCount) els.ccCount.textContent = String(keys.length);
    if (!keys.length) {
      els.ccList.innerHTML = '';
      if (els.ccEmpty) els.ccEmpty.hidden = false;
      return;
    }
    if (els.ccEmpty) els.ccEmpty.hidden = true;
    els.ccList.innerHTML = keys.map(function (k) {
      return '<div class="list-row">' +
        '<code>' + esc(k) + '</code>' +
        '<span>' + esc(state.customCommands[k]) + '</span>' +
        '<button data-trigger="' + esc(k) + '" aria-label="Remove">×</button>' +
        '</div>';
    }).join('');
    els.ccList.querySelectorAll('button[data-trigger]').forEach(function (b) {
      b.addEventListener('click', function () { removeCustomCommand(b.dataset.trigger); });
    });
  }

  // ─────────────────────────────────────────────
  // EMBEDS TAB
  // ─────────────────────────────────────────────
  function initEmbedsTab() {
    [els.emTitle, els.emDescription, els.emColor, els.emImage].forEach(function (el) {
      if (el) el.addEventListener('input', renderEmbedPreview);
    });
    if (els.emColorPicker && els.emColor) {
      els.emColorPicker.addEventListener('input', function () {
        els.emColor.value = els.emColorPicker.value;
        renderEmbedPreview();
      });
      els.emColor.addEventListener('input', function () {
        if (hexOk(els.emColor.value)) {
          els.emColorPicker.value = normalizeHex(els.emColor.value, '#7c5cff');
        }
        renderEmbedPreview();
      });
    }
    if (els.emPreviewBtn) els.emPreviewBtn.addEventListener('click', renderEmbedPreview);
    if (els.emSendBtn) {
      els.emSendBtn.addEventListener('click', async function () {
        var ch = els.emChannel.value;
        if (!ch) return toast('Select a target channel.', 'error');
        var body = {
          channel_id: ch,
          title: els.emTitle.value || '',
          description: els.emDescription.value || '',
          color: els.emColor.value || '',
          image_url: els.emImage.value || ''
        };
        if (!body.title && !body.description) return toast('Add a title or description.', 'error');
        var ok = await confirmAction('Send embed?', 'Post to the selected channel?');
        if (!ok) return;
        els.emSendBtn.disabled = true;
        var res = await API.sendEmbed(state.guildId, body);
        els.emSendBtn.disabled = false;
        if (!res.ok) return toast((res.error && res.error.message) || 'Send failed.', 'error');
        toast('Embed sent.', 'success');
      });
    }
  }

  function renderEmbedPreview() {
    if (!els.emPreviewTitle) return;
    els.emPreviewTitle.textContent = els.emTitle.value || ' ';
    els.emPreviewDesc.textContent = els.emDescription.value || ' ';
    var color = els.emColor.value || '';
    els.emPreviewBar.style.background = hexOk(color) ? color : '#7c5cff';
    var img = els.emImage.value || '';
    if (img && /^https?:/.test(img)) {
      els.emPreviewImg.src = img;
      els.emPreviewImgWrap.hidden = false;
    } else {
      els.emPreviewImgWrap.hidden = true;
    }
  }

  // ─────────────────────────────────────────────
  // GIVEAWAYS TAB
  // ─────────────────────────────────────────────
  function initGiveawaysTab() {
    if (els.gwStartBtn) {
      els.gwStartBtn.addEventListener('click', async function () {
        var prize = (els.gwPrize.value || '').trim();
        var duration = (els.gwDuration.value || '').trim();
        var winners = parseInt(els.gwWinners.value || '1', 10);
        var channel = els.gwChannel.value;
        if (!prize) return toast('Prize required.', 'error');
        if (!duration) return toast('Duration required (30m/5h/1d).', 'error');
        if (!channel) return toast('Select a channel.', 'error');
        if (!winners || winners < 1) return toast('Winners must be ≥ 1.', 'error');
        var ok = await confirmAction('Start giveaway?',
          'Prize: "' + prize + '"\nDuration: ' + duration + '\nWinners: ' + winners);
        if (!ok) return;
        els.gwStartBtn.disabled = true;
        var res = await API.startGiveaway(state.guildId, {
          prize: prize, duration: duration, winners: winners, channel_id: channel
        });
        els.gwStartBtn.disabled = false;
        if (!res.ok) return toast((res.error && res.error.message) || 'Failed.', 'error');
        toast('Giveaway started.', 'success');
        els.gwPrize.value = '';
        els.gwDuration.value = '';
        els.gwWinners.value = '1';
      });
    }
  }

  // ─────────────────────────────────────────────
  // USER MENU / LOGOUT / MODAL / RETRY
  // ─────────────────────────────────────────────
  function initUserMenu() {
    if (!els.userChip || !els.userMenu) return;
    els.userChip.addEventListener('click', function (e) {
      e.stopPropagation();
      els.userMenu.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!els.userMenu.contains(e.target)) els.userMenu.classList.remove('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') els.userMenu.classList.remove('open');
    });
  }

  function initLogout() {
    if (!els.logoutBtn) return;
    els.logoutBtn.addEventListener('click', async function () {
      els.logoutBtn.disabled = true;
      try { await API.logout(); } catch (e) {}
      try { window.stardustClearSession && window.stardustClearSession(); } catch (e) {}
      window.location.href = 'index.html';
    });
  }

  function initRetry() {
    if (els.retryBtn) els.retryBtn.addEventListener('click', loadEverything);
  }

  function initModal() {
    if (els.modalCancel) els.modalCancel.addEventListener('click', function () { closeModal(false); });
    if (els.modalConfirm) els.modalConfirm.addEventListener('click', function () { closeModal(true); });
    if (els.modalOverlay) {
      els.modalOverlay.addEventListener('click', function (e) {
        if (e.target === els.modalOverlay) closeModal(false);
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && els.modalOverlay && !els.modalOverlay.hidden) closeModal(false);
    });
  }

  // ─────────────────────────────────────────────
  // BOOT
  // ─────────────────────────────────────────────
  function boot() {
    cache();

    var params = new URLSearchParams(window.location.search);
    state.guildId = params.get('guild');
    if (!state.guildId) { window.location.href = 'dashboard.html'; return; }

    initSidebar();
    initUserMenu();
    initLogout();
    initRetry();
    initModal();
    initImageUploads();
    initWelcomeTab();
    initLeaveTab();
    initBoosterTab();
    initLevelingTab();
    initEconomyTab();
    initAutomodTab();
    initAutoresponderTab();
    initLoggingTab();
    initTicketsTab();
    initCustomCommandsTab();
    initEmbedsTab();
    initGiveawaysTab();

    loadEverything().then(function () {
      initSidebar();
      var hash = window.location.hash.replace('#', '');
      if (hash) switchTab(hash);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
