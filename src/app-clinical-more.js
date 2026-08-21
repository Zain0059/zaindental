import {
  sb, SC, SL, MONTHS, USER, toothOpts, toast, esc, age, fmt, today, toEG,
  getEditInvId, setEditInvId, sha256
} from './app.js';
import { openInv, loadInvoices, loadProcs, _procs } from './app-features.js';
import { openSheet, closeSheet, sw } from './app-handlers.js';
import { t, isAr } from './i18n.js';

let _clPatId = null;
let _editTxId = null;
let _editInvId = null;
let _editStfId = null;
let _editSvcId = null;
let _editExpId = null;

let _editInvItems = [];
let _editInvOrigItems = [];

let _scanImgB64 = null, _scanImgMime = null, _scanImg2B64 = null, _scanImg2Mime = null;
let _clTmr = null;
let _selectedToothNum = null;
let _selectedTeeth = new Set();
let _multiSelectMode = false;
let _longPressTimer = null;
let _longPressTriggered = false;
let _clDentitionMode = 'adult'; // 'adult' or 'pediatric'

// Clinical & Odontogram
export async function loadRecentClinical() {
  const el = document.getElementById("cl-body");
  const pres = document.getElementById("cl-pres");
  if (pres) pres.style.display = "none";
  if (!el) return;
  el.innerHTML = '<div class="ldg"><div class="spin"></div></div>';

  const { data } = await sb.from("treatments").select("*,patients(first_name,last_name)").order("date_performed", { ascending: false }).limit(25);
  if (!data?.length) { el.innerHTML = `<div class="empty">${isAr() ? "لا توجد سجلات علاجية أسنان سابقة" : "No dental clinical records found"}</div>`; return; }

  el.innerHTML = `<div class="slbl" style="padding:0 2px 8px">${isAr() ? "أحدث العلاجات والإجراءات السريرية" : "Recent Clinical Treatments"}</div><div class="card">` + data.map(t => {
    const pname = t.patients ? t.patients.first_name + ' ' + t.patients.last_name : (isAr() ? 'مريض غير محدد' : 'Unknown Patient');
    return `<div class="row-sep" style="padding:14px 18px;cursor:pointer" onclick="window.loadCLPat(${t.patient_id},'${esc(pname)}')">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--navy)">${esc(pname)}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">🦷 ${esc(t.procedure_name)} · 📅 ${t.date_performed || ''}${t.tooth_number ? ` · ${isAr() ? 'سن #' : 'Tooth #'}` + t.tooth_number : ''}</div>
        </div>
        <div style="font-size:14px;font-weight:800;color:var(--teal);font-family:var(--font-mono)">${fmt(t.cost || 0)}</div>
      </div>
    </div>`;
  }).join('') + '</div>';
}

