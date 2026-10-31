import { branch } from '../branch.ts';
import { QUICK_SLUGS } from './quick-slugs.ts';
import type { QuickKind } from './quick-kind.ts';

/**
 * Where a quick chip leads from a feed whose pages start at `base`: to its own
 * page, or — when it is the one pressed — back to the whole feed. The other
 * filters (`query`) go along.
 */
export const quickHref = (base: string, kind: QuickKind, pressed: QuickKind | '', query: string): string =>
  [branch(kind === pressed)(() => base, () => `${base}${QUICK_SLUGS[kind]}/`), query].filter((part) => part !== '').join('?');
