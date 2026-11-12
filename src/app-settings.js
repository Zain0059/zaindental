// ==================================================
// ZAIN DENTAL CLINIC — CLINIC SETTINGS & CUSTOMIZATION
// Company Details, Print Setup, and Practice Customization
// ==================================================

import { toast, esc } from './app.js';
import { isAr, applyLangToDOM } from './i18n.js';

export const SETTINGS_KEY = 'zd_clinic_settings';

export const DEFAULT_SETTINGS = {
  // 🏢 1. Company & Clinic Details
  clinicNameAr: "عيادة زين لطب وجراحة الأسنان",
  clinicNameEn: "Zain Dental Clinic & Implant Center",
  clinicTaglineAr: "المنظومة السحابية المتكاملة لطب وتجميل الأسنان",
  clinicTaglineEn: "Cloud Dental Practice Management & Advanced Care",
  doctorName: "د. عبد الله زين",
  doctorTitle: "أخصائي جراحة وزراعة وتجميل الفم والأسنان",
  doctorLicense: "ترخيص مزاولة مهنة رقم: 48921 / نقابة أطباء الأسنان",
  phonePrimary: "01023456789",
  phoneSecondary: "0223456789",
  whatsappNumber: "01023456789",
  emailAddress: "info@zaindentalclinic.com",
  clinicAddress: "شارع التحرير، برج الأطباء، الدور الرابع - الدقي، الجيزة",
  crNumber: "CR-4029184",
  taxNumber: "TR-894-321-002",
  currency: "EGP", // EGP, SAR, AED, USD, KWD
  currencySymbolAr: "ج.م",
  currencySymbolEn: "EGP",

  // 🖨️ 2. Print & Invoice Settings
  printPaperSize: "a4", // "a4" or "thermal80"
  printHeaderNote: "عيادة زين التخصصية لطب الأسنان · صحة وجمال ابتسامتكم غايتنا الدائمة",
  printFooterNote: "نتمنى لكم دوام الصحة والعافية · الضمان الطبي يسري بموجب أصل الفاتورة أو رقم الملف",
  prescriptionAdvice: "يرجى الالتزام الصارم بمواعيد الجرعات الدوائية، المضمضة بالماء والملح بعد 24 ساعة من الجراحة، والامتناع التام عن المشروبات الساخنة والتدخين.",
  printShowLogo: true,
  printShowSignatureStamp: true,
  printShowQr: true,
  printShowTaxCr: true,
  printFontSize: "normal", // "compact", "normal", "large"

  // 🎨 3. General Practice Customization
  appointmentDuration: 30, // 15, 20, 30, 45, 60 minutes
  defaultApptStatus: "scheduled", // "scheduled", "confirmed"
  weekStartDay: "saturday", // "saturday", "sunday", "monday"
  workHoursStart: "10:00",
  workHoursEnd: "22:00",
  soundAlerts: true,
  themeAccent: "teal", // "teal", "blue", "navy", "emerald", "purple"
  autoRefreshQueue: 30 // seconds
};

export const THEME_PALETTES = {
  teal: {
    name: "فيروزي زين (افتراضي)",
    color: "#0EA5A4",
    dark: "#0A807F",
    light: "#14B8B6",
    dim: "rgba(14, 165, 164, 0.08)",
    low: "rgba(14, 165, 164, 0.15)",
    glow: "rgba(14, 165, 164, 0.28)"
  },
  blue: {
    name: "أزرق طبي ملكي",
    color: "#2563EB",
    dark: "#1D4ED8",
    light: "#3B82F6",
    dim: "rgba(37, 99, 235, 0.08)",
    low: "rgba(37, 99, 235, 0.15)",
    glow: "rgba(37, 99, 235, 0.28)"
  },
  navy: {
    name: "كحلي كلاسيكي فاخر",
    color: "#0B2545",
    dark: "#07192F",
    light: "#133863",
    dim: "rgba(11, 37, 69, 0.08)",
    low: "rgba(11, 37, 69, 0.15)",
    glow: "rgba(11, 37, 69, 0.28)"
  },
  emerald: {
    name: "زمردي طبي مشرق",
    color: "#059669",
    dark: "#047857",
    light: "#10B981",
    dim: "rgba(5, 150, 105, 0.08)",
    low: "rgba(5, 150, 105, 0.15)",
    glow: "rgba(5, 150, 105, 0.28)"
  },
  purple: {
    name: "أرجواني راقي",
    color: "#7C3AED",
    dark: "#6D28D9",
    light: "#8B5CF6",
    dim: "rgba(124, 58, 237, 0.08)",
    low: "rgba(124, 58, 237, 0.15)",
    glow: "rgba(124, 58, 237, 0.28)"
  }
};

let _currentSettings = null;
let _activeSettingsTab = "company";

export function getClinicSettings() {
  if (_currentSettings) return _currentSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      _currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } else {
      _currentSettings = { ...DEFAULT_SETTINGS };
    }
  } catch (e) {
    _currentSettings = { ...DEFAULT_SETTINGS };
  }
  return _currentSettings;
}

export function saveClinicSettings(newSettings) {
  _currentSettings = { ...getClinicSettings(), ...newSettings };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(_currentSettings));
  } catch (e) {}
  applyClinicSettings(_currentSettings);
  return _currentSettings;
}

export function applyClinicSettings(settings) {
  const s = settings || getClinicSettings();
  const ar = isAr();

  // 1. Update branding in desktop sidebar & mobile header
  const brandName = ar ? (s.clinicNameAr || DEFAULT_SETTINGS.clinicNameAr) : (s.clinicNameEn || DEFAULT_SETTINGS.clinicNameEn);
  const brandTagline = ar ? (s.clinicTaglineAr || DEFAULT_SETTINGS.clinicTaglineAr) : (s.clinicTaglineEn || DEFAULT_SETTINGS.clinicTaglineEn);

  document.querySelectorAll("[data-i18n='clinic_name']").forEach(el => {
    el.textContent = brandName;
  });
  document.querySelectorAll("[data-i18n='clinic_tagline']").forEach(el => {
    el.textContent = brandTagline;
  });

  // 2. Update page title
  document.title = `${brandName} · ${brandTagline}`;

  // 3. Update theme CSS accent colors
  const palette = THEME_PALETTES[s.themeAccent] || THEME_PALETTES.teal;
  const root = document.documentElement;
  root.style.setProperty("--teal", palette.color);
  root.style.setProperty("--teal-dark", palette.dark);
  root.style.setProperty("--teal-light", palette.light);
  root.style.setProperty("--teal-dim", palette.dim);
  root.style.setProperty("--teal-low", palette.low);
  root.style.setProperty("--teal-glow", palette.glow);
  root.style.setProperty("--border-focus", palette.color);

  // 4. Update body class for print paper size
  document.body.classList.toggle("paper-thermal80", s.printPaperSize === "thermal80");
  document.body.classList.toggle("paper-a4", s.printPaperSize !== "thermal80");
}

