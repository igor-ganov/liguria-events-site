import { branch } from '../branch.ts';
import type { CompactEvent, SourceLink } from './event-schema.ts';
import { sourceName } from './source-name.ts';
import { sourceOf } from './source-of.ts';

export type NamedLink = Readonly<{ name: string; url: string }>;

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
