import { branch } from '../branch.ts';
import type { CompactEvent, SourceLink } from './event-schema.ts';
import { sourceName } from './source-name.ts';

export type NamedLink = Readonly<{ name: string; url: string }>;

/** The compact index does not name the primary source — infer it from the
 *  URL host for labeling. */
const sourceOf = (event: CompactEvent): string => {
  const host = new URL(event.u).hostname.replace(/^www\./, '');
  const bySuffix: readonly (readonly [string, string])[] = [
    ['visitgenoa.it', 'visitgenoa'],
    ['mentelocale.it', 'mentelocale'],
    ['genovateatro.it', 'genovateatro'],
    ['palazzoducale.genova.it', 'palazzoducale'],
    ['portoantico.it', 'portoantico'],
  ];
  return bySuffix.find(([suffix]) => host.endsWith(suffix))?.[1] ?? host;
};

/** Primary + alternate source links, first-wins deduped, human-named. */
export const eventLinks = (event: CompactEvent): readonly NamedLink[] =>
  [{ source: sourceOf(event), url: event.u }, ...(event.l ?? [])]
    .reduce<readonly SourceLink[]>(
      (kept, link) =>
        branch(kept.some((existing) => existing.url === link.url))(
          () => kept,
          () => [...kept, link],
        ),
      [],
    )
    .map((link) => ({ name: sourceName(link.source), url: link.url }));
