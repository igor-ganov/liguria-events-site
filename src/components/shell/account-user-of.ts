import type { AccountUser } from './account-user.ts';

/**
 * The viewer carried by an /api/auth/me body, or none. The endpoint reports an
 * empty user for a stranger, so the body is read defensively — `Object(x)` boxes
 * an absent value into `{}`, which answers "who is this?" without a guard and
 * survives a malformed response as well.
 */
export const accountUserOf = (body: unknown): AccountUser | undefined => {
  const user = Object(Object(body)['user']);
  const viewer: AccountUser = {
    handle: String(user['handle'] ?? ''),
    role: String(user['role'] ?? ''),
  };
  return [viewer].filter((candidate) => candidate.handle !== '')[0];
};