export function switchSettingsTab(tabId) {
  _activeSettingsTab = tabId;
  const tabs = ["company", "print", "customization"];
  tabs.forEach(t => {
    const pane = document.getElementById("st-pane-" + t);
    const btn = document.getElementById("st-btn-" + t);
    if (pane) pane.style.display = t === tabId ? "block" : "none";
    if (btn) btn.classList.toggle("on", t === tabId);
  });
}

export function selectPaperSize(size) {
  const a4Card = document.getElementById("st-paper-a4");
  const thCard = document.getElementById("st-paper-th");
  const input = document.getElementById("st-val-paper-size");
  if (input) input.value = size;
  if (a4Card) a4Card.classList.toggle("selected", size === "a4");
  if (thCard) thCard.classList.toggle("selected", size === "thermal80");
}

export function selectAccentColor(colorKey) {
  const input = document.getElementById("st-val-theme-accent");
  if (input) input.value = colorKey;
  document.querySelectorAll(".st-color-swatch").forEach(el => {
    el.classList.toggle("selected", el.getAttribute("data-color") === colorKey);
  });
  // Preview color immediately
  const palette = THEME_PALETTES[colorKey];
  if (palette) {
    const root = document.documentElement;
    root.style.setProperty("--teal", palette.color);
    root.style.setProperty("--teal-dark", palette.dark);
    root.style.setProperty("--teal-light", palette.light);
    root.style.setProperty("--teal-dim", palette.dim);
    root.style.setProperty("--teal-low", palette.low);
    root.style.setProperty("--teal-glow", palette.glow);
    root.style.setProperty("--border-focus", palette.color);
  }
}

