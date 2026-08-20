import {
  sb, SC, SL, MONTHS, USER, toothOpts, toast, esc, age, fmt, today, toEG,
  isAdmin, getCurrentUser, setEditInvId
} from './app.js';
import { t, isAr, applyLangToDOM } from './i18n.js';
import { sw, openSheet, closeSheet } from './app-handlers.js';

let _editPatId = null, _editInvId = null, _editTxId = null, _editStfId = null, _editSvcId = null, _editExpId = null;
let _niPatId = null, _naPatId = null, _clPatId = null, _invFilter = "all";
export let _niItems = [], _procs = [], _naMode = "existing";
let _tmrs = {};
let _allInvoices = [], _invToday = true;
let _editInvItems = [], _editInvOrigItems = [];
let _scanImgB64 = null, _scanImgMime = null, _scanImg2B64 = null, _scanImg2Mime = null;

// Queue / Dashboard Overview
export async function loadQueue() {
  const el = document.getElementById("queue-body");
  if (!el) return;
  el.innerHTML = '<div class="ldg"><div class="spin"></div></div>';
  const td = today();
  const { data } = await sb.from("appointments").select("status").eq("appointment_date", td);
  if (!data) { el.innerHTML = `<div class="empty">${isAr() ? "تعذر تحميل النظرة العامة" : "Failed to load clinic overview"}</div>`; return; }
  
  const by = {};
  data.forEach(a => { by[a.status] = (by[a.status] || 0) + 1; });
  const total = data.length;
  const waiting = (by.scheduled || 0) + (by.confirmed || 0);
  
  const { count: totalPats } = await sb.from("patients").select("*", { count: "exact", head: true });
  const startOfMonth = td.slice(0, 7) + "-01";
  const { count: newPats } = await sb.from("patients").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth);
  
  const { data: invData } = await sb.from("invoices").select("total_amount,paid_amount,issue_date,status");
  const monthRev = (invData || []).filter(i => i.issue_date >= startOfMonth).reduce((s, i) => s + (+i.total_amount || 0), 0);
  const outstanding = (invData || []).filter(i => i.status !== "paid").reduce((s, i) => s + Math.max(0, (+i.total_amount || 0) - (+i.paid_amount || 0)), 0);

  el.innerHTML = `
  <div class="today-hero-card">
    <div class="hero-top">
      <div>
        <div style="font-size:12px;color:rgba(255,255,255,0.7);font-weight:600;letter-spacing:0.8px">${isAr() ? "حالة العيادة في الوقت الفعلي" : "Real-Time Clinic Status"}</div>
        <div style="font-size:24px;font-weight:800;letter-spacing:-0.4px;margin-top:2px">${waiting} ${isAr() ? "مرضى في الانتظار" : "Patients In Waiting"}</div>
      </div>
      <div class="hero-date-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="13" height="13" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        ${isAr() ? "اليوم" : "Today"} · ${td}
      </div>
    </div>
    <div class="hero-stats-grid">
      <div class="hero-stat-item">
        <div class="hero-stat-val">${total}</div>
        <div class="hero-stat-lbl">${isAr() ? "مواعيد اليوم" : "Today's Appointments"}</div>
      </div>
      <div class="hero-stat-item">
        <div class="hero-stat-val">${by.confirmed || 0}</div>
        <div class="hero-stat-lbl">${isAr() ? "حضور مؤكد" : "Confirmed Arrivals"}</div>
      </div>
      <div class="hero-stat-item">
        <div class="hero-stat-val">${by.completed || 0}</div>
        <div class="hero-stat-lbl">${isAr() ? "تم إنجازه اليوم" : "Completed Today"}</div>
      </div>
      <div class="hero-stat-item">
        <div class="hero-stat-val">${newPats || 0}</div>
        <div class="hero-stat-lbl">${isAr() ? "مرضى جدد (الشهر)" : "New Patients (Month)"}</div>
      </div>
    </div>
  </div>

  <div class="slbl">${isAr() ? "توزيع حالات المواعيد" : "Appointment Status Distribution"}</div>
  <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;margin-bottom:24px">
    ${[
      ["#3B82F6", SL.scheduled, by.scheduled || 0],
      ["#0EA5A4", SL.confirmed, by.confirmed || 0],
      ["#10B981", SL.completed, by.completed || 0],
      ["#EF4444", SL.cancelled, by.cancelled || 0],
      ["#64748B", SL['no-show'], by["no-show"] || 0],
      ["#0B2545", isAr() ? "إجمالي المحجوز" : "Total Booked", total]
    ].map(([c, l, v]) => `
    <div style="background:var(--surface);border-radius:var(--r-md);padding:14px 12px;text-align:center;border:1px solid var(--border);box-shadow:var(--shadow-sm)">
      <div style="font-size:22px;font-weight:800;color:${c};font-family:var(--font-mono)">${v}</div>
      <div style="font-size:10px;font-weight:700;letter-spacing:0.5px;color:var(--text-muted);margin-top:2px">${l}</div>
    </div>`).join("")}
  </div>

  <div class="slbl">${isAr() ? "مؤشرات الأداء الرئيسية للعيادة" : "Clinic Key Performance Metrics"}</div>
  <div class="sg">
    <div class="sc sc-featured" style="--ac:var(--teal)">
      <div class="sc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
      <div class="sc-val">${totalPats || 0}</div>
      <div class="sc-lbl">${isAr() ? "إجمالي المرضى المسجلين" : "Total Registered Patients"}</div>
    </div>
    <div class="sc" style="--ac:var(--success)">
      <div class="sc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
      <div class="sc-val">${newPats || 0}</div>
      <div class="sc-lbl">${isAr() ? "مرضى جدد هذا الشهر" : "New Patients This Month"}</div>
    </div>
    ${isAdmin() ? `
    <div class="sc sc-featured" style="--ac:var(--navy)">
      <div class="sc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
      <div class="sc-val">${fmt(monthRev)}</div>
      <div class="sc-lbl">${isAr() ? "إيرادات الشهر المفوترة" : "Monthly Billed Revenue"}</div>
    </div>
    <div class="sc" style="--ac:var(--error)">
      <div class="sc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg></div>
      <div class="sc-val" style="color:var(--error)">${fmt(outstanding)}</div>
      <div class="sc-lbl">${isAr() ? "المتبقي غير المحصل" : "Outstanding Balance"}</div>
    </div>
    ` : `
    <div class="sc sc-featured" style="--ac:var(--navy)">
      <div class="sc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
      <div class="sc-val">${by.completed || 0}</div>
      <div class="sc-lbl">${isAr() ? "زيارات تم إنجازها اليوم" : "Visits Completed Today"}</div>
    </div>
    <div class="sc" style="--ac:var(--info)">
      <div class="sc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
      <div class="sc-val">${waiting}</div>
      <div class="sc-lbl">${isAr() ? "في صالة الانتظار" : "In Waiting Area"}</div>
    </div>
    `}
  </div>`;
}

