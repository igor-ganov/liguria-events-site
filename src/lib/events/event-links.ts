import { branch } from '../branch.ts';
import type { CompactEvent, SourceLink } from './event-schema.ts';
import { sourceName } from './source-name.ts';
import { sourceOf } from './source-of.ts';

export type NamedLink = Readonly<{ name: string; url: string }>;

// The site a page belongs to: its host without "www.", or the address itself
// when it is not one a URL parser reads.
const siteOf = (url: string): string =>
  [url].filter((href) => URL.canParse(href)).map((href) => new URL(href).hostname.replace(/^www\./, '')).at(0) ?? url;

/**
 * Primary + alternate source links, human-named, one per source: the first
 * page a source gave wins. A show sold date by date keeps every other date's
 * page as a link (83 for one exhibition), and several pages of one site said
 * the same thing three times over; a reader wants to know who says so, once.
 */
export const eventLinks = (event: CompactEvent): readonly NamedLink[] =>
  [{ source: sourceOf(event), url: event.u }, ...(event.l ?? [])]
    // An event submitted on the site carries no source link; an empty one is
    // not a link to render.
    .filter((link) => link.url !== '')
    .reduce<readonly SourceLink[]>(
      (kept, link) =>
        branch(kept.some((existing) => siteOf(existing.url) === siteOf(link.url)))(
          () => kept,
          () => [...kept, link],
        ),
      [],
    )
    .map((link) => ({ name: sourceName(link.source), url: link.url }));
