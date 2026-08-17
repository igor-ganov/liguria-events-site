/** An anonymous route gets a secret edit token: the creating device keeps it
 *  (localStorage) and needs it to edit later — the public link is read-only.
 *  A signed-in owner needs none, and gets none. */
export const anonymousEditToken = (signedIn: boolean): string | undefined =>
  [signedIn].filter((yes) => !yes).map(() => crypto.randomUUID().replace(/-/g, '')).at(0);
