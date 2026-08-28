/**
 * Whether the page must tell crawlers to leave it alone.
 *
 * Only a SUBMITTED event can be kept out: one that came from the crawler has no
 * status of its own, and treating "no status" as "not published" put a noindex
 * on every one of the three and a half thousand pages the collector fills.
 *
 * Of the submitted ones, only published + public belongs in an index: a
 * link-only event is nobody's business but its readers', and one still under
 * review must not be indexed while a human is still looking at it.
 */
export const keepOutOfSearch = (
  status: string | undefined,
  visibility: string | undefined,
): boolean => status !== undefined && !(status === 'published' && visibility === 'public');