// Patients Management
export async function loadRecentPats() {
  const el = document.getElementById("pat-list");
  if (!el) return;
  el.innerHTML = '<div class="ldg"><div class="spin"></div></div>';
  const { data } = await sb.from("patients").select("*").order("created_at", { ascending: false }).limit(25);
  if (!data?.length) { el.innerHTML = `<div class="empty">${isAr() ? "لا يوجد أي مرضى مسجلين بعد" : "No patients registered yet"}</div>`; return; }
  el.innerHTML = `<div class="slbl" style="padding:0 2px 8px">${isAr() ? "دليل وسجلات أحدث المرضى" : "Recent Patient Directory"}</div><div class="card">` + data.map(patRow).join("") + "</div>";
}

export function searchPats(q) {
  clearTimeout(_tmrs.pat);
  if (!q.trim()) { loadRecentPats(); return; }
  _tmrs.pat = setTimeout(async () => {
    const el = document.getElementById("pat-list");
    if (!el) return;
    el.innerHTML = '<div class="ldg"><div class="spin"></div></div>';
    const { data } = await sb.from("patients").select("*")
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%,patient_number.ilike.%${q}%`)
      .order("last_name").limit(50);
    if (!data?.length) { el.innerHTML = `<div class="empty">${isAr() ? "لم يتم العثور على أي مريض مطابق للبحث" : "No patients match your search"}</div>`; return; }
    el.innerHTML = '<div class="card">' + data.map(patRow).join("") + "</div>";
  }, 300);
}

export function patRow(p) {
  const ini = ((p.first_name || " ")[0] + (p.last_name || " ")[0]).toUpperCase();
  const d = p.date_of_birth ? age(p.date_of_birth) + (isAr() ? " سنة" : " yrs") : (p.age ? p.age + (isAr() ? " سنة" : " yrs") : "");
  return `<div class="pr row-sep" onclick="window.openPat(${p.id})">
    <div class="av">${ini}</div>
    <div class="pr-info">
      <div class="pr-name">${esc(p.first_name)} ${esc(p.last_name || '')}</div>
      <div class="pr-sub">
        <span>${isAr() ? "ملف" : "ID"}: <strong>${esc(p.patient_number || "P-" + p.id)}</strong></span>
        <span>·</span>
        <span dir="ltr">📞 ${esc(p.phone || (isAr() ? "بدون هاتف" : "No phone"))}</span>
        ${d ? `<span>· 🎂 ${d}</span>` : ""}
        ${p.allergies ? `<span class="badge b-red">⚠ ${isAr() ? "حساسية طبية" : "Allergies"}</span>` : ""}
      </div>
    </div>
    <div class="pr-arr">›</div>
  </div>`;
}

export function switchPatTab(tabName) {
  document.querySelectorAll('.pat-tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabName);
  });
  document.querySelectorAll('.pat-tab-panel').forEach(p => {
    p.classList.toggle('active', p.id === `pat-panel-${tabName}`);
  });
}

export async function openPat(pid) {
  const sh = document.getElementById("sh-patient");
  document.getElementById("sh-pat-name").textContent = "Loading patient…";
  document.getElementById("sh-pat-num").textContent = "";
  document.getElementById("sh-pat-body").innerHTML = '<div class="ldg"><div class="spin"></div></div>';
  sh.classList.add("open");

  const [{ data: p }, { data: appts }, { data: txs }, { data: invs }] = await Promise.all([
    sb.from("patients").select("*").eq("id", pid).single(),
    sb.from("appointments").select("*").eq("patient_id", pid).order("appointment_date", { ascending: false }).limit(20),
    sb.from("treatments").select("*").eq("patient_id", pid).order("date_performed", { ascending: false }).limit(30),
    sb.from("invoices").select("*").eq("patient_id", pid).order("created_at", { ascending: false }).limit(20)
  ]);

  if (!p) { document.getElementById("sh-pat-body").innerHTML = '<div class="empty">Patient record not found</div>'; return; }
  _editPatId = pid;
  const fullName = p.first_name + " " + p.last_name;
  document.getElementById("sh-pat-name").textContent = fullName;
  document.getElementById("sh-pat-num").textContent = "Patient ID: " + (p.patient_number || "P-" + p.id) + (p.gender ? " · " + p.gender : "");

  document.getElementById("ep-fname").value = p.first_name || "";
  document.getElementById("ep-lname").value = p.last_name || "";
  document.getElementById("ep-phone").value = p.phone || "";
  document.getElementById("ep-email").value = p.email || "";
  document.getElementById("ep-dob").value = p.date_of_birth || "";
  document.getElementById("ep-gender").value = p.gender || "";
  document.getElementById("ep-city").value = p.city || "";
  document.getElementById("ep-blood").value = p.blood_type || "";
  document.getElementById("ep-allergies").value = p.allergies || "";
  document.getElementById("ep-conditions").value = p.medical_conditions || "";
  document.getElementById("ep-medications").value = p.current_medications || "";
  document.getElementById("ep-notes").value = p.notes || "";

  const allgs = (p.allergies || "").split(",").map(s => s.trim()).filter(Boolean);
  
  // Billing calculations
  let totalBilled = 0, totalPaid = 0;
  (invs || []).forEach(i => {
    totalBilled += (+i.total_amount || 0);
    totalPaid += (+i.paid_amount || 0);
  });
  const balanceRemaining = Math.max(0, totalBilled - totalPaid);

  const phone = (p.phone || "").replace(/\D/g, "");
  const intlPhone = toEG(phone);
  const waMsg = encodeURIComponent(`عيادة د. عبدالله سامي زين لطب وجراحة الفم والأسنان 🦷\nمرحباً أستاذ/ة ${fullName}،\nنتمنى لك دوام الصحة والعافية.\nللتواصل أو الاستفسار: 01555563997`);

  // Appointments HTML
  const apptHtml = appts?.length ? appts.map(a => {
    const c = SC[a.status] || "#64748B";
    const apptWaMsg = encodeURIComponent(`عيادة د. عبدالله سامي زين لطب وجراحة الفم والأسنان 🦷\nمرحباً أستاذ/ة ${fullName}،\nنذكركم بموعدكم القادم بتاريخ ${a.appointment_date} الساعة ${(a.appointment_time || '').slice(0,5)}.\n\nللتواصل أو الاستفسار: 01555563997`);
    return `
      <div class="ar row-sep" style="padding:12px 14px">
        <div class="ar-timeline-node" style="width:50px">
          <span class="ar-time-badge">${(a.appointment_time || "").slice(0, 5) || "—"}</span>
        </div>
        <div class="ar-body">
          <div style="font-size:12px;font-weight:700;color:var(--text-dim)">📅 ${a.appointment_date}</div>
          <div class="ar-name" style="font-size:13px">${esc(a.appt_type || (isAr() ? "علاج عام" : "General Treatment"))}</div>
          <div class="ar-type">
            <span>${SL[a.status] || a.status}</span>
            ${a.dentist_name ? `<span>· 👨‍⚕️ ${esc(a.dentist_name)}</span>` : ""}
          </div>
        </div>
        <div class="ar-act">
          ${phone ? `<button class="wa-btn" onclick="event.stopPropagation();window.sendWA('${p.phone}','${apptWaMsg}')" title="Send WhatsApp">
            <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.138.562 4.144 1.545 5.879L.057 23.786a.5.5 0 0 0 .658.625l5.975-1.901A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.941 9.941 0 0 1-5.073-1.384l-.362-.215-3.754 1.194 1.107-3.645-.234-.376A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            WA
          </button>` : ""}
        </div>
      </div>`;
  }).join("") : `<div class="empty" style="padding:24px">${isAr() ? "لا توجد مواعيد مسجلة" : "No appointments on record"}</div>`;

  // Treatments HTML
  const txHtml = txs?.length ? txs.map(t => `
    <div class="row-sep" style="padding:14px 16px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div style="font-size:14px;font-weight:700;color:var(--navy)">${esc(t.procedure_name)}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">
            <span>📅 ${t.date_performed || ""}</span>
            ${t.tooth_number ? `<span style="background:var(--teal-dim);color:var(--teal-dark);padding:2px 6px;border-radius:4px;font-weight:700;font-size:11px;margin-inline-start:6px">🦷 ${isAr() ? "سن #" : "Tooth #"}${t.tooth_number}</span>` : ""}
            ${t.dentist_name ? `<span> · 👨‍⚕️ ${esc(t.dentist_name)}</span>` : ""}
          </div>
        </div>
        <div style="font-size:15px;font-weight:800;color:var(--teal-dark);font-family:var(--font-mono)">${fmt(+t.cost || 0)}</div>
      </div>
      ${t.diagnosis ? `<div style="font-size:12px;color:var(--text-dim);margin-top:6px;background:var(--bg);padding:6px 10px;border-radius:var(--r-sm);border:1px solid var(--border)">📝 ${esc(t.diagnosis)}</div>` : ""}
      ${t.notes ? `<div style="font-size:11px;color:var(--text-muted);margin-top:4px">${esc(t.notes)}</div>` : ""}
    </div>`).join("") : `<div class="empty" style="padding:24px">${isAr() ? "لم يتم تسجيل أي إجراءات علاجية بعد" : "No dental procedures recorded yet"}</div>`;

  // Invoices HTML
  const invHtml = invs?.length ? invs.map(i => {
    const isPaid = i.status === 'paid';
    const isPartial = i.status === 'partial';
    const stClass = isPaid ? 's-paid' : isPartial ? 's-partial' : 's-unpaid';
    const stText = isPaid ? (isAr() ? '● مدفوع بالكامل' : '● Fully Paid') : isPartial ? (isAr() ? '● دفع جزئي' : '● Partial Payment') : (isAr() ? '● غير مدفوع' : '● Unpaid Balance');
    return `
      <div class="inv-row row-sep" onclick="window.openInv(${i.id})">
        <div style="flex:1;min-width:0">
          <div class="inv-num">${esc(i.invoice_number || "INV-" + i.id)}</div>
          <div class="inv-date">📅 ${i.issue_date || (i.created_at || "").slice(0, 10)}</div>
        </div>
        <div class="inv-amt">
          <div class="inv-total">${fmt(+i.total_amount || 0)}</div>
          <div class="inv-status ${stClass}">${stText}</div>
        </div>
      </div>`;
  }).join("") : `<div class="empty" style="padding:24px">${isAr() ? "لا توجد فواتير منشأة لهذا المريض" : "No invoices generated for this patient"}</div>`;

  document.getElementById("sh-pat-body").innerHTML = `
    <!-- Quick Action Strip -->
    <div class="quick-action-strip">
      ${p.phone ? `
        <a href="tel:${p.phone}" class="quick-act-btn" style="text-decoration:none">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          ${isAr() ? "اتصال هاتفي" : "Call Patient"}
        </a>
        <button class="quick-act-btn wa" onclick="window.sendWA('${p.phone}','${waMsg}')">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.138.562 4.144 1.545 5.879L.057 23.786a.5.5 0 0 0 .658.625l5.975-1.901A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.941 9.941 0 0 1-5.073-1.384l-.362-.215-3.754 1.194 1.107-3.645-.234-.376A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
          ${isAr() ? "واتساب" : "WhatsApp"}
        </button>` : ""}
      <button class="quick-act-btn" onclick="window.openEditPat()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        ${isAr() ? "تعديل البيانات" : "Edit Record"}
      </button>
    </div>

    <!-- Tab Bar -->
    <div class="pat-tabs-nav">
      <button class="pat-tab-btn active" data-tab="overview" onclick="window.switchPatTab('overview')">${isAr() ? "نظرة عامة" : "Overview"}</button>
      <button class="pat-tab-btn" data-tab="visits" onclick="window.switchPatTab('visits')">${isAr() ? "الزيارات" : "Visits"} (${appts?.length || 0})</button>
      <button class="pat-tab-btn" data-tab="treatments" onclick="window.switchPatTab('treatments')">${isAr() ? "العلاجات" : "Treatments"} (${txs?.length || 0})</button>
      <button class="pat-tab-btn" data-tab="billing" onclick="window.switchPatTab('billing')">${isAr() ? "الفواتير" : "Invoices"} (${invs?.length || 0})</button>
    </div>

    <!-- PANEL 1: OVERVIEW -->
    <div id="pat-panel-overview" class="pat-tab-panel active">
      <!-- Financial Summary Box -->
      <div style="margin:0 16px 16px;background:var(--surface);border-radius:var(--r-lg);border:1px solid var(--border);padding:14px 16px;box-shadow:var(--shadow-sm)">
        <div class="slbl" style="margin-bottom:8px">${isAr() ? "رصيد حساب المريض" : "Patient Account Balance"}</div>
        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;text-align:center">
          <div>
            <div style="font-size:10px;color:var(--text-muted);font-weight:700;text-transform:uppercase">${isAr() ? "إجمالي الفواتير" : "Total Billed"}</div>
            <div style="font-size:15px;font-weight:800;color:var(--navy);font-family:var(--font-mono);margin-top:2px">${fmt(totalBilled)}</div>
          </div>
          <div>
            <div style="font-size:10px;color:var(--text-muted);font-weight:700;text-transform:uppercase">${isAr() ? "إجمالي المدفوع" : "Total Paid"}</div>
            <div style="font-size:15px;font-weight:800;color:var(--success);font-family:var(--font-mono);margin-top:2px">${fmt(totalPaid)}</div>
          </div>
          <div>
            <div style="font-size:10px;color:var(--text-muted);font-weight:700;text-transform:uppercase">${isAr() ? "الرصيد المتبقي" : "Balance Due"}</div>
            <div style="font-size:15px;font-weight:800;color:${balanceRemaining > 0 ? 'var(--warning)' : 'var(--teal)'};font-family:var(--font-mono);margin-top:2px">${fmt(balanceRemaining)}</div>
          </div>
        </div>
      </div>

      <div class="ig">
        <div class="ii"><div class="ii-lbl">${isAr() ? "رقم الهاتف" : "Contact Phone"}</div><div class="ii-val" dir="ltr" style="font-family:var(--font-mono)">${esc(p.phone || "—")}</div></div>
        <div class="ii"><div class="ii-lbl">${isAr() ? "العمر / تاريخ الميلاد" : "Age / Birth Date"}</div><div class="ii-val">${p.date_of_birth ? p.date_of_birth + " (" + age(p.date_of_birth) + (isAr() ? " سنة)" : "y)") : (p.age ? p.age + (isAr() ? " سنة" : " years") : "—")}</div></div>
        <div class="ii"><div class="ii-lbl">${isAr() ? "فصيلة الدم" : "Blood Group"}</div><div class="ii-val">${esc(p.blood_type || "—")}</div></div>
        <div class="ii"><div class="ii-lbl">${isAr() ? "المدينة / المحافظة" : "City / Location"}</div><div class="ii-val">${esc(p.city || "—")}</div></div>
        <div class="ii full"><div class="ii-lbl">${isAr() ? "البريد الإلكتروني" : "Email Address"}</div><div class="ii-val">${esc(p.email || "—")}</div></div>
        ${allgs.length ? `<div class="ii full" style="background:var(--error-bg);border-color:var(--error-border)"><div class="ii-lbl" style="color:var(--error)">⚠ ${isAr() ? "حساسية طبية حرجة" : "Critical Medical Allergies"}</div><div>${allgs.map(a => `<span class="badge b-red">${esc(a)}</span>`).join("")}</div></div>` : ""}
        ${p.medical_conditions ? `<div class="ii full"><div class="ii-lbl">${isAr() ? "الأمراض المزمنة" : "Medical Conditions"}</div><div class="ii-val" style="font-size:13px;font-weight:400">${esc(p.medical_conditions)}</div></div>` : ""}
        ${p.current_medications ? `<div class="ii full"><div class="ii-lbl">${isAr() ? "الأدوية الحالية" : "Current Medications"}</div><div class="ii-val" style="font-size:13px;font-weight:400">${esc(p.current_medications)}</div></div>` : ""}
        ${p.notes ? `<div class="ii full"><div class="ii-lbl">${isAr() ? "ملاحظات سريرية عامة" : "General Clinical Notes"}</div><div class="ii-val" style="font-size:13px;font-weight:400">${esc(p.notes)}</div></div>` : ""}
      </div>
    </div>

    <!-- PANEL 2: VISITS -->
    <div id="pat-panel-visits" class="pat-tab-panel">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:0 16px 8px">
        <div class="slbl" style="margin:0">${isAr() ? "سجل المواعيد والزيارات" : "Appointment History"}</div>
        <button class="small-btn primary" onclick="window.openSheet('new-appt')">
          ${isAr() ? "+ حجز موعد" : "+ Book Appointment"}
        </button>
      </div>
      <div class="card" style="margin:0 16px 16px">${apptHtml}</div>
    </div>

    <!-- PANEL 3: TREATMENTS -->
    <div id="pat-panel-treatments" class="pat-tab-panel">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:0 16px 8px">
        <div class="slbl" style="margin:0">${isAr() ? "سجل العلاجات والإجراءات" : "Dental Procedures History"}</div>
        <button class="small-btn primary" onclick="window.openOdontogramForPat(${p.id})">
          ${isAr() ? "+ مخطط الأسنان / إضافة علاج" : "+ Odontogram / Add Tx"}
        </button>
      </div>
      <div class="card" style="margin:0 16px 16px">${txHtml}</div>
    </div>

    <!-- PANEL 4: BILLING & INVOICES -->
    <div id="pat-panel-billing" class="pat-tab-panel">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:0 16px 8px">
        <div class="slbl" style="margin:0">${isAr() ? "الفواتير والمدفوعات" : "Invoices & Payments"}</div>
        <button class="small-btn primary" onclick="window.openNewInvForPat(${p.id})">
          ${isAr() ? "+ إصدار فاتورة" : "+ Create Invoice"}
        </button>
      </div>
      <div class="card" style="margin:0 16px 16px">${invHtml}</div>
    </div>
  `;
}

export function openOdontogramForPat(pid) {
  closeSheet('patient');
  goTo('odontogram');
  const sel = document.getElementById("od-pat-sel");
  if (sel) {
    sel.value = pid;
    sel.dispatchEvent(new Event('change'));
  }
}

export async function openNewInvForPat(pid) {
  closeSheet('patient');
  openSheet('inv-new');
  if (pid) {
    const { data: pat } = await sb.from("patients").select("first_name,last_name,patient_number").eq("id", pid).single();
    const name = pat ? `${pat.first_name} ${pat.last_name}` : "Patient #" + pid;
    selNIPat(pid, name);
  }
}

export function openEditPat() { if (!_editPatId) return; openSheet("edit-patient"); }

export async function saveEditPat() {
  const fn = document.getElementById("ep-fname").value.trim();
  if (!fn) { toast("First name is required ✗"); return; }
  const { error } = await sb.from("patients").update({
    first_name: fn,
    last_name: document.getElementById("ep-lname").value.trim(),
    phone: document.getElementById("ep-phone").value.trim(),
    email: document.getElementById("ep-email").value.trim(),
    date_of_birth: document.getElementById("ep-dob").value || null,
    gender: document.getElementById("ep-gender").value,
    city: document.getElementById("ep-city").value.trim(),
    blood_type: document.getElementById("ep-blood").value,
    allergies: document.getElementById("ep-allergies").value.trim(),
    medical_conditions: document.getElementById("ep-conditions").value.trim(),
    current_medications: document.getElementById("ep-medications").value.trim(),
    notes: document.getElementById("ep-notes").value.trim(),
    updated_at: new Date().toISOString(),
  }).eq("id", _editPatId);

  if (!error) {
    toast("Patient profile updated ✓");
    closeSheet("edit-patient");
    openPat(_editPatId);
    loadRecentPats();
  } else {
    toast("Failed: " + error.message + " ✗");
  }
}

let _delPatPending = false;
let _delPatTimer = null;

export async function deletePatient() {
  if (!_editPatId) return;
  const delBtn = document.querySelector("#sh-edit-patient .sh-danger-btn");
  if (!_delPatPending) {
    _delPatPending = true;
    if (delBtn) {
      delBtn.textContent = "Confirm Delete?";
      delBtn.style.background = "var(--error)";
      delBtn.style.color = "#fff";
    }
    toast("Click 'Confirm Delete?' to permanently remove this patient record");
    clearTimeout(_delPatTimer);
    _delPatTimer = setTimeout(() => {
      _delPatPending = false;
      if (delBtn) {
        delBtn.textContent = "Delete";
        delBtn.style.background = "";
        delBtn.style.color = "";
      }
    }, 4500);
    return;
  }

  _delPatPending = false;
  clearTimeout(_delPatTimer);
  const { error } = await sb.from("patients").delete().eq("id", _editPatId);
  if (!error) {
    toast("Patient record deleted ✓");
    closeSheet("edit-patient");
    closeSheet("patient");
    _editPatId = null;
    loadRecentPats();
  } else {
    toast("Failed: " + error.message + " ✗");
  }
}

export async function submitNewPatient() {
  const fn = document.getElementById("np-fname").value.trim();
  if (!fn) { toast("First name is required ✗"); return; }
  const { data, error } = await sb.from("patients").insert({
    first_name: fn,
    last_name: document.getElementById("np-lname").value.trim(),
    phone: document.getElementById("np-phone").value.trim(),
    age: parseInt(document.getElementById("np-age").value) || null,
    gender: document.getElementById("np-gender").value,
    allergies: document.getElementById("np-allergies").value.trim(),
    medical_conditions: document.getElementById("np-conditions").value.trim(),
    notes: document.getElementById("np-notes").value.trim(),
  }).select().single();

  if (error) { toast("Failed: " + error.message + " ✗"); return; }
  toast("New patient added successfully ✓");
  closeSheet("new-patient");
  ["np-fname", "np-lname", "np-phone", "np-allergies", "np-conditions", "np-notes"].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = "";
  });
  const ageEl = document.getElementById("np-age"); if (ageEl) ageEl.value = "";
  const genEl = document.getElementById("np-gender"); if (genEl) genEl.value = "";
  loadRecentPats();
}

// Invoices & Billing
export async function loadInvoices() {
  const el = document.getElementById("inv-list");
  if (!el) return;
  el.innerHTML = '<div class="ldg"><div class="spin"></div></div>';
  const { data } = await sb.from("invoices").select("*").order("created_at", { ascending: false }).limit(200);
  _allInvoices = data || [];
  renderInvoices();
}

export function toggleTodayFilter(el) {
  _invToday = !_invToday;
  el.classList.toggle("on", _invToday);
  renderInvoices();
}

export function setIFilter(f, el) {
  _invFilter = f;
  document.querySelectorAll("[data-ifilter]").forEach(e => e.classList.toggle("on", e === el));
  renderInvoices();
}

export function renderInvoices() {
  const el = document.getElementById("inv-list");
  if (!el) return;
  let data = _allInvoices;
  const q = (document.getElementById("inv-srch")?.value || "").trim().toLowerCase();
  if (_invToday) {
    const t = today();
    data = data.filter(i => i.issue_date === t || (i.created_at && i.created_at.startsWith(t)));
  }
  if (_invFilter !== "all") data = data.filter(i => i.status === _invFilter);
  if (q) data = data.filter(i => (i.patient_name || "").toLowerCase().includes(q) || (i.invoice_number || "").toLowerCase().includes(q));
  if (!data.length) { el.innerHTML = `<div class="empty">${isAr() ? "لا توجد فواتير مطابقة لهذا الفلتر" : "No invoices found for this selection"}</div>`; return; }
  
  el.innerHTML = '<div class="card">' + data.map(i => {
    const sc = { paid: "s-paid", partial: "s-partial", unpaid: "s-unpaid" }[i.status] || "";
    const stLabel = i.status === 'paid' ? (isAr() ? 'مدفوعة' : 'PAID') : i.status === 'partial' ? (isAr() ? 'دفع جزئي' : 'PARTIAL') : (isAr() ? 'غير مدفوعة' : 'UNPAID');
    return `<div class="inv-row row-sep" onclick="window.openInv(${i.id})">
      <div style="flex:1;min-width:0">
        <div class="inv-num">${esc(i.invoice_number || "#" + i.id)}</div>
        <div class="inv-name">${esc(i.patient_name || "")}</div>
        <div class="inv-date" style="font-family:var(--font-mono)">📅 ${i.issue_date || ""}</div>
      </div>
      <div class="inv-amt">
        <div class="inv-total">${fmt(+i.total_amount || 0)}</div>
        <div class="inv-status ${sc}">● ${stLabel}</div>
      </div>
      <div style="color:var(--text-light);font-size:16px;padding-inline-start:8px">›</div>
    </div>`;
  }).join("") + "</div>";
}

export async function openInv(id) {
  _editInvId = id;
  setEditInvId(id);
  const editBtn = document.getElementById("inv-edit-btn");
  if (editBtn) editBtn.style.display = "block";

  document.getElementById("sh-inv-title").textContent = isAr() ? "فاتورة علاجية" : "Invoice";
  document.getElementById("sh-inv-sub").textContent = isAr() ? "جاري تحميل التفاصيل…" : "Loading details…";
  document.getElementById("sh-inv-body").innerHTML = '<div class="ldg"><div class="spin"></div></div>';
  openSheet("inv");

  const [{ data: inv }, { data: items }, { data: pmts }] = await Promise.all([
    sb.from("invoices").select("*").eq("id", id).single(),
    sb.from("invoice_items").select("*").eq("invoice_id", id),
    sb.from("payments").select("*").eq("invoice_id", id).order("created_at"),
  ]);

  if (!inv) { document.getElementById("sh-inv-body").innerHTML = `<div class="empty">${isAr() ? "لم يتم العثور على الفاتورة" : "Invoice not found"}</div>`; return; }
  document.getElementById("sh-inv-title").textContent = inv.invoice_number || "#" + id;
  document.getElementById("sh-inv-sub").textContent = (inv.patient_name || "") + " · " + (inv.issue_date || "");

  const sc = { paid: "b-green", partial: "b-gold", unpaid: "b-red" }[inv.status] || "b-gold";
  const stLabel = inv.status === 'paid' ? (isAr() ? 'مدفوعة بالكامل' : 'PAID') : inv.status === 'partial' ? (isAr() ? 'دفعة جزئية' : 'PARTIAL') : (isAr() ? 'غير مدفوعة' : 'UNPAID');
  const remaining = Math.max(0, (+inv.total_amount || 0) - (+inv.paid_amount || 0));

  const itemsHtml = items?.length ? items.map(it => `
    <div class="row-sep" style="padding:12px 16px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:14px;font-weight:600;color:var(--navy)">${esc(it.description)}</div>
        <div style="font-size:12px;color:var(--text-muted)">${isAr() ? "الكمية:" : "Qty:"} ${it.quantity || 1} × ${fmt(it.unit_price || 0)}</div>
      </div>
      <div style="font-size:14px;font-weight:700;color:var(--teal);font-family:var(--font-mono)">${fmt(it.total_price || 0)}</div>
    </div>`).join("") : `<div class="empty" style="padding:16px">${isAr() ? "لا توجد بنود مضافة" : "No items attached"}</div>`;

  const pmtsHtml = pmts?.length ? pmts.map(p => {
    const methLabel = p.payment_method === 'card' ? (isAr() ? 'بطاقة بنكية / POS' : 'Card / POS') : p.payment_method === 'bank_transfer' ? (isAr() ? 'تحويل بنكي / انستاباي' : 'Bank / Instapay') : p.payment_method === 'insurance' ? (isAr() ? 'تأمين طبي' : 'Insurance') : (isAr() ? 'نقدي (كاش)' : 'Cash');
    return `
    <div class="row-sep" style="padding:12px 16px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:14px;font-weight:700;color:var(--success);font-family:var(--font-mono)">+ ${fmt(p.amount)}</div>
        <div style="font-size:12px;color:var(--text-muted)">📅 ${p.payment_date || ""} · 💳 ${methLabel}</div>
      </div>
    </div>`;
  }).join("") : `<div style="padding:14px 16px;font-size:13px;color:var(--text-muted)">${isAr() ? "لا توجد دفعات مسجلة بعد" : "No payment records yet"}</div>`;

  document.getElementById("sh-inv-body").innerHTML = `
    <div class="ig">
      <div class="ii full" style="display:flex;justify-content:space-between;align-items:center">
        <div><div class="ii-lbl">${isAr() ? "حالة الدفع" : "Payment Status"}</div><span class="badge ${sc}">● ${stLabel}</span></div>
        <div style="text-align:right"><div class="ii-lbl">${isAr() ? "إجمالي الفاتورة" : "Invoice Total"}</div><div style="font-size:20px;font-weight:800;color:var(--navy);font-family:var(--font-mono)">${fmt(+inv.total_amount || 0)}</div></div>
      </div>
      <div class="ii"><div class="ii-lbl">${isAr() ? "إجمالي المسدد" : "Total Paid"}</div><div class="ii-val" style="color:var(--success);font-family:var(--font-mono)">${fmt(+inv.paid_amount || 0)}</div></div>
      <div class="ii"><div class="ii-lbl">${isAr() ? "المتبقي المستحق" : "Outstanding Balance"}</div><div class="ii-val" style="color:${remaining > 0 ? "var(--error)" : "var(--success)"};font-family:var(--font-mono)">${fmt(remaining)}</div></div>
      ${inv.notes ? `<div class="ii full"><div class="ii-lbl">${isAr() ? "ملاحظات الفاتورة" : "Invoice Notes"}</div><div class="ii-val" style="font-size:13px;font-weight:400">${esc(inv.notes)}</div></div>` : ""}
    </div>
    <div style="padding:0 16px 8px"><div class="slbl">${isAr() ? "بنود الخدمات والإجراءات" : "Line Items Breakdown"}</div></div>
    <div class="card" style="margin:0 16px 16px">${itemsHtml}</div>
    <div style="padding:0 16px 8px"><div class="slbl">${isAr() ? "سجل إيصالات السداد" : "Payment Receipts"}</div></div>
    <div class="card" style="margin:0 16px 16px">${pmtsHtml}</div>
    ${remaining > 0 ? `<div class="pg" style="padding:0 16px 24px">
      <div class="slbl">${isAr() ? "تسجيل دفعة جديدة" : "Record Payment Installment"}</div>
      <div class="ff"><label>${isAr() ? "المبلغ المراد سداده (جنيه)" : "Amount To Pay (EGP)"}</label><input type="number" inputmode="decimal" id="pay-amt" value="${remaining.toFixed(2)}" step="0.01" min="0.01"></div>
      <div class="ff"><label>${isAr() ? "طريقة الدفع" : "Payment Method"}</label><select id="pay-meth"><option value="cash">${isAr() ? "نقداً (كاش)" : "Cash"}</option><option value="card">${isAr() ? "بطاقة بنكية / POS" : "Card / POS"}</option><option value="bank_transfer">${isAr() ? "تحويل بنكي / انستاباي" : "Bank Transfer / Instapay"}</option><option value="insurance">${isAr() ? "تغطية تأمين" : "Insurance Coverage"}</option></select></div>
      <button class="btn-primary" style="border-radius:var(--r-md);padding:13px" onclick="window.recordPayment(${id})">${isAr() ? "تسجيل الدفعة" : "Record Payment"}</button>
    </div>` : ""}`;
}

export async function recordPayment(invId) {
  const amt = parseFloat(document.getElementById("pay-amt")?.value || 0);
  const meth = document.getElementById("pay-meth")?.value || "cash";
  if (!amt || amt <= 0) { toast(isAr() ? "يرجى إدخال مبلغ صحيح ✗" : "Enter a valid amount ✗"); return; }
  const user = getCurrentUser();
  const { error } = await sb.from("payments").insert({
    invoice_id: invId,
    amount: amt,
    payment_method: meth,
    payment_date: today(),
    received_by: user?.full_name || (isAr() ? "موظف" : "Staff")
  });
  if (!error) {
    toast(isAr() ? "تم تسجيل الدفعة بنجاح ✓" : "Payment recorded successfully ✓");
    openInv(invId);
    loadInvoices();
  } else {
    toast(isAr() ? "فشل تسجيل الدفعة ✗" : "Failed to record payment ✗");
  }
}

// Line items & procedure catalog
export async function loadProcs() {
  const { data } = await sb.from("procedures_catalog").select("*").order("name");
  if (data) _procs = data;
}

export function srchNI(q) {
  clearTimeout(_tmrs.ni);
  const el = document.getElementById("ni-pres");
  if (!q.trim()) { el.style.display = "none"; return; }
  _tmrs.ni = setTimeout(async () => {
    const { data } = await sb.from("patients")
      .select("id,first_name,last_name,patient_number,phone")
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%,patient_number.ilike.%${q}%`)
      .order("first_name")
      .limit(6);
    if (!data?.length) { el.style.display = "none"; return; }
    el.style.display = "block";
    el.innerHTML = data.map(p => `<div onclick="window.selNIPat(${p.id},'${esc(p.first_name)} ${esc(p.last_name)}')" style="padding:12px 14px;border-bottom:1px solid var(--border);cursor:pointer;font-size:14px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <strong>${esc(p.first_name)} ${esc(p.last_name)}</strong>
        <span style="color:var(--text-muted);font-size:12px"> (${esc(p.patient_number || "P-" + p.id)})</span>
      </div>
      ${p.phone ? `<span style="font-family:var(--font-mono);font-size:12px;color:var(--teal);background:var(--teal-dim);padding:2px 8px;border-radius:12px">📞 ${esc(p.phone)}</span>` : ""}
    </div>`).join("");
  }, 250);
}

