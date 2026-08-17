import { getUserById } from './users.ts';
import { readSession } from './session.ts';
import type { AppUser } from './types.ts';

/** The bindings the session lookup needs. */
type SessionEnv = Readonly<{ SESSION_SECRET: string; DB: D1Database }>;

/**
 * The signed-in user behind a session cookie, or undefined. This mirrors the
 * middleware guard chain it replaced step for step: both the runtime env and the
 * cookie must be present, the token must verify, and the subject must resolve to
 * a row. Every step tests TRUTHINESS, as before — so an empty subject, like an
 * unverified token, yields no user rather than a lookup for ''.
 */
export const sessionUser = async (
  env: SessionEnv | undefined,
  token: string | undefined,
  nowMs: number,
): Promise<AppUser | undefined> => {
  const ready = [{ env, token }].filter(
    (pair): pair is { env: SessionEnv; token: string } => Boolean(pair.env) && Boolean(pair.token),
  );
  const found = await Promise.all(
    ready.map(async ({ env: bindings, token: cookie }) => {
      const subject = await readSession(cookie, bindings.SESSION_SECRET, nowMs);
      const rows = await Promise.all(
        [subject]
          .filter((value): value is string => Boolean(value))
          .map((id) => getUserById(bindings.DB, id)),
      );
      return rows.filter((row): row is AppUser => Boolean(row)).at(0);
    }),
  );
  return found.at(0) ?? undefined;
};
