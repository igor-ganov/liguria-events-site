import { DEFAULT_LOCALE } from '../i18n/default-locale.ts';
import { sitemapRow } from './sitemap-row.ts';
import type { SitemapUrl } from './sitemap-url.ts';

// The pages that are written rather than generated. Translated ones get the row
// the site speaks; the legal pages are built at the root only, and naming an
// /it/ twin for them handed Google four URLs that answered 404 — the mistake
// alternateLinks already carries a comment about.
const TRANSLATED = ['releases/', 'roadmap/', 'venues/'];
const ROOT_ONLY = ['privacy/', 'terms/', 'content-policy/'];

/**
 * The written pages, and only the written pages.
 *
 * An allowlist, because the file this replaces was a denylist — one `filter`
 * that excluded the map view — and a denylist advertises every page nobody
 * remembered to exclude. That is how /admin/, /admin/users/, /settings/,
 * /tickets/ and /auth/verify/ came to be offered to Google as content, three of
 * them answering 302 to a sign-in.
 */
export const contentSitemapUrls = (today: string, site: URL | undefined): readonly SitemapUrl[] => [
  ...TRANSLATED.map((path) => sitemapRow(path, today, site)),
  ...ROOT_ONLY.map((path) => sitemapRow(path, today, site, [DEFAULT_LOCALE])),
];
