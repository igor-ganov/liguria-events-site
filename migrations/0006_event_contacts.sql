-- Contact + address fields for user-submitted events. The crawler leaves these
-- null (its events carry source links instead); the submit form fills them in.
ALTER TABLE events ADD COLUMN address TEXT;
ALTER TABLE events ADD COLUMN phone TEXT;
ALTER TABLE events ADD COLUMN website TEXT;
