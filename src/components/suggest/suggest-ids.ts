import type { SuggestKind } from '../../lib/suggest/suggest-doc.ts';

/** The ids the combobox wires together with ARIA: the input controls the
 *  list, points at the active option, and each group is named by its heading.
 *  One search box per page, so fixed ids are unique. */
export const SUGGEST_IDS: Readonly<{
  list: string;
  option: (at: number) => string;
  heading: (kind: SuggestKind) => string;
}> = {
  list: 'feed-suggest-list',
  option: (at) => `feed-suggest-option-${at}`,
  heading: (kind) => `feed-suggest-heading-${kind}`,
};
