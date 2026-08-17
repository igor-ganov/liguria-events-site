/** The paths that require a signed-in, unbanned account. */
const PROTECTED: readonly string[] = ['/submit', '/admin', '/settings'];

/** True when a path is behind the auth gate — the section root itself or
 *  anything under it. */
export const needsAuth = (path: string): boolean =>
  PROTECTED.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
