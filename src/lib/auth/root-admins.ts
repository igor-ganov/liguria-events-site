/** Emails that are always admins. Re-applied on every sign-in, so the founding
 *  account cannot be demoted or banned out of its own platform. */
export const rootAdmins = (env: { ADMIN_EMAILS?: string }): readonly string[] =>
  (env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
