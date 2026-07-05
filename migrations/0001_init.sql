-- Dove Go — initial schema.
-- Applied automatically on deploy via `wrangler d1 migrations apply`.
-- Ephemeral auth artefacts (magic tokens, WebAuthn challenges, sessions) live
-- in KV/cookies, not here; D1 holds the durable, migratable structure.

-- People who can submit events (email login + optional passkeys).
CREATE TABLE users (
  id         TEXT PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  handle     TEXT UNIQUE NOT NULL,
  role       TEXT NOT NULL DEFAULT 'member',   -- member | admin
  created_at TEXT NOT NULL
);

-- WebAuthn passkeys, one row per credential.
CREATE TABLE passkey_credentials (
  credential_id TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id),
  public_key    TEXT NOT NULL,                 -- base64url COSE key
  sign_count    INTEGER NOT NULL DEFAULT 0,
  device_name   TEXT,
  transports    TEXT,                          -- JSON array
  created_at    TEXT NOT NULL,
  last_used_at  TEXT
);
CREATE INDEX idx_passkey_user ON passkey_credentials (user_id);

-- Events — both crawled and user-submitted. `status` gates public visibility;
-- the AI moderator and admins move rows between statuses.
CREATE TABLE events (
  id           TEXT PRIMARY KEY,
  origin       TEXT NOT NULL,                  -- crawler | user
  submitter_id TEXT REFERENCES users(id),
  status       TEXT NOT NULL DEFAULT 'held',   -- published | held | rejected
  title_en TEXT, title_it TEXT, title_ru TEXT,
  desc_en  TEXT, desc_it  TEXT, desc_ru  TEXT,
  start_date TEXT NOT NULL,                    -- ISO yyyy-mm-dd
  end_date   TEXT,
  categories TEXT,                             -- JSON array
  venue      TEXT,
  lat REAL, lng REAL,
  cover_image TEXT,
  links       TEXT,                            -- JSON array of {url,label}
  free        INTEGER NOT NULL DEFAULT 0,
  gem         INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
CREATE INDEX idx_events_status_start ON events (status, start_date);

-- Moderation / admin audit trail: AI verdicts and admin actions, with reasons.
CREATE TABLE moderation_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id   TEXT NOT NULL,
  action     TEXT NOT NULL,                    -- ai_allow | ai_hold | ai_reject | admin_delete | admin_publish
  actor      TEXT NOT NULL,                    -- ai | admin:<handle> | system
  reason     TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_modlog_event ON moderation_log (event_id);
