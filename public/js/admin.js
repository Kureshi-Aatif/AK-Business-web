/**
 * AK Digital Studio - Admin Dashboard Client JS
 */

document.addEventListener('DOMContentLoaded', () => {
  const drawer = document.getElementById('admin-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const closeBtn = document.getElementById('drawer-close');

  function closeDrawer() {
    if (drawer) drawer.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-open');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  // Click row to open drawer
  document.querySelectorAll('.data-row').forEach((row) => {
    row.addEventListener('click', (e) => {
      // Don't trigger if clicked directly on an anchor or button
      if (e.target.closest('a') || e.target.closest('button')) return;

      const recordJson = row.getAttribute('data-record');
      const type = row.getAttribute('data-type'); // 'inquiry' or 'contact'
      if (!recordJson) return;

      try {
        const record = JSON.parse(recordJson);
        openRecordDrawer(record, type);
      } catch (err) {
        console.error('Failed to parse record:', err);
      }
    });
  });
});

function openRecordDrawer(record, type) {
  const drawer = document.getElementById('admin-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const drawerTitle = document.getElementById('drawer-title');
  const drawerContent = document.getElementById('drawer-content');

  if (!drawer || !drawerContent) return;

  drawerTitle.textContent = `${record.reference} - ${record.name}`;

  const isContact = type === 'contact';
  const cleanPhone = (record.phone || '').replace(/[^0-9]/g, '');
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${record.name}, regarding your ${isContact ? 'message' : 'inquiry'} (${record.reference}) with AK Digital Studio:`)}` : '#';
  const mailUrl = `mailto:${record.email}?subject=${encodeURIComponent(`AK Digital Studio - ${record.reference}`)}`;

  let html = `
    <div style="display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap;">
      ${cleanPhone ? `<a href="${waUrl}" target="_blank" rel="noopener" class="btn btn--primary btn--sm" style="background: #25D366;">WhatsApp Chat</a>` : ''}
      <a href="${mailUrl}" class="btn btn--royal btn--sm">Reply by Email</a>
    </div>

    <div class="drawer-field">
      <div class="drawer-field-label">Reference ID</div>
      <div class="drawer-field-val"><strong>${record.reference}</strong></div>
    </div>

    <div class="drawer-field">
      <div class="drawer-field-label">Submission Date</div>
      <div class="drawer-field-val">${record.created_at}</div>
    </div>

    <div class="drawer-field">
      <div class="drawer-field-label">Full Name</div>
      <div class="drawer-field-val">${record.name}</div>
    </div>

    <div class="drawer-field">
      <div class="drawer-field-label">Email</div>
      <div class="drawer-field-val"><a href="${mailUrl}" style="color: var(--color-royal);">${record.email}</a></div>
    </div>

    <div class="drawer-field">
      <div class="drawer-field-label">Phone / WhatsApp</div>
      <div class="drawer-field-val">${record.phone || 'N/A'}</div>
    </div>
  `;

  if (!isContact) {
    html += `
      <div class="drawer-field">
        <div class="drawer-field-label">Business Name & Type</div>
        <div class="drawer-field-val">${record.business_name || 'N/A'} (${record.business_type || 'N/A'})</div>
      </div>

      <div class="drawer-field">
        <div class="drawer-field-label">Interested In</div>
        <div class="drawer-field-val"><strong>${record.interest}</strong></div>
      </div>

      <div class="drawer-field">
        <div class="drawer-field-label">Budget & Timeline</div>
        <div class="drawer-field-val">${record.budget || 'Not specified'} | ${record.timeline || 'Not specified'}</div>
      </div>

      <div class="drawer-field">
        <div class="drawer-field-label">Preferred Contact Method</div>
        <div class="drawer-field-val">${record.contact_method}</div>
      </div>

      <div class="drawer-field">
        <div class="drawer-field-label">Project Details</div>
        <div class="drawer-field-val" style="background: #F4F7FF; padding: 12px; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(record.details)}</div>
      </div>
    `;
  } else {
    html += `
      <div class="drawer-field">
        <div class="drawer-field-label">Subject</div>
        <div class="drawer-field-val"><strong>${record.subject}</strong></div>
      </div>

      <div class="drawer-field">
        <div class="drawer-field-label">Message</div>
        <div class="drawer-field-val" style="background: #F4F7FF; padding: 12px; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(record.message)}</div>
      </div>
    `;
  }

  // Status & Internal Notes
  html += `
    <hr style="margin: 24px 0; border: none; border-top: 1px solid var(--color-line);">

    <div class="drawer-field">
      <div class="drawer-field-label">Status</div>
      <select id="drawer-status-select" class="filter-input" style="width: 100%; padding: 10px;">
        <option value="new" ${record.status === 'new' ? 'selected' : ''}>New</option>
        <option value="contacted" ${record.status === 'contacted' ? 'selected' : ''}>Contacted</option>
        <option value="quoted" ${record.status === 'quoted' ? 'selected' : ''}>Quoted</option>
        <option value="won" ${record.status === 'won' ? 'selected' : ''}>Won / Client</option>
        <option value="lost" ${record.status === 'lost' ? 'selected' : ''}>Lost</option>
        <option value="spam" ${record.status === 'spam' ? 'selected' : ''}>Spam</option>
      </select>
    </div>

    <div class="drawer-field">
      <div class="drawer-field-label">Internal Notes</div>
      <textarea id="drawer-notes-area" class="filter-input" style="width: 100%; height: 100px; padding: 10px; resize: vertical;" placeholder="Add internal notes about this client / discussion...">${escapeHtml(record.notes || '')}</textarea>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
      <button type="button" class="btn btn--royal btn--sm" id="btn-save-record">Save Changes</button>
      <button type="button" class="btn btn--outline btn--sm" id="btn-delete-record" style="color: var(--color-error); border-color: var(--color-error);">Delete</button>
    </div>
  `;

  drawerContent.innerHTML = html;
  drawer.classList.add('is-open');
  overlay.classList.add('is-open');

  // Handle Save
  const saveBtn = document.getElementById('btn-save-record');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const newStatus = document.getElementById('drawer-status-select').value;
      const newNotes = document.getElementById('drawer-notes-area').value;

      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';

      try {
        const url = `/admin/${isContact ? 'contacts' : 'inquiries'}/${record.id}`;
        const res = await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, notes: newNotes })
        });
        if (res.ok) {
          window.location.reload();
        } else {
          alert('Failed to update record.');
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save Changes';
        }
      } catch (err) {
        alert('Network error saving record.');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
      }
    });
  }

  // Handle Delete
  const delBtn = document.getElementById('btn-delete-record');
  if (delBtn) {
    delBtn.addEventListener('click', async () => {
      if (!confirm(`Are you sure you want to permanently delete record ${record.reference}?`)) return;

      delBtn.disabled = true;
      delBtn.textContent = 'Deleting...';

      try {
        const url = `/admin/${isContact ? 'contacts' : 'inquiries'}/${record.id}`;
        const res = await fetch(url, { method: 'DELETE' });
        if (res.ok) {
          window.location.reload();
        } else {
          alert('Failed to delete record.');
          delBtn.disabled = false;
          delBtn.textContent = 'Delete';
        }
      } catch (err) {
        alert('Network error deleting record.');
        delBtn.disabled = false;
        delBtn.textContent = 'Delete';
      }
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
