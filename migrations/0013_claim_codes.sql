-- Proof that a claimant speaks for an event: the staff send a code to an
-- address they took from the organiser's own page, and the claimant types it
-- back. One row per thread, replaced when a new code is sent.
--
-- The code is not here. It is derived from the site's secret, the thread, the
-- address and `sends`, so a copy of this table gives nobody a code; `tries`
-- counts wrong guesses at the current one and closes it at five.
CREATE TABLE claim_codes (
  ticket_id  TEXT PRIMARY KEY REFERENCES tickets(id),
  address    TEXT NOT NULL,
  sends      INTEGER NOT NULL DEFAULT 1,
  tries      INTEGER NOT NULL DEFAULT 0,
  sent_by    TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
