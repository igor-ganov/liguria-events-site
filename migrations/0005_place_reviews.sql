-- User reviews on places: a 1..5 rating and an optional comment. Places live in
-- static per-region shards (not this DB), so a review is keyed by the place's
-- stable open-data id (osm:node/… | ovt:…). One review per user per place — a
-- repeat submission updates the existing row (see upsertPlaceReview).
CREATE TABLE place_reviews (
  id         TEXT PRIMARY KEY,
  place_id   TEXT NOT NULL,                     -- osm:node/… | ovt:…
  region     TEXT NOT NULL,                     -- region slug, for links back
  user_id    TEXT NOT NULL REFERENCES users(id),
  rating     INTEGER NOT NULL,                  -- 1..5
  comment    TEXT,
  status     TEXT NOT NULL DEFAULT 'published', -- published | held | rejected
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_place_reviews_place ON place_reviews (place_id, status);
CREATE UNIQUE INDEX idx_place_reviews_user_place ON place_reviews (user_id, place_id);
