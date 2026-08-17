import { fieldOf } from './field-of.ts';

/** Shell: is there a signed-in account behind this page? An unreachable session
 *  endpoint means anonymous. */
export const fetchLoggedIn = async (): Promise<boolean> => {
  try {
    const me: unknown = await (await fetch('/api/auth/me')).json();
    return Boolean(fieldOf(me, 'user'));
  } catch {
    return false;
  }
};
