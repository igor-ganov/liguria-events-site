import { SESSION_COOKIE } from '../auth/session-cookie-name.ts';

/**
 * A request that cannot be answered with somebody's account in the page: a
 * plain GET carrying no session.
 *
 * The condition for touching a shared cache at all. The Cache API keys on the
 * address alone — it does not honour Vary — so a signed-in request must neither
 * read from it nor write to it, or one reader's header lands in another's page.
 */
export const anonymousGet = (request: Request): boolean =>
  request.method === 'GET' && !(request.headers.get('cookie') ?? '').includes(`${SESSION_COOKIE}=`);
