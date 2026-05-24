// Drop4Life — Main application logic
// Auth, navigation, modals, toasts, data loading, page interactions.

// ============================================
// AUTH & ROLES
// ============================================
let currentUser = { username: 'admin', role: 'super_admin', name: 'د. عبدالرحمن عبدالله علي' };
const USERS = {
  'admin':  { password: 'admin123',  role: 'super_admin', name: 'د. عبدالرحمن عبدالله علي', badge: 'Super Admin' },
  'deputy': { password: 'deputy123', role: 'deputy',      name: 'د. ليلى سعد',    badge: 'Deputy' },
  'lab':    { password: 'lab123',    role: 'lab',         name: 'م. سامي حسن',    badge: 'Lab Admin' },
};

function attemptLogin() {
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value;
  const err = document.getElementById('login-error');
  const acct = USERS[u];
  if (acct && acct.password === p) {
    currentUser = { username: u, role: acct.role, name: acct.name };
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'flex';
    applyRoles();
    showToast(`تم تسجيل الدخول كـ ${acct.badge}`, 'success');
    loadAll();
  } else {
    err.style.display = 'block';
  }
}

function applyRoles() {
  const nameEl = document.getElementById('current-user-name');
  const roleEl = document.getElementById('current-user-role');
  const acct = USERS[currentUser.username] || { name: currentUser.name, badge: 'User' };
  if (nameEl) nameEl.innerText = acct.name;
  if (roleEl) roleEl.innerText = acct.badge;
  const menuName = document.getElementById('menu-user-name');
  const menuRole = document.getElementById('menu-user-role');
  if (menuName) menuName.innerText = acct.name;
  if (menuRole) menuRole.innerText = acct.badge;

  // Update avatar initials based on the current name
  const initial = (acct.name || '?').replace(/^د\.\s*/, '').trim().charAt(0) || '?';
  document.querySelectorAll('.user-avatar-sm').forEach(el => {
    if (el.children.length === 0) el.innerText = initial;
  });

  document.body.classList.remove('role-super-admin', 'role-deputy', 'role-lab', 'role-admin');
  document.body.classList.add('role-' + currentUser.role.replace('_', '-'));
  if (currentUser.role !== 'super_admin') document.body.classList.add('role-admin');

  const superSection = document.getElementById('super-admin-section');
  if (superSection) superSection.style.display = currentUser.role === 'super_admin' ? 'block' : 'none';

  const badge = document.getElementById('profile-badge');
  if (badge) badge.innerText = acct.badge;
}

function logout() {
  showToast('تم تسجيل الخروج بنجاح', 'success');
  setTimeout(() => location.reload(), 700);
}

// ============================================
// NAVIGATION
// ============================================
function navigate(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');
  if (el) el.classList.add('active');
  // Reload insights when entering that page
  if (page === 'insights') loadInsights();
  if (page === 'reports' || page === 'dashboard') loadStats();
}

// ============================================
// MODALS
// ============================================
function showModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}

