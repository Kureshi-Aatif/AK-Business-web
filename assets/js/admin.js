/**
 * AK Digital Studio - Admin Portal Client JS
 * Zero external dependencies. Communicates with /api/admin/* using Bearer token stored in sessionStorage.
 */

import { API_BASE_URL } from './config.js';

let currentTab = 'inquiries'; // 'inquiries' | 'contacts'
let recordsCache = [];
let activeRecord = null;

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('admin-login-form');
  const tokenInput = document.getElementById('admin-token-input');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const searchInput = document.getElementById('admin-search');
  const statusFilter = document.getElementById('admin-status-filter');
  const exportBtn = document.getElementById('admin-export-btn');
  const tabInquiries = document.getElementById('tab-inquiries');
  const tabContacts = document.getElementById('tab-contacts');
  const drawerClose = document.getElementById('drawer-close');
  const drawerOverlay = document.getElementById('drawer-overlay');

  // Check existing session token
  const savedToken = sessionStorage.getItem('ak_admin_token');
  if (savedToken) {
    verifyAndLoadDashboard(savedToken);
  } else {
    showLoginView();
  }

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = tokenInput.value.trim();
      if (!token) return;

      const loginError = document.getElementById('login-error');
      if (loginError) loginError.style.display = 'none';

      const success = await verifyAndLoadDashboard(token);
      if (!success && loginError) {
        loginError.textContent = 'Invalid administrator token. Access denied.';
        loginError.style.display = 'block';
      }
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('ak_admin_token');
      showLoginView();
    });
  }

  // Tabs
  if (tabInquiries) {
    tabInquiries.addEventListener('click', () => {
      currentTab = 'inquiries';
      tabInquiries.classList.add('is-active');
      if (tabContacts) tabContacts.classList.remove('is-active');
      loadRecords();
    });
  }
  if (tabContacts) {
    tabContacts.addEventListener('click', () => {
      currentTab = 'contacts';
      tabContacts.classList.add('is-active');
      if (tabInquiries) tabInquiries.classList.remove('is-active');
      loadRecords();
    });
  }

  // Search & Filter
  if (searchInput) {
    searchInput.addEventListener('input', () => renderTable());
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', () => renderTable());
  }

  // CSV Export
  if (exportBtn) {
    exportBtn.addEventListener('click', () => exportToCsv());
  }

  // Drawer Close
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);
});

function showLoginView() {
  const loginView = document.getElementById('admin-login-view');
  const dashView = document.getElementById('admin-dashboard-view');
  if (loginView) loginView.style.display = 'block';
  if (dashView) dashView.style.display = 'none';
}

function showDashboardView() {
  const loginView = document.getElementById('admin-login-view');
  const dashView = document.getElementById('admin-dashboard-view');
  if (loginView) loginView.style.display = 'none';
  if (dashView) dashView.style.display = 'block';
}

async function verifyAndLoadDashboard(token) {
  try {
    const res = await fetch(`${API_BASE_URL || ''}/api/admin/inquiries`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      sessionStorage.removeItem('ak_admin_token');
      return false;
    }

    sessionStorage.setItem('ak_admin_token', token);
    showDashboardView();
    loadRecords();
    loadStats();
    return true;
  } catch (err) {
    return false;
  }
}

async function loadRecords() {
  const token = sessionStorage.getItem('ak_admin_token');
  if (!token) return;

  const endpoint = currentTab === 'inquiries' ? '/api/admin/inquiries' : '/api/admin/contacts';
  const tableBody = document.getElementById('admin-table-body');
  if (tableBody) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--color-slate);">Loading records...</td></tr>`;
  }

  try {
    const res = await fetch(`${API_BASE_URL || ''}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) throw new Error('Unauthorized');

    const data = await res.json();
    recordsCache = data.items || [];
    renderTable();
  } catch (err) {
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--color-error);">Failed to load records. Please re-login.</td></tr>`;
    }
  }
}

