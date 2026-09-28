# Stardust — Deployment & Testing Checklist

Complete deployment checklist for both the frontend (GitHub Pages) and backend (Render).

---

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Backend Deployment (Render)](#2-backend-deployment-render)
3. [Frontend Deployment (GitHub Pages)](#3-frontend-deployment-github-pages)
4. [Discord Developer Portal Setup](#4-discord-developer-portal-setup)
5. [Post-Deploy Verification](#5-post-deploy-verification)
6. [Testing Checklist](#6-testing-checklist)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Prerequisites

- [ ] GitHub account with a repository named `Stardust-discord-bot`
- [ ] Render account (free tier is fine)
- [ ] Discord Developer Portal access to your Stardust application
- [ ] Bot token generated (from Discord Dev Portal → Bot)

---

## 2. Backend Deployment (Render)

### 2.1 Create the Service

1. Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repo — but for the bot only, use a separate private repo or the same repo with a subfolder
3. **Build Command:** `pip install -r requirements.txt`
4. **Start Command:** `python main.py`
5. **Environment:** Python 3

### 2.2 Environment Variables

Set these in Render → your service → **Environment**:

| Key | Value |
|---|---|
| `DISCORD_TOKEN` | Your bot token |
| `DISCORD_CLIENT_ID` | `1517046273037832342` (or your client ID) |
| `DISCORD_CLIENT_SECRET` | From Discord Dev Portal → OAuth2 |
| `OAUTH_REDIRECT` | `https://stardust-bot.onrender.com/api/callback` |
| `FRONTEND_URL` | `https://zishutron.github.io` **(NO path, NO trailing slash)** |
| `SESSION_SECRET` | A long random string (32+ chars) |

### 2.3 Verify

Visit: `https://stardust-bot.onrender.com/api/health`

Expected response:

```json
{
  "success": true,
  "data": {
    "api": "ok",
    "bot_ready": true,
    "bot_latency_ms": 42,
    "guild_count": 5,
    "timestamp": 1735689600
  }
}

⚠️ Free Tier Note: The backend sleeps after ~15 min of inactivity. First request after sleep takes 20–30 seconds. If the free-tier hour limit is exhausted, the service is offline until the next billing cycle.

3. Frontend Deployment (GitHub Pages)
3.1 Push files

Ensure the following are in the repo root:

Pages:

☐ index.html ☐ features.html ☐ commands.html ☐ docs.html ☐ status.html ☐ support.html ☐ terms.html ☐ privacy.html ☐ 404.html ☐ dashboard.html ☐ server.html

Styles:

☐ style.css ☐ pages.css ☐ dashboard.css ☐ server.css

Scripts:

☐ api.js ☐ app.js ☐ dashboard.js ☐ server.js

SEO / meta:

☐ robots.txt ☐ sitemap.xml ☐ README.md

3.2 Enable GitHub Pages

Repo → Settings → Pages → Source: Deploy from a branch → Branch: main, folder: / (root) → Save.

3.3 Verify

Visit https://zishutron.github.io/Stardust-discord-bot/ — homepage should load.

4. Discord Developer Portal Setup
Go to https://discord.com/developers/applications → your app.

4.1 OAuth2

OAuth2 → General → Redirects:

☐ Add https://stardust-bot.onrender.com/api/callback

Save.

OAuth2 → General → Client Secret:

☐ Reset if needed, copy and store in Render env

4.2 Bot Intents

Bot → Privileged Gateway Intents:

☐ Presence Intent — ON ☐ Server Members Intent — ON ☐ Message Content Intent — ON

Save.

4.3 Bot Permissions

OAuth2 → URL Generator:

☐ Scopes: bot, applications.commands ☐ Permissions: Administrator (simplest) or the fine-grained set: · Manage Server · Manage Roles · Manage Channels · Kick Members · Ban Members · Moderate Members · Manage Messages · Send Messages · Embed Links · Attach Files

5. Post-Deploy Verification
5.1 Backend Health

☐ https://stardust-bot.onrender.com/api/health returns JSON with bot_ready: true ☐ https://stardust-bot.onrender.com/ returns {"status": "ok", ...}

5.2 Frontend Loads

☐ https://zishutron.github.io/Stardust-discord-bot/ — hero renders, theme toggle works, mobile drawer works ☐ Footer status shows "All systems operational" ☐ Stats section shows a server count number

5.3 OAuth Flow

☐ Click Login on homepage ☐ Redirected to Discord OAuth → authorize ☐ Redirected back to index.html?login=success ☐ Toast appears, then auto-redirect to dashboard.html ☐ Dashboard shows server cards ☐ Click Manage on a card → server.html?guild=XXX loads

5.4 Cookie Verification

Open DevTools → Application → Cookies → stardust-bot.onrender.com:

☐ stardust_session cookie exists ☐ SameSite: None ☐ Secure: ✓ (checkmark) ☐ HttpOnly: ✓ (checkmark)

If SameSite is Lax — the backend wasn't updated with the cross-domain cookie fix.

6. Testing Checklist
6.1 Homepage (index.html)

☐ Logo appears in header, drawer, footer, and tab favicon ☐ Hero title uses italic serif ☐ Dashboard preview mockup renders correctly ☐ Feature grid shows 8 cards ☐ Showcase tabs switch between panels ☐ Stats section populates from /api/health ☐ CTA buttons work ☐ Footer links work ☐ Theme toggle persists across page reload ☐ Mobile: hamburger opens drawer; links close it

6.2 Features (features.html)

☐ Hero with ToC pills ☐ All 9 sections render with proper spacing ☐ CTA at bottom

6.3 Commands (commands.html)

☐ Search filters command list in real time ☐ Category tabs filter correctly ☐ Command cards show description + permission pills ☐ Empty state shows when no matches

6.4 Docs (docs.html)

☐ Left sidebar sticky on desktop ☐ Active section highlights as you scroll ☐ Sidebar links smooth-scroll to sections ☐ FAQ items expand/collapse on click ☐ Mobile: sidebar moves above content

6.5 Status (status.html)

☐ Overall status card shows correct state ☐ API / Bot / Servers cards each show proper badge ☐ Auto-refreshes every 60 seconds ☐ Handles offline state gracefully

6.6 Support (support.html)

☐ 4 support cards render ☐ FAQ accordion works ☐ Discord invite links open in new tab

6.7 Legal (terms.html, privacy.html)

☐ Content renders in narrow legal column ☐ "Last updated" pill visible ☐ Contact links work

6.8 404 (404.html)

☐ Visit https://zishutron.github.io/Stardust-discord-bot/nonexistent → custom 404 shows ☐ Theme respects saved preference ☐ Back / dashboard / support buttons work

6.9 Dashboard (dashboard.html)

☐ Loading skeleton appears initially ☐ Servers populate after fetch ☐ Search filters servers ☐ Tabs (All / Manageable / Add Stardust) filter + update counts ☐ "Manage" button → opens server.html?guild=XXX ☐ "Add Stardust" button → opens Discord OAuth with guild_id + disable_guild_select ☐ "No access" appears for non-admin servers ☐ User dropdown shows correct name + avatar ☐ Logout → returns to index.html

6.10 Server Dashboard (server.html)

☐ Sidebar shows server icon + name ☐ Crumb shows "Dashboard / " ☐ All tabs in sidebar switch panels ☐ Mobile: hamburger opens sidebar drawer ☐ Overview: stats + module grid + quick actions render ☐ AutoMod: toggle updates config; add/remove words works ☐ Welcome: channel select + save works ☐ Tickets: deploy button → confirmation → API call ☐ Economy: leaderboard renders top 20 ☐ Giveaways: form works, confirmation modal appears ☐ Embeds: live preview + send works ☐ Commands: static list renders ☐ Settings: guild ID, bot presence, latency display

6.11 Mobile

Test at widths: 360px, 390px, 412px, 480px, 768px

☐ No horizontal scroll (except code blocks) ☐ Touch targets ≥ 44px ☐ All drawers/collapsibles work ☐ Toast appears at bottom with proper margins ☐ Forms stack vertically

6.12 Accessibility

☐ Keyboard: Tab moves focus through interactive elements ☐ Focus states visible ☐ Escape closes modals / drawers ☐ Screen reader: buttons have aria-labels where needed ☐ prefers-reduced-motion respected

7. Troubleshooting
"Backend unavailable" everywhere

· Render free tier asleep → wait 30 seconds · Free tier hours exhausted → wait for next billing cycle · Check /api/health directly in browser

Login loops back to homepage without session

· SameSite=None not applied on backend · FRONTEND_URL has a trailing slash or path · Discord redirect URL doesn't match OAUTH_REDIRECT exactly

Dashboard shows "No permission" for everything

· Your Discord user lacks Manage Server or Administrator on those servers · Bot is not on the server — click Add Stardust instead

Bot not appearing online

· Check Render logs · Verify DISCORD_TOKEN is set correctly · Verify all 3 privileged intents are ON in Discord Dev Portal

Cookie not persisting across pages

· Browser blocking third-party cookies (Safari, Firefox strict mode) · Workaround: use the site in the same browser profile where you logged in; or configure site-specific cookie permissions

Theme flash on page load

· The inline script in of every page sets theme before CSS renders. If flash persists, check that the script runs before any stylesheet links.

📞 Support

If something still doesn't work, join the Discord support server: https://discord.gg/Xhh5r2UM5C
