import { branch } from '../branch.ts';

/** The domain fragment of an auth cookie. In production it is widened to
 *  `.dovego.it` so the session is shared with subdomains (e.g. the admin app at
 *  admin.dovego.it); dev keeps a host-only cookie so dev.dovego.it stays
 *  isolated. Spread into both the set and the delete options — a delete that
 *  does not match the domain leaves the cookie in place. */
export const cookieDomain = (production: boolean): Readonly<{ domain?: string }> =>
  branch(production)<Readonly<{ domain?: string }>>(() => ({ domain: '.dovego.it' }), () => ({}));