async function loadStats() {
  const token = sessionStorage.getItem('ak_admin_token');
  if (!token) return;

  try {
    const [inqRes, cntRes] = await Promise.all([
      fetch(`${API_BASE_URL || ''}/api/admin/inquiries`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`${API_BASE_URL || ''}/api/admin/contacts`, { headers: { 'Authorization': `Bearer ${token}` } })
    ]);

    const inqData = await inqRes.json();
    const cntData = await cntRes.json();

    const inqs = inqData.items || [];
    const cnts = cntData.items || [];

    const statInq = document.getElementById('stat-total-inquiries');
    const statCnt = document.getElementById('stat-total-contacts');
    const statWeek = document.getElementById('stat-new-week');

    if (statInq) statInq.textContent = inqs.length;
    if (statCnt) statCnt.textContent = cnts.length;

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newInqs = inqs.filter(r => new Date(r.created_at).getTime() >= oneWeekAgo).length;
    const newCnts = cnts.filter(r => new Date(r.created_at).getTime() >= oneWeekAgo).length;
    if (statWeek) statWeek.textContent = newInqs + newCnts;
  } catch (e) {
    // Stats optional
  }
}

function renderTable() {
  const tableBody = document.getElementById('admin-table-body');
  if (!tableBody) return;

  const search = (document.getElementById('admin-search')?.value || '').toLowerCase().trim();
  const status = (document.getElementById('admin-status-filter')?.value || '').toLowerCase().trim();

  const filtered = recordsCache.filter(item => {
    if (status && (item.status || 'new').toLowerCase() !== status) return false;
    if (search) {
      const match = [
        item.reference,
        item.name,
        item.email,
        item.phone,
        item.business_name,
        item.interest,
        item.subject,
        item.details,
        item.message
      ].join(' ').toLowerCase();
      if (!match.includes(search)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--color-slate);">No records found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = filtered.map(item => {
    const isContact = currentTab === 'contacts';
    const dateFormatted = new Date(item.created_at).toLocaleDateString('en-IN', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const statusBadgeClass = getStatusClass(item.status);
    const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${item.name}, regarding your ${isContact ? 'message' : 'inquiry'} (${item.reference}) with AK Digital Studio:`)}` : null;

    return `
      <tr class="data-row" data-id="${item.id}" style="cursor: pointer;">
        <td><strong>${escapeHtml(item.reference)}</strong></td>
        <td style="font-size: 0.88rem; color: var(--color-slate); white-space: nowrap;">${dateFormatted}</td>
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td>
          <div style="font-size: 0.9rem;"><a href="mailto:${escapeHtml(item.email)}" style="color: var(--color-royal);">${escapeHtml(item.email)}</a></div>
          <div style="font-size: 0.85rem; color: var(--color-slate);">${escapeHtml(item.phone || 'N/A')}</div>
        </td>
        <td>
          <span class="badge badge--sky" style="font-size: 0.8rem;">${escapeHtml(isContact ? item.subject : item.interest)}</span>
        </td>
        <td>
          <span class="status-pill ${statusBadgeClass}">${escapeHtml(item.status || 'new')}</span>
        </td>
        <td>
          <div style="display: flex; gap: 8px;" onclick="event.stopPropagation()">
            ${waUrl ? `<a href="${waUrl}" target="_blank" rel="noopener" class="btn btn--sm" style="background: #25D366; color: #fff; padding: 4px 10px; font-size: 0.8rem;" title="WhatsApp">WA</a>` : ''}
            <a href="mailto:${escapeHtml(item.email)}" class="btn btn--outline-sky btn--sm" style="padding: 4px 10px; font-size: 0.8rem;" title="Email">Email</a>
            <button class="btn btn--outline btn--sm" style="padding: 4px 10px; font-size: 0.8rem;" onclick="viewRecordDetails(${item.id})">Details</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Row click listener
  tableBody.querySelectorAll('.data-row').forEach(row => {
    row.addEventListener('click', (e) => {
      const id = parseInt(row.getAttribute('data-id'), 10);
      viewRecordDetails(id);
    });
  });
}

function getStatusClass(status) {
  const s = (status || 'new').toLowerCase();
  if (s === 'new') return 'status-new';
  if (s === 'in discussion' || s === 'in_progress') return 'status-discussion';
  if (s === 'proposal sent') return 'status-proposal';
  if (s === 'completed') return 'status-completed';
  if (s === 'archived') return 'status-archived';
  return 'status-new';
}

window.viewRecordDetails = function(id) {
  const item = recordsCache.find(r => r.id === id);
  if (!item) return;

  activeRecord = item;
  const isContact = currentTab === 'contacts';
  const drawer = document.getElementById('admin-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const drawerTitle = document.getElementById('drawer-title');
  const drawerBody = document.getElementById('drawer-content');

  if (!drawer || !drawerBody) return;

  drawerTitle.textContent = `${item.reference} - ${item.name}`;

  const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${item.name}, regarding your ${isContact ? 'message' : 'inquiry'} (${item.reference}) with AK Digital Studio:`)}` : null;

  drawerBody.innerHTML = `
    <div style="display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap;">
      ${waUrl ? `<a href="${waUrl}" target="_blank" rel="noopener" class="btn btn--primary btn--sm" style="background: #25D366; border-color: #25D366;">Chat on WhatsApp</a>` : ''}
      <a href="mailto:${escapeHtml(item.email)}?subject=${encodeURIComponent(`AK Digital Studio - ${item.reference}`)}" class="btn btn--royal btn--sm">Reply by Email</a>
    </div>

    <div class="drawer-field">
      <div class="drawer-field-label">Reference ID</div>
      <div class="drawer-field-val"><strong>${escapeHtml(item.reference)}</strong></div>
    </div>

    <div class="drawer-field">
      <div class="drawer-field-label">Date Submitted</div>
      <div class="drawer-field-val">${new Date(item.created_at).toLocaleString('en-IN')}</div>
    </div>

    <div class="drawer-field">
      <div class="drawer-field-label">Full Name</div>
      <div class="drawer-field-val"><strong>${escapeHtml(item.name)}</strong></div>
    </div>

    <div class="drawer-field">
      <div class="drawer-field-label">Email</div>
      <div class="drawer-field-val"><a href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a></div>
    </div>

    <div class="drawer-field">
      <div class="drawer-field-label">Phone / WhatsApp</div>
      <div class="drawer-field-val">${item.phone ? `<a href="tel:${escapeHtml(item.phone)}">${escapeHtml(item.phone)}</a>` : 'Not provided'}</div>
    </div>

    ${!isContact ? `
      <div class="drawer-field">
        <div class="drawer-field-label">Business Name & Type</div>
        <div class="drawer-field-val">${escapeHtml(item.business_name || 'N/A')} (${escapeHtml(item.business_type || 'N/A')})</div>
      </div>

      <div class="drawer-field">
        <div class="drawer-field-label">Interested In</div>
        <div class="drawer-field-val"><span class="badge badge--orange">${escapeHtml(item.interest)}</span></div>
      </div>

      <div class="drawer-field">
        <div class="drawer-field-label">Budget & Timeline</div>
        <div class="drawer-field-val">${escapeHtml(item.budget || 'Not specified')} | ${escapeHtml(item.timeline || 'Not specified')}</div>
      </div>

      <div class="drawer-field">
        <div class="drawer-field-label">Preferred Contact Method</div>
        <div class="drawer-field-val">${escapeHtml(item.contact_method || 'WhatsApp')}</div>
      </div>
    ` : `
      <div class="drawer-field">
        <div class="drawer-field-label">Subject</div>
        <div class="drawer-field-val"><strong>${escapeHtml(item.subject)}</strong></div>
      </div>
    `}

    <div class="drawer-field">
      <div class="drawer-field-label">${isContact ? 'Message Content' : 'Project Details'}</div>
      <div class="drawer-field-val" style="white-space: pre-wrap; background: #FAFCFF; padding: 14px; border-radius: 8px; border: 1px solid var(--color-line); font-size: 0.95rem;">
        ${escapeHtml(isContact ? item.message : item.details)}
      </div>
    </div>

    <div class="drawer-field">
      <div class="drawer-field-label">Status</div>
      <select id="drawer-status-select" class="form-control" style="max-width: 260px; font-weight: 700;">
        <option value="new" ${item.status === 'new' ? 'selected' : ''}>New</option>
        <option value="in discussion" ${item.status === 'in discussion' ? 'selected' : ''}>In Discussion</option>
        <option value="proposal sent" ${item.status === 'proposal sent' ? 'selected' : ''}>Proposal Sent</option>
        <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Completed</option>
        <option value="archived" ${item.status === 'archived' ? 'selected' : ''}>Archived</option>
      </select>
    </div>

    <div class="drawer-field">
      <div class="drawer-field-label">Internal Studio Notes</div>
      <textarea id="drawer-notes-input" class="form-control" rows="4" placeholder="Add private notes regarding client calls, custom scope, or quotation details...">${escapeHtml(item.notes || '')}</textarea>
    </div>

    <div style="display: flex; gap: 12px; margin-top: 20px;">
      <button id="drawer-save-btn" class="btn btn--primary">Save Changes</button>
      <button id="drawer-delete-btn" class="btn btn--outline" style="color: var(--color-error); border-color: var(--color-error);">Delete Record</button>
    </div>

    <div style="margin-top: 30px; font-size: 0.8rem; color: var(--color-slate); border-top: 1px solid var(--color-line); padding-top: 14px;">
      <div>IP Hash: ${escapeHtml(item.ip_hash || 'N/A')}</div>
      <div>UTM Source: ${escapeHtml(item.utm_source || 'direct')}</div>
    </div>
  `;

  document.getElementById('drawer-save-btn')?.addEventListener('click', saveActiveRecord);
  document.getElementById('drawer-delete-btn')?.addEventListener('click', deleteActiveRecord);

  drawer.classList.add('is-open');
  if (overlay) overlay.classList.add('is-open');
};

async function saveActiveRecord() {
  if (!activeRecord) return;
  const token = sessionStorage.getItem('ak_admin_token');
  if (!token) return;

  const status = document.getElementById('drawer-status-select')?.value;
  const notes = document.getElementById('drawer-notes-input')?.value;
  const saveBtn = document.getElementById('drawer-save-btn');

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
  }

  const endpoint = currentTab === 'inquiries' ? `/api/admin/inquiries/${activeRecord.id}` : `/api/admin/contacts/${activeRecord.id}`;

  try {
    const res = await fetch(`${API_BASE_URL || ''}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, notes })
    });

    if (res.ok) {
      activeRecord.status = status;
      activeRecord.notes = notes;
      renderTable();
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Saved!';
        setTimeout(() => { saveBtn.textContent = 'Save Changes'; }, 2000);
      }
    } else {
      alert('Failed to update record.');
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
      }
    }
  } catch (err) {
    alert('Network error while saving changes.');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Changes';
    }
  }
}