export function srchCL(q) {
  clearTimeout(_clTmr);
  const el = document.getElementById("cl-pres");
  if (!q.trim()) {
    if (el) el.style.display = "none";
    loadRecentClinical();
    return;
  }
  _clTmr = setTimeout(async () => {
    const { data } = await sb.from("patients").select("id,first_name,last_name,patient_number,phone")
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%,patient_number.ilike.%${q}%`)
      .order("last_name").limit(8);
    if (!data?.length) { if (el) el.style.display = "none"; return; }
    if (el) {
      el.style.display = "block";
      el.innerHTML = data.map(p => {
        const ini = ((p.first_name || " ")[0] + (p.last_name || " ")[0]).toUpperCase();
        return `<div onclick="window.loadCLPat(${p.id},'${esc(p.first_name)} ${esc(p.last_name)}')" style="padding:12px 16px;border-bottom:1px solid var(--border);cursor:pointer;display:flex;align-items:center;gap:12px">
          <div style="width:34px;height:34px;border-radius:50%;background:var(--teal-dim);border:1px solid var(--teal-low);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--teal-dark);flex-shrink:0">${ini}</div>
          <div>
            <div style="font-size:14px;font-weight:600;color:var(--navy)">${esc(p.first_name)} ${esc(p.last_name)}</div>
            <div style="font-size:12px;color:var(--text-muted)">${esc(p.patient_number || '')} · 📞 ${esc(p.phone || '—')}</div>
          </div>
        </div>`;
      }).join("");
    }
  }, 280);
}

export async function loadCLPat(pid, name) {
  _clPatId = pid;
  const pres = document.getElementById("cl-pres");
  if (pres) pres.style.display = "none";
  const clQ = document.getElementById("cl-q");
  if (clQ) clQ.value = name;
  const el = document.getElementById("cl-body");
  if (!el) return;
  el.innerHTML = '<div class="ldg"><div class="spin"></div></div>';

  const [{ data: txs }, { data: pat }] = await Promise.all([
    sb.from("treatments").select("*").eq("patient_id", pid).order("date_performed", { ascending: false }),
    sb.from("patients").select("*").eq("id", pid).single()
  ]);

  const treatedTeeth = new Set((txs || []).map(t => parseInt(t.tooth_number, 10)).filter(Boolean));

  // FDI Standard ISO-3950 Tooth Definitions
  const TOOTH_NAMES = {
    18: { code: 'M3', en: '18 · Wisdom Molar', ar: '18 · ضرس العقل' },
    17: { code: 'M2', en: '17 · 2nd Molar', ar: '17 · ضرس ثان' },
    16: { code: 'M1', en: '16 · 1st Molar', ar: '16 · ضرس أول' },
    15: { code: 'P2', en: '15 · 2nd Premolar', ar: '15 · ضاحك ثان' },
    14: { code: 'P1', en: '14 · 1st Premolar', ar: '14 · ضاحك أول' },
    13: { code: 'C',  en: '13 · Canine', ar: '13 · ناب' },
    12: { code: 'I2', en: '12 · Lateral Incisor', ar: '12 · قاطع جانبي' },
    11: { code: 'I1', en: '11 · Central Incisor', ar: '11 · قاطع مركزي' },

    21: { code: 'I1', en: '21 · Central Incisor', ar: '21 · قاطع مركزي' },
    22: { code: 'I2', en: '22 · Lateral Incisor', ar: '22 · قاطع جانبي' },
    23: { code: 'C',  en: '23 · Canine', ar: '23 · ناب' },
    24: { code: 'P1', en: '24 · 1st Premolar', ar: '24 · ضاحك أول' },
    25: { code: 'P2', en: '25 · 2nd Premolar', ar: '25 · ضاحك ثان' },
    26: { code: 'M1', en: '26 · 1st Molar', ar: '26 · ضرس أول' },
    27: { code: 'M2', en: '27 · 2nd Molar', ar: '27 · ضرس ثان' },
    28: { code: 'M3', en: '28 · Wisdom Molar', ar: '28 · ضرس العقل' },

    48: { code: 'M3', en: '48 · Wisdom Molar', ar: '48 · ضرس العقل' },
    47: { code: 'M2', en: '47 · 2nd Molar', ar: '47 · ضرس ثان' },
    46: { code: 'M1', en: '46 · 1st Molar', ar: '46 · ضرس أول' },
    45: { code: 'P2', en: '45 · 2nd Premolar', ar: '45 · ضاحك ثان' },
    44: { code: 'P1', en: '44 · 1st Premolar', ar: '44 · ضاحك أول' },
    43: { code: 'C',  en: '43 · Canine', ar: '43 · ناب' },
    42: { code: 'I2', en: '42 · Lateral Incisor', ar: '42 · قاطع جانبي' },
    41: { code: 'I1', en: '41 · Central Incisor', ar: '41 · قاطع مركزي' },

    31: { code: 'I1', en: '31 · Central Incisor', ar: '31 · قاطع مركزي' },
    32: { code: 'I2', en: '32 · Lateral Incisor', ar: '32 · قاطع جانبي' },
    33: { code: 'C',  en: '33 · Canine', ar: '33 · ناب' },
    34: { code: 'P1', en: '34 · 1st Premolar', ar: '34 · ضاحك أول' },
    35: { code: 'P2', en: '35 · 2nd Premolar', ar: '35 · ضاحك ثان' },
    36: { code: 'M1', en: '36 · 1st Molar', ar: '36 · ضرس أول' },
    37: { code: 'M2', en: '37 · 2nd Molar', ar: '37 · ضرس ثان' },
    38: { code: 'M3', en: '38 · Wisdom Molar', ar: '38 · ضرس العقل' },

    // Pediatric / Primary teeth
    55: { code: 'm2', en: '55 · 2nd Primary Molar', ar: '55 · ضرس لبني 2' },
    54: { code: 'm1', en: '54 · 1st Primary Molar', ar: '54 · ضرس لبني 1' },
    53: { code: 'c',  en: '53 · Primary Canine', ar: '53 · ناب لبني' },
    52: { code: 'i2', en: '52 · Primary Lateral Incisor', ar: '52 · قاطع جانبي لبني' },
    51: { code: 'i1', en: '51 · Primary Central Incisor', ar: '51 · قاطع مركزي لبني' },

    61: { code: 'i1', en: '61 · Primary Central Incisor', ar: '61 · قاطع مركزي لبني' },
    62: { code: 'i2', en: '62 · Primary Lateral Incisor', ar: '62 · قاطع جانبي لبني' },
    63: { code: 'c',  en: '63 · Primary Canine', ar: '63 · ناب لبني' },
    64: { code: 'm1', en: '64 · 1st Primary Molar', ar: '64 · ضرس لبني 1' },
    65: { code: 'm2', en: '65 · 2nd Primary Molar', ar: '65 · ضرس لبني 2' },

    85: { code: 'm2', en: '85 · 2nd Primary Molar', ar: '85 · ضرس لبني 2' },
    84: { code: 'm1', en: '84 · 1st Primary Molar', ar: '84 · ضرس لبني 1' },
    83: { code: 'c',  en: '83 · Primary Canine', ar: '83 · ناب لبني' },
    82: { code: 'i2', en: '82 · Primary Lateral Incisor', ar: '82 · قاطع جانبي لبني' },
    81: { code: 'i1', en: '81 · Primary Central Incisor', ar: '81 · قاطع مركزي لبني' },

    71: { code: 'i1', en: '71 · Primary Central Incisor', ar: '71 · قاطع مركزي لبني' },
    72: { code: 'i2', en: '72 · Primary Lateral Incisor', ar: '72 · قاطع جانبي لبني' },
    73: { code: 'c',  en: '73 · Primary Canine', ar: '73 · ناب لبني' },
    74: { code: 'm1', en: '74 · 1st Primary Molar', ar: '74 · ضرس لبني 1' },
    75: { code: 'm2', en: '75 · 2nd Primary Molar', ar: '75 · ضرس لبني 2' }
  };

  // Quadrants definition:
  const isPed = _clDentitionMode === 'pediatric';
  const upperRightTeeth = isPed ? [55, 54, 53, 52, 51] : [18, 17, 16, 15, 14, 13, 12, 11];
  const upperLeftTeeth  = isPed ? [61, 62, 63, 64, 65] : [21, 22, 23, 24, 25, 26, 27, 28];
  const lowerRightTeeth = isPed ? [85, 84, 83, 82, 81] : [48, 47, 46, 45, 44, 43, 42, 41];
  const lowerLeftTeeth  = isPed ? [71, 72, 73, 74, 75] : [31, 32, 33, 34, 35, 36, 37, 38];

  const renderTooth = (num) => {
    const isTreated = treatedTeeth.has(num);
    const isSelected = _selectedTeeth.has(num) || _selectedToothNum === num;
    const info = TOOTH_NAMES[num] || { code: '', en: `Tooth #${num}`, ar: `سن #${num}` };
    const titleText = (isAr() ? info.ar : info.en) + (_multiSelectMode ? (isAr() ? ' · انقر للإضافة/الإزالة' : ' · Click to toggle') : (isAr() ? ' · انقر للتحديد أو اضغط مطولاً للتحديد المتعدد' : ' · Click to select, hold for multi-select'));
    return `<div class="od-tooth-wrap"
      onpointerdown="window.handleToothPointerDown(event, ${num})"
      onpointerup="window.handleToothPointerUp(event, ${num})"
      onpointercancel="window.handleToothPointerCancel(event, ${num})"
      onclick="window.handleToothClick(event, ${num})"
      title="${titleText}">
      <div id="tooth-box-${num}" class="od-tooth-box ${isTreated ? 'is-treated' : ''} ${isSelected ? 'selected' : ''}" data-tooth="${num}">
        ${num}
        ${isSelected && _selectedTeeth.size > 1 ? '<span class="od-tooth-badge">✓</span>' : ''}
      </div>
      <span class="od-tooth-lbl">${info.code}</span>
    </div>`;
  };

  const txHtml = txs?.length ? txs.map(t => `
    <div class="row-sep" style="padding:14px 16px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div style="flex:1;min-width:0;cursor:pointer" onclick="window.openEditTx(${t.id},'${esc(t.procedure_name)}',${t.cost || 0},'${t.date_performed || today()}',${t.tooth_number || 0},'${esc(t.diagnosis || '')}')">
          <div style="font-size:14px;font-weight:600;color:var(--navy)">${esc(t.procedure_name)}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">📅 ${t.date_performed || ""}${t.tooth_number ? ` · 🦷 ${isAr() ? 'سن #' : 'Tooth #'}` + t.tooth_number : ""}${t.dentist_name ? " · 👨‍⚕️ " + esc(t.dentist_name) : ""}</div>
          ${t.diagnosis ? `<div style="font-size:12px;color:var(--text-dim);margin-top:4px;background:var(--bg);padding:4px 8px;border-radius:var(--r-xs)">${esc(t.diagnosis)}</div>` : ""}
        </div>
        <div style="display:flex;align-items:center;gap:10px;padding-inline-start:12px;flex-shrink:0">
          <div style="font-size:14px;font-weight:800;color:var(--teal);font-family:var(--font-mono)">${fmt(t.cost || 0)}</div>
          <button class="small-btn" onclick="window.openEditTx(${t.id},'${esc(t.procedure_name)}',${t.cost || 0},'${t.date_performed || today()}',${t.tooth_number || 0},'${esc(t.diagnosis || '')}')">${isAr() ? "تعديل" : "Edit"}</button>
        </div>
      </div>
    </div>`).join("") : `<div class="empty">${isAr() ? "لم يتم تسجيل أي إجراءات علاجية لهذا المريض" : "No dental procedures recorded for this patient"}</div>`;

  el.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px;margin-bottom:16px;box-shadow:var(--shadow-sm)">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:16px;font-weight:700;color:var(--navy)">${esc(pat?.first_name || "")} ${esc(pat?.last_name || "")}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${isAr() ? "رقم المريض:" : "ID:"} ${esc(pat?.patient_number || "P-" + pid)} · 📞 <span dir="ltr">${esc(pat?.phone || (isAr() ? "لا يوجد هاتف" : "No phone"))}</span></div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="small-btn primary" onclick="window.openAddTx()">${isAr() ? "+ إضافة إجراء علاجي" : "+ Add Treatment"}</button>
        </div>
      </div>
      ${pat?.allergies ? `<div style="font-size:12px;color:var(--error);margin-top:8px;font-weight:600;background:var(--error-bg);padding:6px 10px;border-radius:var(--r-sm);border:1px solid var(--error-border)">⚠ ${isAr() ? "تنبيه حساسيات طبية:" : "Medical Alert:"} ${esc(pat.allergies)}</div>` : ""}
    </div>

    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px;margin-bottom:18px;box-shadow:var(--shadow-sm)">
      <div class="od-toolbar">
        <div>
          <div class="slbl" style="margin:0">${isAr() ? "مخطط الأسنان التفاعلي (نظام FDI العالمي)" : "Interactive Dental Odontogram (FDI System)"}</div>
          <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px">
            ${isAr() ? "انقر على الأسنان أو اضغط مطولاً للتحديد المتعدد وإجراء عمليات مجمعة" : "Click teeth or hold to multi-select for bulk operations"}
          </div>
        </div>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <button id="od-multi-toggle-btn" class="od-toggle-btn ${_multiSelectMode ? 'active' : ''}" onclick="window.toggleMultiSelectMode()">
            <span class="od-toggle-dot"></span>
            <span>${isAr() ? "التحديد المتعدد" : "Multi-Select"}</span>
          </button>
          <div style="display:flex;gap:4px">
            <button class="small-btn ${!isPed ? 'primary' : ''}" onclick="window.setDentitionMode('adult')" style="font-size:11px">${isAr() ? "دائمة (32)" : "Adult (32)"}</button>
            <button class="small-btn ${isPed ? 'primary' : ''}" onclick="window.setDentitionMode('pediatric')" style="font-size:11px">${isAr() ? "لبنية (20)" : "Pediatric (20)"}</button>
          </div>
        </div>
      </div>

      <!-- Multi-Select Action Banner -->
      <div id="od-multibar" class="od-multibar" style="display:${_selectedTeeth.size > 0 ? 'block' : 'none'}">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <div>
            <div style="font-size:13px;font-weight:700;color:var(--navy)">
              🦷 ${isAr() ? `الأسنان المحددة (${_selectedTeeth.size}):` : `Selected Teeth (${_selectedTeeth.size}):`}
            </div>
            <div id="od-multi-chips-wrap" class="od-multi-chips">
              ${Array.from(_selectedTeeth).sort((a, b) => a - b).map(num => `
                <span class="od-chip">
                  #${num}
                  <span class="od-chip-del" onclick="window.removeToothFromSelection(${num})" title="${isAr() ? 'إزالة السن' : 'Remove tooth'}">×</span>
                </span>
              `).join('')}
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <button class="small-btn primary" onclick="window.openBulkMarkTreated()" style="padding:6px 12px;font-weight:700">
              ✓ ${isAr() ? "تحديد كمعالج مجمع" : "Mark as Treated"}
            </button>
            <button class="small-btn" onclick="window.openBulkAddTx()" style="padding:6px 12px;font-weight:700">
              + ${isAr() ? "تسجيل علاج مجمع" : "Add Treatment Record"}
            </button>
            <button class="small-btn danger" onclick="window.clearToothSelection()" style="padding:6px 10px;font-weight:700">
              ${isAr() ? "إلغاء التحديد" : "Clear"}
            </button>
          </div>
        </div>

        <!-- Quick Quadrant / Arch Selectors -->
        <div class="od-quick-sel-row">
          <span style="font-size:10.5px;font-weight:700;color:var(--text-muted);margin-inline-end:4px">${isAr() ? "تحديد سريع:" : "Quick Select:"}</span>
          <span class="od-quick-tag" onclick="window.selectArchOrQuadrant('all')">${isAr() ? "كامل الفم" : "All Teeth"}</span>
          <span class="od-quick-tag" onclick="window.selectArchOrQuadrant('upper')">${isAr() ? "الفك العلوي" : "Upper Arch"}</span>
          <span class="od-quick-tag" onclick="window.selectArchOrQuadrant('lower')">${isAr() ? "الفك السفلي" : "Lower Arch"}</span>
          <span class="od-quick-tag" onclick="window.selectArchOrQuadrant('q1')">${isAr() ? "الربع 1 (علوي أيمن)" : "Q1 (UR)"}</span>
          <span class="od-quick-tag" onclick="window.selectArchOrQuadrant('q2')">${isAr() ? "الربع 2 (علوي أيسر)" : "Q2 (UL)"}</span>
          <span class="od-quick-tag" onclick="window.selectArchOrQuadrant('q3')">${isAr() ? "الربع 3 (سفلي أيسر)" : "Q3 (LL)"}</span>
          <span class="od-quick-tag" onclick="window.selectArchOrQuadrant('q4')">${isAr() ? "الربع 4 (سفلي أيمن)" : "Q4 (LR)"}</span>
        </div>
      </div>

      <div class="od-viewport">
        <div class="od-chart-inner" dir="ltr">
          <!-- Anatomical Orientation Header -->
          <div class="od-orientation-bar">
            <span class="od-orient-tag">◀ ${isAr() ? "يمين المريض (Right)" : "Patient Right (R)"}</span>
            <span style="font-size:10px;color:var(--text-muted);font-weight:700">FDI ISO 3950</span>
            <span class="od-orient-tag">${isAr() ? "يسار المريض (Left)" : "Patient Left (L)"} ▶</span>
          </div>

          <!-- Upper Arch (Maxillary) -->
          <div style="font-size:11px;font-weight:700;color:var(--navy);margin-bottom:6px;text-align:center">
            ${isAr() ? "الفك العلوي (Maxillary Arch)" : "Upper Arch (Maxillary)"}
          </div>
          <div class="od-arch-row">
            <div class="od-quadrant" title="${isAr() ? 'الربع الأول: علوي أيمن' : 'Quadrant 1: Upper Right'}">
              ${upperRightTeeth.map(renderTooth).join("")}
            </div>
            <div class="od-midline">
              <div class="od-midline-bar"></div>
              <div class="od-midline-lbl">MID</div>
            </div>
            <div class="od-quadrant" title="${isAr() ? 'الربع الثاني: علوي أيسر' : 'Quadrant 2: Upper Left'}">
              ${upperLeftTeeth.map(renderTooth).join("")}
            </div>
          </div>

          <!-- Occlusal Plane Divider -->
          <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin:10px 0 8px">
            <div style="flex:1;height:1px;background:var(--border)"></div>
            <div style="font-size:9.5px;font-weight:800;color:var(--text-muted);letter-spacing:1px;background:var(--surface);padding:2px 8px;border-radius:10px;border:1px solid var(--border)">OCCLUSAL PLANE</div>
            <div style="flex:1;height:1px;background:var(--border)"></div>
          </div>

          <!-- Lower Arch (Mandibular) -->
          <div style="font-size:11px;font-weight:700;color:var(--navy);margin-bottom:6px;text-align:center">
            ${isAr() ? "الفك السفلي (Mandibular Arch)" : "Lower Arch (Mandibular)"}
          </div>
          <div class="od-arch-row">
            <div class="od-quadrant" title="${isAr() ? 'الربع الرابع: سفلي أيمن' : 'Quadrant 4: Lower Right'}">
              ${lowerRightTeeth.map(renderTooth).join("")}
            </div>
            <div class="od-midline">
              <div class="od-midline-bar"></div>
              <div class="od-midline-lbl">MID</div>
            </div>
            <div class="od-quadrant" title="${isAr() ? 'الربع الثالث: سفلي أيسر' : 'Quadrant 3: Lower Left'}">
              ${lowerLeftTeeth.map(renderTooth).join("")}
            </div>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div style="display:flex;justify-content:center;gap:16px;margin-top:12px;flex-wrap:wrap;font-size:11px;color:var(--text-muted)">
        <div style="display:flex;align-items:center;gap:6px">
          <span style="width:12px;height:12px;border-radius:3px;border:1px solid #CBD5E1;background:var(--surface);display:inline-block"></span>
          <span>${isAr() ? "سليم / غير مسجل" : "Healthy / Untreated"}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <span style="width:12px;height:12px;border-radius:3px;background:var(--teal);display:inline-block"></span>
          <span>${isAr() ? "تم علاجه مسجل" : "Treated Record"}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <span style="width:12px;height:12px;border-radius:3px;border:2px solid var(--teal);background:var(--teal-dim);display:inline-block"></span>
          <span>${isAr() ? "محدد حاليًا" : "Selected Tooth"}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <span class="od-tooth-badge" style="position:static;display:inline-flex;width:12px;height:12px;font-size:8px">✓</span>
          <span>${isAr() ? "ضمن التحديد المتعدد" : "Multi-selected"}</span>
        </div>
      </div>
    </div>

    <div class="sec-hdr">
      <div class="slbl" style="margin:0">${isAr() ? "سجل الإجراءات السريرية" : "Clinical History"}</div>
    </div>
    <div class="card" style="margin-bottom:16px">${txHtml}</div>

    <!-- Add Treatment Form -->
    <div id="cl-add-form" style="display:none;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:18px;box-shadow:var(--shadow-md)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div class="slbl" id="cl-form-title" style="margin:0">${isAr() ? "تسجيل إجراء علاجي جديد" : "Record New Dental Treatment"}</div>
        <div id="cl-form-multi-badge" style="display:none;font-size:11px;font-weight:700;color:var(--teal-dark);background:var(--teal-dim);padding:3px 8px;border-radius:12px;border:1px solid var(--teal)">
          ${isAr() ? "إجراء مجمع لعدة أسنان" : "Bulk Multi-Tooth Treatment"}
        </div>
      </div>

      <div class="ff"><label>${isAr() ? "الخدمة / الإجراء العلاجي" : "Procedure / Treatment"}</label>
        <select id="cl-proc" onchange="window.clProcSel(this)" style="width:100%;margin-bottom:6px">
          <option value="">${isAr() ? "— اختر من قائمة الخدمات —" : "— Select from catalog —"}</option>
          ${_procs.map(p => `<option value="${p.id}" data-name="${esc(p.name)}" data-cost="${p.default_cost}">${esc(p.name)} (${fmt(p.default_cost)})</option>`).join("")}
          <option value="custom">${isAr() ? "إجراء مخصص…" : "Custom Procedure…"}</option>
        </select>
        <input id="cl-proc-name" type="text" placeholder="${isAr() ? 'أو أدخل اسم الإجراء يدويًا…' : 'Or enter custom procedure name…'}" style="display:none">
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        <div class="ff" style="margin:0">
          <label id="cl-tooth-lbl">${isAr() ? "رقم السن (FDI)" : "Tooth # (FDI)"}</label>
          <select id="cl-tooth" onchange="window.onCLToothChange(this.value)">${toothOpts()}</select>
          <div id="cl-multi-tooth-chips" style="display:none;flex-wrap:wrap;gap:4px;margin-top:6px"></div>
        </div>
        <div class="ff" style="margin:0">
          <label id="cl-cost-lbl">${isAr() ? "التكلفة الإجمالية (جنيه)" : "Total Cost (EGP)"}</label>
          <input id="cl-cost" type="number" inputmode="decimal" step="0.01" min="0" value="0">
        </div>
      </div>
      <div class="ff"><label>${isAr() ? "التشخيص والملاحظات السريرية" : "Clinical Diagnosis & Notes"}</label><textarea id="cl-notes" placeholder="${isAr() ? 'الملاحظات السريرية والمواد المستخدمة…' : 'Observations, materials used, patient feedback…'}"></textarea></div>
      <button class="btn-primary" style="border-radius:var(--r-md);padding:13px" onclick="window.submitTx()">${isAr() ? "حفظ العلاج وإنشاء فاتورة" : "Save Treatment & Create Invoice"}</button>
    </div>

    <!-- Bulk Mark As Treated Modal Sheet (rendered inline) -->
    <div id="cl-bulk-modal" style="display:none;position:fixed;inset:0;background:rgba(11,37,69,0.5);backdrop-filter:blur(3px);z-index:9999;align-items:center;justify-content:center;padding:16px">
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);max-width:500px;width:100%;padding:22px;box-shadow:var(--shadow-lg);animation:od-slide-in 0.2s ease-out">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <div style="font-size:16px;font-weight:800;color:var(--navy)">
            ✓ ${isAr() ? "تحديد الأسنان المحددة كمعالجة" : "Mark Selected Teeth as Treated"}
          </div>
          <button class="small-btn" onclick="window.closeBulkMarkTreated()" style="font-size:14px;padding:2px 8px">✕</button>
        </div>
        <div style="font-size:12.5px;color:var(--text-muted);margin-bottom:12px">
          ${isAr() ? "سيتم تسجيل وتوثيق الإجراء الطبي لكل سن من الأسنان المحددة دفعة واحدة:" : "A clinical treatment entry will be recorded for each selected tooth:"}
        </div>
        <div id="cl-bulk-teeth-summary" style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:14px;background:var(--bg);padding:8px 10px;border-radius:var(--r-sm);border:1px solid var(--border)">
        </div>
        <div class="ff"><label>${isAr() ? "الإجراء العلاجي المنجز" : "Completed Procedure"}</label>
          <select id="cl-bulk-proc" onchange="window.onBulkProcChange(this)" style="width:100%;margin-bottom:6px">
            <option value="Scaling & Polishing">${isAr() ? "تنظيف وتلميع أسنان (Scaling & Polishing)" : "Scaling & Polishing"}</option>
            <option value="Fluoride Application">${isAr() ? "جلسة فلورايد وقائية (Fluoride Application)" : "Fluoride Application"}</option>
            <option value="Composite Filling">${isAr() ? "حشو تجميلي كومبوزيت (Composite Filling)" : "Composite Filling"}</option>
            <option value="Dental Extraction">${isAr() ? "خلع سن (Extraction)" : "Extraction"}</option>
            <option value="Comprehensive Examination">${isAr() ? "فحص سريري شامل (Comprehensive Examination)" : "Comprehensive Examination"}</option>
            <option value="custom">${isAr() ? "إجراء مخصص…" : "Custom Procedure…"}</option>
          </select>
          <input id="cl-bulk-custom-proc" type="text" placeholder="${isAr() ? 'أدخل اسم الإجراء…' : 'Enter procedure name…'}" style="display:none">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
          <div class="ff" style="margin:0">
            <label>${isAr() ? "تاريخ الإجراء" : "Date Performed"}</label>
            <input id="cl-bulk-date" type="date" value="${today()}">
          </div>
          <div class="ff" style="margin:0">
            <label>${isAr() ? "التكلفة الإجمالية (جنيه)" : "Total Cost (EGP)"}</label>
            <input id="cl-bulk-cost" type="number" inputmode="decimal" min="0" step="0.01" value="0">
          </div>
        </div>
        <div class="ff">
          <label>${isAr() ? "الملاحظات السريرية (اختياري)" : "Clinical Notes (Optional)"}</label>
          <textarea id="cl-bulk-notes" placeholder="${isAr() ? 'ملاحظات المواد أو العلاج المنجز…' : 'Clinical observations, materials used…'}" style="height:60px"></textarea>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
          <button class="small-btn" onclick="window.closeBulkMarkTreated()">${isAr() ? "إلغاء" : "Cancel"}</button>
          <button class="small-btn primary" onclick="window.submitBulkMarkTreated()">${isAr() ? "✓ تأكيد وحفظ الإجراءات" : "✓ Confirm & Save Records"}</button>
        </div>
      </div>
    </div>`;
}

export function setDentitionMode(mode) {
  _clDentitionMode = mode;
  if (_clPatId) {
    const clQ = document.getElementById("cl-q");
    loadCLPat(_clPatId, clQ ? clQ.value : "");
  }
}

// Multi-Selection State & Toggle Handlers
export function toggleMultiSelectMode() {
  _multiSelectMode = !_multiSelectMode;
  const btn = document.getElementById("od-multi-toggle-btn");
  if (btn) {
    if (_multiSelectMode) {
      btn.classList.add("active");
      toast(isAr() ? "تم تفعيل وضع التحديد المتعدد 🦷" : "Multi-Select Mode Activated 🦷");
    } else {
      btn.classList.remove("active");
      toast(isAr() ? "تم إيقاف التحديد المتعدد" : "Multi-Select Mode Deactivated");
    }
  }
  updateOdontogramSelectionUI();
}

export function handleToothPointerDown(e, num) {
  _longPressTriggered = false;
  clearTimeout(_longPressTimer);
  _longPressTimer = setTimeout(() => {
    _longPressTriggered = true;
    if (!_multiSelectMode) {
      _multiSelectMode = true;
      const btn = document.getElementById("od-multi-toggle-btn");
      if (btn) btn.classList.add("active");
    }
    toggleToothInSelection(num);
    if (navigator.vibrate) {
      try { navigator.vibrate(50); } catch (_) {}
    }
    toast(isAr() ? `تم تحديد السن #${num} عبر الضغط المطول` : `Tooth #${num} selected via long press`);
  }, 450);
}

