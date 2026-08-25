/** The paths that require a signed-in, unbanned account.
 *
 *  `/submit` is deliberately NOT here. An organiser arriving from a venue page
 *  used to be bounced to the home page with a dialog and no idea what they had
 *  been about to do; the form is now shown to anyone, and the API — which is
 *  where it matters — still refuses an anonymous POST. */
const PROTECTED: readonly string[] = ['/admin', '/settings'];

/** True when a path is behind the auth gate — the section root itself or
 *  anything under it. */
export const needsAuth = (path: string): boolean =>
  PROTECTED.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
