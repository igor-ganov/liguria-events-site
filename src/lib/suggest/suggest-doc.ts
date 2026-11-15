/** What a suggestion leads to: an event page, or a venue's page. */
export type SuggestKind = 'event' | 'venue';

/** One suggestion target, as a region's suggestion file carries it. The path
 *  is in-site and language-free, for localizedUrl(lang, path). `until` is the
 *  last day an event is on, so a file held for days does not suggest what is
 *  over; a venue has none. `body` is what the letters are also matched in. */
export type SuggestDoc = Readonly<{
  id: string;
  kind: SuggestKind;
  title: string;
  sub: string;
  path: string;
  body: string;
  until: string;
}>;

/** The ids the meaning found, best first, already apart by kind. */
export type SemanticIds = Readonly<{ events: readonly string[]; venues: readonly string[] }>;

/** What the combobox shows: two groups, each in its order. */
export type SuggestGroups = Readonly<{ events: readonly SuggestDoc[]; venues: readonly SuggestDoc[] }>;

/** One document to embed at build time, for every region at once. */
export type EmbedDoc = Readonly<{ id: string; region: string; until: string; text: string }>;
