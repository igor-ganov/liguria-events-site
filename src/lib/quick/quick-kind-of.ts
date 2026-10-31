import { QUICK_KINDS } from './quick-kind.ts';
import type { QuickKind } from './quick-kind.ts';

/** A quick filter named in a URL, or '' for anything that is not one. */
export const quickKindOf = (value: string | undefined): QuickKind | '' =>
  QUICK_KINDS.find((kind) => kind === value) ?? '';
