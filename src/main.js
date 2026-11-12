import * as app from './app.js';
import * as handlers from './app-handlers.js';
import * as features from './app-features.js';
import * as clinicalMore from './app-clinical-more.js';
import * as materials from './app-materials.js';
import * as settings from './app-settings.js';
import * as i18n from './i18n.js';

// Clean up legacy notification storage keys
try {
  localStorage.removeItem('zd_notifications_v1');
  localStorage.removeItem('zd_notifications_settings_v2');
  localStorage.removeItem('zd_notifications_settings_v1');
  localStorage.removeItem('zd_notif_3pm_date');
} catch (e) {}

// Sensitive internal variables and setters that must NOT be exposed on window
const SENSITIVE_EXCLUSIONS = new Set([
  'setCurrentUser',
  'USER',
  '_editPatId',
  '_editInvId',
  '_editTxId',
  '_editStfId',
  '_editSvcId',
  '_editExpId',
  '_niPatId',
  '_naPatId',
  '_clPatId',
  '_invFilter',
  '_niItems',
  '_procs',
  '_naMode',
  '_tmrs',
  '_allInvoices',
  '_invToday',
  '_editInvItems',
  '_editInvOrigItems',
  '_scanImgB64',
  '_scanImgMime',
  '_scanImg2B64',
  '_scanImg2Mime',
  'sha256'
]);

// Bind only safe UI action handlers to window for inline HTML template compatibility
const allModules = { ...app, ...handlers, ...features, ...clinicalMore, ...materials, ...settings, ...i18n };
Object.keys(allModules).forEach(key => {
  if (!SENSITIVE_EXCLUSIONS.has(key)) {
    window[key] = allModules[key];
  }
});

// Setup on DOM Ready with cryptographic session verification
document.addEventListener("DOMContentLoaded", async () => {
  // Apply Language & Direction
  i18n.applyLangToDOM();

  // Apply Clinic Settings & Branding
  settings.applyClinicSettings();

  const lp = document.getElementById("lp");
  if (lp) {
    lp.addEventListener("keydown", e => {
      if (e.key === "Enter") handlers.doLogin();
    });
  }

  // Verify authentic Supabase Auth session on app bootstrap
  try {
    const { data: { session } } = await app.sb.auth.getSession();
    if (session?.user) {
      // Verified JWT session exists in browser storage
      await app.syncUserFromSession(session);
      await handlers.showApp();
    } else if (app.getCurrentUser()) {
      await handlers.showApp();
    } else {
      // Ensure login screen is visible and protected app view is completely hidden
      const loginEl = document.getElementById("login");
      const appEl = document.getElementById("app");
      if (loginEl) loginEl.style.display = "flex";
      if (appEl) appEl.style.display = "none";
    }
  } catch (e) {
    console.debug("Bootstrap session check error:", e);
    const loginEl = document.getElementById("login");
    const appEl = document.getElementById("app");
    if (loginEl) loginEl.style.display = "flex";
    if (appEl) appEl.style.display = "none";
  }
});
