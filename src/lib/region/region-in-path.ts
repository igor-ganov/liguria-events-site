import { branch } from '../branch.ts';
import { storedRegion } from './stored-region.ts';
import { isLocale } from '../i18n/is-locale.ts';

/**
 * The region a page's own address names, if it names one.
 *
 * The address is the truth about where a reader is reading — "a link is a
 * place, not a session", which is why the region is in every path. Read from
 * there rather than from the region the shell happens to be rendering with:
 * that one falls back to the founding region, so a page with no region of its
 * own would have quietly recorded Liguria as the reader's — the very guess this
 * whole change is about removing.
 */
export const regionInPath = (pathname: string): string | undefined => {
  const parts = pathname.split('/').filter((part) => part !== '');
  const bare = branch(isLocale(parts[0] ?? ''))(
    () => parts.slice(1),
    () => parts,
  );
  return storedRegion(bare[0]);
};
