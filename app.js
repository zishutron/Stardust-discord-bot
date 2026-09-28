/* ═══════════════════════════════════════════════════════════
   STARDUST — Landing Page Behavior
   Every subsystem runs in isolation — one failure never kills others.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  function log() {
    if (window.console) console.log.apply(console, ['[Stardust]'].concat(Array.prototype.slice.call(arguments)));
  }
  function warn() {
    if (window.console) console.warn.apply(console, ['[Stardust]'].concat(Array.prototype.slice.call(arguments)));
  }

  // ─────────────────────────────────────────────
  // SAFE SUBSYSTEM RUNNER — ek fail ho toh baaki chalein
  // ─────────────────────────────────────────────
  function runSafe(name, fn) {
    try {
      fn();
      log('✓', name);
    } catch (err) {
      warn('✗', name, '—', err && err.message);
    }
  }

  // ═════════════════════════════════════════════
  // 1. THEME SYSTEM
  // ═════════════════════════════════════════════
  function initTheme() {
    var root = document.documentElement;
    var KEY = 'stardust_theme';

    function apply(theme) {
      root.setAttribute('data-theme', theme);
      try { localStorage.setItem(KEY, theme); } catch (e) {}
      var btn = document.getElementById('themeToggle');
      if (btn) btn.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' theme');
    }

    // Initial theme
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved === 'light' || saved === 'dark') {
      apply(saved);
    } else {
      var prefersLight = false;
      try { prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches; } catch (e) {}
      apply(prefersLight ? 'light' : 'dark');
    }

    // Toggle button — event delegation (works even if button added later)
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('#themeToggle');
      if (!btn) return;
      e.preventDefault();
      var current = root.getAttribute('data-theme') || 'dark';
      apply(current === 'dark' ? 'light' : 'dark');
      log('Theme →', current === 'dark' ? 'light' : 'dark');
    });
  }

  // ═════════════════════════════════════════════
  // 2. HEADER SCROLL
  // ═════════════════════════════════════════════
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

  // ═════════════════════════════════════════════
  // 3. MOBILE DRAWER
  // ═════════════════════════════════════════════
  function initDrawer() {
    var drawer = document.getElementById('drawer');
    var overlay = document.getElementById('drawerOverlay');
    if (!drawer || !overlay) {
      warn('Drawer elements missing');
      return;
    }

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

    // Event delegation — button click par open, overlay click par close
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;

      if (t.closest('#menuToggle')) {
        e.preventDefault();
        open();
        return;
      }
      if (t.closest('#drawerClose')) {
        e.preventDefault();
        close();
        return;
      }
      if (t.closest('#drawerOverlay')) {
        e.preventDefault();
        close();
        return;
      }
      // Click on any link inside drawer auto-closes
      var link = t.closest('#drawer a');
      if (link) {
        close();
      }
    });

    // ESC key closes
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  // ═════════════════════════════════════════════
  // 4. SHOWCASE TABS
  // ═════════════════════════════════════════════
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

  // ═════════════════════════════════════════════
  // 5. TOAST SYSTEM
  // ═════════════════════════════════════════════
  function initToast() {
    var stack = document.getElementById('toastStack');
    if (!stack) {
      // Create one if missing
      stack = document.createElement('div');
      stack.id = 'toastStack';
      stack.className = 'toast-stack';
      stack.setAttribute('aria-live', 'polite');
      document.body.appendChild(stack);
    }

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, function (c) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
      });
    }

    function toast(message, type, timeout) {
      type = type || 'info';
      timeout = timeout || 4000;
      var el = document.createElement('div');
      el.className = 'toast ' + type;
      var icons = { success: '✓', error: '✕', info: 'i' };
      el.innerHTML =
        '<span class="toast-icon">' + (icons[type] || 'i') + '</span>' +
        '<span>' + escapeHtml(message) + '</span>';
      stack.appendChild(el);
      setTimeout(function () {
        el.classList.add('leaving');
        setTimeout(function () { el.remove(); }, 220);
      }, timeout);
    }

    window.stardustToast = toast;
  }

  // ═════════════════════════════════════════════
  // 6. LOGIN BUTTONS
  // ═════════════════════════════════════════════
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

  // ═════════════════════════════════════════════
  // 7. OAUTH RETURN HANDLER (?login=success)
  // ═════════════════════════════════════════════
  function initOAuthReturn() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'success') {
      window.stardustToast && window.stardustToast('Logged in successfully. Redirecting…', 'success');
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(function () {
        window.location.href = 'dashboard.html';
      }, 800);
    } else if (params.get('login_error')) {
      window.stardustToast && window.stardustToast('Login failed: ' + params.get('login_error'), 'error');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  // ═════════════════════════════════════════════
  // 8. LIVE STATUS (with Render cold-start resilience)
  // ═════════════════════════════════════════════
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
    var MAX_ATTEMPTS = 3;

    async function check() {
      if (!window.StardustAPI) {
        setOffline('API not loaded');
        return;
      }
      var res = await window.StardustAPI.health();
      if (res.ok && res.data) {
        setOnline(res.data);
        return;
      }
      attempts++;
      if (attempts < MAX_ATTEMPTS) {
        if (footerText) footerText.textContent = 'Waking up server… (' + attempts + '/' + MAX_ATTEMPTS + ')';
        // Exponential backoff: 3s, 6s
        setTimeout(check, 3000 * attempts);
      } else {
        setOffline('Backend unavailable');
      }
    }

    // First check after slight delay so page renders first
    setTimeout(check, 500);
    setInterval(function () {
      attempts = 0;
      check();
    }, 60000);
  }

  // ═════════════════════════════════════════════
  // 9. SMOOTH ANCHOR SCROLL
  // ═════════════════════════════════════════════
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

  // ═════════════════════════════════════════════
  // BOOT — wait for DOM then start subsystems
  // ═════════════════════════════════════════════
  function boot() {
    log('Booting subsystems…');
    runSafe('Theme system', initTheme);
    runSafe('Header scroll', initHeaderScroll);
    runSafe('Mobile drawer', initDrawer);
    runSafe('Showcase tabs', initShowcase);
    runSafe('Toast system', initToast);
    runSafe('Login buttons', initLoginButtons);
    runSafe('OAuth return', initOAuthReturn);
    runSafe('Live status', initLiveStatus);
    runSafe('Smooth scroll', initSmoothScroll);
    log('All subsystems ready.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
