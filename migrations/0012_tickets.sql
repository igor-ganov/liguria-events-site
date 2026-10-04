-- Requests from readers about an event: "something is wrong with it" (report)
-- and "it is mine" (claim). Each is a thread between one reader and the staff.
--
-- The event is named by its id only. Most events are crawled and have no row
-- in `events`, so there is nothing to reference; the title is kept as it read
-- when the request was opened, so the thread still makes sense after the event
-- has left the corpus.
CREATE TABLE tickets (
  id          TEXT PRIMARY KEY,
  kind        TEXT NOT NULL,                    -- report | claim
  status      TEXT NOT NULL DEFAULT 'open',     -- open | answered | resolved | rejected
  event_id    TEXT NOT NULL,
  event_title TEXT NOT NULL,
  user_id     TEXT NOT NULL REFERENCES users(id),
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
CREATE INDEX idx_tickets_user ON tickets (user_id, updated_at);
CREATE INDEX idx_tickets_status ON tickets (status, updated_at);

CREATE TABLE ticket_messages (
  id         TEXT PRIMARY KEY,
  ticket_id  TEXT NOT NULL REFERENCES tickets(id),
  author_id  TEXT NOT NULL REFERENCES users(id),
  staff      INTEGER NOT NULL DEFAULT 0,        -- 1 when written by an admin
  body       TEXT NOT NULL,
  attachment TEXT,                              -- uploads path of a screenshot
  created_at TEXT NOT NULL
);
CREATE INDEX idx_ticket_messages ON ticket_messages (ticket_id, created_at);

-- Who an event belongs to, once a claim has been approved. One owner per event;
-- the ticket that granted it is kept, so the decision can be traced and undone.
CREATE TABLE event_owners (
  event_id   TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  ticket_id  TEXT NOT NULL REFERENCES tickets(id),
  granted_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL
);
CREATE INDEX idx_event_owners_user ON event_owners (user_id);
