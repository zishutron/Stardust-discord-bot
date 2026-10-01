/* ═══════════════════════════════════════════════════════════
   STARDUST — Global page behavior (v3)
   Auto-detects login, updates header, theme, drawer, dropdown.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  function log() { if (window.console) console.log.apply(console, ['[Stardust]'].concat(Array.prototype.slice.call(arguments))); }
  function warn() { if (window.console) console.warn.apply(console, ['[Stardust]'].concat(Array.prototype.slice.call(arguments))); }

  function runSafe(name, fn) {
    try { fn(); log('✓', name); }
    catch (err) { warn('✗', name, '—', err && err.message); }
  }

  // ─────────────────────────────────────────────
  // 1. THEME
  // ─────────────────────────────────────────────
  function initTheme() {
    var root = document.documentElement;
    var KEY = 'stardust_theme';

    function apply(theme) {
      root.setAttribute('data-theme', theme);
      try { localStorage.setItem(KEY, theme); } catch (e) {}
    }

    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved === 'light' || saved === 'dark') apply(saved);
    else {
      var prefersLight = false;
      try { prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches; } catch (e) {}
      apply(prefersLight ? 'light' : 'dark');
    }

    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('#themeToggle');
      if (!btn) return;
      e.preventDefault();
      var cur = root.getAttribute('data-theme') || 'dark';
      apply(cur === 'dark' ? 'light' : 'dark');
    });
  }

  // ─────────────────────────────────────────────
  // 2. HEADER SCROLL
  // ─────────────────────────────────────────────
  function initHeaderScroll() {
    var header = document.getElementById('siteHeader');
    if (!header) return;
    function onScroll() {
      if (window.scrollY > 8) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ─────────────────────────────────────────────
  // 3. DRAWER
  // ─────────────────────────────────────────────
  function initDrawer() {
    var drawer = document.getElementById('drawer');
    var overlay = document.getElementById('drawerOverlay');
    if (!drawer || !overlay) return;

    function open() {
      drawer.classList.add('active');
      overlay.classList.add('active');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest('#menuToggle')) { e.preventDefault(); open(); return; }
      if (t.closest('#drawerClose')) { e.preventDefault(); close(); return; }
      if (t.closest('#drawerOverlay')) { e.preventDefault(); close(); return; }
      var link = t.closest('#drawer a');
      if (link) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  // ─────────────────────────────────────────────
  // 4. SHOWCASE TABS
  // ─────────────────────────────────────────────
  function initShowcase() {
    var tabs = document.querySelectorAll('.showcase-tab');
    var panels = document.querySelectorAll('.showcase-panel');
    if (!tabs.length || !panels.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.dataset.tab;
        if (!target) return;
        tabs.forEach(function (t) { t.classList.remove('active'); });
        panels.forEach(function (p) { p.classList.remove('active'); });
        tab.classList.add('active');
        var panel = document.querySelector('.showcase-panel[data-panel="' + target + '"]');
        if (panel) panel.classList.add('active');
      });
    });
  }

  // ─────────────────────────────────────────────
  // 5. TOAST
  // ─────────────────────────────────────────────
  function initToast() {
    var stack = document.getElementById('toastStack');
    if (!stack) {
      stack = document.createElement('div');
      stack.id = 'toastStack';
      stack.className = 'toast-stack';
      stack.setAttribute('aria-live', 'polite');
      document.body.appendChild(stack);
    }
    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
      });
    }
    function toast(message, type, timeout) {
      type = type || 'info';
      timeout = timeout || 4000;
      var el = document.createElement('div');
      el.className = 'toast ' + type;
      var icons = { success: '✓', error: '✕', info: 'i' };
      el.innerHTML = '<span class="toast-icon">' + (icons[type] || 'i') + '</span><span>' + esc(message) + '</span>';
      stack.appendChild(el);
      setTimeout(function () {
        el.classList.add('leaving');
        setTimeout(function () { el.remove(); }, 220);
      }, timeout);
    }
    window.stardustToast = toast;
  }

  // ─────────────────────────────────────────────
  // 6. SESSION — CACHE + HEADER UPDATE
  // ─────────────────────────────────────────────
  var SESSION_KEY = 'stardust_session_user';
  var SESSION_MAX_AGE = 5 * 60 * 1000; // 5 min

  function getCachedUser() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (Date.now() - (obj.ts || 0) > SESSION_MAX_AGE) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return obj.user;
    } catch (e) { return null; }
  }
  function setCachedUser(user) {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user: user, ts: Date.now() })); } catch (e) {}
  }
  function clearCachedUser() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
  }
  window.stardustClearSession = clearCachedUser;

  function userAvatarUrl(u, size) {
    if (!u) return 'https://cdn.discordapp.com/embed/avatars/0.png';
    var s = size || 64;
    if (u.avatar) return 'https://cdn.discordapp.com/avatars/' + u.id + '/' + u.avatar + '.png?size=' + s;
    return 'https://cdn.discordapp.com/embed/avatars/0.png';
  }

  function escHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function updateHeaderForUser(user) {
    if (!user) return;
    var name = user.global_name || user.username || 'User';
    var av = userAvatarUrl(user, 64);

    document.querySelectorAll('.login-btn').forEach(function (btn) {
      btn.classList.remove('login-btn');
      btn.classList.add('user-chip-btn');
      btn.setAttribute('aria-haspopup', 'true');
      btn.setAttribute('aria-expanded', 'false');

      var isA = btn.tagName === 'A';
      btn.innerHTML =
        '<img class="user-chip-avatar" src="' + av + '" alt="">' +
        '<span class="user-chip-name">' + escHtml(name) + '</span>' +
        '<svg class="user-chip-caret" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
      if (isA) btn.setAttribute('href', 'dashboard.html');
    });

    // Global dropdown handler (only attached once)
    if (!window.__stardustUserMenuBound) {
      window.__stardustUserMenuBound = true;

      document.addEventListener('click', function (e) {
        var chip = e.target.closest && e.target.closest('.user-chip-btn');
        if (chip) {
          e.preventDefault();
          e.stopPropagation();
          var menu = document.getElementById('globalUserMenu');
          if (!menu) {
            menu = document.createElement('div');
            menu.id = 'globalUserMenu';
            menu.className = 'global-user-menu';
            menu.innerHTML =
              '<a href="dashboard.html" class="dropdown-item">My servers</a>' +
              '<a href="support.html" class="dropdown-item">Support</a>' +
              '<div class="dropdown-sep"></div>' +
              '<button type="button" class="dropdown-item danger" id="globalLogoutBtn">Log out</button>';
            document.body.appendChild(menu);
            document.getElementById('globalLogoutBtn').addEventListener('click', async function (ev) {
              ev.preventDefault();
              try { await window.StardustAPI.logout(); } catch (er) {}
              clearCachedUser();
              window.location.href = 'index.html';
            });
          }

          // Toggle behavior
          if (menu.classList.contains('open')) {
            menu.classList.remove('open');
            chip.setAttribute('aria-expanded', 'false');
            return;
          }

          // Position: fixed, below the chip, clamped inside viewport
          var rect = chip.getBoundingClientRect();
          var menuWidth = 220;
          var right = window.innerWidth - rect.right;
          if (right < 12) right = 12;
          if (window.innerWidth - right - menuWidth < 12) {
            right = Math.max(12, window.innerWidth - menuWidth - 12);
          }
          menu.style.position = 'fixed';
          menu.style.top = (rect.bottom + 8) + 'px';
          menu.style.right = right + 'px';
          menu.style.left = 'auto';
          menu.classList.add('open');
          chip.setAttribute('aria-expanded', 'true');
          return;
        }
        var menu = document.getElementById('globalUserMenu');
        if (menu && menu.classList.contains('open') && !e.target.closest('#globalUserMenu')) {
          menu.classList.remove('open');
        }
      });
    }
  }

  // ─────────────────────────────────────────────
  // 7. DROPDOWN AUTO-CLOSE (scroll/resize)
  // ─────────────────────────────────────────────
  function initDropdownAutoClose() {
    function closeMenu() {
      var menu = document.getElementById('globalUserMenu');
      if (menu) menu.classList.remove('open');
    }
    window.addEventListener('scroll', closeMenu, { passive: true });
    window.addEventListener('resize', closeMenu);
  }

  // ─────────────────────────────────────────────
  // 8. LOGIN BUTTONS (only if not logged in)
  // ─────────────────────────────────────────────
  function initLoginButtons() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.login-btn');
      if (!btn) return;
      e.preventDefault();

      if (!window.StardustAPI) {
        window.stardustToast && window.stardustToast('API client not loaded.', 'error');
        return;
      }

      btn.style.opacity = '0.6';
      btn.style.pointerEvents = 'none';

      window.StardustAPI.login().catch(function (err) {
        btn.style.opacity = '';
        btn.style.pointerEvents = '';
        window.stardustToast && window.stardustToast(err.message || 'Login failed.', 'error');
      });
    });
  }

  // ─────────────────────────────────────────────
  // 9. OAUTH RETURN HANDLER
  // ─────────────────────────────────────────────
  function initOAuthReturn() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'success') {
      clearCachedUser();
      window.stardustToast && window.stardustToast('Logged in successfully. Redirecting…', 'success');
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(function () { window.location.href = 'dashboard.html'; }, 800);
    } else if (params.get('login_error')) {
      window.stardustToast && window.stardustToast('Login failed: ' + params.get('login_error'), 'error');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  // ─────────────────────────────────────────────
  // 10. SESSION DETECTION
  // ─────────────────────────────────────────────
  async function detectSession() {
    if (!window.StardustAPI) return;

    var path = window.location.pathname.toLowerCase();
    if (path.indexOf('dashboard') !== -1 || path.indexOf('server') !== -1) return;

    var cached = getCachedUser();
    if (cached) { updateHeaderForUser(cached); return; }

    try {
      var res = await window.StardustAPI.me();
      if (res.ok && res.data && res.data.id) {
        setCachedUser(res.data);
        updateHeaderForUser(res.data);
      } else {
        clearCachedUser();
      }
    } catch (err) {
      clearCachedUser();
    }
  }

  // ─────────────────────────────────────────────
  // 11. LIVE STATUS
  // ─────────────────────────────────────────────
  function initLiveStatus() {
    var footerDot = document.getElementById('footerStatusDot');
    var footerText = document.getElementById('footerStatusText');
    var statServers = document.getElementById('statServers');
    var statLatency = document.getElementById('statLatency');
    var serverCount = document.getElementById('serverCount');

    function setOffline(reason) {
      if (footerDot) footerDot.className = 'dot offline';
      if (footerText) footerText.textContent = reason || 'Status unavailable';
      if (statServers) statServers.textContent = '—';
      if (statLatency) statLatency.textContent = '—';
    }
    function setOnline(data) {
      var gc = data.guild_count || 0;
      var lat = data.bot_latency_ms;
      var ready = data.bot_ready;
      if (footerDot) footerDot.className = 'dot online';
      if (footerText) footerText.textContent = ready ? 'All systems operational' : 'Bot waking up…';
      if (statServers) statServers.textContent = gc.toLocaleString ? gc.toLocaleString() : String(gc);
      if (statLatency) statLatency.textContent = lat ? lat + 'ms' : '—';
      if (serverCount && gc) serverCount.textContent = (gc.toLocaleString ? gc.toLocaleString() : String(gc));
    }

    var attempts = 0;
    var MAX = 3;
    async function check() {
      if (!window.StardustAPI) { setOffline('API not loaded'); return; }
      var res = await window.StardustAPI.health();
      if (res.ok && res.data) { setOnline(res.data); return; }
      attempts++;
      if (attempts < MAX) {
        if (footerText) footerText.textContent = 'Waking up server… (' + attempts + '/' + MAX + ')';
        setTimeout(check, 3000 * attempts);
      } else { setOffline('Backend unavailable'); }
    }
    setTimeout(check, 500);
    setInterval(function () { attempts = 0; check(); }, 60000);
  }

  // ─────────────────────────────────────────────
  // 12. SMOOTH SCROLL
  // ─────────────────────────────────────────────
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  }

  // ─────────────────────────────────────────────
  // BOOT
  // ─────────────────────────────────────────────
  function boot() {
    log('Booting…');
    runSafe('Theme', initTheme);
    runSafe('Header scroll', initHeaderScroll);
    runSafe('Drawer', initDrawer);
    runSafe('Showcase', initShowcase);
    runSafe('Toast', initToast);
    runSafe('Login buttons', initLoginButtons);
    runSafe('OAuth return', initOAuthReturn);
    runSafe('Dropdown autoclose', initDropdownAutoClose);
    runSafe('Live status', initLiveStatus);
    runSafe('Smooth scroll', initSmoothScroll);
    setTimeout(function () { runSafe('Session detect', detectSession); }, 100);
    log('Ready.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
