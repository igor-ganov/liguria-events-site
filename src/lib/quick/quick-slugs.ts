import type { QuickKind } from './quick-kind.ts';

/** The path segment of each quick filter's page: the words people type, and the
 *  one already used for the weekend facet, so its indexed address stays put. */
export const QUICK_SLUGS: Readonly<Record<QuickKind, string>> = {
  tonight: 'tonight',
  weekend: 'this-weekend',
  sunday: 'sunday-evening',
};