export function handleToothPointerUp(e, num) {
  clearTimeout(_longPressTimer);
}

export function handleToothPointerCancel(e, num) {
  clearTimeout(_longPressTimer);
}

export function handleToothClick(e, num) {
  if (_longPressTriggered) {
    _longPressTriggered = false;
    return;
  }
  const isMulti = _multiSelectMode || e.shiftKey || e.ctrlKey || e.metaKey;
  if (isMulti) {
    toggleToothInSelection(num);
  } else {
    // Single selection mode
    _selectedTeeth.clear();
    _selectedTeeth.add(num);
    _selectedToothNum = num;
    updateOdontogramSelectionUI(num);

    // Open add treatment form
    openAddTx(true);
    const toothSelect = document.getElementById("cl-tooth");
    if (toothSelect) toothSelect.value = num;
    syncAddFormToSelection();
    toast(isAr() ? `تم تحديد السن رقم #${num} للعلاج 🦷` : `Tooth #${num} selected for treatment 🦷`);
  }
}

export function toggleToothInSelection(num) {
  if (_selectedTeeth.has(num)) {
    _selectedTeeth.delete(num);
  } else {
    _selectedTeeth.add(num);
  }
  _selectedToothNum = _selectedTeeth.size === 1 ? Array.from(_selectedTeeth)[0] : null;
  updateOdontogramSelectionUI(num);
  syncAddFormToSelection();
}

export function removeToothFromSelection(num) {
  _selectedTeeth.delete(num);
  _selectedToothNum = _selectedTeeth.size === 1 ? Array.from(_selectedTeeth)[0] : null;
  updateOdontogramSelectionUI();
  syncAddFormToSelection();
}

export function clearToothSelection() {
  _selectedTeeth.clear();
  _selectedToothNum = null;
  updateOdontogramSelectionUI();
  syncAddFormToSelection();
  toast(isAr() ? "تم مسح تحديد الأسنان" : "Tooth selection cleared");
}

export function selectArchOrQuadrant(type) {
  const isPed = _clDentitionMode === 'pediatric';
  const q1 = isPed ? [55, 54, 53, 52, 51] : [18, 17, 16, 15, 14, 13, 12, 11];
  const q2 = isPed ? [61, 62, 63, 64, 65] : [21, 22, 23, 24, 25, 26, 27, 28];
  const q3 = isPed ? [71, 72, 73, 74, 75] : [31, 32, 33, 34, 35, 36, 37, 38];
  const q4 = isPed ? [85, 84, 83, 82, 81] : [48, 47, 46, 45, 44, 43, 42, 41];

  let targetTeeth = [];
  if (type === 'all') targetTeeth = [...q1, ...q2, ...q3, ...q4];
  else if (type === 'upper') targetTeeth = [...q1, ...q2];
  else if (type === 'lower') targetTeeth = [...q3, ...q4];
  else if (type === 'q1') targetTeeth = q1;
  else if (type === 'q2') targetTeeth = q2;
  else if (type === 'q3') targetTeeth = q3;
  else if (type === 'q4') targetTeeth = q4;

  targetTeeth.forEach(n => _selectedTeeth.add(n));
  _selectedToothNum = _selectedTeeth.size === 1 ? Array.from(_selectedTeeth)[0] : null;
  updateOdontogramSelectionUI();
  syncAddFormToSelection();
  toast(isAr() ? `تم تحديد ${targetTeeth.length} سن بنجاح 🦷` : `Selected ${targetTeeth.length} teeth 🦷`);
}

