import { cookieDomain } from './cookie-domain.ts';

/** Cookie options for the session. Used for both set and delete (delete must
 *  match the domain). */
export const sessionCookie = (production: boolean) => ({
  httpOnly: true as const,
  secure: true as const,
  sameSite: 'lax' as const,
  path: '/',
  ...cookieDomain(production),
});
