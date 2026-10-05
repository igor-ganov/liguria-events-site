-- E2E test owner (local D1 only). The owner-editor spec mints a session cookie
-- for this id with the test SESSION_SECRET.
INSERT OR IGNORE INTO users (id, email, handle, role, created_at)
VALUES ('e2e-owner', 'e2e@test.local', 'e2eowner', 'member', '2026-01-01T00:00:00Z');

-- Every run starts from an empty desk. Several specs create an event, and the
-- daily cap counts them: after twenty runs in one day the local database, not
-- the code, started answering 429 and four specs failed for a reason that had
-- nothing to do with what they test.
DELETE FROM events WHERE submitter_id = 'e2e-owner';

-- A second reader and a member of staff, for the specs where it matters who is
-- looking: a thread is private to the reader who opened it and to the staff.
INSERT OR IGNORE INTO users (id, email, handle, role, created_at)
VALUES ('e2e-other', 'other@test.local', 'e2eother', 'member', '2026-01-01T00:00:00Z');
INSERT OR IGNORE INTO users (id, email, handle, role, created_at)
VALUES ('e2e-admin', 'admin@test.local', 'e2eadmin', 'admin', '2026-01-01T00:00:00Z');

-- Every run starts with no requests and no event handed over, in the order the
-- foreign keys allow.
DELETE FROM claim_codes;
DELETE FROM event_owners;
DELETE FROM ticket_messages;
DELETE FROM tickets;
