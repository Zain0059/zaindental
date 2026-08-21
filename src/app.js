// ==================================================
// ZAIN DENTAL CLINIC — CLIENT APPLICATION LOGIC
// ==================================================

const SUPABASE_URL = 'https://nfbwdbizeepxjxmtuhxz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mYndkYml6ZWVweGp4bXR1aHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MTAzNjcsImV4cCI6MjA4OTE4NjM2N30.UFtvS4wc4vBFc6_XewvhMypjFWh9kxhtuzJr7x0i6gk';

let _sbClient = null;
export function getSb() {
  if (!_sbClient && typeof window !== 'undefined' && window.supabase) {
    _sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return _sbClient;
}

export const sb = new Proxy({}, {
  get(target, prop) {
    const client = getSb();
    if (!client) {
      console.warn("Supabase client is initializing...");
      return (...args) => {
        const retryClient = getSb();
        if (retryClient && typeof retryClient[prop] === 'function') {
          return retryClient[prop](...args);
        }
        return {
          select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
          from: () => ({ select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }) })
        };
      };
    }
    const val = client[prop];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  }
});

import { t, isAr, getLang } from './i18n.js';

export const SC = {
  scheduled: "#3B82F6",
  confirmed: "#0EA5A4",
  completed: "#10B981",
  cancelled: "#EF4444",
  "no-show": "#64748B"
};

export const SL = new Proxy({}, {
  get(target, prop) {
    const keyMap = {
      scheduled: "st_scheduled",
      confirmed: "st_confirmed",
      completed: "st_completed",
      done: "st_done",
      cancelled: "st_cancelled",
      "no-show": "st_noshow",
      unpaid: "st_unpaid",
      partial: "st_partial",
      paid: "st_paid"
    };
    if (keyMap[prop]) {
      return t(keyMap[prop]);
    }
    return prop;
  }
});

export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const MONTHS_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

export let USER = null;
try {
  const stored = localStorage.getItem("zd_user");
  if (stored) USER = JSON.parse(stored);
} catch (e) {
  localStorage.removeItem("zd_user");
}

