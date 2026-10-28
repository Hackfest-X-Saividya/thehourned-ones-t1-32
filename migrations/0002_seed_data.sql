-- Seed data for testing and development
-- Migration: 0002_seed_data.sql

-- Default Users
INSERT OR IGNORE INTO users (id, name, email, role, badge_number, created_at) VALUES
('usr_investigator_1', 'Detective Sarah Connor', 'sconnor@forensics.pd.gov', 'investigator', 'BADGE-4091', '2026-10-01T08:00:00Z'),
('usr_lead_1', 'Inspector James Gordon', 'jgordon@forensics.pd.gov', 'lead_investigator', 'BADGE-1002', '2026-10-01T08:00:00Z'),
('usr_analyst_1', 'Analyst Chloe Decker', 'cdecker@forensics.pd.gov', 'analyst', 'BADGE-7741', '2026-10-01T08:00:00Z'),
('usr_admin_1', 'Captain Raymond Holt', 'rholt@forensics.pd.gov', 'admin', 'BADGE-0001', '2026-10-01T08:00:00Z');

-- Initial Sample Case
INSERT OR IGNORE INTO cases (id, case_number, title, description, status, incident_date, assigned_investigator_id, created_at, updated_at) VALUES
('case_sample_001', 'CR-2026-0042', 'Downtown Jewelry Robbery Suspect', 'Witness describes adult male, 30s, sharp jawline, hooded jacket, prominent brow.', 'active_investigation', '2026-10-24T21:30:00Z', 'usr_investigator_1', '2026-10-25T09:00:00Z', '2026-10-25T09:00:00Z');

-- Access grant for sample case
INSERT OR IGNORE INTO case_access (id, case_id, user_id, permission, granted_at) VALUES
('acc_001', 'case_sample_001', 'usr_investigator_1', 'admin', '2026-10-25T09:00:00Z'),
('acc_002', 'case_sample_001', 'usr_analyst_1', 'read', '2026-10-25T09:15:00Z');

-- Initial Sample Generation
INSERT OR IGNORE INTO generations (id, case_id, prompt, model_name, num_candidates, parameters_json, created_by, created_at) VALUES
('gen_sample_001', 'case_sample_001', 'Male early 30s, sharp square jawline, deep-set almond eyes, straight narrow nose, 3-day stubble, vertical scar above left eyebrow', '@cf/stabilityai/stable-diffusion-xl-base-1.0', 1, '{"seed":1042}', 'usr_investigator_1', '2026-10-28T09:30:00Z');

-- Initial Sample Composite Image
INSERT OR IGNORE INTO images (
  id, case_id, generation_id, parent_image_id, version,
  is_active, status, prompt, edit_instruction, facial_regions_json,
  model_name, parameters_json, r2_key, r2_mask_key, content_type,
  width, height, file_size_bytes, created_by, created_at
) VALUES (
  'IMG-SKETCH-1042', 'case_sample_001', 'gen_sample_001', NULL, 1,
  1, 'accepted', 'Male early 30s, sharp square jawline, deep-set almond eyes, straight narrow nose, 3-day stubble, vertical scar above left eyebrow',
  NULL, '["jawline","eyes","nose","facial_hair","scars_marks"]',
  '@cf/stabilityai/stable-diffusion-xl-base-1.0', '{"seed":1042}',
  'cases/case_sample_001/images/IMG-SKETCH-1042.png', NULL, 'image/png',
  1024, 1024, 262488, 'usr_investigator_1', '2026-10-28T09:30:00Z'
);

