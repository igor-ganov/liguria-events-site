import { defineMiddleware } from 'astro:middleware';
import { readSession, SESSION_COOKIE } from './lib/auth/session.ts';
import { getUserById } from './lib/auth/users.ts';

const PROTECTED = ['/submit', '/admin'];

const needsAuth = (path: string): boolean =>
  PROTECTED.some((p) => path === p || path.startsWith(`${p}/`));

/** Resolve the session cookie into locals.user, and gate protected paths. */
export const onRequest = defineMiddleware(async (ctx, next) => {
  const env = ctx.locals.runtime?.env;
  const token = ctx.cookies.get(SESSION_COOKIE)?.value;
  if (env && token) {
    const subject = await readSession(token, env.SESSION_SECRET, Date.now());
    const user = subject ? await getUserById(env.DB, subject) : null;
    if (user) ctx.locals.user = user;
  }

  if (needsAuth(ctx.url.pathname) && !ctx.locals.user) {
    return ctx.redirect(`/login?next=${encodeURIComponent(ctx.url.pathname)}`);
  }
  return next();
});
