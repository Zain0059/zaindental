// ==================================================
// ZAIN DENTAL CLINIC — NOTIFICATIONS ENGINE
// Handles:
// 1. Daily 3:00 PM appointment summary alerts
// 2. Realtime notifications when any appointment is booked by/for other users
// 3. Audio chimes, Web Notification API, in-app banners & Notification Drawer
// ==================================================

import { sb, getCurrentUser, today, esc } from './app.js';
import { isAr, t } from './i18n.js';

const NOTIFS_STORAGE_KEY = 'zd_notifications_v1';
const MAX_STORED_NOTIFS = 60;
const CLIENT_INSTANCE_ID = 'cli_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();

let _realtimeChannel = null;
let _bc = null;
let _daily3pmTimer = null;
let _processedApptIds = new Set();
let _audioCtx = null;

// Initialize Web BroadcastChannel if available
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    _bc = new BroadcastChannel('zd_clinic_bus');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported:', e);
}

// --------------------------------------------------
// Subtle Sound Synthesizer (Zero external dependencies)
// --------------------------------------------------
export function playNotificationSound(type = 'default') {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!_audioCtx) {
      _audioCtx = new AudioContextClass();
    }
    if (_audioCtx.state === 'suspended') {
      _audioCtx.resume();
    }

    const now = _audioCtx.currentTime;
    const osc1 = _audioCtx.createOscillator();
    const osc2 = _audioCtx.createOscillator();
    const gainNode = _audioCtx.createGain();

    gainNode.connect(_audioCtx.destination);
    osc1.connect(gainNode);
    osc2.connect(gainNode);

    if (type === '3pm') {
      // Warm chord chime (A major / E)
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.35);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(554.37, now);
      osc2.frequency.exponentialRampToValueAtTime(1108.73, now + 0.35);

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.85);
      osc2.stop(now + 0.85);
    } else {
      // Pleasant double-bell alert for new booking
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.setValueAtTime(880.00, now + 0.12); // A5

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(739.99, now); // F#5
      osc2.frequency.setValueAtTime(1174.66, now + 0.12); // D6

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.11);
      gainNode.gain.exponentialRampToValueAtTime(0.25, now + 0.14);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.75);
      osc2.stop(now + 0.75);
    }
  } catch (e) {
    console.debug('Audio chime skipped:', e);
  }
}

// --------------------------------------------------
// System/Browser Permissions & Push Dispatch
// --------------------------------------------------
export async function requestBrowserNotificationPermission() {
  if (!('Notification' in window)) {
    if (window.toast) window.toast(isAr() ? 'المتصفح لا يدعم إشعارات النظام ✗' : 'Browser does not support notifications ✗');
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      if (window.toast) window.toast(isAr() ? 'تم تفعيل إشعارات النظام بنجاح ✓' : 'System notifications enabled ✓');
      updateNotificationPermissionUI();
      return true;
    } else {
      if (window.toast) window.toast(isAr() ? 'تم رفض إذن الإشعارات من المتصفح ✗' : 'Notification permission was denied ✗');
      updateNotificationPermissionUI();
      return false;
    }
  } catch (e) {
    console.error('Failed to request notification permission:', e);
    return false;
  }
}

export function updateNotificationPermissionUI() {
  const permBtn = document.getElementById('notif-perm-banner');
  if (!permBtn) return;
  if (!('Notification' in window) || Notification.permission === 'granted') {
    permBtn.style.display = 'none';
  } else {
    permBtn.style.display = 'flex';
  }
}

export function dispatchSystemNotification({ title, body, tag, data, onClick }) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification(title, {
        body,
        icon: '/assets/icon.png',
        badge: '/assets/icon.png',
        tag: tag || 'zd-clinic-' + Date.now(),
        renotify: true,
        data
      });
      notif.onclick = () => {
        window.focus();
        if (typeof onClick === 'function') onClick();
        notif.close();
      };
    }
  } catch (e) {
    console.debug('System notification dispatch fallback:', e);
  }
}