export function getCurrentUser() {
  try {
    const stored = localStorage.getItem("zd_user");
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return USER;
}

export function setCurrentUser(u) {
  USER = u;
  if (u) {
    localStorage.setItem("zd_user", JSON.stringify(u));
  } else {
    localStorage.removeItem("zd_user");
  }
}

export function isAdmin() {
  const u = getCurrentUser();
  return u?.role === 'admin';
}

export let _niPatId = null, _naPatId = null, _clPatId = null, _invFilter = "all";
export let _niItems = [], _procs = [], _naMode = "existing";
export let _tmrs = {};
export let _editPatId = null, _editInvId = null, _editTxId = null, _editStfId = null, _editSvcId = null, _editExpId = null;
export function setEditInvId(id) { _editInvId = id; }
export function getEditInvId() { return _editInvId; }
export let _allInvoices = [], _invToday = true;
export let _editInvItems = [], _editInvOrigItems = [];
export let _scanImgB64 = null, _scanImgMime = null, _scanImg2B64 = null, _scanImg2Mime = null;

// SHA-256 for password hashing
export async function sha256(msg) {
  function rightRotate(v, a) { return (v >>> a) | (v << (32 - a)); }
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const bytes = new TextEncoder().encode(msg);
  const bits = bytes.length * 8;
  const extra = ((bytes.length + 9) % 64 === 0) ? 0 : 64 - ((bytes.length + 9) % 64);
  const padded = new Uint8Array(bytes.length + 1 + extra + 8);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 4, bits, false);
  for (let offset = 0; offset < padded.length; offset += 64) {
    const W = new Array(64);
    for (let i = 0; i < 16; i++) W[i] = dv.getUint32(offset + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = (rightRotate(W[i - 15], 7) ^ rightRotate(W[i - 15], 18) ^ (W[i - 15] >>> 3)) >>> 0;
      const s1 = (rightRotate(W[i - 2], 17) ^ rightRotate(W[i - 2], 19) ^ (W[i - 2] >>> 10)) >>> 0;
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const t1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
      const S0 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H = [H[0] + a, H[1] + b, H[2] + c, H[3] + d, H[4] + e, H[5] + f, H[6] + g, H[7] + h].map(v => v >>> 0);
  }
  return H.map(v => v.toString(16).padStart(8, "0")).join("");
}

export function toothOpts() {
  const isArabic = isAr();
  const T_EN = {
    18: "18 — Wisdom Molar", 17: "17 — 2nd Molar", 16: "16 — 1st Molar", 15: "15 — 2nd Premolar", 14: "14 — 1st Premolar", 13: "13 — Canine", 12: "12 — Lateral Incisor", 11: "11 — Central Incisor",
    21: "21 — Central Incisor", 22: "22 — Lateral Incisor", 23: "23 — Canine", 24: "24 — 1st Premolar", 25: "25 — 2nd Premolar", 26: "26 — 1st Molar", 27: "27 — 2nd Molar", 28: "28 — Wisdom Molar",
    48: "48 — Wisdom Molar", 47: "47 — 2nd Molar", 46: "46 — 1st Molar", 45: "45 — 2nd Premolar", 44: "44 — 1st Premolar", 43: "43 — Canine", 42: "42 — Lateral Incisor", 41: "41 — Central Incisor",
    31: "31 — Central Incisor", 32: "32 — Lateral Incisor", 33: "33 — Canine", 34: "34 — 1st Premolar", 35: "35 — 2nd Premolar", 36: "36 — 1st Molar", 37: "37 — 2nd Molar", 38: "38 — Wisdom Molar",
    // Primary / Pediatric
    55: "55 — 2nd Primary Molar", 54: "54 — 1st Primary Molar", 53: "53 — Primary Canine", 52: "52 — Primary Lateral Incisor", 51: "51 — Primary Central Incisor",
    61: "61 — Primary Central Incisor", 62: "62 — Primary Lateral Incisor", 63: "63 — Primary Canine", 64: "64 — 1st Primary Molar", 65: "65 — 2nd Primary Molar",
    85: "85 — 2nd Primary Molar", 84: "84 — 1st Primary Molar", 83: "83 — Primary Canine", 82: "82 — Primary Lateral Incisor", 81: "81 — Primary Central Incisor",
    71: "71 — Primary Central Incisor", 72: "72 — Primary Lateral Incisor", 73: "73 — Primary Canine", 74: "74 — 1st Primary Molar", 75: "75 — 2nd Primary Molar"
  };
  const T_AR = {
    18: "18 — ضرس العقل", 17: "17 — ضرس ثان", 16: "16 — ضرس أول", 15: "15 — ضاحك ثان", 14: "14 — ضاحك أول", 13: "13 — ناب", 12: "12 — قاطع جانبي", 11: "11 — قاطع مركزي",
    21: "21 — قاطع مركزي", 22: "22 — قاطع جانبي", 23: "23 — ناب", 24: "24 — ضاحك أول", 25: "25 — ضاحك ثان", 26: "26 — ضرس أول", 27: "27 — ضرس ثان", 28: "28 — ضرس العقل",
    48: "48 — ضرس العقل", 47: "47 — ضرس ثان", 46: "46 — ضرس أول", 45: "45 — ضاحك ثان", 44: "44 — ضاحك أول", 43: "43 — ناب", 42: "42 — قاطع جانبي", 41: "41 — قاطع مركزي",
    31: "31 — قاطع مركزي", 32: "32 — قاطع جانبي", 33: "33 — ناب", 34: "34 — ضاحك أول", 35: "35 — ضاحك ثان", 36: "36 — ضرس أول", 37: "37 — ضرس ثان", 38: "38 — ضرس العقل",
    // Primary / Pediatric
    55: "55 — ضرس لبني ثان", 54: "54 — ضرس لبني أول", 53: "53 — ناب لبني", 52: "52 — قاطع جانبي لبني", 51: "51 — قاطع مركزي لبني",
    61: "61 — قاطع مركزي لبني", 62: "62 — قاطع جانبي لبني", 63: "63 — ناب لبني", 64: "64 — ضرس لبني أول", 65: "65 — ضرس لبني ثان",
    85: "85 — ضرس لبني ثان", 84: "84 — ضرس لبني أول", 83: "83 — ناب لبني", 82: "82 — قاطع جانبي لبني", 81: "81 — قاطع مركزي لبني",
    71: "71 — قاطع مركزي لبني", 72: "72 — قاطع جانبي لبني", 73: "73 — ناب لبني", 74: "74 — ضرس لبني أول", 75: "75 — ضرس لبني ثان"
  };
  const T = isArabic ? T_AR : T_EN;
  const Q = isArabic ? [
    ["الربع الأول: علوي أيمن (Q1: 18-11)", [18, 17, 16, 15, 14, 13, 12, 11]],
    ["الربع الثاني: علوي أيسر (Q2: 21-28)", [21, 22, 23, 24, 25, 26, 27, 28]],
    ["الربع الرابع: سفلي أيمن (Q4: 48-41)", [48, 47, 46, 45, 44, 43, 42, 41]],
    ["الربع الثالث: سفلي أيسر (Q3: 31-38)", [31, 32, 33, 34, 35, 36, 37, 38]],
    ["أسنان لبنية: علوي أيمن (Q5: 55-51)", [55, 54, 53, 52, 51]],
    ["أسنان لبنية: علوي أيسر (Q6: 61-65)", [61, 62, 63, 64, 65]],
    ["أسنان لبنية: سفلي أيمن (Q8: 85-81)", [85, 84, 83, 82, 81]],
    ["أسنان لبنية: سفلي أيسر (Q7: 71-75)", [71, 72, 73, 74, 75]]
  ] : [
    ["Upper Right (Q1: 18-11)", [18, 17, 16, 15, 14, 13, 12, 11]],
    ["Upper Left (Q2: 21-28)", [21, 22, 23, 24, 25, 26, 27, 28]],
    ["Lower Right (Q4: 48-41)", [48, 47, 46, 45, 44, 43, 42, 41]],
    ["Lower Left (Q3: 31-38)", [31, 32, 33, 34, 35, 36, 37, 38]],
    ["Primary Upper Right (Q5: 55-51)", [55, 54, 53, 52, 51]],
    ["Primary Upper Left (Q6: 61-65)", [61, 62, 63, 64, 65]],
    ["Primary Lower Right (Q8: 85-81)", [85, 84, 83, 82, 81]],
    ["Primary Lower Left (Q7: 71-75)", [71, 72, 73, 74, 75]]
  ];
  return `<option value="">${t("tooth_select_ph")}</option>` + Q.map(([lbl, teeth]) => `<optgroup label="${lbl}">${teeth.map(n => `<option value="${n}">${T[n] || n}</option>`).join("")}</optgroup>`).join("");
}

export function toast(m, ms = 2400) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = m;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), ms);
}

export function esc(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function age(dob) {
  const d = new Date(dob), n = new Date();
  let a = n.getFullYear() - d.getFullYear();
  if (n < new Date(n.getFullYear(), d.getMonth(), d.getDate())) a--;
  return a;
}

export function fmt(n, sym = null) {
  const defaultSym = isAr() ? "ج.م" : "EGP";
  const currency = sym !== null ? sym : defaultSym;
  const numStr = (+n || 0).toLocaleString(isAr() ? "ar-EG" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return isAr() ? `${numStr} ${currency}` : `${currency} ${numStr}`;
}

export function today() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function toEG(phone) {
  let n = (phone || "").replace(/\D/g, "");
  if (n.startsWith("966")) n = n.slice(3);
  if (n.startsWith("20")) n = n.slice(2);
  if (n.startsWith("0")) n = n.slice(1);
  return "20" + n;
}

export function sendWA(phone, msg) {
  window.open("https://wa.me/" + toEG(phone) + "?text=" + msg, "_blank");
}
