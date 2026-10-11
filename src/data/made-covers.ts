import covers from './covers.json';

/** The photographs that had a page-sized copy when the site was built (see
 *  scripts/build-thumbs.ts, which writes the list). Empty outside a deploy. */
export const MADE_COVERS: ReadonlySet<string> = new Set<string>(covers);
