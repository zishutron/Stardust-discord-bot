/* ═══════════════════════════════════════════════════════════
   STARDUST — Server dashboard logic
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var API = window.StardustAPI;

  var state = {
    guildId: null,
    user: null,
    overview: null,
    config: {},
    words: [],
    activeTab: 'overview'
  };

  // ─── DOM helper ───
  function $(id) { return document.getElementById(id); }

  var els = {};

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

    // tab panels
    els.tabs = document.querySelectorAll('.tab-panel');
    els.links = document.querySelectorAll('.sidebar-link[data-tab]');

    // moderation / automod
    els.automodToggle = $('automodToggle');
    els.wordInput = $('wordInput');
    els.wordAddBtn = $('wordAddBtn');
    els.wordChips = $('wordChips');
    els.wordEmpty = $('wordEmpty');
    els.wordCount = $('wordCount');

    // welcome / leveling
    els.welcomeChannel = $('welcomeChannel');
    els.welcomeSaveBtn = $('welcomeSaveBtn');
    els.levelChannelSelect = $('levelChannelSelect');
    els.levelMessageInput = $('levelMessageInput');
    els.levelSaveBtn = $('levelSaveBtn');
    els.rewardChannelSelect = $('rewardChannelSelect');
    els.rewardSaveBtn = $('rewardSaveBtn');

    // tickets
    els.ticketPanelChannel = $('ticketPanelChannel');
    els.ticketDeployBtn = $('ticketDeployBtn');

    // economy
    els.economyLb = $('economyLb');

    // giveaways
    els.gwPrize = $('gwPrize');
    els.gwDuration = $('gwDuration');
    els.gwWinners = $('gwWinners');
    els.gwChannel = $('gwChannel');
    els.gwStartBtn = $('gwStartBtn');

    // embeds
    els.emTitle = $('emTitle');
    els.emDescription = $('emDescription');
    els.emColor = $('emColor');
    els.emImage = $('emImage');
    els.emChannel = $('emChannel');
    els.emPreviewBtn = $('emPreviewBtn');
    els.emSendBtn = $('emSendBtn');
    els.emPreviewWrap = $('emPreviewWrap');
    els.emPreviewBar = $('emPreviewBar');
    els.emPreviewTitle = $('emPreviewTitle');
    els.emPreviewDesc = $('emPreviewDesc');
    els.emPreviewImg = $('emPreviewImg');
    els.emPreviewImgWrap = $('emPreviewImgWrap');

    // settings
    els.setGuildId = $('setGuildId');
    els.setBotPresence = $('setBotPresence');
    els.setBotLatency = $('setBotLatency');

    // modal
    els.modalOverlay = $('modalOverlay');
    els.modalTitle = $('modalTitle');
    els.modalBody = $('modalBody');
    els.modalCancel = $('modalCancel');
    els.modalConfirm = $('modalConfirm');
  }

  // ─── State switching ───
  function showOnly(name) {
    if (els.loading) els.loading.hidden = name !== 'loading';
    if (els.error) els.error.hidden = name !== 'error';
    if (els.content) els.content.hidden = name !== 'content';
  }

  function toast(msg, type) {
    if (window.stardustToast) window.stardustToast(msg, type || 'info');
  }

  // ─── ESC / helpers ───
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function initials(name) {
    if (!name) return '?';
    var parts = String(name).trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function guildIconUrl(id, hash, size) {
    if (!hash) return null;
    return 'https://cdn.discordapp.com/icons/' + id + '/' + hash + '.png?size=' + (size || 128);
  }

  function userAvatarUrl(id, hash) {
    if (!hash) return 'https://cdn.discordapp.com/embed/avatars/0.png';
    return 'https://cdn.discordapp.com/avatars/' + id + '/' + hash + '.png?size=64';
  }

  // ─── Confirm modal ───
  var confirmResolve = null;
  function confirmAction(title, body) {
    return new Promise(function (resolve) {
      if (!els.modalOverlay) return resolve(false);
      els.modalTitle.textContent = title;
      els.modalBody.textContent = body;
      els.modalOverlay.hidden = false;
      confirmResolve = resolve;
    });
  }
  function closeModal(result) {
    if (els.modalOverlay) els.modalOverlay.hidden = true;
    if (confirmResolve) {
      confirmResolve(result);
      confirmResolve = null;
    }
  }

  // ─── Sidebar / tab nav ───
  function initSidebar() {
    document.querySelectorAll('.sidebar-link[data-tab]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        switchTab(link.dataset.tab);
        if (window.innerWidth <= 900) closeSidebar();
      });
    });

    if (els.mobileMenu) {
      els.mobileMenu.addEventListener('click', openSidebar);
    }
    if (els.overlay) {
      els.overlay.addEventListener('click', closeSidebar);
    }

    document.querySelectorAll('.quick-action').forEach(function (b) {
      b.addEventListener('click', function () {
        switchTab(b.dataset.goto);
      });
    });

    document.querySelectorAll('.module-tile').forEach(function (t) {
      t.addEventListener('click', function () {
        var tab = t.dataset.tab;
        if (tab) switchTab(tab);
      });
    });
  }

  function switchTab(name) {
    if (!name) return;
    state.activeTab = name;
    els.links.forEach(function (l) {
      l.classList.toggle('active', l.dataset.tab === name);
    });
    els.tabs.forEach(function (p) {
      p.classList.toggle('active', p.dataset.panel === name);
    });
    try { window.location.hash = name; } catch (e) {}
    if (name === 'economy' && !state.economyLoaded) loadEconomy();
    if (name === 'commands' && !state.commandsLoaded) renderCommands();
  }

  function openSidebar() {
    if (els.sidebar) els.sidebar.classList.add('open');
    if (els.overlay) els.overlay.classList.add('active');
  }
  function closeSidebar() {
    if (els.sidebar) els.sidebar.classList.remove('open');
    if (els.overlay) els.overlay.classList.remove('active');
  }

  // ─── Populate channel selects ───
  async function loadChannels() {
    // Fetch the guild data via overview (which gives us counts, not channels).
    // Channels aren't exposed in our API currently — we rely on Discord's
    // channel IDs being typed by user OR we let them pick from a text input.
    // For now, we fall back to a text input style if channels aren't available.

    // Since our backend doesn't yet expose a channels endpoint, we show a
    // helpful message. The user can still type channel IDs.

    // (If you later add /api/guilds/:id/channels, wire it up here.)
    var selects = [els.welcomeChannel, els.levelChannelSelect, els.rewardChannelSelect,
                   els.ticketPanelChannel, els.gwChannel, els.emChannel];

    selects.forEach(function (sel) {
      if (!sel) return;
      // Keep only the "Not configured" / "Select" option
      while (sel.options.length > 1) sel.remove(1);

      // Add a manual entry option
      var opt = document.createElement('option');
      opt.value = '__manual__';
      opt.textContent = 'Enter channel ID manually…';
      sel.appendChild(opt);
    });
  }

  // ─── Load overview ───
  async function loadOverview() {
    showOnly('loading');

    var meRes = await API.me();
    if (!meRes.ok) {
      if (meRes.status === 401) {
        window.location.href = 'dashboard.html';
        return;
      }
      return showError('Session error', 'Please log in again.');
    }
    state.user = meRes.data;
    renderUser();

    var ovRes = await API.overview(state.guildId);
    if (!ovRes.ok) {
      if (ovRes.status === 401) { window.location.href = 'dashboard.html'; return; }
      if (ovRes.status === 403) return showError('Access denied', 'You do not have permission to manage this server.');
      if (ovRes.status === 409) return showError('Bot not installed', 'Stardust is not on this server. Re-invite it first.');
      if (ovRes.status === 0 || ovRes.status === 503) return showError('Backend unavailable', 'Stardust is waking up on Render. Try again in ~30 seconds.');
      return showError('Could not load server', (ovRes.error && ovRes.error.message) || 'Unexpected error.');
    }
    state.overview = ovRes.data;

    var cfgRes = await API.getConfig(state.guildId);
    if (cfgRes.ok && cfgRes.data) state.config = cfgRes.data;

    renderServer();
    showOnly('content');
  }

  function showError(title, msg) {
    if (els.errorTitle) els.errorTitle.textContent = title;
    if (els.errorMessage) els.errorMessage.textContent = msg;
    showOnly('error');
  }

  function renderUser() {
    var u = state.user;
    if (!u || !els.userMenu) return;
    els.userMenu.hidden = false;
    var name = u.global_name || u.username || 'User';
    if (els.userName) els.userName.textContent = name;
    if (els.userAvatar) {
      els.userAvatar.src = userAvatarUrl(u.id, u.avatar);
      els.userAvatar.alt = name;
    }
  }

  function renderServer() {
    var ov = state.overview;
    if (!ov) return;

    // crumb
    if (els.crumb) els.crumb.textContent = ov.name;

    // sidebar identity
    renderSidebarServer(ov);

    // hero
    var heroIcon = $('serverHeroIcon');
    var heroName = $('serverHeroName');
    var heroStats = $('serverHeroStats');

    if (heroIcon) {
      var iconUrl = ov.icon || guildIconUrl(ov.id, null);
      // our API returns icon as URL already
      heroIcon.innerHTML = ov.icon
        ? '<img src="' + escapeHtml(ov.icon) + '" alt="">'
        : initials(ov.name);
    }
    if (heroName) heroName.textContent = ov.name;

    if (heroStats) {
      heroStats.innerHTML =
        '<span>👥 ' + (ov.member_count || 0).toLocaleString() + ' members</span>' +
        '<span>💬 ' + (ov.channel_count || 0) + ' channels</span>' +
        '<span>🎭 ' + (ov.role_count || 0) + ' roles</span>' +
        '<span>⚡ ' + (ov.bot_latency_ms || '—') + 'ms</span>';
    }

    // stats row
    var statsRow = $('statsRow');
    if (statsRow) {
      statsRow.innerHTML =
        tile('Members', (ov.member_count || 0).toLocaleString()) +
        tile('Channels', ov.channel_count || 0) +
        tile('Roles', ov.role_count || 0) +
        tile('Latency', (ov.bot_latency_ms || '—') + 'ms');
    }

    // modules
    renderModules(ov.modules || {});

    // set settings fields
    if (els.setGuildId) els.setGuildId.textContent = ov.id;
    if (els.setBotPresence) els.setBotPresence.textContent = ov.bot_present ? 'Online' : 'Offline';
    if (els.setBotLatency) els.setBotLatency.textContent = (ov.bot_latency_ms || '—') + 'ms';

    // apply config to forms
    applyConfig();
  }

  function tile(label, value) {
    return '<div class="stat-tile"><div class="stat-tile-label">' + label + '</div><div class="stat-tile-value">' + value + '</div></div>';
  }

  function renderSidebarServer(ov) {
    if (!els.sidebarServer) return;
    var icon = ov.icon
      ? '<img class="sidebar-server-icon" src="' + escapeHtml(ov.icon) + '" alt="">'
      : '<div class="sidebar-server-fallback">' + initials(ov.name) + '</div>';
    els.sidebarServer.innerHTML =
      icon +
      '<div style="flex:1;min-width:0;">' +
        '<div class="sidebar-server-name">' + escapeHtml(ov.name) + '</div>' +
        '<div class="sidebar-server-meta">' + (ov.member_count || 0).toLocaleString() + ' members</div>' +
      '</div>';
  }

  function renderModules(mods) {
    var grid = $('modulesGrid');
    if (!grid) return;
    var tiles = [
      { key: 'welcome',   label: 'Welcome',   tab: 'welcome'   },
      { key: 'automod',   label: 'AutoMod',   tab: 'automod'   },
      { key: 'reward',    label: 'Rewards',   tab: 'economy'   },
      { key: 'leveling',  label: 'Leveling',  tab: 'leveling'  },
      { key: 'tickets',   label: 'Tickets',   tab: 'tickets'   },
      { key: 'leave',     label: 'Leave',     tab: 'welcome'   }
    ];
    grid.innerHTML = tiles.map(function (t) {
      var on = !!mods[t.key];
      return (
        '<button class="module-tile" data-tab="' + t.tab + '">' +
          '<span class="module-dot ' + (on ? 'on' : 'off') + '"></span>' +
          '<div class="module-info">' +
            '<strong>' + t.label + '</strong>' +
            '<span>' + (on ? 'Enabled' : 'Not configured') + '</span>' +
          '</div>' +
        '</button>'
      );
    }).join('');

    // bind clicks
    grid.querySelectorAll('.module-tile').forEach(function (t) {
      t.addEventListener('click', function () {
        var tab = t.dataset.tab;
        if (tab) switchTab(tab);
      });
    });
  }

  // ─── Apply config to inputs ───
  function applyConfig() {
    var c = state.config || {};

    if (els.automodToggle) {
      var on = c.automod_enabled !== false;
      els.automodToggle.setAttribute('aria-checked', on ? 'true' : 'false');
    }

    // welcome channel + level channel + reward channel: our selects don't have
    // full channel list yet, so we show the stored ID as a text input fallback.
    setChannelSelectValue(els.welcomeChannel, c.channel);
    setChannelSelectValue(els.levelChannelSelect, c.level_channel);
    setChannelSelectValue(els.rewardChannelSelect, c.reward_channel);

    if (els.levelMessageInput) {
      els.levelMessageInput.value = c.level_msg || '';
    }
  }

  function setChannelSelectValue(sel, id) {
    if (!sel) return;
    if (!id) {
      sel.value = '';
      return;
    }
    // If our manual-entry option exists, but ID doesn't match any real option,
    // we add a temporary "current" option.
    var existing = Array.from(sel.options).find(function (o) { return o.value === String(id); });
    if (!existing) {
      var opt = document.createElement('option');
      opt.value = String(id);
      opt.textContent = 'Channel ' + id;
      sel.appendChild(opt);
    }
    sel.value = String(id);
  }

  // ─── Save handlers ───
  async function saveConfig(patch) {
    var res = await API.updateConfig(state.guildId, patch);
    if (!res.ok) {
      toast((res.error && res.error.message) || 'Save failed.', 'error');
      return false;
    }
    state.config = res.data || state.config;
    toast('Settings saved.', 'success');
    return true;
  }

  function initWelcomeForms() {
    if (els.welcomeSaveBtn) {
      els.welcomeSaveBtn.addEventListener('click', async function () {
        els.welcomeSaveBtn.disabled = true;
        var v = els.welcomeChannel.value;
        var payload = { channel: v === '' ? null : (isNaN(v) ? v : parseInt(v, 10)) };
        var ok = await saveConfig(payload);
        els.welcomeSaveBtn.disabled = false;
      });
    }

    if (els.levelSaveBtn) {
      els.levelSaveBtn.addEventListener('click', async function () {
        els.levelSaveBtn.disabled = true;
        var v = els.levelChannelSelect.value;
        var patch = {
          level_channel: v === '' ? null : (isNaN(v) ? v : parseInt(v, 10)),
          level_msg: els.levelMessageInput.value
        };
        var ok = await saveConfig(patch);
        els.levelSaveBtn.disabled = false;
      });
    }

    if (els.rewardSaveBtn) {
      els.rewardSaveBtn.addEventListener('click', async function () {
        els.rewardSaveBtn.disabled = true;
        var v = els.rewardChannelSelect.value;
        var patch = { reward_channel: v === '' ? null : (isNaN(v) ? v : parseInt(v, 10)) };
        var ok = await saveConfig(patch);
        els.rewardSaveBtn.disabled = false;
      });
    }
  }

  // ─── AutoMod ───
  function initAutomod() {
    if (els.automodToggle) {
      els.automodToggle.addEventListener('click', async function () {
        var current = els.automodToggle.getAttribute('aria-checked') === 'true';
        var next = !current;
        els.automodToggle.setAttribute('aria-checked', next ? 'true' : 'false');
        var ok = await saveConfig({ automod_enabled: next });
        if (!ok) {
          // revert
          els.automodToggle.setAttribute('aria-checked', current ? 'true' : 'false');
        }
      });
    }

    if (els.wordAddBtn) {
      els.wordAddBtn.addEventListener('click', addWord);
    }
    if (els.wordInput) {
      els.wordInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') addWord();
      });
    }

    loadWords();
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

  async function loadWords() {
    var res = await API.automodWords(state.guildId);
    if (!res.ok) return;
    state.words = Array.isArray(res.data) ? res.data : [];
    renderWords();
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
      return '<span class="word-chip">' + escapeHtml(w) +
        ' <button data-word="' + escapeHtml(w) + '" aria-label="Remove">×</button></span>';
    }).join('');
    els.wordChips.querySelectorAll('button[data-word]').forEach(function (b) {
      b.addEventListener('click', function () { removeWord(b.dataset.word); });
    });
  }

  // ─── Tickets ───
  function initTickets() {
    if (els.ticketDeployBtn) {
      els.ticketDeployBtn.addEventListener('click', async function () {
        var ch = els.ticketPanelChannel.value;
        if (!ch || ch === '__manual__') return toast('Select a channel first.', 'error');
        var ok = await confirmAction('Deploy ticket panel?', 'This will post a ticket launcher in the selected channel.');
        if (!ok) return;
        els.ticketDeployBtn.disabled = true;
        var res = await API.deployTicketPanel(state.guildId, ch);
        els.ticketDeployBtn.disabled = false;
        if (!res.ok) return toast((res.error && res.error.message) || 'Deploy failed.', 'error');
        toast('Ticket panel deployed.', 'success');
      });
    }
  }

  // ─── Economy leaderboard ───
  async function loadEconomy() {
    state.economyLoaded = true;
    if (!els.economyLb) return;
    els.economyLb.innerHTML = '<div class="empty-mini">Loading…</div>';
    var res = await API.economyLeaderboard(state.guildId);
    if (!res.ok) {
      els.economyLb.innerHTML = '<div class="empty-mini">Could not load leaderboard.</div>';
      return;
    }
    var list = Array.isArray(res.data) ? res.data : [];
    if (!list.length) {
      els.economyLb.innerHTML = '<div class="empty-mini">No economy data yet. Encourage members to chat!</div>';
      return;
    }
    els.economyLb.innerHTML = '<div class="lb-list">' + list.map(function (u, i) {
      var cls = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
      var avatar = u.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png';
      return (
        '<div class="lb-row">' +
          '<div class="lb-rank ' + cls + '">#' + (i + 1) + '</div>' +
          '<img class="lb-avatar" src="' + escapeHtml(avatar) + '" alt="">' +
          '<div class="lb-name">' + escapeHtml(u.name) + '</div>' +
          '<div class="lb-balance">🪙 ' + (u.balance || 0).toLocaleString() + '</div>' +
        '</div>'
      );
    }).join('') + '</div>';
  }

  // ─── Giveaways ───
  function initGiveaways() {
    if (els.gwStartBtn) {
      els.gwStartBtn.addEventListener('click', async function () {
        var prize = (els.gwPrize.value || '').trim();
        var duration = (els.gwDuration.value || '').trim();
        var winners = parseInt(els.gwWinners.value || '1', 10);
        var channel = els.gwChannel.value;

        if (!prize) return toast('Prize required.', 'error');
        if (!duration) return toast('Duration required (e.g. 30m).', 'error');
        if (!channel || channel === '__manual__') return toast('Select a channel.', 'error');
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

  // ─── Embed builder ───
  function initEmbeds() {
    if (els.emPreviewBtn) {
      els.emPreviewBtn.addEventListener('click', renderEmbedPreview);
    }
    if (els.emSendBtn) {
      els.emSendBtn.addEventListener('click', async function () {
        var ch = els.emChannel.value;
        if (!ch || ch === '__manual__') return toast('Select a target channel.', 'error');
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

    // Live preview as they type
    [els.emTitle, els.emDescription, els.emColor, els.emImage].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', renderEmbedPreview);
    });
  }

  function renderEmbedPreview() {
    if (!els.emPreviewWrap) return;
    els.emPreviewWrap.hidden = false;
    els.emPreviewTitle.textContent = els.emTitle.value || '';
    els.emPreviewTitle.style.display = els.emTitle.value ? 'block' : 'none';
    els.emPreviewDesc.textContent = els.emDescription.value || '';
    els.emPreviewDesc.style.display = els.emDescription.value ? 'block' : 'none';

    var col = els.emColor.value || '#7c5cff';
    if (col && !col.startsWith('#')) col = '#' + col;
    els.emPreviewBar.style.background = col;

    var img = els.emImage.value || '';
    if (img.startsWith('http')) {
      els.emPreviewImg.src = img;
      els.emPreviewImgWrap.hidden = false;
    } else {
      els.emPreviewImgWrap.hidden = true;
    }
  }

  // ─── Commands ───
  var ALL_COMMANDS = [
    { name: '/welcome-set',  cat: 'Welcome',  desc: 'Map welcome channel.' },
    { name: '/welcome-test', cat: 'Welcome',  desc: 'Trigger test welcome card.' },
    { name: '/welcome-reset',cat: 'Welcome',  desc: 'Disable welcome module.' },
    { name: '/reward-set',   cat: 'Economy',  desc: 'Set reward channel.' },
    { name: '/reward-test',  cat: 'Economy',  desc: 'Trigger test reward.' },
    { name: '/reward-reset', cat: 'Economy',  desc: 'Disable reward module.' },
    { name: '/level-set-channel', cat: 'Leveling', desc: 'Set level-up channel.' },
    { name: '/level-set-msg',     cat: 'Leveling', desc: 'Custom level-up message.' },
    { name: '/rank',         cat: 'Leveling', desc: 'Display your rank card.' },
    { name: '/richest',      cat: 'Economy',  desc: 'Top 10 richest members.' },
    { name: '/daily',        cat: 'Economy',  desc: 'Claim daily coins.' },
    { name: '/wallet',       cat: 'Economy',  desc: 'View your balance.' },
    { name: '/menu',         cat: 'Economy',  desc: 'Global food menu.' },
    { name: '/shop',         cat: 'Economy',  desc: 'Browse item shop.' },
    { name: '/buy',          cat: 'Economy',  desc: 'Buy an item.' },
    { name: '/inventory',    cat: 'Economy',  desc: 'View inventory.' },
    { name: '/serve',        cat: 'Economy',  desc: 'Serve a premium meal.' },
    { name: '/kick',         cat: 'Moderation', desc: 'Kick a member.' },
    { name: '/ban',          cat: 'Moderation', desc: 'Ban a member.' },
    { name: '/mute',         cat: 'Moderation', desc: 'Timeout a member.' },
    { name: '/warn',         cat: 'Moderation', desc: 'Warn a member.' },
    { name: '/addrole',      cat: 'Moderation', desc: 'Add a role.' },
    { name: '/removerole',   cat: 'Moderation', desc: 'Remove a role.' },
    { name: '/gstart',       cat: 'Giveaways',  desc: 'Start a giveaway.' },
    { name: '/ticket_setup', cat: 'Tickets',    desc: 'Deploy ticket panel.' },
    { name: '/ticket_config',cat: 'Tickets',    desc: 'Configure tickets.' },
    { name: '/embed_builder',cat: 'Utilities',  desc: 'Interactive embed builder.' },
    { name: '/matrixpoll',   cat: 'Utilities',  desc: 'Start a poll.' },
    { name: '/remindme',     cat: 'Utilities',  desc: 'Set a reminder.' },
    { name: '/afk',          cat: 'Utilities',  desc: 'Set AFK status.' },
    { name: '/stardustquote',cat: 'Utilities',  desc: 'Random tech quote.' },
    { name: '/rollmatrix',   cat: 'Utilities',  desc: 'Roll 1-100.' },
    { name: '/ping',         cat: 'Utilities',  desc: 'Check latency.' },
    { name: '/help',         cat: 'Utilities',  desc: 'View all commands.' },
    { name: '/play_rps',     cat: 'Games',      desc: 'Rock Paper Scissors.' },
    { name: '/play_ttt',     cat: 'Games',      desc: 'Tic Tac Toe.' },
    { name: '/play_slap',    cat: 'Games',      desc: 'Slap fight.' },
    { name: '/hug',          cat: 'Games',      desc: 'Anime hug.' },
    { name: '/kiss',         cat: 'Games',      desc: 'Anime kiss.' },
    { name: '/slap',         cat: 'Games',      desc: 'Anime slap.' }
  ];

  function renderCommands() {
    state.commandsLoaded = true;
    var grid = $('commandsGrid');
    if (!grid) return;
    grid.innerHTML = ALL_COMMANDS.map(function (c) {
      return (
        '<div class="cmd-card">' +
          '<code>' + c.name + '</code>' +
          '<p>' + escapeHtml(c.desc) + '</p>' +
        '</div>'
      );
    }).join('');
  }

  // ─── User menu ───
  function initUserMenu() {
    if (!els.userChip || !els.userMenu) return;
    els.userChip.addEventListener('click', function (e) {
      e.stopPropagation();
      els.userMenu.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!els.userMenu.contains(e.target)) els.userMenu.classList.remove('open');
    });
  }

  function initLogout() {
    if (!els.logoutBtn) return;
    els.logoutBtn.addEventListener('click', async function () {
      els.logoutBtn.disabled = true;
      try { await API.logout(); } catch (e) {}
      window.location.href = 'index.html';
    });
  }

  // ─── Retry ───
  function initRetry() {
    if (els.retryBtn) els.retryBtn.addEventListener('click', loadOverview);
  }

  // ─── Modal buttons ───
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

  // ─── Boot ───
  function boot() {
    cache();

    // Guild ID from query string
    var params = new URLSearchParams(window.location.search);
    state.guildId = params.get('guild');
    if (!state.guildId) {
      window.location.href = 'dashboard.html';
      return;
    }

    initSidebar();
    initUserMenu();
    initLogout();
    initRetry();
    initModal();
    initAutomod();
    initWelcomeForms();
    initTickets();
    initGiveaways();
    initEmbeds();

    loadChannels();
    loadOverview().then(function () {
      // Re-init sidebar binds for dynamic elements (module tiles)
      initSidebar();
      // restore tab from hash
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
