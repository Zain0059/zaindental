import {
  sb, SC, SL, MONTHS, USER, toothOpts, toast, esc, age, fmt, today, toEG,
  getEditInvId, setEditInvId
} from './app.js';
import { openInv, loadInvoices, loadProcs, _procs } from './app-features.js';
import { openSheet, closeSheet, sw } from './app-handlers.js';

let _clPatId = null;
let _editTxId = null;
let _editInvId = null;
let _editStfId = null;
let _editSvcId = null;
let _editExpId = null;

let _scanImgB64 = null, _scanImgMime = null, _scanImg2B64 = null, _scanImg2Mime = null;
let _clTmr = null;

// Clinical & Odontogram
export async function loadRecentClinical() {
  const el = document.getElementById("cl-body");
  const pres = document.getElementById("cl-pres");
  if (pres) pres.style.display = "none";
  if (!el) return;
  el.innerHTML = '<div class="ldg"><div class="spin"></div></div>';

  const { data } = await sb.from("treatments").select("*,patients(first_name,last_name)").order("date_performed", { ascending: false }).limit(25);
  if (!data?.length) { el.innerHTML = '<div class="empty">No dental clinical records found</div>'; return; }

  el.innerHTML = '<div class="slbl" style="padding:0 2px 8px">Recent Clinical Treatments</div><div class="card">' + data.map(t => {
    const pname = t.patients ? t.patients.first_name + ' ' + t.patients.last_name : 'Unknown Patient';
    return `<div class="row-sep" style="padding:14px 18px;cursor:pointer" onclick="window.loadCLPat(${t.patient_id},'${esc(pname)}')">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--navy)">${esc(pname)}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">🦷 ${esc(t.procedure_name)} · 📅 ${t.date_performed || ''}${t.tooth_number ? ' · Tooth #' + t.tooth_number : ''}</div>
        </div>
        <div style="font-size:14px;font-weight:800;color:var(--teal);font-family:var(--font-mono)">EGP ${t.cost || 0}</div>
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

  const treatedTeeth = new Set((txs || []).map(t => t.tooth_number).filter(Boolean));

  const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  const renderTooth = (num) => {
    const isTreated = treatedTeeth.has(num);
    return `<div onclick="window.selectToothFromChart(${num})" style="display:flex;flex-direction:column;align-items:center;cursor:pointer;padding:4px 2px" title="Tooth #${num}">
      <div style="width:24px;height:28px;border-radius:4px;border:1.5px solid ${isTreated ? 'var(--teal)' : '#CBD5E1'};background:${isTreated ? 'var(--teal)' : '#FFFFFF'};color:${isTreated ? '#FFFFFF' : '#64748B'};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;box-shadow:var(--shadow-sm);transition:transform 0.15s">
        ${num}
      </div>
    </div>`;
  };

  const txHtml = txs?.length ? txs.map(t => `
    <div class="row-sep" style="padding:14px 16px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div style="flex:1;min-width:0;cursor:pointer" onclick="window.openEditTx(${t.id},'${esc(t.procedure_name)}',${t.cost || 0},'${t.date_performed || today()}',${t.tooth_number || 0},'${esc(t.diagnosis || '')}')">
          <div style="font-size:14px;font-weight:600;color:var(--navy)">${esc(t.procedure_name)}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">📅 ${t.date_performed || ""}${t.tooth_number ? " · 🦷 Tooth #" + t.tooth_number : ""}${t.dentist_name ? " · 👨‍⚕️ " + esc(t.dentist_name) : ""}</div>
          ${t.diagnosis ? `<div style="font-size:12px;color:var(--text-dim);margin-top:4px;background:var(--bg);padding:4px 8px;border-radius:var(--r-xs)">${esc(t.diagnosis)}</div>` : ""}
        </div>
        <div style="display:flex;align-items:center;gap:10px;padding-left:12px;flex-shrink:0">
          <div style="font-size:14px;font-weight:800;color:var(--teal);font-family:var(--font-mono)">EGP ${t.cost || 0}</div>
          <button class="small-btn" onclick="window.openEditTx(${t.id},'${esc(t.procedure_name)}',${t.cost || 0},'${t.date_performed || today()}',${t.tooth_number || 0},'${esc(t.diagnosis || '')}')">Edit</button>
        </div>
      </div>
    </div>`).join("") : '<div class="empty">No dental procedures recorded for this patient</div>';

  el.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px;margin-bottom:16px;box-shadow:var(--shadow-sm)">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:16px;font-weight:700;color:var(--navy)">${esc(pat?.first_name || "")} ${esc(pat?.last_name || "")}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">ID: ${esc(pat?.patient_number || "P-" + pid)} · 📞 ${esc(pat?.phone || "No phone")}</div>
        </div>
        <button class="small-btn primary" onclick="window.openAddTx()">+ Add Treatment</button>
      </div>
      ${pat?.allergies ? `<div style="font-size:12px;color:var(--error);margin-top:8px;font-weight:600;background:var(--error-bg);padding:6px 10px;border-radius:var(--r-sm);border:1px solid var(--error-border)">⚠ Medical Alert: ${esc(pat.allergies)}</div>` : ""}
    </div>

    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px;margin-bottom:18px;box-shadow:var(--shadow-sm)">
      <div class="slbl" style="margin-bottom:8px">Interactive Adult Dental Chart (FDI System)</div>
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:10px">Upper Arch (Maxillary)</div>
      <div style="display:flex;justify-content:center;gap:4px;overflow-x:auto;padding-bottom:8px">
        ${upperTeeth.map(renderTooth).join("")}
      </div>
      <div style="border-top:1px dashed var(--border);margin:8px 0"></div>
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:10px">Lower Arch (Mandibular)</div>
      <div style="display:flex;justify-content:center;gap:4px;overflow-x:auto">
        ${lowerTeeth.map(renderTooth).join("")}
      </div>
    </div>

    <div class="sec-hdr">
      <div class="slbl" style="margin:0">Clinical History</div>
    </div>
    <div class="card" style="margin-bottom:16px">${txHtml}</div>

    <div id="cl-add-form" style="display:none;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:18px;box-shadow:var(--shadow-md)">
      <div class="slbl">Record New Dental Treatment</div>
      <div class="ff"><label>Procedure / Treatment</label>
        <select id="cl-proc" onchange="window.clProcSel(this)" style="width:100%;margin-bottom:6px">
          <option value="">— Select from catalog —</option>
          ${_procs.map(p => `<option value="${p.id}" data-name="${esc(p.name)}" data-cost="${p.default_cost}">${esc(p.name)} (EGP ${p.default_cost})</option>`).join("")}
          <option value="custom">Custom Procedure…</option>
        </select>
        <input id="cl-proc-name" type="text" placeholder="Or enter custom procedure name…" style="display:none">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        <div class="ff" style="margin:0"><label>Tooth # (FDI)</label><select id="cl-tooth">${toothOpts()}</select></div>
        <div class="ff" style="margin:0"><label>Cost (EGP)</label><input id="cl-cost" type="number" inputmode="decimal" step="0.01" min="0" value="0"></div>
      </div>
      <div class="ff"><label>Clinical Diagnosis &amp; Notes</label><textarea id="cl-notes" placeholder="Observations, materials used, patient feedback…"></textarea></div>
      <button class="btn-primary" style="border-radius:var(--r-md);padding:13px" onclick="window.submitTx()">Save Treatment &amp; Create Invoice</button>
    </div>`;
}

export function selectToothFromChart(num) {
  openAddTx();
  const toothSelect = document.getElementById("cl-tooth");
  if (toothSelect) {
    toothSelect.value = num;
    toast(`Tooth #${num} selected for treatment`);
  }
}

export function openAddTx() {
  const f = document.getElementById("cl-add-form");
  if (f) f.style.display = f.style.display === "none" ? "block" : "none";
}

export function clProcSel(sel) {
  const opt = sel.options[sel.selectedIndex];
  const customInput = document.getElementById("cl-proc-name");
  if (opt.value === "custom") {
    if (customInput) { customInput.style.display = "block"; customInput.value = ""; }
  } else if (opt.value) {
    if (customInput) customInput.style.display = "none";
    document.getElementById("cl-cost").value = opt.dataset.cost || 0;
  }
}

export async function submitTx() {
  if (!_clPatId) { toast("No patient selected ✗"); return; }
  const sel = document.getElementById("cl-proc");
  const opt = sel.options[sel.selectedIndex];
  const name = (opt && opt.value && opt.value !== "custom") ? (opt.dataset.name || opt.text) : document.getElementById("cl-proc-name").value.trim();
  if (!name) { toast("Select or enter a procedure ✗"); return; }
  const cost = parseFloat(document.getElementById("cl-cost").value) || 0;
  const clNotes = document.getElementById("cl-notes").value;

  const { data: tx, error } = await sb.from("treatments").insert({
    patient_id: _clPatId,
    procedure_name: name,
    tooth_number: document.getElementById("cl-tooth").value || null,
    cost,
    diagnosis: clNotes,
    date_performed: today(),
    dentist_name: USER?.full_name || "Dr. Abdullah Zain"
  }).select().single();

  if (!error) {
    toast("Treatment saved — generating invoice…");
    const { data: pat } = await sb.from("patients").select("first_name,last_name").eq("id", _clPatId).single();
    const pname = pat ? `${pat.first_name} ${pat.last_name}` : "";

    const { data: inv } = await sb.from("invoices").insert({
      patient_id: _clPatId,
      patient_name: pname,
      total_amount: cost,
      issue_date: today(),
      notes: clNotes,
      created_by: USER?.full_name || ""
    }).select().single();

    if (inv) {
      await sb.from("invoice_items").insert({
        invoice_id: inv.id,
        description: name + (document.getElementById("cl-tooth").value ? " (Tooth #" + document.getElementById("cl-tooth").value + ")" : ""),
        quantity: 1,
        unit_price: cost,
        total_price: cost
      });
      const invRef = (clNotes ? clNotes + "\n" : "") + "Via Invoice " + inv.invoice_number;
      await sb.from("treatments").update({ diagnosis: invRef }).eq("id", tx.id);
      loadInvoices();
      loadCLPat(_clPatId, document.getElementById("cl-q").value);
      openInv(inv.id);
    } else {
      loadCLPat(_clPatId, document.getElementById("cl-q").value);
    }
  } else {
    toast("Failed to save treatment ✗");
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
  const revBars = rev.map((v, i) => `<div class="bar-row"><div class="bar-label">${MONTHS[i]}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round(v / maxR * 100)}%;background:linear-gradient(90deg, #0EA5A4, #14B8B6)">${v > 0 ? `<span class="bar-val">EGP ${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>` : ""}</div></div></div>`).join("");

  const byStatus = {};
  (appts || []).forEach(a => { byStatus[a.status] = (byStatus[a.status] || 0) + 1; });
  const apptBars = Object.entries(byStatus).map(([s, c]) => `<div class="bar-row"><div class="bar-label" style="width:70px;text-align:right;font-size:10px;color:${SC[s] || "#64748B"}">${SL[s] || s}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round(c / Math.max(...Object.values(byStatus), 1) * 100)}%;background:${SC[s] || "#64748B"}"><span class="bar-val">${c}</span></div></div></div>`).join("");

  const procMap = {};
  (txs || []).forEach(t => {
    if (!procMap[t.procedure_name]) procMap[t.procedure_name] = { cnt: 0, rev: 0 };
    procMap[t.procedure_name].cnt++;
    procMap[t.procedure_name].rev += (+t.cost || 0);
  });
  const topProcs = Object.entries(procMap).sort((a, b) => b[1].cnt - a[1].cnt).slice(0, 8);
  const maxP = Math.max(...topProcs.map(([, v]) => v.cnt), 1);
  const procBars = topProcs.map(([name, v]) => `<div class="bar-row"><div style="flex:1"><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-dim);margin-bottom:3px"><span>${esc(name)}</span><span style="color:var(--teal);font-weight:700">${v.cnt}× · EGP ${v.rev.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div><div class="bar-track" style="height:14px"><div class="bar-fill" style="width:${Math.round(v.cnt / maxP * 100)}%;background:linear-gradient(90deg, var(--teal), var(--teal-light))"></div></div></div></div>`).join("");

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
  const expBars = expRev.map((v, i) => `<div class="bar-row"><div class="bar-label">${MONTHS[i]}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round(v / maxE * 100)}%;background:linear-gradient(90deg, #EF4444, #F87171)">${v > 0 ? `<span class="bar-val">EGP ${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>` : ""}</div></div></div>`).join("");

  const expCats = {};
  (exps || []).forEach(e => { expCats[e.category] = (expCats[e.category] || 0) + (+e.amount || 0); });
  const expCatHtml = Object.entries(expCats).sort((a, b) => b[1] - a[1]).map(([c, a]) => `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)"><span style="font-size:13px;color:var(--text)">${esc(c)}</span><span style="font-size:13px;font-weight:700;color:var(--error);font-family:var(--font-mono)">EGP ${a.toFixed(0)}</span></div>`).join("");

  const { count: newPats } = await sb.from("patients").select("*", { count: "exact", head: true }).gte("created_at", startMonth);

  el.innerHTML = `
    <div class="sg">
      <div class="sc sc-featured" style="--ac:var(--teal)">
        <div class="sc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
        <div class="sc-val">EGP ${(totalYear || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        <div class="sc-lbl">${td.slice(0, 4)} Gross Revenue</div>
      </div>
      <div class="sc" style="--ac:var(--error)">
        <div class="sc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
        <div class="sc-val">EGP ${(totalExpenses || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        <div class="sc-lbl">${td.slice(0, 4)} Clinic Expenses</div>
      </div>
      <div class="sc" style="--ac:${netProfit >= 0 ? "var(--success)" : "var(--error)"}">
        <div class="sc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg></div>
        <div class="sc-val">EGP ${Math.abs(netProfit || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        <div class="sc-lbl">Net ${netProfit >= 0 ? "Operating Profit" : "Loss"}</div>
      </div>
      <div class="sc" style="--ac:var(--warning)">
        <div class="sc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg></div>
        <div class="sc-val">EGP ${(outstanding || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        <div class="sc-lbl">Outstanding Balance</div>
      </div>
    </div>

    <div class="slbl">Annual Revenue Trajectory (${td.slice(0, 4)})</div>
    <div class="card" style="padding:16px"><div class="bar-wrap">${revBars}</div></div>

    <div class="slbl">Monthly Clinic Expenses (${td.slice(0, 4)})</div>
    <div class="card" style="padding:16px"><div class="bar-wrap">${expBars}</div></div>

    <div class="slbl">Expenses by Category</div>
    <div class="card" style="padding:16px">${expCatHtml || '<div class="empty">No expenses recorded</div>'}</div>

    <div class="slbl">Appointments Breakdown</div>
    <div class="card" style="padding:16px"><div class="bar-wrap">${apptBars || '<div class="empty">No data</div>'}</div></div>

    <div class="slbl">Top Performed Procedures</div>
    <div class="card" style="padding:16px"><div class="bar-wrap">${procBars || '<div class="empty">No data</div>'}</div></div>`;
}

// Staff Management
export async function loadStaffMgmt() {
  const el = document.getElementById("sh-staff-mgmt-body");
  if (!el) return;
  el.innerHTML = '<div class="ldg"><div class="spin"></div></div>';
  const { data } = await sb.from("staff").select("id,username,full_name,role,phone,is_active").order("full_name");
  if (!data) { el.innerHTML = '<div class="empty">Failed to load staff</div>'; return; }

  el.innerHTML = `<div class="card">
    ${data.map(s => `
    <div class="row-sep" style="display:flex;align-items:center;padding:14px 18px;gap:14px;cursor:pointer" onclick="window.editStaff(${s.id},'${esc(s.full_name)}','${esc(s.username)}','${s.role}','${esc(s.phone || '')}',${s.is_active})">
      <div class="av">
        ${(s.full_name || "?")[0].toUpperCase()}
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:700;color:var(--navy)">${esc(s.full_name)}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:2px">Role: ${s.role?.toUpperCase()} · @${esc(s.username)}</div>
        ${s.phone ? `<div style="font-size:11px;color:var(--text-light)">📞 ${esc(s.phone)}</div>` : ""}
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        <span class="role-badge ${s.role === 'admin' ? 'r-admin' : s.role === 'dentist' ? 'r-dentist' : 'r-assistant'}">${s.role?.toUpperCase()}</span>
        <span style="font-size:11px;font-weight:700;color:${s.is_active ? "var(--success)" : "var(--error)"}">${s.is_active ? "● Active" : "○ Inactive"}</span>
      </div>
    </div>`).join("")}
  </div>`;
}

export function openAddStaff() {
  _editStfId = null;
  document.getElementById("staff-edit-title").textContent = "New Staff Member";
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
  document.getElementById("staff-edit-title").textContent = "Edit Staff Profile";
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

  if (!name) { toast("Full name is required ✗"); return; }
  if (!username) { toast("Username is required ✗"); return; }
  if (!_editStfId && !pass) { toast("Password is required ✗"); return; }
  if (pass && pass !== pass2) { toast("Passwords do not match ✗"); return; }
  if (pass && pass.length < 6) { toast("Password must be at least 6 characters ✗"); return; }

  let updateData = { full_name: name, username, role, phone, is_active: _editStfId ? isActive : true };
  if (pass) updateData.password_hash = await sha256(pass);

  let error;
  if (_editStfId) { ({ error } = await sb.from("staff").update(updateData).eq("id", _editStfId)); }
  else { ({ error } = await sb.from("staff").insert(updateData)); }

  if (!error) {
    toast(_editStfId ? "Staff member updated ✓" : "Staff member added ✓");
    closeSheet("staff-edit");
    loadStaffMgmt();
  } else {
    if (error.message.includes("unique")) toast("Username already exists ✗");
    else toast("Failed: " + error.message + " ✗");
  }
}

let _delStaffPending = false;
let _delStaffTimer = null;

export async function deleteStaff() {
  if (!_editStfId) return;
  if (USER?.id === _editStfId) { toast("Cannot delete your currently active account ✗"); return; }
  const delBtn = document.querySelector("#sh-staff-edit .sh-danger-btn");
  if (!_delStaffPending) {
    _delStaffPending = true;
    if (delBtn) { delBtn.textContent = "Confirm Remove?"; delBtn.style.background = "var(--error)"; delBtn.style.color = "#fff"; }
    toast("Click again to confirm staff removal");
    clearTimeout(_delStaffTimer);
    _delStaffTimer = setTimeout(() => {
      _delStaffPending = false;
      if (delBtn) { delBtn.textContent = "Delete Staff"; delBtn.style.background = ""; delBtn.style.color = ""; }
    }, 4000);
    return;
  }
  _delStaffPending = false;
  clearTimeout(_delStaffTimer);
  const { error } = await sb.from("staff").delete().eq("id", _editStfId);
  if (!error) {
    toast("Staff member removed ✓");
    closeSheet("staff-edit");
    loadStaffMgmt();
  } else toast("Failed: " + error.message + " ✗");
}

// Services catalog
export async function loadServices() {
  const el = document.getElementById("sh-services-body");
  if (!el) return;
  el.innerHTML = '<div class="ldg"><div class="spin"></div></div>';
  const { data } = await sb.from("procedures_catalog").select("*").order("category,name");
  if (!data) { el.innerHTML = '<div class="empty">Failed to load services</div>'; return; }

  const cats = {};
  data.forEach(s => { const c = s.category || "Other"; if (!cats[c]) cats[c] = []; cats[c].push(s); });

  let html = "";
  for (const [cat, svcs] of Object.entries(cats)) {
    html += `<div class="slbl" style="margin-top:14px">${esc(cat)}</div><div class="card">`;
    html += svcs.map(s => `
      <div class="row-sep" style="display:flex;align-items:center;padding:14px 18px;gap:12px;cursor:pointer" onclick="window.editService(${s.id},'${esc(s.name)}',${s.default_cost},'${esc(s.category || 'Other')}')">
        <div style="flex:1"><div style="font-size:14px;font-weight:600;color:var(--navy)">${esc(s.name)}</div></div>
        <div style="font-size:15px;font-weight:800;color:var(--teal);font-family:var(--font-mono)">EGP ${(+s.default_cost || 0).toFixed(2)}</div>
        <div style="color:var(--text-light);font-size:16px">›</div>
      </div>`).join("");
    html += "</div>";
  }
  el.innerHTML = html || '<div class="empty">No services in price list</div>';
}

export function openAddService() {
  _editSvcId = null;
  document.getElementById("service-edit-title").textContent = "New Dental Service";
  document.getElementById("svc-name").value = "";
  document.getElementById("svc-price").value = "";
  document.getElementById("svc-cat").value = "General";
  document.getElementById("svc-delete-btn").style.display = "none";
  openSheet("service-edit");
}

export function editService(id, name, price, cat) {
  _editSvcId = id;
  document.getElementById("service-edit-title").textContent = "Edit Dental Service";
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
  if (!name) { toast("Enter service name ✗"); return; }
  let error;
  if (_editSvcId) { ({ error } = await sb.from("procedures_catalog").update({ name, default_cost: price, category: cat }).eq("id", _editSvcId)); }
  else { ({ error } = await sb.from("procedures_catalog").insert({ name, default_cost: price, category: cat })); }
  if (!error) {
    toast(_editSvcId ? "Service updated ✓" : "Service added ✓");
    closeSheet("service-edit");
    loadServices();
    loadProcs();
  } else toast("Failed: " + error.message + " ✗");
}

let _delSvcPending = false;
let _delSvcTimer = null;

export async function deleteService() {
  if (!_editSvcId) return;
  const delBtn = document.getElementById("svc-delete-btn");
  if (!_delSvcPending) {
    _delSvcPending = true;
    if (delBtn) { delBtn.textContent = "Confirm Delete?"; delBtn.style.background = "var(--error)"; delBtn.style.color = "#fff"; }
    toast("Click again to confirm deleting this service");
    clearTimeout(_delSvcTimer);
    _delSvcTimer = setTimeout(() => {
      _delSvcPending = false;
      if (delBtn) { delBtn.textContent = "Delete Service"; delBtn.style.background = ""; delBtn.style.color = ""; }
    }, 4000);
    return;
  }
  _delSvcPending = false;
  clearTimeout(_delSvcTimer);
  const { error } = await sb.from("procedures_catalog").delete().eq("id", _editSvcId);
  if (!error) {
    toast("Service deleted ✓");
    closeSheet("service-edit");
    loadServices();
    loadProcs();
  } else toast("Failed: " + error.message + " ✗");
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
  if (!name) { toast("Procedure name is required ✗"); return; }
  const { error } = await sb.from("treatments").update({
    procedure_name: name,
    cost: parseFloat(document.getElementById("etx-cost").value) || 0,
    date_performed: document.getElementById("etx-date").value,
    tooth_number: parseInt(document.getElementById("etx-tooth").value) || null,
    diagnosis: document.getElementById("etx-notes").value.trim()
  }).eq("id", _editTxId);
  if (!error) {
    toast("Treatment updated ✓");
    closeSheet("edit-tx");
    if (_clPatId) loadCLPat(_clPatId, document.getElementById("cl-q").value);
  } else toast("Failed: " + error.message + " ✗");
}

let _delTxPending = false;
let _delTxTimer = null;

export async function deleteTx() {
  if (!_editTxId) return;
  const delBtn = document.querySelector("#sh-edit-tx .sh-danger-btn");
  if (!_delTxPending) {
    _delTxPending = true;
    if (delBtn) { delBtn.textContent = "Confirm Delete?"; delBtn.style.background = "var(--error)"; delBtn.style.color = "#fff"; }
    toast("Click again to confirm deleting treatment");
    clearTimeout(_delTxTimer);
    _delTxTimer = setTimeout(() => {
      _delTxPending = false;
      if (delBtn) { delBtn.textContent = "Delete"; delBtn.style.background = ""; delBtn.style.color = ""; }
    }, 4000);
    return;
  }
  _delTxPending = false;
  clearTimeout(_delTxTimer);
  const { error } = await sb.from("treatments").delete().eq("id", _editTxId);
  if (!error) {
    toast("Treatment deleted ✓");
    closeSheet("edit-tx");
    if (_clPatId) loadCLPat(_clPatId, document.getElementById("cl-q").value);
  } else toast("Failed: " + error.message + " ✗");
}

// Edit Invoice
export async function openEditInv(optId) {
  const invId = optId || _editInvId || getEditInvId();
  if (!invId) {
    toast("Please select an invoice first ✗");
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
    <div style="font-size:11px;font-weight:700;color:var(--teal);text-transform:uppercase;letter-spacing:0.6px">Item ${i + 1}</div>
    <button onclick="window.removeEditInvItem(${i})" style="background:none;border:none;color:var(--error);font-size:18px;cursor:pointer;line-height:1">×</button>
  </div>
  <div class="ff" style="margin-bottom:8px"><label>Description</label><input id="einv-desc-${i}" type="text" value="${esc(it.description || "")}" oninput="window.editInvCalc(${i})"></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <div class="ff" style="margin:0"><label>Quantity</label><input id="einv-qty-${i}" type="number" value="${it.quantity || 1}" min="1" oninput="window.editInvCalc(${i})"></div>
    <div class="ff" style="margin:0"><label>Price (EGP)</label><input id="einv-price-${i}" type="number" inputmode="decimal" value="${it.unit_price || 0}" step="0.01" oninput="window.editInvCalc(${i})"></div>
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
  document.getElementById("einv-total").textContent = "EGP " + tot.toFixed(2);
}

export async function saveEditInv() {
  const invId = _editInvId || getEditInvId();
  if (!invId) { toast("No invoice selected ✗"); return; }
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
      toast("Error saving items: " + itemErr.message + " ✗");
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
    toast(newStatus === "unpaid" ? "Invoice reset to unpaid ✓" : "Invoice updated ✓");
    closeSheet("edit-inv");
    openInv(invId);
    loadInvoices();
  } else {
    toast("Failed to update invoice: " + error.message + " ✗");
  }
}

let _delInvPending = false;
let _delInvTimer = null;

export async function deleteInv() {
  const invId = _editInvId || getEditInvId();
  if (!invId) { toast("No invoice selected ✗"); return; }

  const delBtn = document.querySelector("#sh-edit-inv .sh-danger-btn");
  if (!_delInvPending) {
    _delInvPending = true;
    if (delBtn) {
      delBtn.textContent = "Confirm Delete?";
      delBtn.style.background = "var(--error)";
      delBtn.style.color = "#fff";
    }
    toast("Click 'Confirm Delete?' to permanently remove this invoice");
    clearTimeout(_delInvTimer);
    _delInvTimer = setTimeout(() => {
      _delInvPending = false;
      if (delBtn) {
        delBtn.textContent = "Delete";
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
    delBtn.textContent = "Deleting…";
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
    delBtn.textContent = "Delete";
    delBtn.style.background = "";
    delBtn.style.color = "";
  }

  if (!error) {
    toast("Invoice deleted ✓");
    closeSheet("edit-inv");
    closeSheet("inv");
    _editInvId = null;
    setEditInvId(null);
    loadInvoices();
  } else {
    toast("Failed: " + error.message + " ✗");
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
  if (!data) { el.innerHTML = '<div class="empty">Failed to load expenses</div>'; return; }

  const total = data.reduce((s, e) => s + (+e.amount || 0), 0);
  const cats = {};
  data.forEach(e => { cats[e.category] = (cats[e.category] || 0) + (+e.amount || 0); });

  const catBars = Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;color:var(--text)">${esc(cat)}</div><div style="font-size:13px;font-weight:700;color:var(--error);font-family:var(--font-mono)">EGP ${(+amt).toFixed(2)}</div></div>`).join("");

  sumEl.innerHTML = `<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:18px;margin-bottom:16px;box-shadow:var(--shadow-sm)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:${Object.keys(cats).length ? "12px" : "0"}"><div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.6px">Monthly Total Expenses</div><div style="font-size:24px;font-weight:800;color:var(--error);font-family:var(--font-mono)">EGP ${total.toFixed(2)}</div></div>${catBars}</div>`;

  if (!data.length) { el.innerHTML = '<div class="empty">No expenses recorded for this month</div>'; return; }

  const byDate = {};
  data.forEach(e => { const d = e.expense_date || ""; if (!byDate[d]) byDate[d] = []; byDate[d].push(e); });

  let html = "";
  for (const [date, items] of Object.entries(byDate)) {
    html += `<div class="slbl" style="margin-top:14px;font-family:var(--font-mono)">📅 ${date}</div><div class="card">`;
    html += items.map(e => `<div class="row-sep" style="display:flex;align-items:center;padding:14px 18px;gap:12px;cursor:pointer" onclick="window.openEditExpense(${e.id},'${esc(e.title)}',${e.amount},'${esc(e.category)}','${e.expense_date}','${esc(e.notes || '')}')"><div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:600;color:var(--navy)">${esc(e.title)}</div><div style="font-size:12px;color:var(--text-muted);margin-top:2px">${esc(e.category)}${e.notes ? " · " + esc(e.notes) : ""}</div></div><div style="font-size:14px;font-weight:800;color:var(--error);flex-shrink:0;font-family:var(--font-mono)">EGP ${(+e.amount).toFixed(2)}</div><div style="color:var(--text-light);font-size:16px">›</div></div>`).join("");
    html += "</div>";
  }
  el.innerHTML = html;
}

export function openAddExpense() {
  _editExpId = null;
  document.getElementById("exp-edit-title").textContent = "Record New Expense";
  document.getElementById("exp-amount").value = "";
  document.getElementById("exp-cat").value = "Rent";
  document.getElementById("exp-date").value = today();
  document.getElementById("exp-notes").value = "";
  document.getElementById("exp-delete-btn").style.display = "none";
  openSheet("expense-edit");
}

export function openEditExpense(id, title, amount, cat, date, notes) {
  _editExpId = id;
  document.getElementById("exp-edit-title").textContent = "Edit Expense";
  document.getElementById("exp-cat").value = cat || title;
  document.getElementById("exp-amount").value = amount;
  document.getElementById("exp-date").value = date;
  document.getElementById("exp-notes").value = notes;
  document.getElementById("exp-delete-btn").style.display = "block";
  openSheet("expense-edit");
}

export async function saveExpense() {
  const amount = parseFloat(document.getElementById("exp-amount").value) || 0;
  if (!amount) { toast("Enter expense amount ✗"); return; }
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
    toast(_editExpId ? "Expense updated ✓" : "Expense recorded ✓");
    closeSheet("expense-edit");
    loadExpenses();
  } else toast("Failed: " + error.message + " ✗");
}

let _delExpPending = false;
let _delExpTimer = null;

export async function deleteExpense() {
  if (!_editExpId) return;
  const delBtn = document.getElementById("exp-delete-btn");
  if (!_delExpPending) {
    _delExpPending = true;
    if (delBtn) { delBtn.textContent = "Confirm Delete?"; delBtn.style.background = "var(--error)"; delBtn.style.color = "#fff"; }
    toast("Click again to confirm deleting this expense");
    clearTimeout(_delExpTimer);
    _delExpTimer = setTimeout(() => {
      _delExpPending = false;
      if (delBtn) { delBtn.textContent = "Delete Expense"; delBtn.style.background = ""; delBtn.style.color = ""; }
    }, 4000);
    return;
  }
  _delExpPending = false;
  clearTimeout(_delExpTimer);
  const { error } = await sb.from("clinic_expenses").delete().eq("id", _editExpId);
  if (!error) {
    toast("Expense deleted ✓");
    closeSheet("expense-edit");
    loadExpenses();
  } else toast("Failed: " + error.message + " ✗");
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
  if (!_scanImgB64) { toast("Please capture or choose a photo first ✗"); return; }
  const statusEl = document.getElementById("scan-status");
  statusEl.style.display = "block";
  statusEl.textContent = _scanImg2B64 ? "Analyzing multi-page patient file with AI…" : "Transcribing handwriting with AI vision…";
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
    statusEl.textContent = "Extraction complete — please verify fields before saving.";
  } catch (err) {
    statusEl.textContent = "Scan error: " + err.message;
    toast("Analysis failed ✗");
  } finally {
    document.getElementById("scan-analyze-btn").disabled = false;
  }
}

export async function createPatientFromScan() {
  const fn = document.getElementById("scan-fname").value.trim();
  if (!fn) { toast("First name is required ✗"); return; }
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

  if (error) { toast("Failed to create patient: " + error.message + " ✗"); return; }

  const diagnosis = document.getElementById("scan-diagnosis").value.trim();
  const procedure = document.getElementById("scan-procedure").value.trim();
  if (diagnosis || procedure) {
    await sb.from("treatments").insert({
      patient_id: pat.id,
      procedure_name: procedure || "Scanned File — Initial Record",
      diagnosis: diagnosis || "(Extracted from handwritten file)",
      date_performed: today(),
      dentist_name: USER?.full_name || "Dr. Abdullah Zain",
    });
  }

  toast("Patient profile created from scanned file ✓");
  closeScanSheet();
  sw("clinical");
  loadCLPat(pat.id, fn + " " + (document.getElementById("scan-lname")?.value || ""));
}
