import * as app from './app.js';
import * as handlers from './app-handlers.js';
import * as features from './app-features.js';
import * as clinicalMore from './app-clinical-more.js';
import * as materials from './app-materials.js';
import * as i18n from './i18n.js';

// Clean up legacy notification storage keys
try {
  localStorage.removeItem('zd_notifications_v1');
  localStorage.removeItem('zd_notifications_settings_v2');
  localStorage.removeItem('zd_notifications_settings_v1');
  localStorage.removeItem('zd_notif_3pm_date');
} catch (e) {}

// Bind all functions to window for instant inline compatibility
const allModules = { ...app, ...handlers, ...features, ...clinicalMore, ...materials, ...i18n };
Object.keys(allModules).forEach(key => {
  window[key] = allModules[key];
});

// Setup on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  // Apply Language & Direction
  i18n.applyLangToDOM();

  const lp = document.getElementById("lp");
  if (lp) {
    lp.addEventListener("keydown", e => {
      if (e.key === "Enter") window.doLogin();
    });
  }

  // If already authenticated, show app
  if (app.USER) {
    handlers.showApp();
  }
});
