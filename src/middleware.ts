import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE } from './lib/auth/session.ts';
import { authGate } from './lib/auth/auth-gate.ts';
import { isDefined } from './lib/is-defined.ts';
import { sessionUser } from './lib/auth/session-user.ts';

/** Resolve the session cookie into locals.user, and gate protected paths. */
export const onRequest = defineMiddleware(async (ctx, next) => {
  const user = await sessionUser(
    ctx.locals.runtime?.env,
    ctx.cookies.get(SESSION_COOKIE)?.value,
    Date.now(),
  );
  // Assigned only when there IS a user, so an anonymous request leaves the
  // local untouched (rather than set to undefined) exactly as before.
  [user].filter(isDefined).forEach((found) => {
    ctx.locals.user = found;
  });

  const bounce = [authGate(ctx.url.pathname, ctx.locals.user)]
    .filter(isDefined)
    .map((target) => ctx.redirect(target));
  return bounce.at(0) ?? next();
});
