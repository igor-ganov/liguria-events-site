import { accountUserOf } from './account-user-of.ts';
import { renderAccount } from './render-account.ts';
import type { AccountUser } from './account-user.ts';

// An unreachable or malformed /api/auth/me reads as "not signed in": the header
// then offers sign-in rather than hanging on its skeleton.
const fetchMe = async (): Promise<AccountUser | undefined> => {
  try {
    const body: unknown = await (await fetch('/api/auth/me')).json();
    return accountUserOf(body);
  } catch {
    return undefined;
  }
};

/** Resolve the viewer client-side (most pages are prerendered, so the header
 *  cannot know them server-side) and draw the account slots. */
export const refreshAccount = async (): Promise<AccountUser | undefined> => {
  const user = await fetchMe();
  renderAccount(user);
  return user;
};
