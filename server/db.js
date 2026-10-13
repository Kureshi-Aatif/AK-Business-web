const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const dbPath = path.resolve(__dirname, '../data/app.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Hash IP function for privacy compliance (SHA-256 + salt)
function hashIp(ip) {
  if (!ip) return '';
  return crypto.createHash('sha256').update(ip + '-ak-salt').digest('hex');
}

// Generate human-friendly reference ID (e.g. INQ-2026-X4K9, CNT-2026-B8T2)
function generateReference(prefix = 'INQ') {
  const year = new Date().getFullYear();
  const randomChars = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${year}-${randomChars}`;
}

// Auto-run schema migrations at startup
function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      business_name TEXT,
      business_type TEXT,
      interest TEXT NOT NULL,
      budget TEXT,
      timeline TEXT,
      details TEXT NOT NULL,
      contact_method TEXT DEFAULT 'WhatsApp',
      utm_source TEXT DEFAULT '',
      utm_medium TEXT DEFAULT '',
      utm_campaign TEXT DEFAULT '',
      status TEXT DEFAULT 'new',
      notes TEXT DEFAULT '',
      ip_hash TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'new',
      notes TEXT DEFAULT '',
      ip_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      ip_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
    CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
  `);

  // Safely check and add UTM columns if upgrading existing table
  try {
    const tableInfo = db.prepare("PRAGMA table_info('inquiries')").all();
    const cols = tableInfo.map(c => c.name);
    if (!cols.includes('utm_source')) {
      db.exec("ALTER TABLE inquiries ADD COLUMN utm_source TEXT DEFAULT ''");
    }
    if (!cols.includes('utm_medium')) {
      db.exec("ALTER TABLE inquiries ADD COLUMN utm_medium TEXT DEFAULT ''");
    }
    if (!cols.includes('utm_campaign')) {
      db.exec("ALTER TABLE inquiries ADD COLUMN utm_campaign TEXT DEFAULT ''");
    }
  } catch (err) {
    console.error('[DB Migration Warning]:', err.message);
  }
}

// Log audit action
function logAudit(action, entityType, entityId, details, ip) {
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (action, entity_type, entity_id, details, ip_hash)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(action, entityType, String(entityId || ''), String(details || ''), hashIp(ip));
  } catch (e) {
    console.error('[Audit Log Error]:', e.message);
  }
}

// Automated Daily Database Backup routine with 14-day retention
function backupDatabase() {
  const backupDir = path.resolve(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const destPath = path.join(backupDir, `app-backup-${dateStr}.db`);

  try {
    // Online backup via better-sqlite3 backup API
    db.backup(destPath)
      .then(() => {
        // Prune backups older than 14 days
        pruneOldBackups(backupDir, 14);
      })
      .catch(err => {
        console.error('[DB Backup Error]:', err.message);
      });
  } catch (err) {
    console.error('[DB Backup Initiation Error]:', err.message);
  }
}

function pruneOldBackups(dir, retentionDays = 14) {
  try {
    const files = fs.readdirSync(dir);
    const now = Date.now();
    const maxAgeMs = retentionDays * 24 * 60 * 60 * 1000;

    for (const file of files) {
      if (!file.startsWith('app-backup-') || !file.endsWith('.db')) continue;
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (now - stat.mtimeMs > maxAgeMs) {
        fs.unlinkSync(filePath);
        console.log(`[Backup Retention]: Pruned old backup ${file}`);
      }
    }
  } catch (e) {
    console.error('[Backup Pruning Error]:', e.message);
  }
}

initDb();

// Schedule initial backup and 24-hour backup interval
setTimeout(backupDatabase, 5000);
setInterval(backupDatabase, 24 * 60 * 60 * 1000);

module.exports = {
  db,
  hashIp,
  generateReference,
  logAudit,
  backupDatabase
};