export function initSettingsSheet() {
  const s = getClinicSettings();
  const ar = isAr();
  const body = document.getElementById("sh-settings-body");
  if (!body) return;

  body.innerHTML = `
    <!-- Top Navigation Subtabs -->
    <div class="st-tabs-nav">
      <button type="button" class="st-tab-btn ${(_activeSettingsTab === "company" ? "on" : "")}" id="st-btn-company" onclick="window.switchSettingsTab('company')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h6M3 15h6M15 3v18M15 9h6M15 15h6"/></svg>
        <span>${ar ? "🏢 بيانات الشركة والعيادة" : "🏢 Clinic & Company"}</span>
      </button>
      <button type="button" class="st-tab-btn ${(_activeSettingsTab === "print" ? "on" : "")}" id="st-btn-print" onclick="window.switchSettingsTab('print')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        <span>${ar ? "🖨️ إعدادات الطباعة" : "🖨️ Print Setup"}</span>
      </button>
      <button type="button" class="st-tab-btn ${(_activeSettingsTab === "customization" ? "on" : "")}" id="st-btn-customization" onclick="window.switchSettingsTab('customization')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        <span>${ar ? "🎨 التخصيص العام" : "🎨 Customization"}</span>
      </button>
    </div>

    <form id="settings-form" onsubmit="window.saveClinicSettingsFromUI(event)">
      <!-- ══════════════════════════════════════════
           TAB 1: COMPANY & CLINIC DETAILS
      ══════════════════════════════════════════ -->
      <div id="st-pane-company" class="st-pane" style="display:${_activeSettingsTab === "company" ? "block" : "none"}">
        <div class="st-section-title">
          <div class="st-sec-ico" style="background:rgba(14,165,164,0.12);color:var(--teal)">🏢</div>
          <div>
            <div class="st-sec-h">${ar ? "بيانات وهوية العيادة والشركة" : "Clinic & Legal Identity"}</div>
            <div class="st-sec-p">${ar ? "تظهر هذه المعلومات في رأس الفواتير، الترويسة، وسجلات المرضى والمطبوعات الرسمية." : "These details appear on official receipts, invoices, patient cards, and header banners."}</div>
          </div>
        </div>

        <div class="st-grid-2">
          <div class="ff">
            <label>${ar ? "اسم العيادة (بالعربية)" : "Clinic Name (Arabic)"}</label>
            <input type="text" id="st-clinic-name-ar" value="${esc(s.clinicNameAr)}" required placeholder="مثال: عيادة زين لطب وجراحة الأسنان">
          </div>
          <div class="ff">
            <label>${ar ? "اسم العيادة (بالإنجليزية)" : "Clinic Name (English)"}</label>
            <input type="text" id="st-clinic-name-en" value="${esc(s.clinicNameEn)}" placeholder="e.g. Zain Dental Clinic & Implant Center">
          </div>
        </div>

        <div class="ff">
          <label>${ar ? "الشعار اللفظي أو الوصف التعريفي للعيادة" : "Clinic Tagline / Slogan"}</label>
          <input type="text" id="st-clinic-tagline-ar" value="${esc(s.clinicTaglineAr)}" placeholder="مثال: المنظومة الطبية السحابية المتكاملة لرعاية وزراعة الأسنان">
        </div>

        <div class="st-grid-2">
          <div class="ff">
            <label>${ar ? "اسم الطبيب المسؤول / المدير الطبي" : "Medical Director / Doctor Name"}</label>
            <input type="text" id="st-doctor-name" value="${esc(s.doctorName)}" placeholder="د. عبد الله زين">
          </div>
          <div class="ff">
            <label>${ar ? "المسمى الطبي والدرجة التخصصية" : "Specialty & Medical Title"}</label>
            <input type="text" id="st-doctor-title" value="${esc(s.doctorTitle)}" placeholder="أخصائي جراحة وزراعة وتجميل الفم والأسنان">
          </div>
        </div>

        <div class="ff">
          <label>${ar ? "رقم ترخيص مزاولة المهنة / القيد النقابي" : "Medical License & Board Registration"}</label>
          <input type="text" id="st-doctor-license" value="${esc(s.doctorLicense || "")}" placeholder="مثال: ترخيص نقابة أطباء الأسنان رقم 48921">
        </div>

        <div class="st-grid-3">
          <div class="ff">
            <label>${ar ? "رقم الهاتف الأساسي" : "Primary Phone"}</label>
            <input type="tel" id="st-phone-1" value="${esc(s.phonePrimary)}" placeholder="01023456789">
          </div>
          <div class="ff">
            <label>${ar ? "هاتف إضافي / أرضي" : "Secondary / Landline"}</label>
            <input type="tel" id="st-phone-2" value="${esc(s.phoneSecondary)}" placeholder="0223456789">
          </div>
          <div class="ff">
            <label>${ar ? "واتساب العيادة المباشر" : "WhatsApp Number"}</label>
            <input type="tel" id="st-whatsapp" value="${esc(s.whatsappNumber)}" placeholder="01023456789">
          </div>
        </div>

        <div class="st-grid-2">
          <div class="ff">
            <label>${ar ? "البريد الإلكتروني للعيادة" : "Clinic Email"}</label>
            <input type="email" id="st-email" value="${esc(s.emailAddress)}" placeholder="clinic@zaindental.com">
          </div>
          <div class="ff">
            <label>${ar ? "العملة الافتراضية للتعامل" : "Default Billing Currency"}</label>
            <select id="st-currency">
              <option value="EGP" ${s.currency === "EGP" ? "selected" : ""}>🇪🇬 جنيه مصري (ج.م - EGP)</option>
              <option value="SAR" ${s.currency === "SAR" ? "selected" : ""}>🇸🇦 ريال سعودي (ر.س - SAR)</option>
              <option value="AED" ${s.currency === "AED" ? "selected" : ""}>🇦🇪 درهم إماراتي (د.إ - AED)</option>
              <option value="USD" ${s.currency === "USD" ? "selected" : ""}>🇺🇸 دولار أمريكي ($ - USD)</option>
              <option value="KWD" ${s.currency === "KWD" ? "selected" : ""}>🇰🇼 دينار كويتي (د.ك - KWD)</option>
            </select>
          </div>
        </div>

        <div class="ff">
          <label>${ar ? "عنوان المقر والفرع بالتفصيل" : "Clinic Physical Address & Branch"}</label>
          <input type="text" id="st-address" value="${esc(s.clinicAddress)}" placeholder="الشارع، البرج، الدور، المدينة">
        </div>

        <div class="st-grid-2">
          <div class="ff">
            <label>${ar ? "رقم السجل التجاري (إن وجد)" : "Commercial Register (CR)"}</label>
            <input type="text" id="st-cr" value="${esc(s.crNumber)}" placeholder="CR-4029184">
          </div>
          <div class="ff">
            <label>${ar ? "رقم البطاقة الضريبية / الرقم الضريبي" : "Tax Registration ID"}</label>
            <input type="text" id="st-tax" value="${esc(s.taxNumber)}" placeholder="TR-894-321-002">
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════
           TAB 2: PRINT & PAPER SETTINGS
      ══════════════════════════════════════════ -->
      <div id="st-pane-print" class="st-pane" style="display:${_activeSettingsTab === "print" ? "block" : "none"}">
        <div class="st-section-title">
          <div class="st-sec-ico" style="background:rgba(59,130,246,0.12);color:#2563eb">🖨️</div>
          <div>
            <div class="st-sec-h">${ar ? "خيارات الطباعة وإعدادات الفواتير والروشتات" : "Print & Thermal Paper Setup"}</div>
            <div class="st-sec-p">${ar ? "تخصيص مقاس الورق، الترويسة، سياسة الضمان، ونموذج إيصالات المرضى." : "Configure paper sizing (A4 vs 80mm thermal roll), legal disclaimer, and prescription notes."}</div>
          </div>
        </div>

        <input type="hidden" id="st-val-paper-size" value="${s.printPaperSize}">

        <div class="slbl">${ar ? "نوع ومقاس الورق الافتراضي عند الطباعة" : "Default Paper Size"}</div>
        <div class="st-paper-grid">
          <div class="st-paper-card ${s.printPaperSize === "a4" ? "selected" : ""}" id="st-paper-a4" onclick="window.selectPaperSize('a4')">
            <div class="st-paper-icon">📄</div>
            <div class="st-paper-title">${ar ? "ورق طباعة A4 قياسي" : "Standard A4 Sheet"}</div>
            <div class="st-paper-sub">${ar ? "مناسب للفواتير التفصيلية، تقارير العلاج، وروشتات الأسنان الرسمية على طابعات الليزر أو الحبر." : "Best for itemized invoices, clinical treatment summaries & official prescription pads."}</div>
            <div class="st-paper-badge">${ar ? "مستند كامل ومفصل" : "Full Page"}</div>
          </div>

          <div class="st-paper-card ${s.printPaperSize === "thermal80" ? "selected" : ""}" id="st-paper-th" onclick="window.selectPaperSize('thermal80')">
            <div class="st-paper-icon">🧾</div>
            <div class="st-paper-title">${ar ? "رول حراري سريع 80mm" : "80mm Thermal Receipt"}</div>
            <div class="st-paper-sub">${ar ? "إيصالات قبض ودفع فورية سريعة وموجزة تناسب طابعات الكاشير الحرارية في الاستقبال." : "Instant compact receipts optimized for POS / reception thermal receipt printers."}</div>
            <div class="st-paper-badge">${ar ? "إيصال كاشير سريع" : "POS Thermal"}</div>
          </div>
        </div>

        <div class="ff" style="margin-top:16px">
          <label>${ar ? "نص ترويسة المطبوعات (أعلى الفاتورة والروشتة)" : "Print Header Subtitle / Motto"}</label>
          <input type="text" id="st-print-header" value="${esc(s.printHeaderNote)}" placeholder="مثال: عيادة زين التخصصية لطب الأسنان · صحة وجمال ابتسامتكم غايتنا الدائمة">
        </div>

        <div class="ff">
          <label>${ar ? "تذييل الفاتورة وشروط الضمان الطبي وسياسة العيادة" : "Invoice Footer Terms & Warranty Notice"}</label>
          <textarea id="st-print-footer" rows="2" placeholder="الملاحظات المطبوعة أسفل الفاتورة">${esc(s.printFooterNote)}</textarea>
        </div>

        <div class="ff">
          <label>${ar ? "التعليمات والتنبيهات الافتراضية لروشتة الأسنان (Prescription Advice)" : "Default Prescription Post-Procedure Advice"}</label>
          <textarea id="st-prescription-advice" rows="2" placeholder="تعليمات ما بعد الخلع، التركيبات، والمضادات الحيوية">${esc(s.prescriptionAdvice)}</textarea>
        </div>

        <div class="slbl">${ar ? "عناصر الظهور في المطبوعات الرسمية" : "Printable Elements Visibility"}</div>
        <div class="st-toggles-list">
          <label class="st-toggle-item">
            <div class="st-toggle-info">
              <div class="st-ti-title">${ar ? "إظهار شعار وهوية العيادة في أعلى المطبوعات" : "Show Clinic Logo & Brand Header"}</div>
              <div class="st-ti-desc">${ar ? "يظهر لوجو العيادة واسمها التجاري بتنسيق طبي أنيق في ترويسة الورقة." : "Displays the clinic badge and registered branding in the top header."}</div>
            </div>
            <input type="checkbox" id="st-show-logo" class="st-checkbox" ${s.printShowLogo ? "checked" : ""}>
          </label>

          <label class="st-toggle-item">
            <div class="st-toggle-info">
              <div class="st-ti-title">${ar ? "إظهار مربع توقيع وختم الطبيب المعالج" : "Show Doctor Signature & Official Stamp Box"}</div>
              <div class="st-ti-desc">${ar ? "إضافة مساحة مخصصة لتوقيع الطبيب وختم العيادة في أسفل الفواتير والروشتات." : "Appends an official signature line and clinic stamp placeholder at bottom."}</div>
            </div>
            <input type="checkbox" id="st-show-stamp" class="st-checkbox" ${s.printShowSignatureStamp ? "checked" : ""}>
          </label>

          <label class="st-toggle-item">
            <div class="st-toggle-info">
              <div class="st-ti-title">${ar ? "إظهار رمز الاستجابة السريعة QR للتحقق السريع" : "Show Verification QR Code"}</div>
              <div class="st-ti-desc">${ar ? "توليد كود QR في الفاتورة للتحقق الإلكتروني السريع ورقم الفاتورة." : "Generates a clean QR code embedding invoice verification details."}</div>
            </div>
            <input type="checkbox" id="st-show-qr" class="st-checkbox" ${s.printShowQr ? "checked" : ""}>
          </label>

          <label class="st-toggle-item">
            <div class="st-toggle-info">
              <div class="st-ti-title">${ar ? "إظهار الرقم الضريبي والسجل التجاري في الفواتير" : "Show Tax ID & Commercial Register on Invoices"}</div>
              <div class="st-ti-desc">${ar ? "مهم للمطالبات الضريبية وشركات التأمين الطبي." : "Required for formal tax compliance and dental insurance claims."}</div>
            </div>
            <input type="checkbox" id="st-show-taxcr" class="st-checkbox" ${s.printShowTaxCr ? "checked" : ""}>
          </label>
        </div>

        <div style="margin-top:20px;padding:16px;background:var(--card-subtle);border:1px solid var(--border);border-radius:var(--r-md);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <div>
            <div style="font-size:14px;font-weight:700;color:var(--navy)">${ar ? "معاينة تجريبية فورية للطباعة" : "Live Test Print Preview"}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${ar ? "قم بطباعة نموذج تجريبي كامل لفاتورة وروشتة للتحقق من هوية ومقاس الورق." : "Preview how an invoice and prescription print using your current settings."}</div>
          </div>
          <button type="button" class="small-btn primary" onclick="window.testPrintSettings()" style="flex-shrink:0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            <span>${ar ? "🖨️ طباعة تجريبية للمعاينة" : "Print Test Invoice"}</span>
          </button>
        </div>
      </div>

      <!-- ══════════════════════════════════════════
           TAB 3: PRACTICE GENERAL CUSTOMIZATION
      ══════════════════════════════════════════ -->
      <div id="st-pane-customization" class="st-pane" style="display:${_activeSettingsTab === "customization" ? "block" : "none"}">
        <div class="st-section-title">
          <div class="st-sec-ico" style="background:rgba(16,185,129,0.12);color:#059669">🎨</div>
          <div>
            <div class="st-sec-h">${ar ? "التخصيص العام للعيادة وسير العمل" : "Practice & Workflow Customization"}</div>
            <div class="st-sec-p">${ar ? "فترات المواعيد، بداية الأسبوع، ألوان الواجهة، والنسخ الاحتياطي للنظام." : "Configure calendar slot steps, working days, UI accent color theme, and backup exports."}</div>
          </div>
        </div>

        <input type="hidden" id="st-val-theme-accent" value="${s.themeAccent}">

        <div class="slbl">${ar ? "لون الهوية البصرية للواجهة (Accent Theme)" : "UI Accent Color Theme"}</div>
        <div class="st-colors-row">
          ${Object.keys(THEME_PALETTES).map(k => {
            const pal = THEME_PALETTES[k];
            const isSel = s.themeAccent === k;
            return `
              <div class="st-color-swatch ${isSel ? "selected" : ""}" data-color="${k}" onclick="window.selectAccentColor('${k}')" title="${pal.name}">
                <div class="st-color-circle" style="background:${pal.color}"></div>
                <div class="st-color-name">${pal.name}</div>
              </div>
            `;
          }).join("")}
        </div>

        <div class="st-grid-2" style="margin-top:18px">
          <div class="ff">
            <label>${ar ? "المدة الافتراضية للكشف / الموعد (بالدقائق)" : "Default Appointment Slot Duration"}</label>
            <select id="st-appt-duration">
              <option value="15" ${s.appointmentDuration === 15 ? "selected" : ""}>15 ${ar ? "دقيقة (فحص سريع / غيار)" : "min (Quick review)"}</option>
              <option value="20" ${s.appointmentDuration === 20 ? "selected" : ""}>20 ${ar ? "دقيقة" : "minutes"}</option>
              <option value="30" ${s.appointmentDuration === 30 ? "selected" : ""}>30 ${ar ? "دقيقة (موعد قياسي)" : "min (Standard)"}</option>
              <option value="45" ${s.appointmentDuration === 45 ? "selected" : ""}>45 ${ar ? "دقيقة (جلسة حشو عصب أو علاج لثوي)" : "min (Endo / Perio)"}</option>
              <option value="60" ${s.appointmentDuration === 60 ? "selected" : ""}>60 ${ar ? "دقيقة (جراحة / زراعة / تجميل)" : "min (Surgery / Implant)"}</option>
            </select>
          </div>
          <div class="ff">
            <label>${ar ? "الحالة التلقائية عند حجز موعد جديد" : "Default New Booking Status"}</label>
            <select id="st-default-status">
              <option value="scheduled" ${s.defaultApptStatus === "scheduled" ? "selected" : ""}>${ar ? "مجدول (Scheduled)" : "Scheduled"}</option>
              <option value="confirmed" ${s.defaultApptStatus === "confirmed" ? "selected" : ""}>${ar ? "مؤكد فوراً (Confirmed)" : "Confirmed"}</option>
            </select>
          </div>
        </div>

        <div class="st-grid-3">
          <div class="ff">
            <label>${ar ? "بداية أسبوع العمل في الجدول" : "Week Starts On"}</label>
            <select id="st-week-start">
              <option value="saturday" ${s.weekStartDay === "saturday" ? "selected" : ""}>${ar ? "السبت (Saturday)" : "Saturday"}</option>
              <option value="sunday" ${s.weekStartDay === "sunday" ? "selected" : ""}>${ar ? "الأحد (Sunday)" : "Sunday"}</option>
              <option value="monday" ${s.weekStartDay === "monday" ? "selected" : ""}>${ar ? "الإثنين (Monday)" : "Monday"}</option>
            </select>
          </div>
          <div class="ff">
            <label>${ar ? "بدء ساعات العمل اليومية" : "Work Hours Start"}</label>
            <input type="time" id="st-work-start" value="${s.workHoursStart || "10:00"}">
          </div>
          <div class="ff">
            <label>${ar ? "انتهاء ساعات العمل اليومية" : "Work Hours End"}</label>
            <input type="time" id="st-work-end" value="${s.workHoursEnd || "22:00"}">
          </div>
        </div>

        <div class="st-toggles-list" style="margin-top:12px">
          <label class="st-toggle-item">
            <div class="st-toggle-info">
              <div class="st-ti-title">${ar ? "تفعيل التنبيهات الصوتية الحية للنظام" : "Sound Alerts for Patient Check-in"}</div>
              <div class="st-ti-desc">${ar ? "تشغيل رنة هادئة لطيفة عند تأكيد حضور مريض بالعيادة أو إضافة موعد جديد." : "Plays an audible notification chime upon patient arrival and appointments."}</div>
            </div>
            <input type="checkbox" id="st-sound-alerts" class="st-checkbox" ${s.soundAlerts ? "checked" : ""}>
          </label>
        </div>

        <div class="slbl" style="margin-top:24px">${ar ? "إدارة النسخ الاحتياطية للإعدادات" : "Settings Backup & Portability"}</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button type="button" class="small-btn" onclick="window.exportSettingsJson()" style="background:var(--surface);border:1px solid var(--border)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>${ar ? "💾 تصدير إعدادات العيادة (JSON)" : "Export Settings JSON"}</span>
          </button>

          <label class="small-btn" style="background:var(--surface);border:1px solid var(--border);cursor:pointer;display:inline-flex;align-items:center;gap:6px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>${ar ? "📂 استيراد إعدادات من ملف" : "Import Settings File"}</span>
            <input type="file" accept=".json" style="display:none" onchange="window.importSettingsJson(event)">
          </label>

          <button type="button" class="small-btn" onclick="window.resetSettingsToDefault()" style="background:#fee2e2;color:#b91c1c;border-color:#fca5a5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <span>${ar ? "استعادة الإعدادات الأصلية" : "Reset Defaults"}</span>
          </button>
        </div>
      </div>

      <!-- Sticky Save Bar at bottom of Sheet -->
      <div class="st-bottom-bar">
        <button type="button" class="st-btn-secondary" onclick="window.closeSheet('settings')">
          ${ar ? "إغلاق" : "Close"}
        </button>
        <button type="submit" class="st-btn-save">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          <span>${ar ? "💾 حفظ وتطبيق جميع الإعدادات" : "Save & Apply Settings"}</span>
        </button>
      </div>
    </form>
  `;
}

