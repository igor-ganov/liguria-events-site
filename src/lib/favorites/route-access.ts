import type { SavedRoute } from './favorites-db.ts';

export type RouteAccess = Readonly<{ allowed: boolean; owned: boolean; anonymous: boolean }>;

/** Who may open and edit a saved route. A public route opens for anyone with
 *  the link; a private one only for its owner. Anything else — missing, or
 *  private and not yours — is not allowed, and 404s without revealing that it
 *  exists. An anonymous (owner-less) route is editable by anyone with its link:
 *  that is the only way its creator (who saved it without logging in) can ever
 *  edit it. */
export const routeAccess = (route?: SavedRoute, userId?: string): RouteAccess => {
  const owned = route?.userId !== undefined && route.userId === userId;
  const anonymous = route !== undefined && route.userId === undefined;
  const allowed = route !== undefined && (route.public || owned);
  return { allowed, owned, anonymous };
};
