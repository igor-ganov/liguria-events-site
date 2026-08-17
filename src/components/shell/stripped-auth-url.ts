import { AUTH_PARAMS } from './auth-params.ts';

/** The same address without its sign-in params — path, query and hash only, the
 *  shape history.replaceState wants. */
export const strippedAuthUrl = (href: string): string => {
  const url = new URL(href);
  AUTH_PARAMS.forEach((param) => url.searchParams.delete(param));
  return url.pathname + url.search + url.hash;
};