export function saveClinicSettingsFromUI(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();

  const ar = isAr();
  const getVal = (id, def = "") => document.getElementById(id)?.value ?? def;
  const getCheck = (id, def = false) => {
    const el = document.getElementById(id);
    return el ? el.checked : def;
  };

  const current = getClinicSettings();
  const currencyCode = getVal("st-currency", current.currency);
  const currencySymbols = {
    EGP: { ar: "ج.م", en: "EGP" },
    SAR: { ar: "ر.س", en: "SAR" },
    AED: { ar: "د.إ", en: "AED" },
    USD: { ar: "$", en: "USD" },
    KWD: { ar: "د.ك", en: "KWD" }
  };
  const sym = currencySymbols[currencyCode] || { ar: currencyCode, en: currencyCode };

  const updated = {
    // 1. Company
    clinicNameAr: getVal("st-clinic-name-ar", current.clinicNameAr).trim() || DEFAULT_SETTINGS.clinicNameAr,
    clinicNameEn: getVal("st-clinic-name-en", current.clinicNameEn).trim() || DEFAULT_SETTINGS.clinicNameEn,
    clinicTaglineAr: getVal("st-clinic-tagline-ar", current.clinicTaglineAr).trim(),
    doctorName: getVal("st-doctor-name", current.doctorName).trim(),
    doctorTitle: getVal("st-doctor-title", current.doctorTitle).trim(),
    doctorLicense: getVal("st-doctor-license", current.doctorLicense).trim(),
    phonePrimary: getVal("st-phone-1", current.phonePrimary).trim(),
    phoneSecondary: getVal("st-phone-2", current.phoneSecondary).trim(),
    whatsappNumber: getVal("st-whatsapp", current.whatsappNumber).trim(),
    emailAddress: getVal("st-email", current.emailAddress).trim(),
    clinicAddress: getVal("st-address", current.clinicAddress).trim(),
    crNumber: getVal("st-cr", current.crNumber).trim(),
    taxNumber: getVal("st-tax", current.taxNumber).trim(),
    currency: currencyCode,
    currencySymbolAr: sym.ar,
    currencySymbolEn: sym.en,

    // 2. Print
    printPaperSize: getVal("st-val-paper-size", current.printPaperSize),
    printHeaderNote: getVal("st-print-header", current.printHeaderNote).trim(),
    printFooterNote: getVal("st-print-footer", current.printFooterNote).trim(),
    prescriptionAdvice: getVal("st-prescription-advice", current.prescriptionAdvice).trim(),
    printShowLogo: getCheck("st-show-logo", current.printShowLogo),
    printShowSignatureStamp: getCheck("st-show-stamp", current.printShowSignatureStamp),
    printShowQr: getCheck("st-show-qr", current.printShowQr),
    printShowTaxCr: getCheck("st-show-taxcr", current.printShowTaxCr),

    // 3. Customization
    themeAccent: getVal("st-val-theme-accent", current.themeAccent),
    appointmentDuration: parseInt(getVal("st-appt-duration", current.appointmentDuration), 10) || 30,
    defaultApptStatus: getVal("st-default-status", current.defaultApptStatus),
    weekStartDay: getVal("st-week-start", current.weekStartDay),
    workHoursStart: getVal("st-work-start", current.workHoursStart),
    workHoursEnd: getVal("st-work-end", current.workHoursEnd),
    soundAlerts: getCheck("st-sound-alerts", current.soundAlerts)
  };

  saveClinicSettings(updated);
  toast(ar ? "تم حفظ إعدادات العيادة بنجاح وتحديث النظام ✓" : "Clinic settings saved and applied successfully ✓");
}

