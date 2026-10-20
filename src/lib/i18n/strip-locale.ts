import { branch } from '../branch.ts';
import { isLocale } from './is-locale.ts';

/** A site path without its language prefix: `/it/liguria/` → `liguria/`. What
 *  is left can be handed to localizedUrl to say the same thing in another
 *  language. */
export const stripLocale = (pathname: string): string => {
  const parts = pathname.split('/').filter((part) => part !== '');
  const bare = branch(isLocale(parts[0] ?? ''))(
    () => parts.slice(1),
    () => parts,
  );
  return bare.map((part) => `${part}/`).join('');
};
