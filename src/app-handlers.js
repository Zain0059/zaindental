import {
  sb, SC, SL, MONTHS, USER, sha256, toothOpts, toast, esc, age, fmt, today, toEG, sendWA,
  getCurrentUser, setCurrentUser, isAdmin
} from './app.js';
import { t, isAr, applyLangToDOM } from './i18n.js';
import { loadQueue, loadInvoices, loadRecentPats, loadProcs } from './app-features.js';
import { loadRecentClinical, loadServices, loadStaffMgmt, loadExpenses, loadReports } from './app-clinical-more.js';

let _niPatId = null, _naPatId = null, _clPatId = null, _invFilter = "all";
let _niItems = [], _procs = [], _naMode = "existing";
let _tmrs = {};
let _editPatId = null, _editInvId = null, _editTxId = null, _editStfId = null, _editSvcId = null, _editExpId = null;
let _allInvoices = [], _invToday = true;
let _editInvItems = [], _editInvOrigItems = [];
let _scanImgB64 = null, _scanImgMime = null, _scanImg2B64 = null, _scanImg2Mime = null;
let _activeTab = "sched";

export function getCurrentActiveTab() {
  return _activeTab;
}

export function refreshCurrentView() {
  const currentUser = getCurrentUser();
  const hdrUser = document.getElementById("hdr-user");
  if (hdrUser) hdrUser.textContent = currentUser?.full_name || (isAr() ? "د. عبد الله زين" : "Dr. Abdullah Zain");
  
  const sbUser = document.getElementById("sb-user-name");
  if (sbUser) sbUser.textContent = currentUser?.full_name || (isAr() ? "د. عبد الله زين" : "Dr. Abdullah Zain");
  
  const sbRole = document.getElementById("sb-user-role");
  if (sbRole) {
    const r = currentUser?.role || "admin";
    sbRole.textContent = isAr() ? (r === 'admin' ? 'مدير النظام' : r === 'dentist' ? 'طبيب أسنان' : r === 'assistant' ? 'مساعد طبيب' : 'استقبال') : r.toUpperCase();
  }

  sw(_activeTab);
}

// Authentication
export async function doLogin() {
  const btn = document.getElementById("lbtn"), err = document.getElementById("lerr");
  const u = document.getElementById("lu")?.value.trim(), p = document.getElementById("lp")?.value;
  if (!u || !p) {
    if (err) err.textContent = isAr() ? "يرجى إدخال اسم المستخدم وكلمة المرور" : "Please enter username and password";
    return;
  }
  if (btn) { btn.textContent = isAr() ? "جاري تسجيل الدخول…" : "Signing in…"; btn.disabled = true; }
  if (err) err.textContent = "";

  try {
    const hash = await sha256(p);
    const { data, error } = await sb.from("staff").select("*").eq("username", u).eq("password_hash", hash).eq("is_active", true).single();
    if (error || !data) {
      if (err) err.textContent = isAr() ? "اسم المستخدم أو كلمة المرور غير صحيحة" : "Invalid username or password";
      if (btn) { btn.textContent = isAr() ? "تسجيل الدخول للنظام" : "Sign In to Portal"; btn.disabled = false; }
      return;
    }
    setCurrentUser(data);
    showApp();
  } catch (e) {
    console.error("Login attempt failed:", e);
    if (err) err.textContent = isAr() ? "خطأ في الاتصال، يرجى التحقق من الشبكة" : "Connection error. Please check your network connection.";
    if (btn) { btn.textContent = isAr() ? "تسجيل الدخول للنظام" : "Sign In to Portal"; btn.disabled = false; }
  }
}

export function doLogout() {
  setCurrentUser(null);
  location.reload();
}

export function togglePassword() {
  const input = document.getElementById("lp");
  if (input) {
    input.type = input.type === "password" ? "text" : "password";
  }
}

