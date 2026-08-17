import { strippedAuthUrl } from './stripped-auth-url.ts';

/** Take the sign-in params out of the address bar, keeping history.state — the
 *  ClientRouter's navigation index lives there. */
export const stripAuthParams = (): void => {
  history.replaceState(history.state, '', strippedAuthUrl(location.href));
};
