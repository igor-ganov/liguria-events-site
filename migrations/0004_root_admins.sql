-- The founding account signed up with the yahoo address, not the gmail one.
-- ADMIN_EMAILS lists both and re-applies the role on every sign-in; this
-- covers a database created from scratch.
UPDATE users SET role = 'admin', banned = 0
 WHERE email IN ('igor.ganov@gmail.com', 'igor_ganov@yahoo.com');
