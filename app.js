/* ═══════════════════════════════════════════════════════════
   STARDUST — Landing page behavior
   ═══════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  // ─── Theme (persisted, respects system) ───
  const THEME_KEY = 'stardust_theme';
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }

  (function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch {}
    if (saved === 'light' || saved === 'dark') {
      applyTheme(saved);
    } else {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      applyTheme(prefersLight ? 'light' : 'dark');
    }
  })();

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // ─── Header scroll state ───
  const header = document.getElementById('siteHeader');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ─── Mobile drawer ───
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('drawerOverlay');
  const menuToggle = document.getElementById('menuToggle');
  const drawerClose = document.getElementById('drawerClose');

  function openDrawer() {
    drawer?.classList.add('active');
    overlay?.classList.add('active');
    drawer?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer?.classList.remove('active');
    overlay?.classList.remove('active');
    drawer?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  menuToggle?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  overlay?.addEventListener('click', closeDrawer);
  drawer?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

  // ─── Showcase tabs ───
  document.querySelectorAll('.showcase-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.showcase-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.showcase-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`[data-panel="${target}"]`)?.classList.add('active');
    });
  });

  // ─── Toast ───
  const stack = document.getElementById('toastStack');
  function toast(message, type = 'info', timeout = 4000) {
    if (!stack) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icons = { success: '✓', error: '✕', info: 'i' };
    el.innerHTML = `
      <span class="toast-icon">${icons[type] || 'i'}</span>
      <span>${escapeHtml(message)}</span>
    `;
    stack.appendChild(el);
    setTimeout(() => {
      el.classList.add('leaving');
      setTimeout(() => el.remove(), 200);
    }, timeout);
  }
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }
  window.stardustToast = toast;

  // ─── Login buttons ───
  document.querySelectorAll('.login-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      btn.style.opacity = '0.6';
      btn.style.pointerEvents = 'none';
      try {
        await window.StardustAPI.login();
      } catch (err) {
        btn.style.opacity = '';
        btn.style.pointerEvents = '';
        toast(err.message || 'Login failed', 'error');
      }
    });
  });

  // ─── Detect return from OAuth (?login=success) ───
  const params = new URLSearchParams(window.location.search);
  if (params.get('login') === 'success') {
    toast('Logged in. Redirecting to dashboard…', 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 900);
    window.history.replaceState({}, '', window.location.pathname);
  } else if (params.get('login_error')) {
    toast('Login failed. Please try again.', 'error');
    window.history.replaceState({}, '', window.location.pathname);
  }

  // ─── Live status ───
  async function fetchStatus() {
    const footerDot = document.getElementById('footerStatusDot');
    const footerText = document.getElementById('footerStatusText');
    const statServers = document.getElementById('statServers');
    const statLatency = document.getElementById('statLatency');
    const serverCount = document.getElementById('serverCount');

    const res = await window.StardustAPI.health();

    if (res.ok && res.data) {
      const { guild_count, bot_latency_ms, bot_ready } = res.data;
      if (footerDot) footerDot.className = 'dot online';
      if (footerText) footerText.textContent = bot_ready ? 'All systems operational' : 'Bot offline';
      if (statServers) statServers.textContent = guild_count?.toLocaleString?.() ?? '—';
      if (statLatency) statLatency.textContent = bot_latency_ms ? `${bot_latency_ms}ms` : '—';
      if (serverCount && guild_count) serverCount.textContent = guild_count.toLocaleString();
    } else {
      if (footerDot) footerDot.className = 'dot offline';
      if (footerText) footerText.textContent = 'Status unavailable';
      if (statServers) statServers.textContent = '—';
      if (statLatency) statLatency.textContent = '—';
    }
  }

  fetchStatus();
  // Refresh every 60s
  setInterval(fetchStatus, 60000);

})();
