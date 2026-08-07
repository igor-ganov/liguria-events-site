-- Per-user favourites and saved routes. Favourites are anonymous in
-- localStorage until the user signs in, then synced here (one row per
-- user+event). A saved route stores its computed itinerary as a JSON blob so it
-- reopens exactly as generated, independent of later event changes.
CREATE TABLE favorites (
  user_id    TEXT NOT NULL REFERENCES users(id),
  event_id   TEXT NOT NULL,
  added_at   INTEGER NOT NULL,                 -- epoch ms
  PRIMARY KEY (user_id, event_id)
);
CREATE INDEX idx_favorites_user ON favorites (user_id, added_at);

CREATE TABLE saved_routes (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  name       TEXT NOT NULL,
  data       TEXT NOT NULL,                    -- JSON: ordered stops + legs + mode
  created_at INTEGER NOT NULL                  -- epoch ms
);
CREATE INDEX idx_saved_routes_user ON saved_routes (user_id, created_at);
