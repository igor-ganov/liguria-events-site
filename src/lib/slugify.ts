/**
 * A readable, ASCII, hyphenated form of a name.
 *
 * Its own module because two kinds of URL need it: the detail slugs that append
 * a stable hash for uniqueness, and the venue paths that are already unique by
 * their position under a city and read better without one.
 */
export const slugify = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'x';
