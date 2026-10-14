-- Cloudflare D1 Database Schema for AK Digital Studio
-- Zero-cost, high-performance SQLite database for Cloudflare Pages Functions and Cloudflare Workers

DROP TABLE IF EXISTS inquiries;
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
  consent INTEGER DEFAULT 1,
  status TEXT DEFAULT 'new',
  notes TEXT DEFAULT '',
  ip_hash TEXT,
  user_agent TEXT,
  utm_source TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS contacts;
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  consent INTEGER DEFAULT 1,
  status TEXT DEFAULT 'new',
  notes TEXT DEFAULT '',
  ip_hash TEXT,
  user_agent TEXT,
  utm_source TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Spam control / rate limiting table (revolving window by hashed IP)
DROP TABLE IF EXISTS rate_limits;
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER DEFAULT 1,
  reset_at INTEGER NOT NULL
);

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_reference ON inquiries(reference);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_reference ON contacts(reference);
