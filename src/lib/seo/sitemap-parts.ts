/**
 * The files a crawler is asked to spend its day on, longest-lived first.
 *
 * The order is not a ranking a crawler obeys, but it is the order it reads
 * them in, and the last file is the one that turns over daily: 1 208 event
 * rows against 188 pages and 356 places on 15 November.
 *
 * Named in one place because two addresses are indexes of them: the generated
 * sitemap-index.xml, which Google has had submitted since 6 August, and
 * sitemap-events.xml, submitted on the 22nd. Both keep working and both now
 * describe the same split.
 *
 * The archive is not among them. 3 345 finished pages were a third of
 * everything the site offered; the file is still served for whoever asks.
 */
export const SITEMAP_PARTS = ['sitemap-pages.xml', 'sitemap-places.xml', 'sitemap-upcoming.xml'];
