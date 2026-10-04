import { canonicalUrl } from '../seo/canonical-url.ts';
import { ENTRY_LOCALE } from '../i18n/entry-locale.ts';
import { venuePath } from '../events/venue-path.ts';
import { embedTarget } from './embed-target.ts';

/** The two things a venue can paste: a widget, or a link. */
export type EmbedSnippet = Readonly<{ script: string; plain: string }>;

/**
 * What a venue copies onto its own site.
 *
 * Two of them on purpose. The script is the useful one for the venue — its
 * programme, always current, no work. The plain link is the useful one for us:
 * an iframe is a frame, not a link, and only an anchor in somebody's HTML
 * carries authority back. Offering both openly is the honest version of asking
 * for a link.
 */
export const embedSnippet = (venue: string, site: URL | undefined): EmbedSnippet => {
  const target = embedTarget(venue);
  const path = venuePath(target?.region ?? '', target?.city ?? '', target?.slug ?? '');
  const page = canonicalUrl(ENTRY_LOCALE, path, site);
  const origin = new URL(site ?? 'https://dovego.it').origin;
  return {
    script: `<script async src="${origin}/embed.js" data-venue="${venue}"></script>`,
    plain: `<a href="${page}" rel="noopener">Prossimi eventi su Dove Go</a>`,
  };
};