async function deleteActiveRecord() {
  if (!activeRecord) return;
  if (!confirm(`Are you sure you want to permanently delete record ${activeRecord.reference}?`)) return;

  const token = sessionStorage.getItem('ak_admin_token');
  if (!token) return;

  const endpoint = currentTab === 'inquiries' ? `/api/admin/inquiries/${activeRecord.id}` : `/api/admin/contacts/${activeRecord.id}`;

  try {
    const res = await fetch(`${API_BASE_URL || ''}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      recordsCache = recordsCache.filter(r => r.id !== activeRecord.id);
      renderTable();
      closeDrawer();
      loadStats();
    } else {
      alert('Failed to delete record.');
    }
  } catch (err) {
    alert('Network error while deleting record.');
  }
}

function closeDrawer() {
  const drawer = document.getElementById('admin-drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (drawer) drawer.classList.remove('is-open');
  if (overlay) overlay.classList.remove('is-open');
  activeRecord = null;
}

function exportToCsv() {
  if (recordsCache.length === 0) {
    alert('No records available to export.');
    return;
  }

  const isContact = currentTab === 'contacts';
  let headers = [];
  let rows = [];

  if (!isContact) {
    headers = ['Reference', 'Date', 'Name', 'Email', 'Phone', 'Business Name', 'Business Type', 'Interest', 'Budget', 'Timeline', 'Contact Method', 'Status', 'Notes', 'Details'];
    rows = recordsCache.map(r => [
      r.reference,
      r.created_at,
      r.name,
      r.email,
      r.phone,
      r.business_name || '',
      r.business_type || '',
      r.interest,
      r.budget || '',
      r.timeline || '',
      r.contact_method || '',
      r.status || 'new',
      r.notes || '',
      (r.details || '').replace(/\r?\n/g, ' ')
    ]);
  } else {
    headers = ['Reference', 'Date', 'Name', 'Email', 'Phone', 'Subject', 'Status', 'Notes', 'Message'];
    rows = recordsCache.map(r => [
      r.reference,
      r.created_at,
      r.name,
      r.email,
      r.phone || '',
      r.subject,
      r.status || 'new',
      r.notes || '',
      (r.message || '').replace(/\r?\n/g, ' ')
    ]);
  }

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `AK-Digital-Studio-${currentTab}-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
