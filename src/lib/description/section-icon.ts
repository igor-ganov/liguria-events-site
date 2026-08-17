import type { UiIconName } from '../icons/ui-icon-paths.ts';

/** The stable section types the enrichment tags headings with — `## [tickets]
 *  Biglietti` — and the accent icon each one shows. The tag keeps the icon and
 *  the callout styling working in every language, without matching localized
 *  words; an unknown or absent tag falls back to the neutral `info` section.
 *
 *  A Map, not an object: the tag is read out of source-derived text, and an
 *  inherited key ("constructor") must not read as a known section type. */
export const SECTION_ICON = new Map<string, UiIconName>([
  ['programme', 'star'],
  ['performers', 'gem'],
  ['getting-there', 'pin'],
  ['tickets', 'ticket'],
  ['when', 'calendar'],
  ['info', 'feed'],
]);
