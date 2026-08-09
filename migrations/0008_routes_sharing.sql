-- Shareable saved routes. user_id is now nullable: an anonymous route is stored
-- (so its unique link works for anyone) with no owner and public by default. A
-- signed-in owner controls `public`. `region` scopes links/labels. Recreated
-- from 0007's owner-only shape (the feature is new, no meaningful data yet).
DROP TABLE IF EXISTS saved_routes;
CREATE TABLE saved_routes (
  id         TEXT PRIMARY KEY,
  user_id    TEXT REFERENCES users(id),        -- NULL = anonymous
  name       TEXT NOT NULL,
  region     TEXT NOT NULL DEFAULT 'liguria',
  data       TEXT NOT NULL,                     -- JSON: mode, range, per-day event ids, overrides
  public     INTEGER NOT NULL DEFAULT 1,        -- 1 = anyone with the link can view
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_saved_routes_user ON saved_routes (user_id, created_at);
