-- E2E test owner (local D1 only). The owner-editor spec mints a session cookie
-- for this id with the test SESSION_SECRET.
INSERT OR IGNORE INTO users (id, email, handle, role, created_at)
VALUES ('e2e-owner', 'e2e@test.local', 'e2eowner', 'member', '2026-01-01T00:00:00Z');

-- Every run starts from an empty desk. Several specs create an event, and the
-- daily cap counts them: after twenty runs in one day the local database, not
-- the code, started answering 429 and four specs failed for a reason that had
-- nothing to do with what they test.
DELETE FROM events WHERE submitter_id = 'e2e-owner';
