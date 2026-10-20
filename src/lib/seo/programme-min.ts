/**
 * How many upcoming events make a venue page worth offering a crawler.
 *
 * Three is a programme rather than a single night: the page has a list on it
 * that the city feed does not already say better. The number is shared by the
 * sitemap and by the links the region feed carries, so a crawler is never
 * offered an address it was not also given a path to.
 */
export const PROGRAMME_MIN = 3;