function updateOdontogramSelectionUI(lastClickedNum = null) {
  // Update tooth box styles and badges
  document.querySelectorAll('.od-tooth-box').forEach(el => {
    const num = parseInt(el.getAttribute('data-tooth'), 10);
    const isSel = _selectedTeeth.has(num) || _selectedToothNum === num;
    
    // Remove existing badge
    const badge = el.querySelector('.od-tooth-badge');
    if (badge) badge.remove();

    if (isSel) {
      el.classList.add('selected');
      if (_selectedTeeth.size > 1) {
        const b = document.createElement('span');
        b.className = 'od-tooth-badge';
        b.textContent = '✓';
        el.appendChild(b);
      }
    } else {
      el.classList.remove('selected', 'anim-pop');
    }
  });

  if (lastClickedNum) {
    const lastEl = document.getElementById(`tooth-box-${lastClickedNum}`);
    if (lastEl && _selectedTeeth.has(lastClickedNum)) {
      lastEl.classList.add('anim-pop');
      setTimeout(() => lastEl.classList.remove('anim-pop'), 400);
    }
  }

  // Update Action Banner
  const multibar = document.getElementById("od-multibar");
  const chipsWrap = document.getElementById("od-multi-chips-wrap");
  if (multibar) {
    if (_selectedTeeth.size > 0) {
      multibar.style.display = "block";
      if (chipsWrap) {
        chipsWrap.innerHTML = Array.from(_selectedTeeth).sort((a, b) => a - b).map(num => `
          <span class="od-chip">
            #${num}
            <span class="od-chip-del" onclick="window.removeToothFromSelection(${num})" title="${isAr() ? 'إزالة' : 'Remove'}">×</span>
          </span>
        `).join('');
      }
    } else {
      multibar.style.display = "none";
    }
  }
}

function syncAddFormToSelection() {
  const toothSelect = document.getElementById("cl-tooth");
  const chipsContainer = document.getElementById("cl-multi-tooth-chips");
  const badge = document.getElementById("cl-form-multi-badge");
  const toothLbl = document.getElementById("cl-tooth-lbl");
  const costLbl = document.getElementById("cl-cost-lbl");

  if (_selectedTeeth.size > 1) {
    if (badge) badge.style.display = "inline-block";
    if (toothSelect) toothSelect.style.display = "none";
    if (chipsContainer) {
      chipsContainer.style.display = "flex";
      chipsContainer.innerHTML = Array.from(_selectedTeeth).sort((a, b) => a - b).map(n => `
        <span class="od-chip">#${n}</span>
      `).join('');
    }
    if (toothLbl) toothLbl.textContent = isAr() ? `الأسنان المحددة (${_selectedTeeth.size})` : `Selected Teeth (${_selectedTeeth.size})`;
    if (costLbl) costLbl.textContent = isAr() ? "التكلفة الإجمالية لكافة الأسنان (جنيه)" : "Total Cost for all teeth (EGP)";
  } else {
    if (badge) badge.style.display = "none";
    if (toothSelect) {
      toothSelect.style.display = "block";
      if (_selectedToothNum) toothSelect.value = _selectedToothNum;
    }
    if (chipsContainer) chipsContainer.style.display = "none";
    if (toothLbl) toothLbl.textContent = isAr() ? "رقم السن (FDI)" : "Tooth # (FDI)";
    if (costLbl) costLbl.textContent = isAr() ? "التكلفة (جنيه)" : "Cost (EGP)";
  }
}

export function selectToothFromChart(num) {
  handleToothClick({}, num);
}

export function onCLToothChange(val) {
  const num = parseInt(val, 10);
  _selectedTeeth.clear();
  if (num) {
    _selectedTeeth.add(num);
    _selectedToothNum = num;
  } else {
    _selectedToothNum = null;
  }
  updateOdontogramSelectionUI(num);
}

export function openAddTx(forceOpen = false) {
  const f = document.getElementById("cl-add-form");
  if (f) {
    if (forceOpen) {
      f.style.display = "block";
    } else {
      f.style.display = f.style.display === "none" ? "block" : "none";
    }
    if (f.style.display === "block") {
      syncAddFormToSelection();
    }
  }
}

