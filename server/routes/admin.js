const express = require('express');
const router = express.Router();
const config = require('../config');
const { db, logAudit } = require('../db');
const {
  constantTimeCompare,
  createAdminToken,
  requireAdmin,
  loginRateLimiter
} = require('../security');

// Helper for CSV escaping
function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// GET /admin/login
router.get('/login', (req, res) => {
  const token = req.cookies ? req.cookies.ak_admin_session : null;
  const { verifyAdminToken } = require('../security');
  if (verifyAdminToken(token)) {
    return res.redirect(config.adminRoutePath);
  }
  return res.render('admin/login', {
    pageTitle: 'Admin Login | AK Digital Studio',
    error: null,
    business: config.business
  });
});

// POST /admin/login
router.post('/login', loginRateLimiter, (req, res) => {
  const { password } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

  if (!password || !constantTimeCompare(password, config.adminPassword)) {
    logAudit('FAILED_LOGIN', 'admin', null, 'Failed admin authentication attempt', ip);
    return res.status(401).render('admin/login', {
      pageTitle: 'Admin Login | AK Digital Studio',
      error: 'Invalid administrator password. Access denied.',
      business: config.business
    });
  }

  logAudit('SUCCESS_LOGIN', 'admin', null, 'Successful admin authentication', ip);
  const token = createAdminToken();
  res.cookie('ak_admin_session', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  return res.redirect(config.adminRoutePath);
});

// GET /admin/logout
router.get('/logout', (req, res) => {
  res.clearCookie('ak_admin_session');
  return res.redirect(`${config.adminRoutePath}/login`);
});

// GET /admin - Main Dashboard
router.get('/', requireAdmin, (req, res) => {
  const activeTab = req.query.tab === 'contacts' ? 'contacts' : 'inquiries';
  const search = (req.query.q || '').trim();
  const statusFilter = (req.query.status || '').trim();
  const dateFilter = (req.query.date || '').trim();
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = 15;
  const offset = (page - 1) * limit;

  // 1. Fetch Summary Stats
  const totalInquiries = db.prepare('SELECT COUNT(*) as count FROM inquiries').get().count;
  const totalContacts = db.prepare('SELECT COUNT(*) as count FROM contacts').get().count;
  const newInquiriesThisWeek = db.prepare(`
    SELECT COUNT(*) as count FROM inquiries
    WHERE created_at >= datetime('now', '-7 days')
  `).get().count;
  const newContactsThisWeek = db.prepare(`
    SELECT COUNT(*) as count FROM contacts
    WHERE created_at >= datetime('now', '-7 days')
  `).get().count;

  // Breakdown by interest
  const interestStats = db.prepare(`
    SELECT interest, COUNT(*) as count
    FROM inquiries
    GROUP BY interest
    ORDER BY count DESC
    LIMIT 6
  `).all();

  // 2. Build Query for Inquiries
  let inqWhere = ['1=1'];
  let inqParams = [];
  if (search) {
    inqWhere.push('(name LIKE ? OR email LIKE ? OR phone LIKE ? OR reference LIKE ? OR business_name LIKE ?)');
    const term = `%${search}%`;
    inqParams.push(term, term, term, term, term);
  }
  if (statusFilter && statusFilter !== 'all') {
    inqWhere.push('status = ?');
    inqParams.push(statusFilter);
  }
  if (dateFilter) {
    inqWhere.push("date(created_at) = date(?)");
    inqParams.push(dateFilter);
  }

  const countInqStmt = db.prepare(`SELECT COUNT(*) as count FROM inquiries WHERE ${inqWhere.join(' AND ')}`);
  const filteredInqCount = countInqStmt.get(...inqParams).count;

  const inqStmt = db.prepare(`
    SELECT * FROM inquiries 
    WHERE ${inqWhere.join(' AND ')} 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `);
  const inquiries = inqStmt.all(...inqParams, limit, offset);

  // 3. Build Query for Contacts
  let cntWhere = ['1=1'];
  let cntParams = [];
  if (search) {
    cntWhere.push('(name LIKE ? OR email LIKE ? OR phone LIKE ? OR reference LIKE ? OR subject LIKE ?)');
    const term = `%${search}%`;
    cntParams.push(term, term, term, term, term);
  }
  if (statusFilter && statusFilter !== 'all') {
    cntWhere.push('status = ?');
    cntParams.push(statusFilter);
  }
  if (dateFilter) {
    cntWhere.push("date(created_at) = date(?)");
    cntParams.push(dateFilter);
  }

  const countCntStmt = db.prepare(`SELECT COUNT(*) as count FROM contacts WHERE ${cntWhere.join(' AND ')}`);
  const filteredCntCount = countCntStmt.get(...cntParams).count;

  const cntStmt = db.prepare(`
    SELECT * FROM contacts 
    WHERE ${cntWhere.join(' AND ')} 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `);
  const contacts = cntStmt.all(...cntParams, limit, offset);

  // Fetch recent security audit logs
  const auditLogs = db.prepare(`
    SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10
  `).all();

  const currentCount = activeTab === 'inquiries' ? filteredInqCount : filteredCntCount;
  const totalPages = Math.ceil(currentCount / limit) || 1;

  res.render('admin/dashboard', {
    pageTitle: 'Admin Dashboard | AK Digital Studio',
    activeTab,
    search,
    statusFilter,
    dateFilter,
    page,
    totalPages,
    totalInquiries,
    totalContacts,
    newInquiriesThisWeek,
    newContactsThisWeek,
    interestStats,
    inqTotalFiltered: filteredInqCount,
    cntTotalFiltered: filteredCntCount,
    stats: {
      totalInquiries,
      totalContacts,
      newInquiriesThisWeek,
      newContactsThisWeek,
      interestStats
    },
    inquiries,
    contacts,
    auditLogs,
    business: config.business,
    adminRoute: config.adminRoutePath
  });
});

// PATCH /admin/inquiries/:id - Update status and notes
router.patch('/inquiries/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const validStatuses = ['new', 'contacted', 'quoted', 'won', 'lost', 'spam'];
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

  try {
    const existing = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ ok: false, error: 'Inquiry not found' });
    }

    const nextStatus = validStatuses.includes(status) ? status : existing.status;
    const nextNotes = typeof notes === 'string' ? notes : existing.notes;

    db.prepare(`
      UPDATE inquiries
      SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(nextStatus, nextNotes, id);

    logAudit('UPDATE_INQUIRY', 'inquiry', id, `Status: ${nextStatus}`, ip);

    return res.json({ ok: true, message: 'Inquiry updated successfully' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /admin/inquiries/:id
router.delete('/inquiries/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  try {
    const result = db.prepare('DELETE FROM inquiries WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ ok: false, error: 'Inquiry not found' });
    }
    logAudit('DELETE_INQUIRY', 'inquiry', id, 'Inquiry deleted', ip);
    return res.json({ ok: true, message: 'Inquiry deleted' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// PATCH /admin/contacts/:id - Update status and notes
router.patch('/contacts/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const validStatuses = ['new', 'contacted', 'resolved', 'spam'];
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

  try {
    const existing = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ ok: false, error: 'Contact not found' });
    }

    const nextStatus = validStatuses.includes(status) ? status : existing.status;
    const nextNotes = typeof notes === 'string' ? notes : existing.notes;

    db.prepare(`
      UPDATE contacts
      SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(nextStatus, nextNotes, id);

    logAudit('UPDATE_CONTACT', 'contact', id, `Status: ${nextStatus}`, ip);

    return res.json({ ok: true, message: 'Contact updated successfully' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /admin/contacts/:id
router.delete('/contacts/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  try {
    const result = db.prepare('DELETE FROM contacts WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ ok: false, error: 'Contact not found' });
    }
    logAudit('DELETE_CONTACT', 'contact', id, 'Contact deleted', ip);
    return res.json({ ok: true, message: 'Contact deleted' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /admin/export/inquiries.csv
router.get('/export/inquiries.csv', requireAdmin, (req, res) => {
  const search = (req.query.q || '').trim();
  const statusFilter = (req.query.status || '').trim();

  let where = ['1=1'];
  let params = [];
  if (search) {
    where.push('(name LIKE ? OR email LIKE ? OR phone LIKE ? OR reference LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }
  if (statusFilter && statusFilter !== 'all') {
    where.push('status = ?');
    params.push(statusFilter);
  }

  const rows = db.prepare(`SELECT * FROM inquiries WHERE ${where.join(' AND ')} ORDER BY created_at DESC`).all(...params);

  const headers = ['Reference', 'Date', 'Status', 'Name', 'Email', 'Phone', 'Business', 'Type', 'Interest', 'Budget', 'Timeline', 'Contact Method', 'UTM Source', 'UTM Campaign', 'Details', 'Notes'];
  let csv = headers.map(escapeCsv).join(',') + '\r\n';

  rows.forEach((r) => {
    const line = [
      r.reference,
      r.created_at,
      r.status,
      r.name,
      r.email,
      r.phone,
      r.business_name,
      r.business_type,
      r.interest,
      r.budget,
      r.timeline,
      r.contact_method,
      r.utm_source,
      r.utm_campaign,
      r.details,
      r.notes
    ].map(escapeCsv).join(',');
    csv += line + '\r\n';
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="inquiries-${Date.now()}.csv"`);
  res.status(200).send(csv);
});

// GET /admin/export/contacts.csv
router.get('/export/contacts.csv', requireAdmin, (req, res) => {
  const search = (req.query.q || '').trim();
  const statusFilter = (req.query.status || '').trim();

  let where = ['1=1'];
  let params = [];
  if (search) {
    where.push('(name LIKE ? OR email LIKE ? OR phone LIKE ? OR reference LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }
  if (statusFilter && statusFilter !== 'all') {
    where.push('status = ?');
    params.push(statusFilter);
  }

  const rows = db.prepare(`SELECT * FROM contacts WHERE ${where.join(' AND ')} ORDER BY created_at DESC`).all(...params);

  const headers = ['Reference', 'Date', 'Status', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Notes'];
  let csv = headers.map(escapeCsv).join(',') + '\r\n';

  rows.forEach((r) => {
    const line = [
      r.reference,
      r.created_at,
      r.status,
      r.name,
      r.email,
      r.phone,
      r.subject,
      r.message,
      r.notes
    ].map(escapeCsv).join(',');
    csv += line + '\r\n';
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="contacts-${Date.now()}.csv"`);
  res.status(200).send(csv);
});

module.exports = router;