// ============================================
// TOAST
// ============================================
function showToast(msg, type = 'success') {
  if (typeof translateText === 'function' && !isRTL) msg = translateText(msg, true);
  const icons = { success: 'fas fa-check-circle', warning: 'fas fa-exclamation-triangle', error: 'fas fa-times-circle' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="${icons[type] || icons.success}"></i><span class="toast-msg">${msg}</span>`;
  const c = document.getElementById('toast-container');
  if (!c) return;
  c.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-30px)';
    t.style.transition = 'all 0.3s';
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

// ============================================
// DROPDOWNS
// ============================================
function toggleUserMenu()  { document.getElementById('user-menu')?.classList.toggle('show'); }
function toggleNotifMenu() { document.getElementById('notif-menu')?.classList.toggle('show'); }
function toggleChatMenu()  {
  document.getElementById('chat-menu')?.classList.toggle('show');
  document.getElementById('global-chat-dot')?.style.setProperty('display', 'none');
}
function markNotifsRead() {
  document.querySelectorAll('.notif-item').forEach(item => item.classList.remove('unread'));
  document.getElementById('global-notif-dot')?.style.setProperty('display', 'none');
}
function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const msg = input?.value.trim();
  if (!msg) return;
  const list = document.getElementById('chat-messages');
  const time = new Date().toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  const roleName = document.getElementById('profile-badge')?.innerText || '';
  const bubble = document.createElement('div');
  bubble.style.cssText = 'background:var(--primary-pale); padding:8px 12px; border-radius:var(--radius-sm); border:1px solid var(--primary-light); animation: fadeIn 0.3s ease;';
  bubble.innerHTML = `
    <div style="font-size:11px; font-weight:700; color:var(--primary); margin-bottom:4px;">${currentUser.name} (${roleName})</div>
    <div style="font-size:12px; color:var(--text-primary);">${msg}</div>
    <div style="font-size:10px; color:var(--text-muted); margin-top:4px; text-align:left;">${time}</div>
  `;
  list.appendChild(bubble);
  input.value = '';
  list.scrollTop = list.scrollHeight;
}

// ============================================
// COMPATIBILITY CHECK
// ============================================
const COMPAT_MAP = {
  'A+':  ['A+','AB+'],
  'A-':  ['A+','A-','AB+','AB-'],
  'B+':  ['B+','AB+'],
  'B-':  ['B+','B-','AB+','AB-'],
  'O+':  ['A+','B+','O+','AB+'],
  'O-':  ['A+','A-','B+','B-','O+','O-','AB+','AB-'],
  'AB+': ['AB+'],
  'AB-': ['AB+','AB-'],
};
function checkCompat() {
  const d = document.getElementById('donor-type').value;
  const r = document.getElementById('recipient-type').value;
  const res = document.getElementById('compat-result');
  if (!d || !r) { res.style.display = 'none'; return; }
  const ok = COMPAT_MAP[d] && COMPAT_MAP[d].includes(r);
  res.style.display = 'block';
  res.innerHTML = ok
    ? `<div class="alert alert-success"><i class="fas fa-check-circle"></i><div class="alert-content"><h4>متوافق ✓</h4><p>يمكن نقل الدم من فصيلة ${d} إلى فصيلة ${r}</p></div></div>`
    : `<div class="alert alert-danger"><i class="fas fa-times-circle"></i><div class="alert-content"><h4>غير متوافق ✗</h4><p>لا يمكن نقل الدم من فصيلة ${d} إلى فصيلة ${r} — خطر الرفض المناعي</p></div></div>`;
  if (!isRTL) translateDOM(res, true);
}

// ============================================
// DARK MODE
// ============================================
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('drop4life_theme', isDark ? 'dark' : 'light');
  showToast(isDark ? 'تم تفعيل الوضع الليلي' : 'تم تفعيل الوضع الفاتح', 'success');
}

// ============================================
// SIDEBAR (MOBILE)
// ============================================
function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

// ============================================
// DATA LOADERS — populated from backend
// ============================================
async function loadStats() {
  try {
    const s = await API.stats();
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    set('dash-total-units',  s.totalUnits);
    set('dash-active-donors', s.activeDonors);
    set('dash-pending-reqs',  s.pendingRequests);
    set('dash-distributions', s.distributions);
  } catch (err) {
    console.warn('Stats unavailable:', err.message);
  }
}

async function loadDonors() {
  try {
    const donors = await API.getDonors();
    const tbody = document.getElementById('donors-tbody');
    if (!tbody) return;
    tbody.innerHTML = donors.map((d, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="avatar avatar-sm" style="background:linear-gradient(135deg,var(--primary),var(--accent))">${(d.name || '?').charAt(0)}</div>
            <div>
              <div style="font-weight:700;font-size:13px;">${d.name}</div>
              <div style="font-size:11px;color:var(--text-muted)">#${d.id}</div>
            </div>
          </div>
        </td>
        <td><span class="blood-tag">${d.bloodType}</span></td>
        <td>${d.age}</td>
        <td>${d.phone}</td>
        <td>${d.lastDonation}</td>
        <td><span style="font-weight:800;">${d.donationsCount}</span></td>
        <td>${statusBadge(d.status)}</td>
        <td><button class="btn btn-sm btn-outline" onclick="showModal('donor-detail-modal')">${isRTL ? 'عرض' : 'View'}</button></td>
      </tr>
    `).join('');
  } catch (err) {
    console.warn('Donors unavailable:', err.message);
  }
}