export function showApp() {
  const currentUser = getCurrentUser();
  const loginEl = document.getElementById("login");
  const appEl = document.getElementById("app");
  if (loginEl) loginEl.style.display = "none";
  if (appEl) appEl.style.display = "flex";

  const hdrUser = document.getElementById("hdr-user");
  if (hdrUser) hdrUser.textContent = currentUser?.full_name || (isAr() ? "د. عبد الله سامي زين" : "Dr. Abdullah Zain");
  
  const sbUser = document.getElementById("sb-user-name");
  if (sbUser) sbUser.textContent = currentUser?.full_name || (isAr() ? "د. عبد الله سامي زين" : "Dr. Abdullah Zain");
  
  const sbRole = document.getElementById("sb-user-role");
  if (sbRole) {
    const r = currentUser?.role || "admin";
    sbRole.textContent = isAr() ? (r === 'admin' ? 'مدير النظام' : r === 'dentist' ? 'طبيب أسنان' : r === 'assistant' ? 'مساعد طبيب' : 'استقبال') : r.toUpperCase();
  }

  const sbAvatar = document.getElementById("sb-user-avatar");
  if (sbAvatar && currentUser?.full_name) {
    sbAvatar.textContent = currentUser.full_name[0].toUpperCase();
  }

  const schedDt = document.getElementById("sched-dt");
  if (schedDt) schedDt.value = today();

  const isAdminUser = isAdmin();
  
  // Admin-only buttons in More menu
  const btnReports = document.getElementById("btn-reports");
  const btnStaff = document.getElementById("btn-staff");
  const btnExpenses = document.getElementById("btn-expenses");
  if (btnReports) btnReports.style.display = isAdminUser ? "flex" : "none";
  if (btnStaff) btnStaff.style.display = isAdminUser ? "flex" : "none";
  if (btnExpenses) btnExpenses.style.display = isAdminUser ? "flex" : "none";

  // Admin-only items in Sidebar
  const sbReports = document.getElementById("sb-item-reports");
  const sbStaff = document.getElementById("sb-item-staff");
  const sbExpenses = document.getElementById("sb-item-expenses");
  if (sbReports) sbReports.style.display = isAdminUser ? "flex" : "none";
  if (sbStaff) sbStaff.style.display = isAdminUser ? "flex" : "none";
  if (sbExpenses) sbExpenses.style.display = isAdminUser ? "flex" : "none";

  loadProcs();
  sw("sched");
}

// Navigation
export function sw(tab) {
  _activeTab = tab;
  ["sched", "queue", "patients", "billing", "clinical", "more"].forEach(t => {
    const el = document.getElementById("t-" + t);
    if (el) el.style.display = t === tab ? "block" : "none";
    const nb = document.querySelector(`.nb[data-t="${t}"]`);
    if (nb) nb.classList.toggle("on", t === tab);
    const sbItem = document.querySelector(`.sidebar-item[data-t="${t}"]`);
    if (sbItem) sbItem.classList.toggle("on", t === tab);
  });

  const titles = isAr() ? {
    sched: "الجدول الزمني والمواعيد",
    queue: "قائمة الانتظار والحضور",
    patients: "دليل وسجلات المرضى",
    billing: "الفواتير والحسابات المالية",
    clinical: "مخطط الأسنان والسجل الطبي",
    more: "إدارة العيادة والمزيد"
  } : {
    sched: "Schedule & Appointments",
    queue: "Live Clinic Overview",
    patients: "Patient Directory",
    billing: "Billing & Invoices",
    clinical: "Dental Chart & Clinical",
    more: "Practice Management"
  };

  const titleEl = document.getElementById("hdr-title-text");
  if (titleEl) titleEl.textContent = titles[tab] || (isAr() ? "عيادة زين لطب الأسنان" : "Zain Dental Clinic");

  if (tab === "sched") loadSched();
  if (tab === "queue") loadQueue();
  if (tab === "billing") loadInvoices();
  if (tab === "patients") {
    const qEl = document.getElementById("pat-q");
    if (qEl) qEl.value = "";
    loadRecentPats();
  }
  if (tab === "clinical") {
    const clQ = document.getElementById("cl-q");
    if (clQ) clQ.value = "";
    loadRecentClinical();
  }
}

