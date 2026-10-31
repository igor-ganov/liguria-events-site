import { QUICK_KINDS } from './quick-kind.ts';
import { QUICK_SLUGS } from './quick-slugs.ts';
import type { QuickKind } from './quick-kind.ts';

/** The quick filter a page's path segment stands for, or '' for any other. */
export const quickOfSlug = (slug: string): QuickKind | '' =>
  QUICK_KINDS.find((kind) => QUICK_SLUGS[kind] === slug) ?? '';
