/** File-name stem for the saved PDF: the route title reduced to a slug, capped
 *  at 40 characters, falling back to `route` when nothing usable survives. */
export const routePdfSlug = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'route';