export function openBulkAddTx() {
  openAddTx(true);
  syncAddFormToSelection();
  const f = document.getElementById("cl-add-form");
  if (f) f.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Bulk Mark as Treated Modal Handlers
export function openBulkMarkTreated() {
  if (_selectedTeeth.size === 0) {
    toast(isAr() ? "يرجى تحديد سن أو أكثر أولاً ✗" : "Please select one or more teeth first ✗");
    return;
  }
  const modal = document.getElementById("cl-bulk-modal");
  const sumWrap = document.getElementById("cl-bulk-teeth-summary");
  if (sumWrap) {
    sumWrap.innerHTML = Array.from(_selectedTeeth).sort((a, b) => a - b).map(num => `
      <span class="od-chip" style="background:var(--surface)">#${num}</span>
    `).join('');
  }
  if (modal) modal.style.display = "flex";
}

export function closeBulkMarkTreated() {
  const modal = document.getElementById("cl-bulk-modal");
  if (modal) modal.style.display = "none";
}

export function onBulkProcChange(sel) {
  const customInput = document.getElementById("cl-bulk-custom-proc");
  if (sel.value === "custom") {
    if (customInput) { customInput.style.display = "block"; customInput.value = ""; }
  } else {
    if (customInput) customInput.style.display = "none";
  }
}

export async function submitBulkMarkTreated() {
  if (!_clPatId) { toast(isAr() ? "لم يتم تحديد مريض ✗" : "No patient selected ✗"); return; }
  if (_selectedTeeth.size === 0) { toast(isAr() ? "لا توجد أسنان محددة ✗" : "No teeth selected ✗"); return; }

  const sel = document.getElementById("cl-bulk-proc");
  let procName = sel ? sel.value : "";
  if (procName === "custom") {
    procName = document.getElementById("cl-bulk-custom-proc").value.trim();
  }
  if (!procName) { toast(isAr() ? "يرجى تحديد أو إدخال الإجراء العلاجي ✗" : "Select or enter a procedure ✗"); return; }

  const totalCost = parseFloat(document.getElementById("cl-bulk-cost").value) || 0;
  const perfDate = document.getElementById("cl-bulk-date").value || today();
  const notes = document.getElementById("cl-bulk-notes").value || "";
  const teethList = Array.from(_selectedTeeth).sort((a, b) => a - b);
  const costPerTooth = teethList.length > 0 ? (totalCost / teethList.length) : 0;
  const dentistName = USER?.full_name || (isAr() ? "د. عبدالله زين" : "Dr. Abdullah Zain");

  toast(isAr() ? `جاري حفظ العلاج لـ ${teethList.length} سن…` : `Saving records for ${teethList.length} teeth…`);

  // Insert batch treatments
  const treatmentInserts = teethList.map(tNum => ({
    patient_id: _clPatId,
    procedure_name: procName,
    tooth_number: tNum,
    cost: costPerTooth,
    diagnosis: notes ? `${notes} (Bulk #${tNum})` : `Bulk procedure on Tooth #${tNum}`,
    date_performed: perfDate,
    dentist_name: dentistName
  }));

  const { data: insertedTxs, error: txError } = await sb.from("treatments").insert(treatmentInserts).select();

  if (txError) {
    toast(isAr() ? "فشل تسجيل العلاجات المجمعة ✗" : "Failed to record bulk treatments ✗");
    return;
  }

  // Create invoice if cost > 0
  if (totalCost > 0) {
    const { data: pat } = await sb.from("patients").select("first_name,last_name").eq("id", _clPatId).single();
    const pname = pat ? `${pat.first_name} ${pat.last_name}` : "";

    const { data: inv } = await sb.from("invoices").insert({
      patient_id: _clPatId,
      patient_name: pname,
      total_amount: totalCost,
      issue_date: perfDate,
      notes: notes + (isAr() ? ` · علاج مجمع للأسنان (${teethList.join(', ')})` : ` · Bulk treatment on teeth (${teethList.join(', ')})`),
      created_by: dentistName
    }).select().single();

    if (inv) {
      const invItems = teethList.map(tNum => ({
        invoice_id: inv.id,
        description: `${procName} (${isAr() ? 'سن #' : 'Tooth #'}${tNum})`,
        quantity: 1,
        unit_price: costPerTooth,
        total_price: costPerTooth
      }));
      await sb.from("invoice_items").insert(invItems);
      loadInvoices();
    }
  }

  closeBulkMarkTreated();
  toast(isAr() ? `✓ تم تسجيل العلاج بنجاح لـ ${teethList.length} أسنان!` : `✓ Successfully treated ${teethList.length} teeth!`);
  _selectedTeeth.clear();
  _selectedToothNum = null;
  loadCLPat(_clPatId, document.getElementById("cl-q") ? document.getElementById("cl-q").value : "");
}

export function clProcSel(sel) {
  const opt = sel.options[sel.selectedIndex];
  const customInput = document.getElementById("cl-proc-name");
  if (opt.value === "custom") {
    if (customInput) { customInput.style.display = "block"; customInput.value = ""; }
  } else if (opt.value) {
    if (customInput) customInput.style.display = "none";
    const defaultCost = parseFloat(opt.dataset.cost) || 0;
    const multiplier = _selectedTeeth.size > 1 ? _selectedTeeth.size : 1;
    document.getElementById("cl-cost").value = defaultCost * multiplier;
  }
}

export async function submitTx() {
  if (!_clPatId) { toast(isAr() ? "لم يتم تحديد مريض ✗" : "No patient selected ✗"); return; }
  const sel = document.getElementById("cl-proc");
  const opt = sel ? sel.options[sel.selectedIndex] : null;
  const name = (opt && opt.value && opt.value !== "custom") ? (opt.dataset.name || opt.text) : document.getElementById("cl-proc-name").value.trim();
  if (!name) { toast(isAr() ? "يرجى تحديد أو إدخال الإجراء العلاجي ✗" : "Select or enter a procedure ✗"); return; }
  const cost = parseFloat(document.getElementById("cl-cost").value) || 0;
  const clNotes = document.getElementById("cl-notes").value;
  const dentistName = USER?.full_name || (isAr() ? "د. عبدالله زين" : "Dr. Abdullah Zain");

  // Multi-tooth handling
  if (_selectedTeeth.size > 1) {
    const teethList = Array.from(_selectedTeeth).sort((a, b) => a - b);
    const costPerTooth = cost / teethList.length;

    const inserts = teethList.map(tNum => ({
      patient_id: _clPatId,
      procedure_name: name,
      tooth_number: tNum,
      cost: costPerTooth,
      diagnosis: clNotes,
      date_performed: today(),
      dentist_name: dentistName
    }));

    const { error } = await sb.from("treatments").insert(inserts);
    if (!error) {
      toast(isAr() ? `تم حفظ العلاج لـ ${teethList.length} سن — جاري إنشاء الفاتورة…` : `Treatment saved for ${teethList.length} teeth — generating invoice…`);
      const { data: pat } = await sb.from("patients").select("first_name,last_name").eq("id", _clPatId).single();
      const pname = pat ? `${pat.first_name} ${pat.last_name}` : "";

      if (cost > 0) {
        const { data: inv } = await sb.from("invoices").insert({
          patient_id: _clPatId,
          patient_name: pname,
          total_amount: cost,
          issue_date: today(),
          notes: clNotes + ` (${isAr() ? 'أسنان: ' : 'Teeth: '}${teethList.join(', ')})`,
          created_by: dentistName
        }).select().single();

        if (inv) {
          const invItems = teethList.map(tNum => ({
            invoice_id: inv.id,
            description: `${name} (${isAr() ? 'سن #' : 'Tooth #'}${tNum})`,
            quantity: 1,
            unit_price: costPerTooth,
            total_price: costPerTooth
          }));
          await sb.from("invoice_items").insert(invItems);
          loadInvoices();
          openInv(inv.id);
        }
      }
      _selectedTeeth.clear();
      _selectedToothNum = null;
      loadCLPat(_clPatId, document.getElementById("cl-q") ? document.getElementById("cl-q").value : "");
    } else {
      toast(isAr() ? "فشل حفظ العلاج ✗" : "Failed to save treatment ✗");
    }
    return;
  }

  // Single tooth handling
  const singleTooth = document.getElementById("cl-tooth") ? document.getElementById("cl-tooth").value : (_selectedToothNum || null);
  const { data: tx, error } = await sb.from("treatments").insert({
    patient_id: _clPatId,
    procedure_name: name,
    tooth_number: singleTooth || null,
    cost,
    diagnosis: clNotes,
    date_performed: today(),
    dentist_name: dentistName
  }).select().single();

  if (!error) {
    toast(isAr() ? "تم حفظ العلاج — جاري إنشاء الفاتورة…" : "Treatment saved — generating invoice…");
    const { data: pat } = await sb.from("patients").select("first_name,last_name").eq("id", _clPatId).single();
    const pname = pat ? `${pat.first_name} ${pat.last_name}` : "";

    const { data: inv } = await sb.from("invoices").insert({
      patient_id: _clPatId,
      patient_name: pname,
      total_amount: cost,
      issue_date: today(),
      notes: clNotes,
      created_by: dentistName
    }).select().single();

    if (inv) {
      await sb.from("invoice_items").insert({
        invoice_id: inv.id,
        description: name + (singleTooth ? ` (${isAr() ? 'سن #' : 'Tooth #'}${singleTooth})` : ""),
        quantity: 1,
        unit_price: cost,
        total_price: cost
      });
      const invRef = (clNotes ? clNotes + "\n" : "") + (isAr() ? "عبر فاتورة " : "Via Invoice ") + inv.invoice_number;
      await sb.from("treatments").update({ diagnosis: invRef }).eq("id", tx.id);
      loadInvoices();
      _selectedTeeth.clear();
      _selectedToothNum = null;
      loadCLPat(_clPatId, document.getElementById("cl-q").value);
      openInv(inv.id);
    } else {
      _selectedTeeth.clear();
      _selectedToothNum = null;
      loadCLPat(_clPatId, document.getElementById("cl-q").value);
    }
  } else {
    toast(isAr() ? "فشل حفظ العلاج ✗" : "Failed to save treatment ✗");
  }
}

// Reports & Analytics
export async function loadReports() {
  const el = document.getElementById("sh-rep-body");
  if (!el) return;
  el.innerHTML = '<div class="ldg"><div class="spin"></div></div>';

  const td = today();
  const startYear = td.slice(0, 4) + "-01-01";
  const startMonth = td.slice(0, 7) + "-01";

  const [{ data: invs }, { data: appts }, { data: txs }, { count: totalPats }, { data: exps }] = await Promise.all([
    sb.from("invoices").select("total_amount,paid_amount,issue_date,status").gte("issue_date", startYear),
    sb.from("appointments").select("status").gte("appointment_date", startYear),
    sb.from("treatments").select("procedure_name,cost").gte("date_performed", startYear),
    sb.from("patients").select("*", { count: "exact", head: true }),
    sb.from("clinic_expenses").select("amount,category,expense_date").gte("expense_date", startYear)
  ]);

  const rev = new Array(12).fill(0);
  (invs || []).forEach(i => {
    const m = new Date(i.issue_date).getMonth();
    if (m >= 0 && m < 12) rev[m] += (+i.total_amount || 0);
  });
  const maxR = Math.max(...rev, 1);
  const revBars = rev.map((v, i) => `<div class="bar-row"><div class="bar-label">${MONTHS[i]}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round(v / maxR * 100)}%;background:linear-gradient(90deg, #0EA5A4, #14B8B6)">${v > 0 ? `<span class="bar-val">${fmt(v)}</span>` : ""}</div></div></div>`).join("");

  const byStatus = {};
  (appts || []).forEach(a => { byStatus[a.status] = (byStatus[a.status] || 0) + 1; });
  const apptBars = Object.entries(byStatus).map(([s, c]) => `<div class="bar-row"><div class="bar-label" style="width:80px;text-align:right;font-size:10px;color:${SC[s] || "#64748B"}">${SL[s] || s}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round(c / Math.max(...Object.values(byStatus), 1) * 100)}%;background:${SC[s] || "#64748B"}"><span class="bar-val">${c}</span></div></div></div>`).join("");

  const procMap = {};
  (txs || []).forEach(t => {
    if (!procMap[t.procedure_name]) procMap[t.procedure_name] = { cnt: 0, rev: 0 };
    procMap[t.procedure_name].cnt++;
    procMap[t.procedure_name].rev += (+t.cost || 0);
  });
  const topProcs = Object.entries(procMap).sort((a, b) => b[1].cnt - a[1].cnt).slice(0, 8);
  const maxP = Math.max(...topProcs.map(([, v]) => v.cnt), 1);
  const procBars = topProcs.map(([name, v]) => `<div class="bar-row"><div style="flex:1"><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-dim);margin-bottom:3px"><span>${esc(name)}</span><span style="color:var(--teal);font-weight:700">${v.cnt}× · ${fmt(v.rev)}</span></div><div class="bar-track" style="height:14px"><div class="bar-fill" style="width:${Math.round(v.cnt / maxP * 100)}%;background:linear-gradient(90deg, var(--teal), var(--teal-light))"></div></div></div></div>`).join("");

  const totalYear = rev.reduce((a, b) => a + b, 0);
  const outstanding = (invs || []).filter(i => i.status !== "paid").reduce((s, i) => s + Math.max(0, (+i.total_amount || 0) - (+i.paid_amount || 0)), 0);
  const totalExpenses = (exps || []).reduce((s, e) => s + (+e.amount || 0), 0);
  const netProfit = totalYear - totalExpenses;

  const expRev = new Array(12).fill(0);
  (exps || []).forEach(e => {
    const m = new Date(e.expense_date).getMonth();
    if (m >= 0 && m < 12) expRev[m] += (+e.amount || 0);
  });
  const maxE = Math.max(...expRev, 1);
  const expBars = expRev.map((v, i) => `<div class="bar-row"><div class="bar-label">${MONTHS[i]}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round(v / maxE * 100)}%;background:linear-gradient(90deg, #EF4444, #F87171)">${v > 0 ? `<span class="bar-val">${fmt(v)}</span>` : ""}</div></div></div>`).join("");

  const expCats = {};
  (exps || []).forEach(e => { expCats[e.category] = (expCats[e.category] || 0) + (+e.amount || 0); });
  const expCatHtml = Object.entries(expCats).sort((a, b) => b[1] - a[1]).map(([c, a]) => `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)"><span style="font-size:13px;color:var(--text)">${esc(c)}</span><span style="font-size:13px;font-weight:700;color:var(--error);font-family:var(--font-mono)">${fmt(a)}</span></div>`).join("");

  el.innerHTML = `
    <div class="sg">
      <div class="sc sc-featured" style="--ac:var(--teal)">
        <div class="sc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
        <div class="sc-val">${fmt(totalYear || 0)}</div>
        <div class="sc-lbl">${td.slice(0, 4)} ${isAr() ? "إجمالي الإيرادات" : "Gross Revenue"}</div>
      </div>
      <div class="sc" style="--ac:var(--error)">
        <div class="sc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
        <div class="sc-val">${fmt(totalExpenses || 0)}</div>
        <div class="sc-lbl">${td.slice(0, 4)} ${isAr() ? "إجمالي المصروفات" : "Clinic Expenses"}</div>
      </div>
      <div class="sc" style="--ac:${netProfit >= 0 ? "var(--success)" : "var(--error)"}">
        <div class="sc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg></div>
        <div class="sc-val">${fmt(Math.abs(netProfit || 0))}</div>
        <div class="sc-lbl">${isAr() ? (netProfit >= 0 ? "صافي الأرباح التشغيلية" : "صافي الخسائر") : ("Net " + (netProfit >= 0 ? "Operating Profit" : "Loss"))}</div>
      </div>
      <div class="sc" style="--ac:var(--warning)">
        <div class="sc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg></div>
        <div class="sc-val">${fmt(outstanding || 0)}</div>
        <div class="sc-lbl">${isAr() ? "المستحقات غير المحصلة" : "Outstanding Balance"}</div>
      </div>
    </div>

    <div class="slbl">${isAr() ? "حركة الإيرادات السنوية" : "Annual Revenue Trajectory"} (${td.slice(0, 4)})</div>
    <div class="card" style="padding:16px"><div class="bar-wrap">${revBars}</div></div>

    <div class="slbl">${isAr() ? "المصروفات الشهرية للعيادة" : "Monthly Clinic Expenses"} (${td.slice(0, 4)})</div>
    <div class="card" style="padding:16px"><div class="bar-wrap">${expBars}</div></div>

    <div class="slbl">${isAr() ? "المصروفات حسب البند / التصنيف" : "Expenses by Category"}</div>
    <div class="card" style="padding:16px">${expCatHtml || `<div class="empty">${isAr() ? "لا توجد مصروفات مسجلة" : "No expenses recorded"}</div>`}</div>

    <div class="slbl">${isAr() ? "توزيع حالات المواعيد" : "Appointments Breakdown"}</div>
    <div class="card" style="padding:16px"><div class="bar-wrap">${apptBars || `<div class="empty">${isAr() ? "لا توجد بيانات" : "No data"}</div>`}</div></div>

    <div class="slbl">${isAr() ? "أكثر الإجراءات الطبية طلباً" : "Top Performed Procedures"}</div>
    <div class="card" style="padding:16px"><div class="bar-wrap">${procBars || `<div class="empty">${isAr() ? "لا توجد بيانات" : "No data"}</div>`}</div></div>`;
}

// Staff Management
export async function loadStaffMgmt() {
  const el = document.getElementById("sh-staff-mgmt-body");
  if (!el) return;
  el.innerHTML = '<div class="ldg"><div class="spin"></div></div>';
  const { data } = await sb.from("staff").select("id,username,full_name,role,phone,is_active").order("full_name");
  if (!data) { el.innerHTML = `<div class="empty">${isAr() ? "فشل تحميل قائمة الكادر الطبي" : "Failed to load staff"}</div>`; return; }

  el.innerHTML = `<div class="card">
    ${data.map(s => {
      const roleName = s.role === 'admin' ? (isAr() ? 'مدير النظام' : 'ADMIN') : s.role === 'dentist' ? (isAr() ? 'طبيب أسنان' : 'DENTIST') : (isAr() ? 'مساعد / تمريض' : 'ASSISTANT');
      const activeText = s.is_active ? (isAr() ? '● نشط' : '● Active') : (isAr() ? '○ غير نشط' : '○ Inactive');
      return `
    <div class="row-sep" style="display:flex;align-items:center;padding:14px 18px;gap:14px;cursor:pointer" onclick="window.editStaff(${s.id},'${esc(s.full_name)}','${esc(s.username)}','${s.role}','${esc(s.phone || '')}',${s.is_active})">
      <div class="av">
        ${(s.full_name || "?")[0].toUpperCase()}
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:700;color:var(--navy)">${esc(s.full_name)}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${isAr() ? "الدور:" : "Role:"} ${roleName} · @${esc(s.username)}</div>
        ${s.phone ? `<div style="font-size:11px;color:var(--text-light)" dir="ltr">📞 ${esc(s.phone)}</div>` : ""}
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        <span class="role-badge ${s.role === 'admin' ? 'r-admin' : s.role === 'dentist' ? 'r-dentist' : 'r-assistant'}">${roleName}</span>
        <span style="font-size:11px;font-weight:700;color:${s.is_active ? "var(--success)" : "var(--error)"}">${activeText}</span>
      </div>
    </div>`;
    }).join("")}
  </div>`;
}

export function openAddStaff() {
  _editStfId = null;
  document.getElementById("staff-edit-title").textContent = isAr() ? "إضافة فرد جديد للفريق" : "New Staff Member";
  ["stf-name", "stf-user", "stf-phone", "stf-pass", "stf-pass2"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.getElementById("stf-role").value = "assistant";
  document.getElementById("stf-delete-btn").style.display = "none";
  document.getElementById("stf-status-row").style.display = "none";
  openSheet("staff-edit");
}

export function editStaff(id, name, username, role, phone, isActive) {
  _editStfId = id;
  document.getElementById("staff-edit-title").textContent = isAr() ? "تعديل ملف الموظف" : "Edit Staff Profile";
  document.getElementById("stf-name").value = name;
  document.getElementById("stf-user").value = username;
  document.getElementById("stf-role").value = role;
  document.getElementById("stf-phone").value = phone;
  document.getElementById("stf-pass").value = "";
  document.getElementById("stf-pass2").value = "";
  document.getElementById("stf-active").checked = isActive;
  document.getElementById("stf-delete-btn").style.display = "block";
  document.getElementById("stf-status-row").style.display = "block";
  openSheet("staff-edit");
}

export async function saveStaff() {
  const name = document.getElementById("stf-name").value.trim();
  const username = document.getElementById("stf-user").value.trim().toLowerCase();
  const role = document.getElementById("stf-role").value;
  const phone = document.getElementById("stf-phone").value.trim();
  const pass = document.getElementById("stf-pass").value;
  const pass2 = document.getElementById("stf-pass2").value;
  const isActive = document.getElementById("stf-active").checked;

  if (!name) { toast(isAr() ? "الاسم الكامل مطلوب ✗" : "Full name is required ✗"); return; }
  if (!username) { toast(isAr() ? "اسم المستخدم مطلوب ✗" : "Username is required ✗"); return; }
  if (!_editStfId && !pass) { toast(isAr() ? "كلمة المرور مطلوبة ✗" : "Password is required ✗"); return; }
  if (pass && pass !== pass2) { toast(isAr() ? "كلمتا المرور غير متطابقتين ✗" : "Passwords do not match ✗"); return; }
  if (pass && pass.length < 6) { toast(isAr() ? "يجب ألا تقل كلمة المرور عن 6 أحرف ✗" : "Password must be at least 6 characters ✗"); return; }

  let updateData = { full_name: name, username, role, phone, is_active: _editStfId ? isActive : true };
  if (pass) updateData.password_hash = await sha256(pass);

  let error;
  if (_editStfId) { ({ error } = await sb.from("staff").update(updateData).eq("id", _editStfId)); }
  else { ({ error } = await sb.from("staff").insert(updateData)); }

  if (!error) {
    toast(_editStfId ? (isAr() ? "تم تحديث بيانات الموظف ✓" : "Staff member updated ✓") : (isAr() ? "تمت إضافة الموظف بنجاح ✓" : "Staff member added ✓"));
    closeSheet("staff-edit");
    loadStaffMgmt();
  } else {
    if (error.message.includes("unique")) toast(isAr() ? "اسم المستخدم مسجل مسبقاً ✗" : "Username already exists ✗");
    else toast(isAr() ? "فشل الحفظ: " + error.message + " ✗" : "Failed: " + error.message + " ✗");
  }
}

let _delStaffPending = false;
let _delStaffTimer = null;

export async function deleteStaff() {
  if (!_editStfId) return;
  if (USER?.id === _editStfId) { toast(isAr() ? "لا يمكن حذف الحساب المسجل به حالياً ✗" : "Cannot delete your currently active account ✗"); return; }
  const delBtn = document.querySelector("#sh-staff-edit .sh-danger-btn");
  if (!_delStaffPending) {
    _delStaffPending = true;
    if (delBtn) { delBtn.textContent = isAr() ? "تأكيد الحذف النهائي؟" : "Confirm Remove?"; delBtn.style.background = "var(--error)"; delBtn.style.color = "#fff"; }
    toast(isAr() ? "انقر مرة أخرى لتأكيد حذف هذا الموظف" : "Click again to confirm staff removal");
    clearTimeout(_delStaffTimer);
    _delStaffTimer = setTimeout(() => {
      _delStaffPending = false;
      if (delBtn) { delBtn.textContent = isAr() ? "حذف الموظف" : "Delete Staff"; delBtn.style.background = ""; delBtn.style.color = ""; }
    }, 4000);
    return;
  }
  _delStaffPending = false;
  clearTimeout(_delStaffTimer);
  const { error } = await sb.from("staff").delete().eq("id", _editStfId);
  if (!error) {
    toast(isAr() ? "تم حذف الموظف ✓" : "Staff member removed ✓");
    closeSheet("staff-edit");
    loadStaffMgmt();
  } else toast(isAr() ? "فشل: " + error.message + " ✗" : "Failed: " + error.message + " ✗");
}

// Services catalog
export async function loadServices() {
  const el = document.getElementById("sh-services-body");
  if (!el) return;
  el.innerHTML = '<div class="ldg"><div class="spin"></div></div>';
  const { data } = await sb.from("procedures_catalog").select("*").order("category,name");
  if (!data) { el.innerHTML = `<div class="empty">${isAr() ? "فشل تحميل لائحة الخدمات" : "Failed to load services"}</div>`; return; }

  const cats = {};
  data.forEach(s => { const c = s.category || (isAr() ? "أخرى" : "Other"); if (!cats[c]) cats[c] = []; cats[c].push(s); });

  let html = "";
  for (const [cat, svcs] of Object.entries(cats)) {
    html += `<div class="slbl" style="margin-top:14px">${esc(cat)}</div><div class="card">`;
    html += svcs.map(s => `
      <div class="row-sep" style="display:flex;align-items:center;padding:14px 18px;gap:12px;cursor:pointer" onclick="window.editService(${s.id},'${esc(s.name)}',${s.default_cost},'${esc(s.category || (isAr() ? 'عام' : 'Other'))}')">
        <div style="flex:1"><div style="font-size:14px;font-weight:600;color:var(--navy)">${esc(s.name)}</div></div>
        <div style="font-size:15px;font-weight:800;color:var(--teal);font-family:var(--font-mono)">${fmt(+s.default_cost || 0)}</div>
        <div style="color:var(--text-light);font-size:16px">›</div>
      </div>`).join("");
    html += "</div>";
  }
  el.innerHTML = html || `<div class="empty">${isAr() ? "لا توجد خدمات في لائحة الأسعار" : "No services in price list"}</div>`;
}

export function openAddService() {
  _editSvcId = null;
  document.getElementById("service-edit-title").textContent = isAr() ? "إضافة خدمة علاجية جديدة" : "New Dental Service";
  document.getElementById("svc-name").value = "";
  document.getElementById("svc-price").value = "";
  document.getElementById("svc-cat").value = "General";
  document.getElementById("svc-delete-btn").style.display = "none";
  openSheet("service-edit");
}

export function editService(id, name, price, cat) {
  _editSvcId = id;
  document.getElementById("service-edit-title").textContent = isAr() ? "تعديل الخدمة العلاجية" : "Edit Dental Service";
  document.getElementById("svc-name").value = name;
  document.getElementById("svc-price").value = price;
  document.getElementById("svc-cat").value = cat;
  document.getElementById("svc-delete-btn").style.display = "block";
  openSheet("service-edit");
}

export async function saveService() {
  const name = document.getElementById("svc-name").value.trim();
  const price = parseFloat(document.getElementById("svc-price").value) || 0;
  const cat = document.getElementById("svc-cat").value;
  if (!name) { toast(isAr() ? "يرجى إدخال اسم الخدمة ✗" : "Enter service name ✗"); return; }
  let error;
  if (_editSvcId) { ({ error } = await sb.from("procedures_catalog").update({ name, default_cost: price, category: cat }).eq("id", _editSvcId)); }
  else { ({ error } = await sb.from("procedures_catalog").insert({ name, default_cost: price, category: cat })); }
  if (!error) {
    toast(_editSvcId ? (isAr() ? "تم تحديث الخدمة ✓" : "Service updated ✓") : (isAr() ? "تمت إضافة الخدمة بنجاح ✓" : "Service added ✓"));
    closeSheet("service-edit");
    loadServices();
    loadProcs();
  } else toast(isAr() ? "فشل: " + error.message + " ✗" : "Failed: " + error.message + " ✗");
}

let _delSvcPending = false;
let _delSvcTimer = null;

export async function deleteService() {
  if (!_editSvcId) return;
  const delBtn = document.getElementById("svc-delete-btn");
  if (!_delSvcPending) {
    _delSvcPending = true;
    if (delBtn) { delBtn.textContent = isAr() ? "تأكيد الحذف؟" : "Confirm Delete?"; delBtn.style.background = "var(--error)"; delBtn.style.color = "#fff"; }
    toast(isAr() ? "انقر مرة أخرى لتأكيد حذف هذه الخدمة" : "Click again to confirm deleting this service");
    clearTimeout(_delSvcTimer);
    _delSvcTimer = setTimeout(() => {
      _delSvcPending = false;
      if (delBtn) { delBtn.textContent = isAr() ? "حذف الخدمة" : "Delete Service"; delBtn.style.background = ""; delBtn.style.color = ""; }
    }, 4000);
    return;
  }
  _delSvcPending = false;
  clearTimeout(_delSvcTimer);
  const { error } = await sb.from("procedures_catalog").delete().eq("id", _editSvcId);
  if (!error) {
    toast(isAr() ? "تم حذف الخدمة بنجاح ✓" : "Service deleted ✓");
    closeSheet("service-edit");
    loadServices();
    loadProcs();
  } else toast(isAr() ? "فشل: " + error.message + " ✗" : "Failed: " + error.message + " ✗");
}

// Edit treatment & Invoice
export function openEditTx(id, name, cost, date, tooth, diagnosis) {
  _editTxId = id;
  document.getElementById("etx-name").value = name;
  document.getElementById("etx-cost").value = cost;
  document.getElementById("etx-date").value = date;
  document.getElementById("etx-tooth").value = tooth || "";
  document.getElementById("etx-notes").value = diagnosis || "";
  openSheet("edit-tx");
}

export async function saveEditTx() {
  const name = document.getElementById("etx-name").value.trim();
  if (!name) { toast(isAr() ? "اسم الإجراء العلاجي مطلوب ✗" : "Procedure name is required ✗"); return; }
  const { error } = await sb.from("treatments").update({
    procedure_name: name,
    cost: parseFloat(document.getElementById("etx-cost").value) || 0,
    date_performed: document.getElementById("etx-date").value,
    tooth_number: parseInt(document.getElementById("etx-tooth").value) || null,
    diagnosis: document.getElementById("etx-notes").value.trim()
  }).eq("id", _editTxId);
  if (!error) {
    toast(isAr() ? "تم تحديث الإجراء العلاجي ✓" : "Treatment updated ✓");
    closeSheet("edit-tx");
    if (_clPatId) loadCLPat(_clPatId, document.getElementById("cl-q").value);
  } else toast(isAr() ? "فشل: " + error.message + " ✗" : "Failed: " + error.message + " ✗");
}

let _delTxPending = false;
let _delTxTimer = null;

export async function deleteTx() {
  if (!_editTxId) return;
  const delBtn = document.querySelector("#sh-edit-tx .sh-danger-btn");
  if (!_delTxPending) {
    _delTxPending = true;
    if (delBtn) { delBtn.textContent = isAr() ? "تأكيد الحذف؟" : "Confirm Delete?"; delBtn.style.background = "var(--error)"; delBtn.style.color = "#fff"; }
    toast(isAr() ? "انقر مرة أخرى لتأكيد حذف هذا العلاج" : "Click again to confirm deleting treatment");
    clearTimeout(_delTxTimer);
    _delTxTimer = setTimeout(() => {
      _delTxPending = false;
      if (delBtn) { delBtn.textContent = isAr() ? "حذف" : "Delete"; delBtn.style.background = ""; delBtn.style.color = ""; }
    }, 4000);
    return;
  }
  _delTxPending = false;
  clearTimeout(_delTxTimer);
  const { error } = await sb.from("treatments").delete().eq("id", _editTxId);
  if (!error) {
    toast(isAr() ? "تم حذف العلاج بنجاح ✓" : "Treatment deleted ✓");
    closeSheet("edit-tx");
    if (_clPatId) loadCLPat(_clPatId, document.getElementById("cl-q").value);
  } else toast(isAr() ? "فشل: " + error.message + " ✗" : "Failed: " + error.message + " ✗");
}

// Edit Invoice
export async function openEditInv(optId) {
  const invId = optId || _editInvId || getEditInvId();
  if (!invId) {
    toast(isAr() ? "يرجى تحديد الفاتورة أولاً ✗" : "Please select an invoice first ✗");
    return;
  }
  _editInvId = invId;
  setEditInvId(invId);

  const [{ data: items }, { data: inv }] = await Promise.all([
    sb.from("invoice_items").select("*").eq("invoice_id", invId),
    sb.from("invoices").select("*").eq("id", invId).single()
  ]);

  _editInvItems = items ? [...items] : [];
  _editInvOrigItems = items ? [...items] : [];
  document.getElementById("einv-notes").value = inv?.notes || "";
  document.getElementById("einv-status").value = inv?.status || "unpaid";
  const rows = document.getElementById("einv-item-rows");
  rows.innerHTML = "";
  _editInvItems.forEach((it, i) => renderEditInvItem(it, i));
  calcEditInvTotal();
  openSheet("edit-inv");
}

export function renderEditInvItem(it, i) {
  const rows = document.getElementById("einv-item-rows");
  const div = document.createElement("div");
  div.id = "einv-item-" + i;
  div.style.cssText = "background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);padding:14px;margin-bottom:10px";
  div.innerHTML = `<div style="display:flex;justify-content:space-between;margin-bottom:8px">
    <div style="font-size:11px;font-weight:700;color:var(--teal);text-transform:uppercase;letter-spacing:0.6px">${isAr() ? "البند" : "Item"} ${i + 1}</div>
    <button onclick="window.removeEditInvItem(${i})" style="background:none;border:none;color:var(--error);font-size:18px;cursor:pointer;line-height:1">×</button>
  </div>
  <div class="ff" style="margin-bottom:8px"><label>${isAr() ? "بيان الخدمة / العلاج" : "Description"}</label><input id="einv-desc-${i}" type="text" value="${esc(it.description || "")}" oninput="window.editInvCalc(${i})"></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <div class="ff" style="margin:0"><label>${isAr() ? "الكمية" : "Quantity"}</label><input id="einv-qty-${i}" type="number" value="${it.quantity || 1}" min="1" oninput="window.editInvCalc(${i})"></div>
    <div class="ff" style="margin:0"><label>${isAr() ? "السعر (جنيه)" : "Price (EGP)"}</label><input id="einv-price-${i}" type="number" inputmode="decimal" value="${it.unit_price || 0}" step="0.01" oninput="window.editInvCalc(${i})"></div>
  </div>`;
  rows.appendChild(div);
}

export function addEditInvItem() {
  const i = _editInvItems.length;
  _editInvItems.push({ description: "", quantity: 1, unit_price: 0, total_price: 0 });
  renderEditInvItem(_editInvItems[i], i);
}

export function removeEditInvItem(i) {
  const el = document.getElementById("einv-item-" + i);
  if (el) { el.remove(); delete _editInvItems[i]; calcEditInvTotal(); }
}

export function editInvCalc(i) {
  const qty = parseFloat(document.getElementById("einv-qty-" + i)?.value || 1);
  const price = parseFloat(document.getElementById("einv-price-" + i)?.value || 0);
  const desc = document.getElementById("einv-desc-" + i)?.value || "";
  _editInvItems[i] = { ..._editInvItems[i], description: desc, quantity: qty, unit_price: price, total_price: qty * price };
  calcEditInvTotal();
}

export function calcEditInvTotal() {
  const tot = _editInvItems.filter(Boolean).reduce((s, i) => s + (i.total_price || 0), 0);
  document.getElementById("einv-total").textContent = fmt(tot);
}

export async function saveEditInv() {
  const invId = _editInvId || getEditInvId();
  if (!invId) { toast(isAr() ? "لم يتم تحديد فاتورة ✗" : "No invoice selected ✗"); return; }
  const validItems = _editInvItems.filter(i => i && i.description && i.description.trim());
  const sanitizedItems = validItems.map(it => ({
    invoice_id: invId,
    description: it.description.trim(),
    quantity: parseInt(it.quantity, 10) || 1,
    unit_price: parseFloat(it.unit_price) || 0,
    total_price: (parseInt(it.quantity, 10) || 1) * (parseFloat(it.unit_price) || 0)
  }));
  const total = sanitizedItems.reduce((s, i) => s + (i.total_price || 0), 0);
  const newStatus = document.getElementById("einv-status").value || "unpaid";
  const notes = (document.getElementById("einv-notes")?.value || "").trim();

  // Delete previous items and insert sanitized new ones
  await sb.from("invoice_items").delete().eq("invoice_id", invId);
  if (sanitizedItems.length) {
    const { error: itemErr } = await sb.from("invoice_items").insert(sanitizedItems);
    if (itemErr) {
      toast((isAr() ? "خطأ في حفظ البنود: " : "Error saving items: ") + itemErr.message + " ✗");
      return;
    }
  }
  if (newStatus === "unpaid") {
    await sb.from("payments").delete().eq("invoice_id", invId);
  }

  const invUpdate = { total_amount: total, status: newStatus, notes };
  if (newStatus === "unpaid") invUpdate.paid_amount = 0;

  const { error } = await sb.from("invoices").update(invUpdate).eq("id", invId);
  if (!error) {
    toast(newStatus === "unpaid" ? (isAr() ? "تم إعادة تعيين الفاتورة إلى غير مدفوعة ✓" : "Invoice reset to unpaid ✓") : (isAr() ? "تم تحديث الفاتورة ✓" : "Invoice updated ✓"));
    closeSheet("edit-inv");
    openInv(invId);
    loadInvoices();
  } else {
    toast((isAr() ? "فشل تحديث الفاتورة: " : "Failed to update invoice: ") + error.message + " ✗");
  }
}

let _delInvPending = false;
let _delInvTimer = null;

export async function deleteInv() {
  const invId = _editInvId || getEditInvId();
  if (!invId) { toast(isAr() ? "لم يتم تحديد فاتورة ✗" : "No invoice selected ✗"); return; }

  const delBtn = document.querySelector("#sh-edit-inv .sh-danger-btn");
  if (!_delInvPending) {
    _delInvPending = true;
    if (delBtn) {
      delBtn.textContent = isAr() ? "تأكيد الحذف النهائي؟" : "Confirm Delete?";
      delBtn.style.background = "var(--error)";
      delBtn.style.color = "#fff";
    }
    toast(isAr() ? "انقر مرة أخرى لتأكيد حذف هذه الفاتورة نهائياً" : "Click 'Confirm Delete?' to permanently remove this invoice");
    clearTimeout(_delInvTimer);
    _delInvTimer = setTimeout(() => {
      _delInvPending = false;
      if (delBtn) {
        delBtn.textContent = isAr() ? "حذف" : "Delete";
        delBtn.style.background = "";
        delBtn.style.color = "";
      }
    }, 4500);
    return;
  }

  // Confirmed delete
  _delInvPending = false;
  clearTimeout(_delInvTimer);
  if (delBtn) {
    delBtn.textContent = isAr() ? "جاري الحذف…" : "Deleting…";
    delBtn.disabled = true;
  }

  const { data: invItems } = await sb.from("invoice_items").select("description").eq("invoice_id", invId);
  const { data: invData } = await sb.from("invoices").select("patient_id,invoice_number").eq("id", invId).single();
  if (invData && invItems?.length) {
    await sb.from("treatments").delete().eq("patient_id", invData.patient_id).eq("diagnosis", "Via Invoice " + (invData.invoice_number || invId));
  }
  await sb.from("payments").delete().eq("invoice_id", invId);
  await sb.from("invoice_items").delete().eq("invoice_id", invId);
  const { error } = await sb.from("invoices").delete().eq("id", invId);

  if (delBtn) {
    delBtn.disabled = false;
    delBtn.textContent = isAr() ? "حذف" : "Delete";
    delBtn.style.background = "";
    delBtn.style.color = "";
  }

  if (!error) {
    toast(isAr() ? "تم حذف الفاتورة ✓" : "Invoice deleted ✓");
    closeSheet("edit-inv");
    closeSheet("inv");
    _editInvId = null;
    setEditInvId(null);
    loadInvoices();
  } else {
    toast(isAr() ? "فشل: " + error.message + " ✗" : "Failed: " + error.message + " ✗");
  }
}

// Expenses
export async function loadExpenses() {
  const month = document.getElementById("exp-month").value;
  document.getElementById("exp-month-sub").textContent = month || "";
  const el = document.getElementById("exp-list");
  const sumEl = document.getElementById("exp-summary");
  if (!el || !sumEl) return;
  el.innerHTML = '<div class="ldg"><div class="spin"></div></div>';

  const startDate = month + "-01";
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const endDate = month + "-" + String(lastDay).padStart(2, "0");

  const { data } = await sb.from("clinic_expenses").select("*").gte("expense_date", startDate).lte("expense_date", endDate).order("expense_date", { ascending: false });
  if (!data) { el.innerHTML = `<div class="empty">${isAr() ? "فشل تحميل المصروفات" : "Failed to load expenses"}</div>`; return; }

  const total = data.reduce((s, e) => s + (+e.amount || 0), 0);
  const cats = {};
  data.forEach(e => { cats[e.category] = (cats[e.category] || 0) + (+e.amount || 0); });

  const catBars = Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;color:var(--text)">${esc(cat)}</div><div style="font-size:13px;font-weight:700;color:var(--error);font-family:var(--font-mono)">${fmt(+amt)}</div></div>`).join("");

  sumEl.innerHTML = `<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:18px;margin-bottom:16px;box-shadow:var(--shadow-sm)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:${Object.keys(cats).length ? "12px" : "0"}"><div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.6px">${isAr() ? "إجمالي مصروفات الشهر" : "Monthly Total Expenses"}</div><div style="font-size:22px;font-weight:800;color:var(--error);font-family:var(--font-mono)">${fmt(total)}</div></div>${catBars}</div>`;

  if (!data.length) { el.innerHTML = `<div class="empty">${isAr() ? "لا توجد مصروفات مسجلة لهذا الشهر" : "No expenses recorded for this month"}</div>`; return; }

  const byDate = {};
  data.forEach(e => { const d = e.expense_date || ""; if (!byDate[d]) byDate[d] = []; byDate[d].push(e); });

  let html = "";
  for (const [date, items] of Object.entries(byDate)) {
    html += `<div class="slbl" style="margin-top:14px;font-family:var(--font-mono)">📅 ${date}</div><div class="card">`;
    html += items.map(e => `<div class="row-sep" style="display:flex;align-items:center;padding:14px 18px;gap:12px;cursor:pointer" onclick="window.openEditExpense(${e.id},'${esc(e.title)}',${e.amount},'${esc(e.category)}','${e.expense_date}','${esc(e.notes || '')}')"><div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:600;color:var(--navy)">${esc(e.title)}</div><div style="font-size:12px;color:var(--text-muted);margin-top:2px">${esc(e.category)}${e.notes ? " · " + esc(e.notes) : ""}</div></div><div style="font-size:14px;font-weight:800;color:var(--error);flex-shrink:0;font-family:var(--font-mono)">${fmt(+e.amount)}</div><div style="color:var(--text-light);font-size:16px">›</div></div>`).join("");
    html += "</div>";
  }
  el.innerHTML = html;
}

export function openAddExpense() {
  _editExpId = null;
  document.getElementById("exp-edit-title").textContent = isAr() ? "تسجيل بند مصروف جديد" : "Record New Expense";
  document.getElementById("exp-amount").value = "";
  document.getElementById("exp-cat").value = "Rent";
  document.getElementById("exp-date").value = today();
  document.getElementById("exp-notes").value = "";
  document.getElementById("exp-delete-btn").style.display = "none";
  openSheet("expense-edit");
}

export function openEditExpense(id, title, amount, cat, date, notes) {
  _editExpId = id;
  document.getElementById("exp-edit-title").textContent = isAr() ? "تعديل بيانات المصروف" : "Edit Expense";
  document.getElementById("exp-cat").value = cat || title;
  document.getElementById("exp-amount").value = amount;
  document.getElementById("exp-date").value = date;
  document.getElementById("exp-notes").value = notes;
  document.getElementById("exp-delete-btn").style.display = "block";
  openSheet("expense-edit");
}

export async function saveExpense() {
  const amount = parseFloat(document.getElementById("exp-amount").value) || 0;
  if (!amount) { toast(isAr() ? "يرجى إدخال مبلغ المصروف ✗" : "Enter expense amount ✗"); return; }
  const cat = document.getElementById("exp-cat").value;
  const data = {
    title: cat,
    amount,
    category: cat,
    expense_date: document.getElementById("exp-date").value || today(),
    notes: document.getElementById("exp-notes").value.trim(),
    created_by: USER?.full_name || "",
    month: document.getElementById("exp-date").value?.slice(0, 7) || today().slice(0, 7)
  };
  let error;
  if (_editExpId) { ({ error } = await sb.from("clinic_expenses").update(data).eq("id", _editExpId)); }
  else { ({ error } = await sb.from("clinic_expenses").insert(data)); }
  if (!error) {
    toast(_editExpId ? (isAr() ? "تم تحديث المصروف ✓" : "Expense updated ✓") : (isAr() ? "تم تسجيل المصروف بنجاح ✓" : "Expense recorded ✓"));
    closeSheet("expense-edit");
    loadExpenses();
  } else toast(isAr() ? "فشل: " + error.message + " ✗" : "Failed: " + error.message + " ✗");
}

let _delExpPending = false;
let _delExpTimer = null;

export async function deleteExpense() {
  if (!_editExpId) return;
  const delBtn = document.getElementById("exp-delete-btn");
  if (!_delExpPending) {
    _delExpPending = true;
    if (delBtn) { delBtn.textContent = isAr() ? "تأكيد الحذف؟" : "Confirm Delete?"; delBtn.style.background = "var(--error)"; delBtn.style.color = "#fff"; }
    toast(isAr() ? "انقر مرة أخرى لتأكيد حذف هذا المصروف" : "Click again to confirm deleting this expense");
    clearTimeout(_delExpTimer);
    _delExpTimer = setTimeout(() => {
      _delExpPending = false;
      if (delBtn) { delBtn.textContent = isAr() ? "حذف المصروف" : "Delete Expense"; delBtn.style.background = ""; delBtn.style.color = ""; }
    }, 4000);
    return;
  }
  _delExpPending = false;
  clearTimeout(_delExpTimer);
  const { error } = await sb.from("clinic_expenses").delete().eq("id", _editExpId);
  if (!error) {
    toast(isAr() ? "تم حذف المصروف ✓" : "Expense deleted ✓");
    closeSheet("expense-edit");
    loadExpenses();
  } else toast(isAr() ? "فشل: " + error.message + " ✗" : "Failed: " + error.message + " ✗");
}

// AI File Scanner
export function closeScanSheet() {
  closeSheet("scan-file");
  _scanImgB64 = null; _scanImgMime = null;
  _scanImg2B64 = null; _scanImg2Mime = null;
  const in1 = document.getElementById('scan-file-input'); if (in1) in1.value = "";
  const in2 = document.getElementById('scan-file-input-2'); if (in2) in2.value = "";
  document.getElementById("scan-preview-wrap").style.display = "none";
  document.getElementById("scan-add-page2-wrap").style.display = "none";
  document.getElementById("scan-preview-wrap-2").style.display = "none";
  document.getElementById("scan-analyze-btn").style.display = "none";
  document.getElementById("scan-result-wrap").style.display = "none";
  document.getElementById("scan-status").style.display = "none";
}

export function onScanFileChange(e) {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  _scanImgMime = f.type || "image/jpeg";
  const reader = new FileReader();
  reader.onload = () => {
    _scanImgB64 = reader.result.split(",")[1];
    document.getElementById("scan-preview-img").src = reader.result;
    document.getElementById("scan-preview-wrap").style.display = "block";
    document.getElementById("scan-add-page2-wrap").style.display = "block";
    document.getElementById("scan-analyze-btn").style.display = "flex";
    document.getElementById("scan-result-wrap").style.display = "none";
  };
  reader.readAsDataURL(f);
}

export function onScanFileChange2(e) {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  _scanImg2Mime = f.type || "image/jpeg";
  const reader = new FileReader();
  reader.onload = () => {
    _scanImg2B64 = reader.result.split(",")[1];
    document.getElementById("scan-preview-img-2").src = reader.result;
    document.getElementById("scan-preview-wrap-2").style.display = "block";
    document.getElementById("scan-result-wrap").style.display = "none";
  };
  reader.readAsDataURL(f);
}

export function removeScanPage2() {
  _scanImg2B64 = null; _scanImg2Mime = null;
  const in2 = document.getElementById('scan-file-input-2'); if (in2) in2.value = "";
  document.getElementById("scan-preview-wrap-2").style.display = "none";
}

export async function analyzeScanFile() {
  if (!_scanImgB64) { toast(isAr() ? "يرجى التقاط صورة أو رفع ملف أولاً ✗" : "Please capture or choose a photo first ✗"); return; }
  const statusEl = document.getElementById("scan-status");
  statusEl.style.display = "block";
  statusEl.textContent = _scanImg2B64 ? (isAr() ? "جاري تحليل الملف متعدد الصفحات بالذكاء الاصطناعي…" : "Analyzing multi-page patient file with AI…") : (isAr() ? "جاري قراءة وتحليل الخط اليدوي بالذكاء الاصطناعي…" : "Transcribing handwriting with AI vision…");
  document.getElementById("scan-analyze-btn").disabled = true;

  try {
    const body = { image_base64: _scanImgB64, mime_type: _scanImgMime };
    if (_scanImg2B64) { body.image_base64_2 = _scanImg2B64; body.mime_type_2 = _scanImg2Mime; }
    const { data, error } = await sb.functions.invoke("Scan-proxy", { body });
    if (error) {
      let detail = "";
      try {
        const errBody = await error.context?.json();
        detail = errBody?.error || "";
      } catch (e) { }
      throw new Error(detail || error.message || "File analysis proxy failed");
    }
    if (data?.error) throw new Error(data.error);

    const ex = data?.extracted || {};
    document.getElementById("scan-fname").value = ex.first_name || "";
    document.getElementById("scan-lname").value = ex.last_name || "";
    document.getElementById("scan-phone").value = ex.phone || "";
    document.getElementById("scan-age").value = ex.age || "";
    document.getElementById("scan-gender").value = (ex.gender === "Male" || ex.gender === "Female") ? ex.gender : "";
    document.getElementById("scan-allergies").value = ex.allergies || "";
    document.getElementById("scan-conditions").value = ex.medical_conditions || "";
    document.getElementById("scan-notes").value = ex.notes || "";
    document.getElementById("scan-diagnosis").value = ex.diagnosis || "";
    document.getElementById("scan-procedure").value = ex.procedure || "";
    document.getElementById("scan-result-wrap").style.display = "block";
    statusEl.textContent = isAr() ? "اكتمل الاستخراج بنجاح — يرجى مراجعة الحقول قبل الحفظ." : "Extraction complete — please verify fields before saving.";
  } catch (err) {
    statusEl.textContent = (isAr() ? "خطأ في الفحص: " : "Scan error: ") + err.message;
    toast(isAr() ? "فشل التحليل ✗" : "Analysis failed ✗");
  } finally {
    document.getElementById("scan-analyze-btn").disabled = false;
  }
}

export async function createPatientFromScan() {
  const fn = document.getElementById("scan-fname").value.trim();
  if (!fn) { toast(isAr() ? "الاسم الأول مطلوب ✗" : "First name is required ✗"); return; }
  const { data: pat, error } = await sb.from("patients").insert({
    first_name: fn,
    last_name: document.getElementById("scan-lname").value.trim(),
    phone: document.getElementById("scan-phone").value.trim(),
    age: parseInt(document.getElementById("scan-age").value) || null,
    gender: document.getElementById("scan-gender").value,
    allergies: document.getElementById("scan-allergies").value.trim(),
    medical_conditions: document.getElementById("scan-conditions").value.trim(),
    notes: document.getElementById("scan-notes").value.trim(),
  }).select().single();

  if (error) { toast((isAr() ? "فشل إنشاء ملف المريض: " : "Failed to create patient: ") + error.message + " ✗"); return; }

  const diagnosis = document.getElementById("scan-diagnosis").value.trim();
  const procedure = document.getElementById("scan-procedure").value.trim();
  if (diagnosis || procedure) {
    await sb.from("treatments").insert({
      patient_id: pat.id,
      procedure_name: procedure || (isAr() ? "ملف ممسوح ضوئياً — السجل المبدئي" : "Scanned File — Initial Record"),
      diagnosis: diagnosis || (isAr() ? "(مستخرج من ملف مكتوب بخط اليد)" : "(Extracted from handwritten file)"),
      date_performed: today(),
      dentist_name: USER?.full_name || (isAr() ? "د. عبدالله زين" : "Dr. Abdullah Zain"),
    });
  }

  toast(isAr() ? "تم إنشاء ملف المريض من السجل الممسوح بنجاح ✓" : "Patient profile created from scanned file ✓");
  closeScanSheet();
  sw("clinical");
  loadCLPat(pat.id, fn + " " + (document.getElementById("scan-lname")?.value || ""));
}