async function loadInventory() {
  try {
    const inv = await API.getInventory();
    const tbody = document.getElementById('inventory-tbody');
    if (!tbody) return;
    tbody.innerHTML = inv.map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td style="font-family:monospace">#${item.id}</td>
        <td><span class="blood-tag">${item.bloodType}</span></td>
        <td>${item.type}</td>
        <td>${item.donationDate || '—'}</td>
        <td>${item.expiryDate || '—'}</td>
        <td>${item.donor || '—'}</td>
        <td>${item.storage || '—'}</td>
        <td>${statusBadge(item.status)}</td>
        <td><button class="btn btn-sm btn-primary">${isRTL ? 'استخدام' : 'Use'}</button></td>
      </tr>
    `).join('');
  } catch (err) {
    console.warn('Inventory unavailable:', err.message);
  }
}

async function loadRequests() {
  try {
    const requests = await API.getRequests();
    const tbody = document.getElementById('requests-tbody');
    if (!tbody) return;
    tbody.innerHTML = requests.map(r => {
      let actionHtml;
      if (r.status === 'new') {
        actionHtml = `
          <button class="btn btn-sm super-admin-only" style="background:var(--info); color:#fff;" onclick="reviewRequestDetails(this, '${r.id}')"><i class="fas fa-eye"></i> ${isRTL ? 'مراجعة وموافقة' : 'Review & Approve'}</button>
          <span class="badge badge-gray admin-fallback"><i class="fas fa-lock"></i> ${isRTL ? 'بانتظار المدير' : 'Awaiting Manager'}</span>
        `;
      } else if (r.status === 'processing') {
        actionHtml = `<button class="btn btn-primary btn-sm" onclick="shipRequest(this, '${r.id}')">${isRTL ? 'تجهيز الشحنة' : 'Prepare Shipment'}</button>`;
      } else if (r.status === 'completed') {
        actionHtml = `<button class="btn btn-ghost btn-sm" onclick="showShipmentDetails(this, '${r.id}')">${isRTL ? 'تفاصيل' : 'Details'}</button>`;
      } else {
        actionHtml = `<span class="badge badge-gray">${isRTL ? 'مرفوض' : 'Rejected'}</span>`;
      }
      return `
        <tr>
          <td style="font-family:monospace">#${r.id}</td>
          <td>
            <div style="font-weight:600">${r.hospital}</div>
            <div style="font-size:11px; color:var(--text-muted)">${r.doctor}</div>
          </td>
          <td><span class="blood-tag">${r.bloodType}</span></td>
          <td style="font-weight:800; font-size:16px;">${r.quantity}</td>
          <td>${priorityBadge(r.priority)}</td>
          <td>${r.date}</td>
          <td class="status-cell">${requestStatusBadge(r.status)}</td>
          <td class="action-cell">${actionHtml}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.warn('Requests unavailable:', err.message);
  }
}