export function selNIPat(id, name) {
  _niPatId = id;
  document.getElementById("ni-psel").style.display = "block";
  document.getElementById("ni-pname").textContent = name;
  document.getElementById("ni-pres").style.display = "none";
  document.getElementById("ni-psrch").value = "";
}

export function addNIItem() {
  const idx = _niItems.length;
  _niItems.push({});
  const d = document.getElementById("ni-item-rows");
  const div = document.createElement("div");
  div.id = "ni-item-" + idx;
  div.style.cssText = "background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);padding:14px;margin-bottom:10px;box-shadow:var(--shadow-sm)";
  div.innerHTML = `<div style="display:flex;justify-content:space-between;margin-bottom:10px">
    <div style="font-size:11px;font-weight:700;color:var(--teal);letter-spacing:0.6px;text-transform:uppercase">Line Item ${idx + 1}</div>
    <button onclick="window.removeNIItem(${idx})" style="background:none;border:none;color:var(--error);font-size:18px;cursor:pointer;line-height:1">×</button>
  </div>
  <div class="ff" style="margin-bottom:8px"><label>Service / Procedure</label>
    <select onchange="window.niProcSel(${idx},this)" style="width:100%;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);padding:10px 12px;font-size:14px;color:var(--text);margin-bottom:6px">
      <option value="">— Pick from price list —</option>
      ${_procs.map(p => `<option value="${p.id}" data-cost="${p.default_cost}" data-name="${esc(p.name)}">${esc(p.name)} (EGP ${p.default_cost})</option>`).join("")}
      <option value="custom">Custom procedure…</option>
    </select>
    <input id="ni-desc-${idx}" type="text" placeholder="Or type custom description…" oninput="window.niCalc(${idx})" style="width:100%;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);padding:10px 12px;font-size:14px;color:var(--text)">
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <div class="ff" style="margin:0"><label>Quantity</label><input id="ni-qty-${idx}" type="number" value="1" min="1" oninput="window.niCalc(${idx})"></div>
    <div class="ff" style="margin:0"><label>Unit Price (EGP)</label><input id="ni-price-${idx}" type="number" inputmode="decimal" value="0" step="0.01" oninput="window.niCalc(${idx})"></div>
  </div>`;
  d.appendChild(div);
}

