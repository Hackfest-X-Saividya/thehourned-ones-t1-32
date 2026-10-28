-- Cloudflare D1 Initial Schema for AI Crime Scene Sketch Generator
-- Migration: 0001_initial_schema.sql

-- 1. Users Table (Forensic investigators, analysts, admins)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK(role IN ('investigator', 'lead_investigator', 'admin', 'analyst')),
  badge_number TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Cases Table
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  case_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'active_investigation', 'cold_case', 'closed')),
  incident_date TEXT,
  assigned_investigator_id TEXT NOT NULL REFERENCES users(id),
  active_image_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. Case Access Permissions (Explicit case access list)
CREATE TABLE IF NOT EXISTS case_access (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL CHECK(permission IN ('read', 'write', 'admin')),
  granted_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(case_id, user_id)
);

-- 4. Generations Table (Record of each generation batch)
CREATE TABLE IF NOT EXISTS generations (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  model_name TEXT NOT NULL,
  num_candidates INTEGER NOT NULL DEFAULT 1,
  parameters_json TEXT NOT NULL DEFAULT '{}',
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 5. Images Table (Forensic sketch versions, candidates & edits)
CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  generation_id TEXT REFERENCES generations(id) ON DELETE SET NULL,
  parent_image_id TEXT REFERENCES images(id) ON DELETE SET NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'candidate' CHECK(status IN ('candidate', 'accepted', 'superseded', 'restored', 'archived')),
  prompt TEXT NOT NULL,
  edit_instruction TEXT,
  facial_regions_json TEXT,
  model_name TEXT NOT NULL,
  parameters_json TEXT NOT NULL DEFAULT '{}',
  r2_key TEXT NOT NULL,
  r2_mask_key TEXT,
  content_type TEXT NOT NULL DEFAULT 'image/png',
  width INTEGER NOT NULL DEFAULT 1024,
  height INTEGER NOT NULL DEFAULT 1024,
  file_size_bytes INTEGER DEFAULT 0,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 6. Audit Logs Table (Strictly immutable, append-only)
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  case_id TEXT REFERENCES cases(id) ON DELETE SET NULL,
  request_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_email TEXT,
  user_role TEXT,
  action TEXT NOT NULL CHECK(action IN (
    'CASE_CREATE',
    'CASE_VIEW',
    'IMAGE_GENERATE',
    'IMAGE_SELECT',
    'IMAGE_EDIT',
    'IMAGE_RESTORE',
    'IMAGE_EXPORT',
    'UNAUTHORIZED_ACCESS',
    'AUDIT_VIEW'
  )),
  resource_type TEXT NOT NULL CHECK(resource_type IN ('case', 'generation', 'image', 'audit')),
  resource_id TEXT,
  status TEXT NOT NULL CHECK(status IN ('SUCCESS', 'FAILURE')),
  ip_address TEXT,
  user_agent TEXT,
  details_json TEXT NOT NULL DEFAULT '{}',
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for performance & query optimization
CREATE INDEX IF NOT EXISTS idx_cases_assigned_investigator ON cases(assigned_investigator_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_case_access_user ON case_access(user_id);
CREATE INDEX IF NOT EXISTS idx_case_access_case ON case_access(case_id);
CREATE INDEX IF NOT EXISTS idx_generations_case ON generations(case_id);
CREATE INDEX IF NOT EXISTS idx_images_case ON images(case_id);
CREATE INDEX IF NOT EXISTS idx_images_parent ON images(parent_image_id);
CREATE INDEX IF NOT EXISTS idx_images_version ON images(case_id, version);
CREATE INDEX IF NOT EXISTS idx_images_is_active ON images(case_id, is_active);
CREATE INDEX IF NOT EXISTS idx_audit_logs_case ON audit_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