async function loadActivity() {
  try {
    const acts = await API.activity();
    const wrap = document.getElementById('activity-timeline');
    if (!wrap) return;
    if (!acts.length) {
      wrap.innerHTML = `<div class="text-muted" style="text-align:center; padding:24px;">${isRTL ? 'لا توجد أنشطة' : 'No activity yet'}</div>`;
      return;
    }
    const iconMap = { tint:'tl-red', hospital:'tl-blue', flask:'tl-orange', check:'tl-green', truck:'tl-purple', 'user-plus':'tl-blue', vial:'tl-orange', exclamation:'tl-red', times:'tl-red', info:'tl-blue' };
    wrap.innerHTML = acts.map(a => `
      <div class="timeline-item">
        <div class="timeline-dot ${iconMap[a.icon] || 'tl-blue'}"><i class="fas fa-${a.icon || 'info'}"></i></div>
        <div class="timeline-content">
          <h4>${a.title}</h4>
          <p>${a.detail || ''}</p>
          <div class="timeline-time">${new Date(a.createdAt).toLocaleString(isRTL ? 'ar-EG' : 'en-US')}</div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.warn('Activity unavailable:', err.message);
  }
}

async function loadInsights() {
  try {
    const data = await API.insights();
    const grid = document.getElementById('insights-grid');
    const metrics = document.getElementById('insights-metrics');
    if (metrics) {
      metrics.innerHTML = `
        <div class="metric-card"><div class="metric-val">${data.eligibleDonors}</div><div class="metric-label">${isRTL ? 'متبرعون مؤهلون' : 'Eligible donors'}</div></div>
        <div class="metric-card"><div class="metric-val" style="color:var(--warning)">${data.expiringSoon}</div><div class="metric-label">${isRTL ? 'تنتهي خلال أسبوع' : 'Expiring this week'}</div></div>
        <div class="metric-card"><div class="metric-val" style="color:var(--danger)">${data.urgentReqs}</div><div class="metric-label">${isRTL ? 'طلبات عاجلة معلقة' : 'Pending urgent requests'}</div></div>
        <div class="metric-card"><div class="metric-val" style="color:var(--success)">${data.lowStock.length}</div><div class="metric-label">${isRTL ? 'فصائل في حالة حرجة' : 'Critical types'}</div></div>
      `;
    }
    if (grid) {
      if (!data.insights.length) {
        grid.innerHTML = `<div class="card" style="grid-column: 1 / -1; padding:32px; text-align:center;"><i class="fas fa-check-circle" style="font-size:36px;color:var(--success);margin-bottom:8px;"></i><h3>${isRTL ? 'النظام يعمل بكفاءة عالية' : 'System running smoothly'}</h3></div>`;
      } else {
        grid.innerHTML = data.insights.map(i => `
          <div class="insight-card ${i.level}">
            <div class="insight-icon"><i class="fas fa-${i.icon}"></i></div>
            <div class="insight-text">
              <h4>${i.title}</h4>
              <p>${i.detail}</p>
            </div>
          </div>
        `).join('');
      }
    }
    loadActivity();
  } catch (err) {
    console.warn('Insights unavailable:', err.message);
    const grid = document.getElementById('insights-grid');
    if (grid) grid.innerHTML = `<div class="alert alert-warning" style="grid-column: 1 / -1;"><i class="fas fa-plug"></i><div class="alert-content"><h4>${isRTL ? 'الخادم غير متصل' : 'Backend offline'}</h4><p>${isRTL ? 'تأكد من تشغيل الخادم على localhost:3000' : 'Make sure the server is running on localhost:3000'}</p></div></div>`;
  }
}

function statusBadge(s) {
  const map = isRTL
    ? { eligible:['green','مؤهل'], waiting:['orange','في انتظار الدور'], suspended:['red','موقوف'], pending:['gray','معلق'], valid:['green','صالح'], expiring:['orange','قريب الانتهاء'] }
    : { eligible:['green','Eligible'], waiting:['orange','Waiting'], suspended:['red','Suspended'], pending:['gray','Pending'], valid:['green','Valid'], expiring:['orange','Expiring'] };
  const [cls, txt] = map[s] || ['gray', s];
  return `<span class="badge badge-${cls}">${txt}</span>`;
}

function priorityBadge(p) {
  const map = isRTL
    ? { critical:['red','عاجل جداً'], urgent:['orange','عاجل'], normal:['gray','عادي'] }
    : { critical:['red','Very Urgent'], urgent:['orange','Urgent'], normal:['gray','Normal'] };
  const [cls, txt] = map[p] || ['gray', p];
  return `<span class="badge badge-${cls}">${txt}</span>`;
}

function requestStatusBadge(s) {
  const map = isRTL
    ? { new:['blue','جديد'], processing:['orange','قيد المعالجة'], completed:['green','مكتمل'], rejected:['red','مرفوض'] }
    : { new:['blue','New'], processing:['orange','Processing'], completed:['green','Completed'], rejected:['red','Rejected'] };
  const [cls, txt] = map[s] || ['gray', s];
  return `<span class="badge badge-${cls} status-badge">${txt}</span>`;
}

// ============================================
// REQUEST WORKFLOW
// ============================================
let currentReviewBtn = null;
let currentReviewReqId = null;

function reviewRequestDetails(btn, reqId) {
  currentReviewBtn = btn;
  currentReviewReqId = reqId;
  const row = btn.closest('tr');
  const hospital = row.cells[1].innerText.split('\n')[0];
  const bloodType = row.cells[2].innerText;
  const quantity = parseInt(row.cells[3].innerText);
  let invCount = Math.floor(Math.random() * 50) + 10;
  if (bloodType.includes('AB-')) invCount = 3;
  document.getElementById('review-req-id').innerText = '#' + reqId;
  document.getElementById('review-req-hospital').innerText = hospital;
  document.getElementById('review-req-blood').innerText = bloodType;
  document.getElementById('review-req-qty').innerText = quantity;
  document.getElementById('review-inv-qty').innerText = invCount;
  document.getElementById('review-req-notes').value = '';
  const invEl = document.getElementById('review-inv-qty');
  invEl.style.color = (invCount < quantity) ? 'var(--danger)' : 'var(--success)';
  showModal('review-request-modal');
}

async function confirmRequestApproval() {
  if (!currentReviewReqId) return;
  try {
    await API.approveRequest(currentReviewReqId);
    closeModal('review-request-modal');
    showToast('تمت الموافقة وحفظ الحالة في قاعدة البيانات', 'success');
    loadRequests(); loadStats();
  } catch (err) {
    showToast('خطأ في الاتصال بالخادم', 'error');
  }
}

async function rejectRequest() {
  if (!currentReviewReqId) return;
  try {
    await API.rejectRequest(currentReviewReqId);
    closeModal('review-request-modal');
    showToast('تم رفض الطلب', 'error');
    loadRequests();
  } catch (err) {
    showToast('خطأ في الاتصال بالخادم', 'error');
  }
}

async function shipRequest(btn, reqId) {
  try {
    await API.shipRequest(reqId);
    showToast('تم تجهيز الشحنة للطلب', 'success');
    loadRequests(); loadStats();
  } catch (err) {
    showToast('خطأ في الاتصال بالخادم', 'error');
  }
}

function showShipmentDetails(btn, reqId) {
  const row = btn.closest('tr');
  document.getElementById('shipment-detail-id').innerText = '#' + reqId;
  document.getElementById('shipment-detail-hospital').innerText = row.cells[1].innerText.split('\n')[0];
  document.getElementById('shipment-detail-blood').innerText = `${row.cells[2].innerText} (${row.cells[3].innerText} ${isRTL ? 'وحدة' : 'Units'})`;
  document.getElementById('shipment-detail-driver').innerText = isRTL ? 'أحمد سليم' : 'Ahmed Selim';
  document.getElementById('shipment-detail-vehicle').innerText = 'ABC 1234';
  document.getElementById('shipment-detail-departure').innerText = '02:30 PM';
  document.getElementById('shipment-detail-arrival').innerText = '03:15 PM';
  showModal('shipment-details-modal');
}

// ============================================
// FORM SUBMISSIONS
// ============================================
async function submitNewDonor() {
  const fname = document.getElementById('new-donor-fname').value;
  const lname = document.getElementById('new-donor-lname').value;
  const phone = document.getElementById('new-donor-phone').value;
  const bloodType = document.getElementById('new-donor-blood')?.value;
  if (!fname) { showToast('الاسم مطلوب', 'error'); return; }
  try {
    await API.addDonor({ name: `${fname} ${lname}`.trim(), phone, bloodType });
    closeModal('add-donor-modal');
    showToast('تم حفظ المتبرع في قاعدة البيانات', 'success');
    loadDonors(); loadStats();
  } catch (err) {
    showToast('خطأ في الاتصال بالخادم', 'error');
  }
}

async function submitNewRequest() {
  try {
    const hospital = document.getElementById('new-req-hospital').value || 'مستشفى عام';
    const doctor = document.getElementById('new-req-doctor').value || '';
    const bloodType = document.getElementById('new-req-blood').value;
    const quantity = parseInt(document.getElementById('new-req-qty').value) || 1;
    const priority = document.getElementById('new-req-priority').value;
    const notes = document.getElementById('new-req-notes')?.value || '';
    await API.addRequest({ hospital, doctor, bloodType, quantity, priority, notes });
    closeModal('add-request-modal');
    showToast('تم تسجيل الطلب في قاعدة البيانات بنجاح', 'success');
    loadRequests(); loadStats();
  } catch (err) {
    showToast('خطأ في الاتصال بالخادم', 'error');
  }
}

async function submitNewStock() {
  try {
    const bloodType = document.getElementById('new-stock-blood').value;
    const type = document.getElementById('new-stock-type').value;
    const donationDate = document.getElementById('new-stock-date').value;
    const expiryDate = document.getElementById('new-stock-expiry').value;
    const storage = document.getElementById('new-stock-storage').value;
    await API.addInventory({ bloodType, type, donationDate, expiryDate, storage });
    closeModal('add-stock-modal');
    showToast('تمت إضافة المخزون بنجاح!', 'success');
    loadInventory(); loadStats();
  } catch (err) {
    showToast('خطأ في الاتصال بالخادم', 'error');
  }
}

// ============================================
// MANAGER (settings)
// ============================================
function addNewManager() {
  const name = document.getElementById('new-mgr-name').value || 'مشرف جديد';
  const roleVal = document.getElementById('new-mgr-role').value;
  let roleText = 'نائب';
  if (roleVal === 'super_admin') roleText = 'Super Admin';
  else if (roleVal === 'lab') roleText = 'Lab Admin';
  const list = document.getElementById('managers-list');
  if (!list) return;
  const card = document.createElement('div');
  card.style.cssText = 'display:flex; align-items:center; justify-content:space-between; padding:10px; background:var(--bg-main); border-radius:var(--radius-sm); border: 1px solid var(--border); animation: fadeIn 0.3s ease;';
  card.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px;">
      <div class="avatar avatar-sm" style="background:linear-gradient(135deg,var(--primary),var(--accent))">${name.charAt(0)}</div>
      <div><div style="font-size:13px; font-weight:700;">${name}</div><div style="font-size:11px; color:var(--text-muted)">${roleText}</div></div>
    </div>
    <div style="display:flex; gap:6px;">
      <button class="btn btn-sm btn-ghost"><i class="fas fa-edit"></i></button>
      <button class="btn btn-sm" style="background:var(--danger-light); color:var(--danger);" onclick="this.parentElement.parentElement.remove(); showToast('تم حذف المشرف بنجاح', 'success')"><i class="fas fa-trash"></i></button>
    </div>
  `;
  list.appendChild(card);
  closeModal('add-manager-modal');
  showToast('تمت إضافة المشرف بنجاح', 'success');
  ['new-mgr-name', 'new-mgr-user', 'new-mgr-pass'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

// ============================================
// EXCEL EXPORT (CSV with BOM)
// ============================================
async function exportSystemDataToExcel() {
  showToast('جاري تجميع البيانات وتحويلها لملف Excel...', 'success');
  let csv = '﻿';
  try {
    const [donors, inv, reqs] = await Promise.all([API.getDonors(), API.getInventory(), API.getRequests()]);
    csv += '=== Donors ===\nID,Name,Type,Phone,Status\n';
    donors.forEach(d => csv += `${d.id},${d.name},${d.bloodType},${d.phone},${d.status}\n`);
    csv += '\n=== Inventory ===\nID,Type,Kind,Donation,Expiry,Status\n';
    inv.forEach(i => csv += `${i.id},${i.bloodType},${i.type},${i.donationDate},${i.expiryDate},${i.status}\n`);
    csv += '\n=== Requests ===\nID,Hospital,Type,Quantity,Priority,Status\n';
    reqs.forEach(r => csv += `${r.id},${r.hospital},${r.bloodType},${r.quantity},${r.priority},${r.status}\n`);
  } catch (err) {
    csv += 'Backend unavailable\n';
  }
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Drop4Life_Export.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('تم تصدير ملف Excel بنجاح!', 'success');
}

// ============================================
// GLOBAL EVENTS & INIT
// ============================================
async function loadAll() {
  await Promise.all([loadStats(), loadDonors(), loadInventory(), loadRequests()]);
}

document.addEventListener('DOMContentLoaded', () => {
  // Theme persistence
  if (localStorage.getItem('drop4life_theme') === 'dark') document.body.classList.add('dark-mode');

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); });
  });

  // Esc to close all open modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
  });

  // Click-away for dropdowns
  window.addEventListener('click', e => {
    if (!e.target.closest('.user-dropdown')) document.getElementById('user-menu')?.classList.remove('show');
    if (!e.target.closest('#chat-dropdown'))  document.getElementById('chat-menu')?.classList.remove('show');
    if (!e.target.closest('.notif-dropdown') || e.target.closest('#chat-dropdown')) {
      // only close notif-menu when truly outside notif dropdown
      const insideNotif = e.target.closest('.notif-dropdown') && !e.target.closest('#chat-dropdown');
      if (!insideNotif) document.getElementById('notif-menu')?.classList.remove('show');
    }
  });

  // Mobile sidebar click-away
  document.addEventListener('click', e => {
    const sidebar = document.getElementById('sidebar');
    const btn = document.querySelector('.mobile-menu-btn');
    if (window.innerWidth <= 900 && sidebar?.classList.contains('open')) {
      if (!sidebar.contains(e.target) && btn && !btn.contains(e.target)) sidebar.classList.remove('open');
    }
  });

  // Topbar search → navigate by keyword
  document.querySelector('.topbar-search input')?.addEventListener('input', function () {
    const q = this.value.toLowerCase();
    const map = {
      'مخزون':'inventory','inventory':'inventory',
      'متبرع':'donors','donor':'donors',
      'طلب':'requests','request':'requests',
      'تقرير':'reports','report':'reports',
      'توزيع':'distribution','distribution':'distribution',
      'فحص':'screening','screening':'screening',
      'جلسة':'donation-sessions','session':'donation-sessions',
      'توافق':'compatibility','compat':'compatibility',
      'تحليل':'insights','insight':'insights','رؤى':'insights',
    };
    for (const [key, page] of Object.entries(map)) {
      if (q && key.includes(q)) {
        const navEl = document.querySelector(`[data-nav="${page}"]`);
        if (navEl) { navigate(page, navEl); this.value = ''; return; }
      }
    }
  });

  applyRoles();

  // Apply initial language (English by default) AFTER applyRoles so the user
  // name injected into the DOM gets translated in the same pass.
  if (typeof applyInitialLanguage === 'function') applyInitialLanguage();

  // For demo we start on the dashboard already; load data if backend is up.
  loadAll().catch(() => {});
});