export function niProcSel(idx, sel) {
  const opt = sel.options[sel.selectedIndex];
  if (!opt.value || opt.value === "custom") return;
  document.getElementById("ni-desc-" + idx).value = opt.dataset.name || "";
  document.getElementById("ni-price-" + idx).value = opt.dataset.cost || 0;
  niCalc(idx);
}

export function removeNIItem(idx) {
  const el = document.getElementById("ni-item-" + idx);
  if (el) {
    el.remove();
    delete _niItems[idx];
    niTotalCalc();
  }
}

export function niCalc(idx) {
  const qty = parseFloat(document.getElementById("ni-qty-" + idx)?.value || 1);
  const price = parseFloat(document.getElementById("ni-price-" + idx)?.value || 0);
  const desc = document.getElementById("ni-desc-" + idx)?.value || "";
  _niItems[idx] = { description: desc, quantity: qty, unit_price: price, total_price: qty * price };
  niTotalCalc();
}

export function niTotalCalc() {
  const tot = _niItems.filter(Boolean).reduce((s, i) => s + (i.total_price || 0), 0);
  document.getElementById("ni-total").textContent = "EGP " + tot.toFixed(2);
}

export async function submitInvoice() {
  if (!_niPatId) { toast("Select a patient ✗"); return; }
  const items = _niItems.filter(i => i && i.description && i.total_price > 0);
  if (!items.length) { toast("Add at least one line item ✗"); return; }
  const total = items.reduce((s, i) => s + i.total_price, 0);

  const { data: pat } = await sb.from("patients").select("first_name,last_name").eq("id", _niPatId).single();
  const pname = pat ? `${pat.first_name} ${pat.last_name}` : "";

  const user = getCurrentUser();
  const { data: inv, error } = await sb.from("invoices").insert({
    patient_id: _niPatId,
    patient_name: pname,
    total_amount: total,
    notes: document.getElementById("ni-notes").value,
    issue_date: today(),
    created_by: user?.full_name || "Staff"
  }).select().single();

  if (error) { toast("Failed: " + error.message + " ✗"); return; }
  await sb.from("invoice_items").insert(items.map(it => ({ ...it, invoice_id: inv.id })));
  
  const treatments = items.map(it => ({
    patient_id: _niPatId,
    procedure_name: it.description,
    cost: it.total_price,
    date_performed: today(),
    dentist_name: user?.full_name || "Dr. Abdullah Zain",
    diagnosis: "Via Invoice " + inv.invoice_number
  }));
  await sb.from("treatments").insert(treatments);

  toast("Invoice created successfully ✓");
  closeSheet("inv-new");
  _niPatId = null;
  _niItems = [];
  document.getElementById("ni-psel").style.display = "none";
  document.getElementById("ni-notes").value = "";
  document.getElementById("ni-item-rows").innerHTML = "";
  document.getElementById("ni-total").textContent = "EGP 0.00";
  loadInvoices();
}