export function resetSettingsToDefault() {
  const ar = isAr();
  if (confirm(ar ? "هل أنت متأكد من استعادة كافة إعدادات العيادة إلى الوضع الافتراضي الأصلي؟" : "Reset all clinic settings to original defaults?")) {
    saveClinicSettings(DEFAULT_SETTINGS);
    initSettingsSheet();
    toast(ar ? "تمت استعادة الإعدادات الافتراضية بنجاح ✓" : "Settings restored to defaults ✓");
  }
}

export function exportSettingsJson() {
  const s = getClinicSettings();
  const jsonStr = JSON.stringify(s, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zain-clinic-settings-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast(isAr() ? "تم تصدير ملف الإعدادات بنجاح 📁" : "Settings exported as JSON 📁");
}

export function importSettingsJson(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (typeof parsed === "object") {
        saveClinicSettings(parsed);
        initSettingsSheet();
        toast(isAr() ? "تم استيراد إعدادات العيادة وتطبيقها بنجاح ✓" : "Settings imported successfully ✓");
      }
    } catch (err) {
      toast(isAr() ? "الملف غير صالح أو تالف ✗" : "Invalid JSON file ✗");
    }
  };
  reader.readAsText(file);
}

// Live Test Print Generator
export function testPrintSettings() {
  const s = getClinicSettings();
  const ar = isAr();
  const curSym = ar ? s.currencySymbolAr : s.currencySymbolEn;
  const isThermal = s.printPaperSize === "thermal80";

  let printContainer = document.getElementById("st-test-print-container");
  if (!printContainer) {
    printContainer = document.createElement("div");
    printContainer.id = "st-test-print-container";
    document.body.appendChild(printContainer);
  }

  printContainer.className = isThermal ? "print-thermal80-sample" : "print-a4-sample";
  printContainer.innerHTML = `
    <div class="test-print-wrapper" style="font-family:inherit;color:#111827;padding:${isThermal ? "8px" : "28px"};max-width:${isThermal ? "76mm" : "210mm"};margin:0 auto">
      <!-- Header -->
      <div style="border-bottom:2px solid ${s.themeAccent ? (THEME_PALETTES[s.themeAccent]?.color || "#0EA5A4") : "#0EA5A4"};padding-bottom:12px;margin-bottom:14px;text-align:center">
        ${s.printShowLogo ? `
          <div style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:10px;background:${THEME_PALETTES[s.themeAccent]?.color || "#0EA5A4"};color:#FFF;margin-bottom:8px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="26" height="26" stroke-width="2"><path d="M12 3C9.8 3 8 4.3 7.5 6C6.7 5.5 5.5 5.6 4.8 6.5C4 7.5 4.5 9 5.3 9.8C5.6 10.1 5.7 10.5 5.7 11C5.7 14 7.5 17 9.2 18.8L9.7 20.5C9.9 21.4 10.6 22 11.5 22H12.5C13.4 22 14.1 21.4 14.3 20.5L14.8 18.8C16.5 17 18.3 14 18.3 11C18.3 10.5 18.4 10.1 18.7 9.8C19.5 9 20 7.5 19.2 6.5C18.5 5.6 17.3 5.5 16.5 6C16 4.3 14.2 3 12 3Z"/></svg>
          </div>
        ` : ""}
        <div style="font-size:${isThermal ? "15px" : "20px"};font-weight:800;color:#0B2545">${esc(ar ? s.clinicNameAr : s.clinicNameEn)}</div>
        <div style="font-size:${isThermal ? "11px" : "13px"};color:#4B5563;margin-top:2px">${esc(s.doctorName)} · ${esc(s.doctorTitle)}</div>
        ${s.printHeaderNote ? `<div style="font-size:11px;color:#6B7280;margin-top:4px">${esc(s.printHeaderNote)}</div>` : ""}
        <div style="font-size:11px;color:#6B7280;margin-top:4px">📞 ${esc(s.phonePrimary)} · 📍 ${esc(s.clinicAddress)}</div>
        ${s.printShowTaxCr ? `<div style="font-size:10px;color:#9CA3AF;margin-top:2px">السجل التجاري: ${esc(s.crNumber)} · البطاقة الضريبية: ${esc(s.taxNumber)}</div>` : ""}
      </div>

      <!-- Invoice Title & Meta -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;font-size:12px">
        <div><strong>${ar ? "فاتورة علاجية تجريبية" : "Test Treatment Receipt"}</strong>: #INV-TEST-001</div>
        <div>${new Date().toLocaleDateString(ar ? "ar-EG" : "en-US")}</div>
      </div>
      <div style="background:#F9FAFB;padding:8px 10px;border-radius:6px;font-size:12px;margin-bottom:12px">
        <div><strong>المريض:</strong> سارة أحمد محمود (ملف #1042)</div>
        <div><strong>الطبيب المعالج:</strong> ${esc(s.doctorName)}</div>
      </div>

      <!-- Items Table -->
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:14px">
        <thead>
          <tr style="border-bottom:1px solid #D1D5DB;text-align:${ar ? "right" : "left"};background:#F3F4F6">
            <th style="padding:6px">${ar ? "الخدمة / الإجراء" : "Procedure"}</th>
            <th style="padding:6px;text-align:center">${ar ? "الكمية" : "Qty"}</th>
            <th style="padding:6px;text-align:${ar ? "left" : "right"}">${ar ? "المبلغ" : "Amount"}</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #E5E7EB">
            <td style="padding:6px">كشف وتشخيص رقمي واستشارة طبية</td>
            <td style="padding:6px;text-align:center">1</td>
            <td style="padding:6px;text-align:${ar ? "left" : "right"}">250.00 ${curSym}</td>
          </tr>
          <tr style="border-bottom:1px solid #E5E7EB">
            <td style="padding:6px">حشو تجميلي كومبوزيت نانو هيبريد (سن 24)</td>
            <td style="padding:6px;text-align:center">1</td>
            <td style="padding:6px;text-align:${ar ? "left" : "right"}">650.00 ${curSym}</td>
          </tr>
          <tr style="border-bottom:1px solid #E5E7EB">
            <td style="padding:6px">تنظيف وتلميع أسنان وإزالة جير بالموجات فوق الصوتية</td>
            <td style="padding:6px;text-align:center">1</td>
            <td style="padding:6px;text-align:${ar ? "left" : "right"}">500.00 ${curSym}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr style="font-weight:800;font-size:13px;border-top:2px solid #111827">
            <td style="padding:8px 6px">${ar ? "الإجمالي المستحق" : "Total Amount"}</td>
            <td></td>
            <td style="padding:8px 6px;text-align:${ar ? "left" : "right"};color:#0B2545">1,400.00 ${curSym}</td>
          </tr>
          <tr style="color:#059669;font-weight:700">
            <td style="padding:4px 6px">${ar ? "المدفوع نقداً (مسدد بالكامل)" : "Paid in Cash"}</td>
            <td></td>
            <td style="padding:4px 6px;text-align:${ar ? "left" : "right"}">1,400.00 ${curSym}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Prescription Section -->
      <div style="border-top:1px dashed #D1D5DB;padding-top:10px;margin-bottom:14px">
        <div style="font-weight:700;font-size:12px;margin-bottom:4px">💊 روشتة وتعليمات طبية للمريض:</div>
        <div style="font-size:11px;color:#374151;line-height:1.5">${esc(s.prescriptionAdvice)}</div>
      </div>

      <!-- Footer & Signatures -->
      <div style="margin-top:16px;font-size:11px;color:#6B7280;text-align:center;border-top:1px solid #E5E7EB;padding-top:10px">
        <div>${esc(s.printFooterNote)}</div>
      </div>

      ${s.printShowSignatureStamp ? `
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:28px;padding:0 20px">
          <div style="text-align:center">
            <div style="font-size:11px;color:#6B7280;margin-bottom:30px">${ar ? "ختم العيادة المعتمد" : "Clinic Stamp"}</div>
            <div style="border-top:1px dotted #9CA3AF;width:120px"></div>
          </div>
          <div style="text-align:center">
            <div style="font-size:11px;color:#6B7280;margin-bottom:30px">${ar ? "توقيع الطبيب المعالج" : "Doctor's Signature"}</div>
            <div style="border-top:1px dotted #9CA3AF;width:120px;font-weight:700">${esc(s.doctorName)}</div>
          </div>
        </div>
      ` : ""}
    </div>
  `;

  document.body.classList.add("printing-test-sample");
  window.print();
  setTimeout(() => {
    document.body.classList.remove("printing-test-sample");
  }, 1000);
}

