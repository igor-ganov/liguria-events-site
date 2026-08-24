import { toCsv } from './to-csv.ts';
import type { AdGroup } from './ad-group.ts';

const CAMPAIGN = 'DoveGo — Ricerca — IT';

/** Keywords, in phrase and exact match. Broad match is left out on purpose:
 *  on a word as overloaded as "eventi" it buys the whole industry. */
export const keywordsCsv = (groups: readonly AdGroup[]): string =>
  toCsv([
    ['Campaign', 'Ad Group', 'Keyword', 'Criterion Type', 'Final URL'],
    ...groups.flatMap((group) =>
      group.keywords.flatMap((keyword) => [
        [CAMPAIGN, group.name, keyword, 'Phrase', group.url],
        [CAMPAIGN, group.name, keyword, 'Exact', group.url],
      ]),
    ),
  ]);

/** One responsive search ad per group: Google assembles the combinations. */
export const adsCsv = (groups: readonly AdGroup[]): string =>
  toCsv([
    [
      'Campaign',
      'Ad Group',
      'Ad type',
      'Final URL',
      ...Array.from({ length: 15 }, (_, i) => `Headline ${i + 1}`),
      ...Array.from({ length: 4 }, (_, i) => `Description ${i + 1}`),
    ],
    ...groups.map((group) => [
      CAMPAIGN,
      group.name,
      'Responsive search ad',
      group.url,
      ...Array.from({ length: 15 }, (_, i) => group.headlines[i] ?? ''),
      ...Array.from({ length: 4 }, (_, i) => group.descriptions[i] ?? ''),
    ]),
  ]);

export const negativesCsv = (negatives: readonly string[]): string =>
  toCsv([
    ['Campaign', 'Keyword', 'Criterion Type'],
    ...negatives.map((keyword) => [CAMPAIGN, keyword, 'Campaign Negative Phrase']),
  ]);
