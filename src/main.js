import * as app from './app.js';
import * as handlers from './app-handlers.js';
import * as features from './app-features.js';
import * as clinicalMore from './app-clinical-more.js';

// Bind all functions to window for instant inline compatibility
const allModules = { ...app, ...handlers, ...features, ...clinicalMore };
Object.keys(allModules).forEach(key => {
  window[key] = allModules[key];
});

// Setup on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
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
