import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, sessionCookie } from './lib/auth/session.ts';
import { authGate } from './lib/auth/auth-gate.ts';
import { legacyLocalePath } from './lib/i18n/legacy-locale-path.ts';
import { isDefined } from './lib/is-defined.ts';
import { magicLinkLanding } from './lib/auth/magic-link-landing.ts';
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

  // English was the site with no prefix — a whole duplicate tree of route files
  // at the root, mirroring [lang]/ — which is why "/" was the English home page
  // rather than the door to the site, and why the one language nobody here
  // reads held every address Google had indexed. English has a prefix now, so
  // the addresses it used to own move to it, permanently and with whatever
  // brought the reader still attached.
  //
  // This reaches the worker at all because 404.astro is server-rendered: an
  // address that matches no route would otherwise be answered by the assets
  // layer, which never runs any of this.
  const moved = legacyLocalePath(ctx.url.pathname);
  switch (moved) {
    case undefined:
      break;
    default:
      return permanentRedirect(`${moved}${ctx.url.search}`);
  }

  // A front door — "/", "/calendar", "/map" and their language-prefixed twins —
  // decides NOTHING here any more. It used to 302, with the page from the
  // address, the language from Accept-Language and the region from Cloudflare's
  // IP lookup, falling back to whichever region had the most events — so every
  // reader who had named no region began in Lombardia. The redirect was the
  // deeper fault: it was answered at the edge, before the page ran, so neither
  // a region the reader had chosen here before nor a location permission they
  // had granted could ever override it. Both live in the browser.
  //
  // The doors are pages now (EntryView). They ask, they are indexable, and the
  // reader's own two answers — what they last read, what their browser says —
  // are applied in the browser, where they can be read at all.

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