export function openSheet(name) {
  const adminOnlySheets = ['reports', 'staff-mgmt', 'expenses'];
  if (adminOnlySheets.includes(name) && !isAdmin()) {
    toast(isAr() ? "هذا القسم مخصص للمدير فقط 🔒" : "Access restricted — Admin only 🔒");
    return;
  }
  const sh = document.getElementById("sh-" + name);
  if (sh) sh.classList.add("open");
  if (name === "reports") loadReports();
  if (name === "services") loadServices();
  if (name === "staff-mgmt") loadStaffMgmt();
  if (name === "expenses") {
    const expM = document.getElementById("exp-month");
    if (expM && !expM.value) expM.value = today().slice(0, 7);
    loadExpenses();
  }
}

export function closeSheet(name) {
  const sh = document.getElementById("sh-" + name);
  if (sh) sh.classList.remove("open");
}

// Schedule & Appointments
export function schedPrevDay() {
  const dtEl = document.getElementById("sched-dt");
  const current = dtEl?.value ? new Date(dtEl.value) : new Date();
  current.setDate(current.getDate() - 1);
  if (dtEl) dtEl.value = current.toISOString().slice(0, 10);
  loadSched();
}

export function schedNextDay() {
  const dtEl = document.getElementById("sched-dt");
  const current = dtEl?.value ? new Date(dtEl.value) : new Date();
  current.setDate(current.getDate() + 1);
  if (dtEl) dtEl.value = current.toISOString().slice(0, 10);
  loadSched();
}

export function schedToday() {
  const dtEl = document.getElementById("sched-dt");
  if (dtEl) dtEl.value = today();
  loadSched();
}

