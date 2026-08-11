-- Anonymous (owner-less) routes are edited only by their author's device, which
-- holds this secret token (in localStorage); a public link alone grants only
-- read access. NULL for legacy routes — claimed on the author's first edit.
ALTER TABLE saved_routes ADD COLUMN edit_token TEXT;
