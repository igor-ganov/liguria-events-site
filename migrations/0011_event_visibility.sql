-- Who may see a user's event, which `status` cannot express: status gates
-- whether it is finished, and reusing it for visibility would make a private
-- party indistinguishable from a rejected submission.
--
-- 'link'   = anyone holding the URL, and nobody else: not in the feed, the
--            sitemap, the RSS feeds or the channel digest, and noindex.
-- 'public' = offered to the city's feed, once moderation has passed.
--
-- The default is 'link', so the private case is what happens when nobody
-- chooses. Crawled rows are public: there is no author to ask.
ALTER TABLE events ADD COLUMN visibility TEXT NOT NULL DEFAULT 'link';
UPDATE events SET visibility = 'public' WHERE origin = 'crawler';
-- Existing user submissions were made under a form that only ever meant
-- "publish this", so honour what their authors actually asked for.
UPDATE events SET visibility = 'public' WHERE origin = 'user';
CREATE INDEX idx_events_visibility_status ON events (visibility, status, start_date);