// --------------------------------------------------
// Storage & History Management
// --------------------------------------------------
export function getStoredNotifications() {
  try {
    const raw = localStorage.getItem(NOTIFS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredNotifications(notifs) {
  try {
    const trimmed = notifs.slice(0, MAX_STORED_NOTIFS);
    localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {}
}

export function addNotificationItem(item) {
  const list = getStoredNotifications();
  const newItem = {
    id: item.id || ('n_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)),
    type: item.type || 'info', // '3pm_summary' | 'new_booking' | 'system'
    title: item.title,
    body: item.body,
    timestamp: item.timestamp || new Date().toISOString(),
    isRead: false,
    date: item.date || today(),
    time: item.time || '',
    patientName: item.patientName || '',
    patientId: item.patientId || null,
    apptId: item.apptId || null,
    bookedBy: item.bookedBy || '',
    meta: item.meta || {}
  };

  // Avoid identical duplicate entries within 5 seconds
  const isDuplicate = list.some(n => 
    n.type === newItem.type &&
    n.title === newItem.title &&
    Math.abs(new Date(n.timestamp).getTime() - new Date(newItem.timestamp).getTime()) < 4000
  );
  if (isDuplicate) return null;

  list.unshift(newItem);
  saveStoredNotifications(list);
  updateNotificationBadge();
  renderNotificationDrawer();
  return newItem;
}

export function markAllNotificationsAsRead() {
  const list = getStoredNotifications().map(n => ({ ...n, isRead: true }));
  saveStoredNotifications(list);
  updateNotificationBadge();
  renderNotificationDrawer();
}

export function markNotificationAsRead(id) {
  const list = getStoredNotifications().map(n => n.id === id ? { ...n, isRead: true } : n);
  saveStoredNotifications(list);
  updateNotificationBadge();
  renderNotificationDrawer();
}

export function clearAllNotifications() {
  saveStoredNotifications([]);
  updateNotificationBadge();
  renderNotificationDrawer();
  if (window.toast) window.toast(isAr() ? 'تم مسح سجل الإشعارات' : 'Notification history cleared');
}

export function updateNotificationBadge() {
  const badge = document.getElementById('notif-badge');
  if (!badge) return;
  const list = getStoredNotifications();
  const unreadCount = list.filter(n => !n.isRead).length;

  if (unreadCount > 0) {
    badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

// --------------------------------------------------
// Floating In-App Interactive Notification Banner
// --------------------------------------------------
export function showFloatingNotificationBanner({ title, body, type, icon, actionText, onAction }) {
  let container = document.getElementById('notif-banner-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notif-banner-container';
    container.className = 'notif-banner-container';
    document.body.appendChild(container);
  }

  const banner = document.createElement('div');
  banner.className = `notif-banner notif-banner-${type || 'default'} animate-fade-in`;
  banner.innerHTML = `
    <div class="notif-banner-icon">${icon || '🔔'}</div>
    <div class="notif-banner-content">
      <div class="notif-banner-title">${esc(title)}</div>
      <div class="notif-banner-body">${esc(body)}</div>
    </div>
    <div class="notif-banner-actions">
      ${actionText ? `<button class="notif-banner-act-btn">${esc(actionText)}</button>` : ''}
      <button class="notif-banner-close-btn" title="${isAr() ? 'إغلاق' : 'Close'}">✕</button>
    </div>
  `;

  if (actionText && onAction) {
    const actBtn = banner.querySelector('.notif-banner-act-btn');
    if (actBtn) {
      actBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onAction();
        removeBanner();
      });
    }
  }

  const closeBtn = banner.querySelector('.notif-banner-close-btn');
  const removeBanner = () => {
    banner.classList.add('notif-banner-fade-out');
    setTimeout(() => banner.remove(), 250);
  };
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeBanner();
    });
  }

  banner.addEventListener('click', () => {
    if (onAction) onAction();
    removeBanner();
  });

  container.appendChild(banner);

  // Auto remove after 7 seconds
  setTimeout(() => {
    if (banner.parentElement) removeBanner();
  }, 7500);
}

// --------------------------------------------------
// FEATURE 1: Daily 3:00 PM Appointments Notification
// --------------------------------------------------
export async function triggerDaily3PMNotification(isManualTest = false) {
  try {
    const todayDate = today();
    const { data: appts, error } = await sb
      .from('appointments')
      .select('*, patients(first_name, last_name, phone)')
      .eq('appointment_date', todayDate)
      .order('appointment_time');

    if (error) {
      console.warn('Could not fetch appointments for 3 PM alert:', error);
      return;
    }

    const total = appts?.length || 0;
    const nowTime = new Date().toTimeString().slice(0, 5);
    
    // Appointments scheduled for or after 15:00 today
    const upcoming = (appts || []).filter(a => {
      const t = (a.appointment_time || '').slice(0, 5);
      return a.status === 'scheduled' || a.status === 'confirmed' || t >= '15:00';
    });

    const isArabic = isAr();
    let title = isArabic ? '⏰ تذكير بمواعيد اليوم (الساعة 3:00 م)' : "⏰ Today's 3:00 PM Schedule Reminder";
    let body = '';

    if (total === 0) {
      body = isArabic 
        ? 'لا توجد مواعيد متبقية أو مسجلة لليوم. نتمنى لك يوماً سعيداً!' 
        : 'No appointments scheduled for today. Have a great day!';
    } else {
      const nextAppt = upcoming[0];
      const nextPName = nextAppt 
        ? (nextAppt.patients?.first_name ? `${nextAppt.patients.first_name} ${nextAppt.patients.last_name || ''}` : nextAppt.patient_name || (isArabic ? 'مريض' : 'Patient'))
        : null;

      if (isArabic) {
        body = `لديك إجمالي ${total} مواعيد اليوم (${upcoming.length} موعد قادم/مجدول).` +
          (nextPName ? ` الموعد القادم: ${nextPName} الساعة ${(nextAppt.appointment_time || '').slice(0, 5)}.` : '');
      } else {
        body = `You have ${total} total appointment(s) today (${upcoming.length} upcoming).` +
          (nextPName ? ` Next: ${nextPName} at ${(nextAppt.appointment_time || '').slice(0, 5)}.` : '');
      }
    }

    // Play chime sound
    playNotificationSound('3pm');

    // Add to In-App History
    addNotificationItem({
      type: '3pm_summary',
      title,
      body,
      date: todayDate,
      time: '15:00',
      meta: { totalAppts: total, upcomingCount: upcoming.length }
    });

    // In-app Floating Banner
    showFloatingNotificationBanner({
      title,
      body,
      type: '3pm',
      icon: '⏰',
      actionText: isArabic ? 'عرض الجدول' : 'View Schedule',
      onAction: () => {
        if (window.sw) window.sw('sched');
        if (window.schedToday) window.schedToday();
      }
    });

    // Browser System Notification
    dispatchSystemNotification({
      title,
      body,
      tag: 'zd-3pm-' + todayDate,
      onClick: () => {
        if (window.sw) window.sw('sched');
        if (window.schedToday) window.schedToday();
      }
    });

    if (!isManualTest) {
      localStorage.setItem('zd_notif_3pm_date', todayDate);
    }
  } catch (e) {
    console.error('Error triggering 3 PM notification:', e);
  }
}

export function initDaily3PMScheduler() {
  if (_daily3pmTimer) {
    clearTimeout(_daily3pmTimer);
    _daily3pmTimer = null;
  }

  const now = new Date();
  const target3PM = new Date();
  target3PM.setHours(15, 0, 0, 0); // 3:00 PM local time

  const todayDate = today();
  const lastTriggeredDate = localStorage.getItem('zd_notif_3pm_date');

  // If currently after 3:00 PM today and hasn't been triggered yet today, trigger after a brief delay
  if (now >= target3PM && lastTriggeredDate !== todayDate) {
    setTimeout(() => {
      triggerDaily3PMNotification(false);
    }, 3500);
    // Schedule for tomorrow at 3:00 PM
    target3PM.setDate(target3PM.getDate() + 1);
  } else if (now >= target3PM) {
    // Already triggered today, schedule for tomorrow 3:00 PM
    target3PM.setDate(target3PM.getDate() + 1);
  }

  const msUntil3PM = target3PM.getTime() - now.getTime();
  console.log(`[Zain Dental Notifications] Daily 3 PM notification scheduled in ${Math.round(msUntil3PM / 60000)} minutes`);

  _daily3pmTimer = setTimeout(() => {
    triggerDaily3PMNotification(false);
    // Reschedule for next day
    initDaily3PMScheduler();
  }, msUntil3PM);
}

// --------------------------------------------------
// FEATURE 2: Realtime Notifications for Appointments Booked to Other Users
// --------------------------------------------------
export function broadcastNewAppointmentBooked(apptData) {
  const currentUser = getCurrentUser();
  const bookerName = currentUser?.full_name || (isAr() ? 'موظف بالعيادة' : 'Clinic Staff');
  
  const payload = {
    event_type: 'appointment_booked',
    client_instance: CLIENT_INSTANCE_ID,
    sender_id: currentUser?.id || null,
    booked_by: bookerName,
    appointment_id: apptData.id || null,
    patient_id: apptData.patient_id,
    patient_name: apptData.patient_name || '',
    appointment_date: apptData.appointment_date,
    appointment_time: apptData.appointment_time,
    appt_type: apptData.appt_type,
    created_at: new Date().toISOString()
  };

  // 1. Broadcast via local BroadcastChannel (Multi-tab/window sync)
  if (_bc) {
    try {
      _bc.postMessage(payload);
    } catch (e) {}
  }

  // 2. Broadcast via Supabase Realtime channel
  if (_realtimeChannel) {
    try {
      _realtimeChannel.send({
        type: 'broadcast',
        event: 'new_appointment',
        payload
      });
    } catch (e) {
      console.warn('Supabase realtime broadcast error:', e);
    }
  }

  // Record this appt id so the current sender doesn't duplicate toast itself
  if (apptData.id) {
    _processedApptIds.add(String(apptData.id));
  }
}

export function handleIncomingNewAppointmentAlert(payload) {
  if (!payload || !payload.appointment_date) return;

  // Ignore if sent by the current tab/instance
  if (payload.client_instance === CLIENT_INSTANCE_ID) return;

  const apptKey = `${payload.appointment_id || ''}_${payload.appointment_date}_${payload.appointment_time}_${payload.patient_name}`;
  if (_processedApptIds.has(apptKey)) return;
  _processedApptIds.add(apptKey);

  const isArabic = isAr();
  const pName = payload.patient_name || (isArabic ? 'مريض جديد' : 'New Patient');
  const apptTime = (payload.appointment_time || '').slice(0, 5);
  const apptDate = payload.appointment_date;
  const bookedBy = payload.booked_by || (isArabic ? 'عضو بالفريق' : 'Staff');

  const title = isArabic ? '📅 حجز موعد جديد في العيادة' : '📅 New Appointment Booked';
  const body = isArabic
    ? `تم حجز موعد لـ ${pName} بتاريخ ${apptDate} الساعة ${apptTime} (بواسطة: ${bookedBy})`
    : `Appointment booked for ${pName} on ${apptDate} at ${apptTime} (by ${bookedBy})`;

  // Play audio chime
  playNotificationSound('booking');

  // Add to Notification Center history
  addNotificationItem({
    type: 'new_booking',
    title,
    body,
    date: apptDate,
    time: apptTime,
    patientName: pName,
    patientId: payload.patient_id,
    apptId: payload.appointment_id,
    bookedBy: bookedBy,
    timestamp: new Date().toISOString(),
    meta: payload
  });

  // Show Floating interactive In-App Banner
  showFloatingNotificationBanner({
    title,
    body,
    type: 'booking',
    icon: '📅',
    actionText: isArabic ? 'عرض بالجدول' : 'View in Schedule',
    onAction: () => {
      const dtInput = document.getElementById('sched-dt');
      if (dtInput) dtInput.value = apptDate;
      if (window.sw) window.sw('sched');
      if (window.loadSched) window.loadSched();
    }
  });

  // Show Browser / System Notification
  dispatchSystemNotification({
    title,
    body,
    tag: 'zd-booking-' + Date.now(),
    onClick: () => {
      const dtInput = document.getElementById('sched-dt');
      if (dtInput) dtInput.value = apptDate;
      if (window.sw) window.sw('sched');
      if (window.loadSched) window.loadSched();
    }
  });

  // Automatically refresh schedule if user is currently looking at this date!
  try {
    const currentSchedDate = document.getElementById('sched-dt')?.value;
    if (currentSchedDate === apptDate && window.loadSched) {
      window.loadSched();
    }
    if (apptDate === today() && window.loadQueue) {
      window.loadQueue();
    }
  } catch (e) {}
}

export function initRealtimeAppointmentListeners() {
  // 1. Local tab/window BroadcastChannel listener
  if (_bc) {
    _bc.onmessage = (event) => {
      if (event.data?.event_type === 'appointment_booked') {
        handleIncomingNewAppointmentAlert(event.data);
      }
    };
  }

  // 2. Supabase Realtime Channels (Broadcast + Postgres changes)
  try {
    const client = sb;
    if (client && typeof client.channel === 'function') {
      _realtimeChannel = client.channel('clinic_notifications_room')
        .on('broadcast', { event: 'new_appointment' }, ({ payload }) => {
          handleIncomingNewAppointmentAlert(payload);
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, (payload) => {
          const newRecord = payload.new;
          if (newRecord) {
            handleIncomingNewAppointmentAlert({
              client_instance: 'pg_listener',
              appointment_id: newRecord.id,
              patient_id: newRecord.patient_id,
              patient_name: newRecord.patient_name || '',
              appointment_date: newRecord.appointment_date,
              appointment_time: newRecord.appointment_time,
              appt_type: newRecord.appt_type,
              booked_by: isAr() ? 'النظام' : 'System',
              created_at: newRecord.created_at || new Date().toISOString()
            });
          }
        })
        .subscribe((status) => {
          console.log('[Zain Dental Notifications] Realtime subscription status:', status);
        });
    }
  } catch (e) {
    console.warn('Realtime channel setup skipped:', e);
  }
}

// --------------------------------------------------
// Notification Drawer & UI Rendering
// --------------------------------------------------
let _currentNotifFilter = 'all';

export function setNotificationFilter(filter) {
  _currentNotifFilter = filter;
  renderNotificationDrawer();
}

export function toggleNotificationDrawer() {
  const sheet = document.getElementById('sh-notifications');
  if (!sheet) return;
  const isOpen = sheet.classList.contains('open');
  if (isOpen) {
    sheet.classList.remove('open');
  } else {
    sheet.classList.add('open');
    updateNotificationPermissionUI();
    renderNotificationDrawer();
  }
}

export function closeNotificationDrawer() {
  const sheet = document.getElementById('sh-notifications');
  if (sheet) sheet.classList.remove('open');
}

export function renderNotificationDrawer() {
  const listEl = document.getElementById('notif-list-container');
  if (!listEl) return;

  const allNotifs = getStoredNotifications();
  let filtered = allNotifs;
  if (_currentNotifFilter === '3pm') {
    filtered = allNotifs.filter(n => n.type === '3pm_summary');
  } else if (_currentNotifFilter === 'bookings') {
    filtered = allNotifs.filter(n => n.type === 'new_booking');
  }

  // Update tabs active state
  ['all', '3pm', 'bookings'].forEach(tab => {
    const tabEl = document.getElementById(`notif-tab-${tab}`);
    if (tabEl) tabEl.classList.toggle('active', tab === _currentNotifFilter);
  });

  const isArabic = isAr();

  if (!filtered.length) {
    listEl.innerHTML = `
      <div class="empty" style="padding:48px 20px;text-align:center">
        <div style="font-size:36px;margin-bottom:12px;opacity:0.8">🔔</div>
        <div style="font-weight:700;color:var(--text);font-size:15px;margin-bottom:4px">
          ${isArabic ? 'لا توجد إشعارات حتى الآن' : 'No notifications yet'}
        </div>
        <div style="color:var(--text-muted);font-size:13px;max-width:260px;margin:0 auto">
          ${isArabic ? 'ستظهر هنا تذكيرات مواعيد الساعة 3:00 عصراً وإشعارات الحجوزات الجديدة فوراً.' : '3:00 PM appointment summaries and new booking alerts will appear here in real-time.'}
        </div>
      </div>
    `;
    return;
  }

  listEl.innerHTML = filtered.map(item => {
    const is3PM = item.type === '3pm_summary';
    const icon = is3PM ? '⏰' : '📅';
    const badgeColor = is3PM ? 'var(--navy)' : 'var(--teal)';
    const dateFormatted = item.timestamp ? new Date(item.timestamp).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : '';
    const dateDay = item.timestamp ? new Date(item.timestamp).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' }) : '';

    return `
      <div class="notif-card ${item.isRead ? 'read' : 'unread'}" onclick="window.handleNotificationCardClick('${item.id}', '${item.date}', '${item.type}')">
        <div class="notif-card-icon" style="background:${badgeColor}15;color:${badgeColor}">${icon}</div>
        <div class="notif-card-content">
          <div class="notif-card-header">
            <span class="notif-card-title">${esc(item.title)}</span>
            <span class="notif-card-time">${dateDay} · ${dateFormatted}</span>
          </div>
          <div class="notif-card-body">${esc(item.body)}</div>
          <div class="notif-card-footer">
            <span class="notif-card-tag" style="color:${badgeColor}">
              ${is3PM ? (isArabic ? 'ملخص 3:00 م' : '3 PM Summary') : (isArabic ? 'حجز موعد' : 'New Booking')}
            </span>
            <button class="notif-card-action-btn" onclick="event.stopPropagation();window.handleNotificationCardClick('${item.id}', '${item.date}', '${item.type}')">
              ${isArabic ? 'عرض الجدول 📅' : 'Open Schedule 📅'}
            </button>
          </div>
        </div>
        ${!item.isRead ? `<div class="notif-unread-dot" title="${isArabic ? 'غير مقروء' : 'Unread'}"></div>` : ''}
      </div>
    `;
  }).join('');
}

export function handleNotificationCardClick(notifId, targetDate, type) {
  markNotificationAsRead(notifId);
  closeNotificationDrawer();

  if (targetDate) {
    const dtInput = document.getElementById('sched-dt');
    if (dtInput) dtInput.value = targetDate;
  }
  if (window.sw) window.sw('sched');
  if (window.loadSched) window.loadSched();
}

// --------------------------------------------------
// Module Bootstrapping
// --------------------------------------------------
export function initNotificationSystem() {
  updateNotificationBadge();
  updateNotificationPermissionUI();
  initDaily3PMScheduler();
  initRealtimeAppointmentListeners();
  renderNotificationDrawer();
}