// Appointment form logic
export function naSetMode(m) {
  _naMode = m;
  const isNew = m === "new";
  document.getElementById("na-new-fields").style.display = isNew ? "block" : "none";
  document.getElementById("na-existing-fields").style.display = isNew ? "none" : "block";
  const nBtn = document.getElementById("na-tab-new");
  const eBtn = document.getElementById("na-tab-existing");
  if (nBtn && eBtn) {
    nBtn.style.cssText = `flex:1;padding:9px;border-radius:var(--r-md);font-size:12px;font-weight:700;cursor:pointer;background:${isNew ? "var(--teal)" : "var(--surface)"};color:${isNew ? "#fff" : "var(--text-muted)"};border:1px solid ${isNew ? "var(--teal)" : "var(--border)"};transition:all .15s`;
    eBtn.style.cssText = `flex:1;padding:9px;border-radius:var(--r-md);font-size:12px;font-weight:700;cursor:pointer;background:${isNew ? "var(--surface)" : "var(--teal)"};color:${isNew ? "var(--text-muted)" : "#fff"};border:1px solid ${isNew ? "var(--border)" : "var(--teal)"};transition:all .15s`;
  }
  if (!isNew) {
    _naPatId = null;
    document.getElementById("na-psel").style.display = "none";
    document.getElementById("na-psrch").value = "";
  }
}

