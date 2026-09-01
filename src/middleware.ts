import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, sessionCookie } from './lib/auth/session.ts';
import { authGate } from './lib/auth/auth-gate.ts';
import { isDefined } from './lib/is-defined.ts';
import { magicLinkLanding } from './lib/auth/magic-link-landing.ts';
import { sessionUser } from './lib/auth/session-user.ts';
import { strayEventPath } from './lib/events/stray-event-path.ts';

const SESSION_MAX_AGE = 7 * 24 * 3600;

/**
 * Resolve the session cookie into locals.user, complete a magic-link sign-in,
 * and gate protected paths.
 *
 * The magic link is spent HERE rather than in the landing page's frontmatter:
 * the token is a one-shot side effect that belongs in the request pipeline, and
 * it leaves /auth/verify as pure markup for the "link expired" case.
 */
export const onRequest = defineMiddleware(async (ctx, next) => {
  const env = ctx.locals.runtime?.env;

  const signin = await magicLinkLanding(env, ctx.url, Date.now());
  signin.forEach(({ session }) => {
    ctx.cookies.set(SESSION_COOKIE, session, {
      ...sessionCookie(env?.ENVIRONMENT === 'production'),
      maxAge: SESSION_MAX_AGE,
    });
  });

  const user = await sessionUser(env, ctx.cookies.get(SESSION_COOKIE)?.value, Date.now());
  // Assigned only when there IS a user, so an anonymous request leaves the
  // local untouched (rather than set to undefined) exactly as before.
  [user].filter(isDefined).forEach((found) => {
    ctx.locals.user = found;
  });

  const bounce = [
    ...signin.map(({ target }) => ctx.redirect(target)),
    ...[authGate(ctx.url.pathname, ctx.locals.user)].filter(isDefined).map((to) => ctx.redirect(to)),
    // An event id where a city slug belongs: a shape only crawlers ask for,
    // tens of thousands of times a day. It names a real event, so it is moved
    // to it rather than answered with a 404.
    ...[strayEventPath(ctx.url.pathname)].filter(isDefined).map((to) => ctx.redirect(to, 301)),
  ];
  return bounce.at(0) ?? next();
});
