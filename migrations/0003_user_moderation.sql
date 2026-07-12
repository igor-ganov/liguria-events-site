-- Admin user management: ban a person (and, with them, their events) and
-- grant/revoke the admin role. Bans are soft — the row stays so the audit
-- trail and the person's events keep their author.
ALTER TABLE users ADD COLUMN banned INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN banned_at TEXT;
ALTER TABLE users ADD COLUMN banned_reason TEXT;

-- The founding admin. ADMIN_EMAILS re-applies this on every sign-in, so the
-- account cannot be locked out of its own platform.
UPDATE users SET role = 'admin' WHERE email = 'igor.ganov@gmail.com';