export function srchNA(q) {
  clearTimeout(_tmrs.na);
  const el = document.getElementById("na-pres");
  if (!q.trim()) { el.style.display = "none"; return; }
  _tmrs.na = setTimeout(async () => {
    const { data } = await sb.from("patients")
      .select("id,first_name,last_name,patient_number,phone")
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%,patient_number.ilike.%${q}%`)
      .order("first_name")
      .limit(6);
    if (!data?.length) { el.style.display = "none"; return; }
    el.style.display = "block";
    el.innerHTML = data.map(p => `<div onclick="window.selNAPat(${p.id},'${esc(p.first_name)} ${esc(p.last_name)}')" style="padding:12px 14px;border-bottom:1px solid var(--border);cursor:pointer;font-size:14px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <strong>${esc(p.first_name)} ${esc(p.last_name)}</strong>
        <span style="color:var(--text-muted);font-size:12px"> (${esc(p.patient_number || "P-" + p.id)})</span>
      </div>
      ${p.phone ? `<span style="font-family:var(--font-mono);font-size:12px;color:var(--teal);background:var(--teal-dim);padding:2px 8px;border-radius:12px">📞 ${esc(p.phone)}</span>` : ""}
    </div>`).join("");
  }, 250);
}

export function selNAPat(id, name) {
  _naPatId = id;
  document.getElementById("na-psel").style.display = "block";
  document.getElementById("na-pname").textContent = name;
  document.getElementById("na-pres").style.display = "none";
  document.getElementById("na-psrch").value = "";
}

export async function submitAppt() {
  const dt = document.getElementById("na-date").value;
  const tm = document.getElementById("na-time").value;
  if (!dt || !tm) { toast("Date and time are required ✗"); return; }
  let pid = _naPatId, pname = "";

  if (_naMode === "new") {
    const fn = document.getElementById("na-new-fname").value.trim();
    const ln = document.getElementById("na-new-lname").value.trim();
    if (!fn) { toast("First name is required ✗"); return; }
    const { data: newP, error } = await sb.from("patients").insert({
      first_name: fn,
      last_name: ln,
      phone: document.getElementById("na-new-phone").value.trim()
    }).select().single();
    if (error) { toast("Failed to create patient ✗"); return; }
    pid = newP.id;
    pname = fn + " " + ln;
    toast("Patient created ✓");
  } else {
    const { data: pat } = await sb.from("patients").select("first_name,last_name").eq("id", pid).single();
    pname = pat ? `${pat.first_name} ${pat.last_name}` : "";
  }

  if (!pid) { toast("Select or enter a patient ✗"); return; }

  const { error } = await sb.from("appointments").insert({
    patient_id: pid,
    patient_name: pname,
    appointment_date: dt,
    appointment_time: tm,
    appt_type: document.getElementById("na-type").value,
    duration_minutes: parseInt(document.getElementById("na-dur").value),
    notes: document.getElementById("na-notes").value,
    status: "scheduled"
  });

  if (!error) {
    toast("Appointment booked successfully ✓");
    closeSheet("new-appt");
    _naPatId = null;
    _naMode = "existing";
    naSetMode("existing");
    ["na-psrch", "na-date", "na-time", "na-notes", "na-new-fname", "na-new-lname", "na-new-phone"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    sw("sched");
  } else {
    toast("Failed to book appointment ✗");
  }
}
