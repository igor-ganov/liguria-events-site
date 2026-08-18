-- Events are containers or standalone. A container (a festival, a concert
-- series) happens ONLY on the dates of its programme, so it must not surface on
-- the empty days in between; a standalone event owns its whole span.
--
-- `sessions` holds the programme as a JSON array of { date, time?, title? }.
-- `kind` is left NULL for standalone, so every existing row keeps its current
-- meaning without a backfill.
ALTER TABLE events ADD COLUMN sessions TEXT;
ALTER TABLE events ADD COLUMN kind TEXT;
