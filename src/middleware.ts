import { defineMiddleware } from 'astro:middleware';
import { bareEntry } from './lib/i18n/bare-entry.ts';
import { entryPath } from './lib/i18n/entry-path.ts';
import { entryRegion } from './lib/region/entry-region.ts';
import { SESSION_COOKIE, sessionCookie } from './lib/auth/session.ts';
import { authGate } from './lib/auth/auth-gate.ts';
import { isDefined } from './lib/is-defined.ts';
import { magicLinkLanding } from './lib/auth/magic-link-landing.ts';
import { negotiatedRedirect } from './lib/http/negotiated-redirect.ts';
import { permanentRedirect } from './lib/http/permanent-redirect.ts';
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
  // Answered before any session work: an event id where a city slug belongs is
  // a shape only crawlers ask for, tens of thousands of times a day. It names a
  // real event, so it is moved to it rather than answered with a 404 — and the
  // answer carries cache headers, so asking again costs nothing.
  const stray = strayEventPath(ctx.url.pathname);
  switch (stray) {
    case undefined:
      break;
    default:
      return permanentRedirect(stray);
  }

  // A front door — "/", "/calendar", "/map" and their language-prefixed twins —
  // names neither a language nor a region, so both are chosen here: the language
  // from Accept-Language, the region from where the reader is or where the events
  // are. public/_redirects did this and could do neither, so every reader landed
  // in the region the site was founded in.
  const bare = bareEntry(ctx.url.pathname);
  const target = await Promise.all(
    [bare]
      .filter(isDefined)
      .map(async () =>
        entryPath(
          ctx.url.pathname,
          ctx.request.headers.get('accept-language') ?? undefined,
          await entryRegion({
            region: ctx.locals.runtime?.cf?.region,
            country: ctx.locals.runtime?.cf?.country,
          }),
          // Whatever brought the reader rides along: a front door that drops
          // the query string turns a paid click into an anonymous one.
          ctx.url.search,
        ),
      ),
  );
  const entry = target.filter(isDefined).at(0);
  switch (entry) {
    case undefined:
      break;
    default:
      return negotiatedRedirect(entry);
  }

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
  ];
  return bounce.at(0) ?? next();
});