export async function printInvoiceFromSettings(invId) {
  const s = getClinicSettings();
  const ar = isAr();
  const { sb } = await import('./app.js');

  const [{ data: inv }, { data: items }, { data: pmts }] = await Promise.all([
    sb.from("invoices").select("*").eq("id", invId).single(),
    sb.from("invoice_items").select("*").eq("invoice_id", invId),
    sb.from("payments").select("*").eq("invoice_id", invId).order("created_at"),
  ]);

  if (!inv) {
    toast(ar ? "تعذر العثور على الفاتورة ✗" : "Invoice not found ✗");
    return;
  }

  const curSym = ar ? s.currencySymbolAr : s.currencySymbolEn;
  const isThermal = s.printPaperSize === "thermal80";
  const total = Number(inv.total_amount || 0);
  const paid = Number(inv.paid_amount || 0);
  const remaining = Math.max(0, total - paid);

  let printContainer = document.getElementById("st-test-print-container");
  if (!printContainer) {
    printContainer = document.createElement("div");
    printContainer.id = "st-test-print-container";
    document.body.appendChild(printContainer);
  }

  printContainer.className = isThermal ? "print-thermal80-sample" : "print-a4-sample";
  printContainer.innerHTML = `
    <div class="test-print-wrapper" style="font-family:inherit;color:#111827;padding:${isThermal ? "8px" : "28px"};max-width:${isThermal ? "76mm" : "210mm"};margin:0 auto">
      <div style="border-bottom:2px solid ${THEME_PALETTES[s.themeAccent]?.color || "#0EA5A4"};padding-bottom:12px;margin-bottom:14px;text-align:center">
        ${s.printShowLogo ? `
          <div style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:10px;background:${THEME_PALETTES[s.themeAccent]?.color || "#0EA5A4"};color:#FFF;margin-bottom:6px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24" stroke-width="2"><path d="M12 3C9.8 3 8 4.3 7.5 6C6.7 5.5 5.5 5.6 4.8 6.5C4 7.5 4.5 9 5.3 9.8C5.6 10.1 5.7 10.5 5.7 11C5.7 14 7.5 17 9.2 18.8L9.7 20.5C9.9 21.4 10.6 22 11.5 22H12.5C13.4 22 14.1 21.4 14.3 20.5L14.8 18.8C16.5 17 18.3 14 18.3 11C18.3 10.5 18.4 10.1 18.7 9.8C19.5 9 20 7.5 19.2 6.5C18.5 5.6 17.3 5.5 16.5 6C16 4.3 14.2 3 12 3Z"/></svg>
          </div>
        ` : ""}
        <div style="font-size:${isThermal ? "15px" : "19px"};font-weight:800;color:#0B2545">${esc(ar ? s.clinicNameAr : s.clinicNameEn)}</div>
        <div style="font-size:11px;color:#4B5563;margin-top:2px">${esc(s.doctorName)} · ${esc(s.doctorTitle)}</div>
        ${s.printHeaderNote ? `<div style="font-size:11px;color:#6B7280;margin-top:3px">${esc(s.printHeaderNote)}</div>` : ""}
        <div style="font-size:10.5px;color:#6B7280;margin-top:3px">📞 ${esc(s.phonePrimary)} · 📍 ${esc(s.clinicAddress)}</div>
        ${s.printShowTaxCr ? `<div style="font-size:10px;color:#9CA3AF;margin-top:2px">س.ت: ${esc(s.crNumber)} · ب.ض: ${esc(s.taxNumber)}</div>` : ""}
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:11.5px">
        <div><strong>فاتورة:</strong> ${esc(inv.invoice_number || "#" + invId)}</div>
        <div>${inv.issue_date || ""}</div>
      </div>
      <div style="background:#F9FAFB;padding:8px 10px;border-radius:6px;font-size:12px;margin-bottom:12px">
        <div><strong>المريض:</strong> ${esc(inv.patient_name || "")}</div>
        <div><strong>حالة السداد:</strong> ${inv.status === 'paid' ? 'مدفوعة بالكامل' : inv.status === 'partial' ? 'مسدد جزئياً' : 'غير مدفوعة'}</div>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:14px">
        <thead>
          <tr style="border-bottom:1px solid #D1D5DB;text-align:${ar ? "right" : "left"};background:#F3F4F6">
            <th style="padding:6px">${ar ? "الخدمة / الإجراء" : "Item"}</th>
            <th style="padding:6px;text-align:center">${ar ? "العدد" : "Qty"}</th>
            <th style="padding:6px;text-align:${ar ? "left" : "right"}">${ar ? "المبلغ" : "Price"}</th>
          </tr>
        </thead>
        <tbody>
          ${(items || []).map(it => `
            <tr style="border-bottom:1px solid #E5E7EB">
              <td style="padding:6px">${esc(it.description)}</td>
              <td style="padding:6px;text-align:center">${it.quantity || 1}</td>
              <td style="padding:6px;text-align:${ar ? "left" : "right"}">${Number(it.total_price || 0).toLocaleString()} ${curSym}</td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr style="font-weight:800;font-size:13px;border-top:2px solid #111827">
            <td style="padding:6px">${ar ? "الإجمالي" : "Total"}</td>
            <td></td>
            <td style="padding:6px;text-align:${ar ? "left" : "right"};color:#0B2545">${total.toLocaleString()} ${curSym}</td>
          </tr>
          <tr style="color:#059669;font-weight:700">
            <td style="padding:4px 6px">${ar ? "المسدد" : "Paid"}</td>
            <td></td>
            <td style="padding:4px 6px;text-align:${ar ? "left" : "right"}">${paid.toLocaleString()} ${curSym}</td>
          </tr>
          ${remaining > 0 ? `
            <tr style="color:#DC2626;font-weight:700">
              <td style="padding:4px 6px">${ar ? "المتبقي" : "Balance Due"}</td>
              <td></td>
              <td style="padding:4px 6px;text-align:${ar ? "left" : "right"}">${remaining.toLocaleString()} ${curSym}</td>
            </tr>
          ` : ""}
        </tfoot>
      </table>

      ${inv.notes ? `
        <div style="font-size:11px;color:#4B5563;margin-bottom:10px"><strong>ملاحظات:</strong> ${esc(inv.notes)}</div>
      ` : ""}

      <div style="margin-top:14px;font-size:10.5px;color:#6B7280;text-align:center;border-top:1px solid #E5E7EB;padding-top:8px">
        <div>${esc(s.printFooterNote)}</div>
      </div>

      ${s.printShowSignatureStamp ? `
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:24px;padding:0 10px">
          <div style="text-align:center">
            <div style="font-size:10.5px;color:#6B7280;margin-bottom:24px">${ar ? "ختم العيادة" : "Clinic Stamp"}</div>
            <div style="border-top:1px dotted #9CA3AF;width:100px"></div>
          </div>
          <div style="text-align:center">
            <div style="font-size:10.5px;color:#6B7280;margin-bottom:24px">${ar ? "توقيع الطبيب" : "Doctor Signature"}</div>
            <div style="border-top:1px dotted #9CA3AF;width:100px;font-weight:700;font-size:11px">${esc(s.doctorName)}</div>
          </div>
        </div>
      ` : ""}
    </div>
  `;

  document.body.classList.add("printing-test-sample");
  window.print();
  setTimeout(() => {
    document.body.classList.remove("printing-test-sample");
  }, 1000);
}

