-- WebAuthn challenges in D1 (strongly consistent) rather than KV — a challenge
-- is written then read within seconds across requests, so it needs read-after-
-- write consistency and an atomic single-use consume (DELETE ... RETURNING).
CREATE TABLE webauthn_challenges (
  id         TEXT PRIMARY KEY,
  purpose    TEXT NOT NULL,        -- register | auth
  user_id    TEXT,                 -- set for register (binds the challenge to the user)
  challenge  TEXT NOT NULL,
  expires_at INTEGER NOT NULL      -- epoch ms
);