export async function loadSched() {
  const dtEl = document.getElementById("sched-dt");
  const dt = dtEl && dtEl.value ? dtEl.value : today();
  if (dtEl && !dtEl.value) dtEl.value = dt;

  // Dynamic greeting
  const hr = new Date().getHours();
  const timeOfDay = isAr() ? (hr < 12 ? "صباح الخير" : "مساء الخير") : (hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening");
  const greetingEl = document.getElementById("sched-greeting");
  if (greetingEl) {
    const user = getCurrentUser();
    const uName = user?.full_name || (isAr() ? "د. عبد الله" : "Dr. Abdullah");
    greetingEl.textContent = isAr() ? `${timeOfDay}، ${uName} 👋` : `${timeOfDay}, ${uName} 👋`;
  }
  const subEl = document.getElementById("sched-subtitle");
  if (subEl) {
    subEl.textContent = isAr() ? "إليك ملخص ما يحدث في عيادتك اليوم." : "Here is what is happening in your clinic today.";
  }

  const el = document.getElementById("sched-list");
  if (!el) return;
  el.innerHTML = '<div class="ldg"><div class="spin"></div></div>';

  const [
    { data, error },
    { count: patCount },
    { data: allInvs }
  ] = await Promise.all([
    sb.from("appointments").select("*,patients(first_name,last_name,phone)").eq("appointment_date", dt).order("appointment_time"),
    sb.from("patients").select("*", { count: 'exact', head: true }),
    sb.from("invoices").select("total_amount,paid_amount,status,issue_date,created_at").limit(300)
  ]);

  if (error) {
    el.innerHTML = `<div class="empty">${isAr() ? "تعذر تحميل المواعيد" : "Failed to load appointments"}</div>`;
    return;
  }

  const visible = (data || []).filter(a => a.status !== 'cancelled');
  const totalAppts = visible.length;
  const confirmedOrDone = visible.filter(a => a.status === 'confirmed' || a.status === 'completed').length;
  
  // Find next upcoming appointment
  const nowTime = new Date().toTimeString().slice(0, 5);
  const isSelectedToday = dt === today();
  const nextAppt = isSelectedToday 
    ? visible.find(a => (a.appointment_time || "").slice(0, 5) >= nowTime && a.status !== 'completed') || visible[0]
    : visible[0];

  // Financial Metrics Calculation
  const currentMonthPrefix = today().slice(0, 7);
  let monthlyCollected = 0, outstanding = 0;
  (allInvs || []).forEach(inv => {
    if ((inv.issue_date && inv.issue_date.startsWith(currentMonthPrefix)) || (inv.created_at && inv.created_at.startsWith(currentMonthPrefix))) {
      monthlyCollected += (+inv.paid_amount || 0);
    }
    const rem = Math.max(0, (+inv.total_amount || 0) - (+inv.paid_amount || 0));
    outstanding += rem;
  });

  // Render Hero Banner
  const heroEl = document.getElementById("sched-overview-hero");
  if (heroEl) {
    const dObj = new Date(dt + "T00:00:00");
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    const dateFormatted = dObj.toLocaleDateString(isAr() ? 'ar-EG' : 'en-US', options);

    heroEl.innerHTML = `
      <div class="today-hero-card">
        <div class="hero-top">
          <div>
            <div style="font-size:16px;font-weight:700;letter-spacing:-0.2px">${isAr() ? "نظرة عامة على مواعيد العيادة اليوم" : "Today's Clinic Overview"}</div>
            <div style="font-size:12px;color:#94A3B8;margin-top:2px">${isAr() ? "متابعة المواعيد والتدفق الفعلي للمرضى" : "Real-time schedule & patient flow"}</div>
          </div>
          <div class="hero-date-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="13" height="13" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            <span>${dateFormatted}</span>
          </div>
        </div>
        <div class="hero-stats-grid">
          <div class="hero-stat-item">
            <div class="hero-stat-val">${totalAppts}</div>
            <div class="hero-stat-lbl">${isAr() ? "مواعيد اليوم" : "Appointments Today"}</div>
          </div>
          <div class="hero-stat-item">
            <div class="hero-stat-val" style="color:var(--teal-light)">${confirmedOrDone}</div>
            <div class="hero-stat-lbl">${isAr() ? "حضور مؤكد / تم الفحص" : "Confirmed / Done"}</div>
          </div>
          <div class="hero-stat-item" style="grid-column: span 2">
            <div style="font-size:11px;color:#94A3B8;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;font-weight:700">${isAr() ? "الموعد القادم التالي" : "Next Upcoming Appointment"}</div>
            <div style="font-size:13px;font-weight:700;color:#FFFFFF;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;direction:${isAr() ? 'rtl' : 'ltr'};text-align:${isAr() ? 'right' : 'left'}">
              ${nextAppt ? `⏱ ${(nextAppt.appointment_time || "").slice(0, 5)} · ${esc(nextAppt.patients?.first_name ? nextAppt.patients.first_name + ' ' + (nextAppt.patients.last_name || '') : nextAppt.patient_name || (isAr() ? 'مريض' : 'Patient'))} (${esc(nextAppt.appt_type || (isAr() ? 'كشف عام' : 'General Treatment'))})` : (isAr() ? 'لا توجد مواعيد قادمة مجدولة' : 'No upcoming appointments scheduled')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Render Key Practice Metrics Grid
  const metricsEl = document.getElementById("sched-metrics-grid");
  if (metricsEl) {
    if (isAdmin()) {
      metricsEl.innerHTML = `
        <div class="sg">
          <div class="sc sc-featured">
            <div class="sc-ico" style="--ac:var(--teal)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg></div>
            <div class="sc-val">${patCount || 0}</div>
            <div class="sc-lbl">${isAr() ? "إجمالي المرضى المسجلين" : "Total Registered Patients"}</div>
          </div>
          <div class="sc">
            <div class="sc-ico" style="--ac:var(--info)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></div>
            <div class="sc-val">${totalAppts}</div>
            <div class="sc-lbl">${isAr() ? "زيارات هذا اليوم" : "Visits on This Date"}</div>
          </div>
          <div class="sc">
            <div class="sc-ico" style="--ac:var(--success)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
            <div class="sc-val" style="color:var(--success)">${fmt(monthlyCollected)}</div>
            <div class="sc-lbl">${isAr() ? "محصل هذا الشهر" : "Collected This Month"}</div>
          </div>
          <div class="sc">
            <div class="sc-ico" style="--ac:var(--warning)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg></div>
            <div class="sc-val" style="color:var(--warning)">${fmt(outstanding)}</div>
            <div class="sc-lbl">${isAr() ? "المتبقي غير المحصل" : "Outstanding Balance"}</div>
          </div>
        </div>
      `;
    } else {
      metricsEl.innerHTML = `
        <div class="sg">
          <div class="sc sc-featured">
            <div class="sc-ico" style="--ac:var(--teal)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg></div>
            <div class="sc-val">${patCount || 0}</div>
            <div class="sc-lbl">${isAr() ? "إجمالي المرضى المسجلين" : "Total Registered Patients"}</div>
          </div>
          <div class="sc">
            <div class="sc-ico" style="--ac:var(--info)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></div>
            <div class="sc-val">${totalAppts}</div>
            <div class="sc-lbl">${isAr() ? "زيارات هذا اليوم" : "Visits on This Date"}</div>
          </div>
          <div class="sc">
            <div class="sc-ico" style="--ac:var(--success)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
            <div class="sc-val" style="color:var(--success)">${confirmedOrDone}</div>
            <div class="sc-lbl">${isAr() ? "مؤكد وتم الفحص" : "Confirmed & Completed"}</div>
          </div>
          <div class="sc">
            <div class="sc-ico" style="--ac:var(--navy)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
            <div class="sc-val">${Math.max(0, totalAppts - confirmedOrDone)}</div>
            <div class="sc-lbl">${isAr() ? "في الانتظار والمجدول" : "Scheduled / Pending"}</div>
          </div>
        </div>
      `;
    }
  }

  if (!visible.length) {
    el.innerHTML = `<div class="empty">${isAr() ? "لا توجد أي مواعيد مجدولة لهذا اليوم" : "No appointments scheduled for this day"}</div>`;
    return;
  }
  el.innerHTML = '<div class="card">' + visible.map(apptRow).join("") + "</div>";
}

export function apptRow(a) {
  const c = SC[a.status] || "#64748B";
  const t = (a.appointment_time || "").slice(0, 5) || "—";
  const pname = a.patients ? `${a.patients.first_name} ${a.patients.last_name || ''}` : a.patient_name || (isAr() ? "مريض غير معروف" : "Unknown Patient");
  const phone = a.patients?.phone || "";
  const waMsg = encodeURIComponent(`عيادة د. عبدالله سامي زين لطب وجراحة الفم والأسنان 🦷\nمرحباً أستاذ/ة ${pname}،\nنذكركم بموعدكم القادم بتاريخ ${a.appointment_date} الساعة ${t}.\n\nللتواصل أو الاستفسار: 01555563997\nنتطلع لرؤيتكم 😊`);
  const safeObj = JSON.stringify(a).replace(/'/g, '&apos;').replace(/"/g, '&quot;');
  
  return `<div class="ar row-sep">
    <div class="ar-timeline-node">
      <span class="ar-time-badge">${t}</span>
    </div>
    <div class="ar-body" onclick='window.openAppt(${safeObj})'>
      <div class="ar-name">${esc(pname)}</div>
      <div class="ar-type">
        <span>🦷 ${esc(a.appt_type || (isAr() ? "علاج عام" : "General Treatment"))}</span>
        <span>·</span>
        <span>⏱ ${a.duration_minutes || 30} ${isAr() ? "دقيقة" : "min"}</span>
        ${a.dentist_name ? `<span>· 👨‍⚕️ ${esc(a.dentist_name)}</span>` : ""}
      </div>
    </div>
    <div class="ar-act">
      <select onchange="window.changeStatus(${a.id}, this.value)" onclick="event.stopPropagation()"
        class="status-sel" style="border-color:${c}40;color:${c}">
        <option value="scheduled" ${a.status === 'scheduled' ? 'selected' : ''}>● ${SL.scheduled}</option>
        <option value="confirmed" ${a.status === 'confirmed' ? 'selected' : ''}>● ${SL.confirmed}</option>
        <option value="completed" ${a.status === 'completed' ? 'selected' : ''}>● ${SL.completed}</option>
        <option value="no-show" ${a.status === 'no-show' ? 'selected' : ''}>● ${SL['no-show']}</option>
        <option value="cancelled" ${a.status === 'cancelled' ? 'selected' : ''}>● ${SL.cancelled}</option>
      </select>
      ${phone ? `<button class="wa-btn" onclick="event.stopPropagation();window.sendWA('${phone}','${waMsg}')" title="${isAr() ? 'إرسال تذكير واتساب' : 'Send WhatsApp Reminder'}">
        <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.138.562 4.144 1.545 5.879L.057 23.786a.5.5 0 0 0 .658.625l5.975-1.901A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.941 9.941 0 0 1-5.073-1.384l-.362-.215-3.754 1.194 1.107-3.645-.234-.376A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
        واتساب
      </button>` : ""}
    </div>
  </div>`;
}

export async function openAppt(a) {
  document.getElementById("sh-appt-title").textContent = (a.appointment_time || "").slice(0, 5) + " · " + (a.appt_type || (isAr() ? "كشف عام" : "General"));
  document.getElementById("sh-appt-sub").textContent = a.appointment_date || "";
  document.getElementById("sh-appt-body").innerHTML = '<div class="ldg"><div class="spin"></div></div>';
  document.getElementById("sh-appt-detail").classList.add("open");

  const { data: pat } = await sb.from("patients").select("*").eq("id", a.patient_id).single();
  const phone = (pat?.phone || "").replace(/\D/g, "");
  const intlPhone = toEG(phone);
  const pname = pat ? `${pat.first_name} ${pat.last_name || ''}` : a.patient_name || "";
  const t = (a.appointment_time || "").slice(0, 5);
  const dt = a.appointment_date || "";
  const waMsg = encodeURIComponent(`عيادة د. عبدالله سامي زين لطب وجراحة الفم والأسنان 🦷\nمرحباً أستاذ/ة ${pname}،\nنذكركم بموعدكم القادم بتاريخ ${dt} الساعة ${t}.\n\nللتواصل أو الاستفسار: 01555563997\nنتطلع لرؤيتكم 😊`);
  const c = SC[a.status] || "#64748B";

  document.getElementById("sh-appt-body").innerHTML = `
    <div style="background:var(--card);border-radius:var(--r-lg);border:1px solid var(--border);margin:16px;overflow:hidden;box-shadow:var(--shadow-md)">
      <div style="height:4px;background:${c};"></div>
      <div class="ig">
        <div class="ii"><div class="ii-lbl">${isAr() ? "المريض" : "Patient"}</div><div class="ii-val">${esc(pname)}</div></div>
        <div class="ii"><div class="ii-lbl">${isAr() ? "التاريخ" : "Date"}</div><div class="ii-val" style="font-family:var(--font-mono)">${dt}</div></div>
        <div class="ii"><div class="ii-lbl">${isAr() ? "الوقت" : "Time"}</div><div class="ii-val" style="color:${c};font-size:18px;font-weight:800;font-family:var(--font-mono)">${t}</div></div>
        <div class="ii"><div class="ii-lbl">${isAr() ? "الإجراء" : "Procedure"}</div><div class="ii-val">${esc(a.appt_type || (isAr() ? "كشف عام" : "General"))}</div></div>
        <div class="ii"><div class="ii-lbl">${isAr() ? "المدة" : "Duration"}</div><div class="ii-val">${a.duration_minutes || 30} ${isAr() ? "دقيقة" : "minutes"}</div></div>
        <div class="ii"><div class="ii-lbl">${isAr() ? "الطبيب المعالج" : "Dentist"}</div><div class="ii-val">${esc(a.dentist_name || (isAr() ? "د. عبد الله سامي زين" : "Dr. Abdullah Zain"))}</div></div>
        ${a.notes ? `<div class="ii full"><div class="ii-lbl">${isAr() ? "ملاحظات" : "Notes"}</div><div class="ii-val" style="font-size:13px;font-weight:400">${esc(a.notes)}</div></div>` : ""}
      </div>
    </div>
    <div class="pg" style="padding:0 16px 24px">
      <div class="slbl">${isAr() ? "تحديث حالة الموعد" : "Update Status"}</div>
      <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;margin-bottom:20px">
        ${[
          ["scheduled","#3B82F6",SL.scheduled],
          ["confirmed","#0EA5A4",SL.confirmed],
          ["completed","#10B981",SL.completed],
          ["no-show","#64748B",SL['no-show']],
          ["cancelled","#EF4444",SL.cancelled]
        ].map(([s, col, lbl]) => `
        <button onclick="window.changeStatus(${a.id},'${s}');this.closest('.pg').querySelectorAll('.status-btn').forEach(b=>{b.style.opacity='0.5';b.style.borderColor='var(--border)'});this.style.opacity='1';this.style.borderColor='${col}'"
          class="status-btn"
          style="background:var(--surface);border:1.5px solid ${s === a.status ? col : 'var(--border)'};border-radius:var(--r-md);padding:10px 6px;font-size:12px;font-weight:700;color:${col};cursor:pointer;opacity:${s === a.status ? '1' : '0.5'};transition:all .18s;box-shadow:var(--shadow-sm)">
          ● ${lbl}
        </button>`).join("")}
      </div>
      <div class="slbl">${isAr() ? "إشعار وتذكير المريض عبر واتساب" : "Patient WhatsApp Notification"}</div>
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:var(--r-lg);padding:16px;margin-bottom:16px">
        <div style="font-size:11px;font-weight:700;color:#15803D;margin-bottom:10px;display:flex;align-items:center;gap:6px;letter-spacing:.6px">
          <svg viewBox="0 0 24 24" fill="#15803D" width="14" height="14"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.138.562 4.144 1.545 5.879L.057 23.786a.5.5 0 0 0 .658.625l5.975-1.901A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.941 9.941 0 0 1-5.073-1.384l-.362-.215-3.754 1.194 1.107-3.645-.234-.376A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
          ${isAr() ? "معاينة نص الرسالة" : "Reminder Preview"}
        </div>
        <div style="background:#FFFFFF;border:1px solid #DCFCE7;border-radius:var(--r-md);padding:14px;margin-bottom:12px;font-size:13px;color:#1F2937;line-height:1.7;direction:rtl;text-align:right;font-family:inherit">
          عيادة د. عبدالله سامي زين لطب وجراحة الفم والأسنان 🦷<br>
          مرحباً أستاذ/ة <strong>${esc(pname)}</strong>،<br>
          نذكركم بموعدكم القادم بتاريخ <strong>${dt}</strong> الساعة <strong>${t}</strong>.<br>
          للتواصل أو الاستفسار: 01555563997<br>
          نتطلع لرؤيتكم 😊
        </div>
        ${phone ? `
        <button onclick="window.open('https://wa.me/${intlPhone}?text=${waMsg}','_blank')"
          style="width:100%;background:#16A34A;color:#fff;border:none;border-radius:var(--r-md);padding:12px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 12px rgba(22,163,74,0.25)">
          ${isAr() ? `إرسال واتساب إلى ${esc(pname)} (${pat?.phone || ""})` : `Send WhatsApp to ${esc(pname)} (${pat?.phone || ""})`}
        </button>` : `<div style="text-align:center;color:var(--error);font-size:12px;font-weight:600;padding:8px">${isAr() ? "لا يوجد رقم هاتف مسجل لهذا المريض" : "No phone number on record for this patient"}</div>`}
      </div>
      <button onclick="window.closeSheet('appt-detail');window.openPat(${a.patient_id})"
        style="width:100%;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);padding:12px;font-size:13px;font-weight:600;color:var(--navy);cursor:pointer;box-shadow:var(--shadow-sm)">
        ${isAr() ? "فتح وتصفح ملف المريض بالكامل ←" : "Open Patient Profile →"}
      </button>
    </div>`;
}

export async function changeStatus(id, ns) {
  const { error } = await sb.from("appointments").update({ status: ns }).eq("id", id);
  if (!error) {
    toast((isAr() ? "تم تحديث الحالة ← " : "Status updated → ") + SL[ns]);
    loadSched();
  } else {
    toast(isAr() ? "فشل التحديث ✗" : "Update failed ✗");
  }
}
