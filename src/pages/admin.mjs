/**
 * Admin Portal Static Page Template
 */

export function renderAdminPage(site) {
  return `
<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Staff Portal | ${escapeHtml(site.name)}</title>
  <meta name="robots" content="noindex, nofollow, noarchive">
  <link rel="icon" type="image/svg+xml" href="/img/favicon.svg">
  <link rel="stylesheet" href="/css/fonts.css">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/css/admin.css">
</head>
<body class="admin-body">

  <!-- Header -->
  <header class="admin-header">
    <div class="admin-header-title">
      <a href="/" style="display: flex; align-items: center; gap: 10px;">
        <img src="/img/logo.svg" alt="${escapeHtml(site.name)}" style="height: 38px; width: auto; background: #fff; padding: 4px 8px; border-radius: 8px;">
      </a>
      <h1>Admin Lead &amp; Inquiry Manager</h1>
    </div>
    <div class="admin-nav-actions">
      <a href="/" class="btn btn--outline-sky btn--sm" style="color: #fff; border-color: rgba(255,255,255,0.3);">View Live Site</a>
      <button id="admin-logout-btn" class="btn btn--white btn--sm">Log Out</button>
    </div>
  </header>

  <!-- Login View (shown when token not in sessionStorage) -->
  <main id="admin-login-view" class="admin-container" style="display: none; max-width: 460px; margin-top: 80px;">
    <div class="card" style="padding: 40px; text-align: center;">
      <div style="font-size: 2.2rem; margin-bottom: 12px;">🔐</div>
      <h2 style="font-size: 1.5rem; margin-bottom: 8px;">Administrator Authentication</h2>
      <p style="font-size: 0.92rem; color: var(--color-slate); margin-bottom: 24px;">
        Enter your administrative bearer access token to manage studio inquiries.
      </p>

      <div id="login-error" style="display: none; background: #FEE2E2; color: #991B1B; padding: 12px 14px; border-radius: 8px; margin-bottom: 20px; font-weight: 600; font-size: 0.9rem;"></div>

      <form id="admin-login-form">
        <div class="form-group" style="text-align: left; margin-bottom: 20px;">
          <label for="admin-token-input" class="form-label">Bearer Admin Token</label>
          <input 
            type="password" 
            id="admin-token-input" 
            class="form-control" 
            placeholder="Paste your ADMIN_TOKEN secret..." 
            required
            autocomplete="current-password"
          >
        </div>
        <button type="submit" class="btn btn--primary" style="width: 100%;">
          Authenticate &amp; Open Portal
        </button>
      </form>
    </div>
  </main>

  <!-- Dashboard View (shown when token is authenticated) -->
  <main id="admin-dashboard-view" class="admin-container" style="display: none;">
    <!-- Top Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Inquiries</div>
        <div class="stat-value" id="stat-total-inquiries">-</div>
        <div class="stat-sub">Website &amp; Service quotes</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Messages</div>
        <div class="stat-value" id="stat-total-contacts">-</div>
        <div class="stat-sub">General contact inquiries</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">New This Week</div>
        <div class="stat-value" id="stat-new-week" style="color: var(--color-orange);">-</div>
        <div class="stat-sub">Last 7 calendar days</div>
      </div>
    </div>

    <!-- Controls Bar -->
    <div class="controls-bar">
      <div style="display: flex; gap: 12px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
        <!-- Tab Buttons -->
        <div style="display: flex; gap: 8px;">
          <button id="tab-inquiries" class="tab-btn is-active">Project Inquiries</button>
          <button id="tab-contacts" class="tab-btn">Contact Messages</button>
        </div>

        <!-- Export CSV Button -->
        <div>
          <button id="admin-export-btn" class="btn btn--outline btn--sm" style="display: inline-flex; align-items: center; gap: 6px;">
            📥 Export to CSV
          </button>
        </div>
      </div>

      <!-- Search & Status Filter -->
      <div style="display: flex; gap: 14px; flex-wrap: wrap; margin-top: 6px;">
        <input 
          type="text" 
          id="admin-search" 
          class="form-control" 
          placeholder="🔍 Search name, email, phone, reference, or business..." 
          style="flex: 1 1 300px;"
        >
        <select id="admin-status-filter" class="form-control" style="flex: 0 1 200px;">
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="in discussion">In Discussion</option>
          <option value="proposal sent">Proposal Sent</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="card" style="padding: 0; overflow: hidden; box-shadow: var(--shadow-sm);">
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Date</th>
              <th>Client</th>
              <th>Contact Details</th>
              <th>Interest / Subject</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="admin-table-body">
            <tr>
              <td colspan="7" style="text-align: center; padding: 40px; color: var(--color-slate);">Loading records...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <!-- Slide-Over Drawer Details Overlay -->
  <div id="drawer-overlay" class="drawer-overlay"></div>
  <aside id="admin-drawer" class="drawer">
    <div class="drawer-header">
      <h3 id="drawer-title" style="margin: 0; font-size: 1.15rem;">Record Details</h3>
      <button id="drawer-close" class="drawer-close" aria-label="Close details">&times;</button>
    </div>
    <div id="drawer-content" class="drawer-body"></div>
  </aside>

  <script type="module" src="/js/admin.js"></script>
</body>
</html>
`;
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
