import { reachedFiles } from './reached-files.ts';
import type { Resolve } from './reached-files.ts';

/** The one layout of the site. A page that reaches it is drawn in the site's
 *  styles and needs its sheet; one that does not (an embed, a bare redirect)
 *  brings its own. */
export const LAYOUT = 'src/layouts/Layout.astro';

/** The pages that are given a stylesheet of their own. */
export const pagesWithLayout = (files: ReadonlyMap<string, string>, resolve: Resolve): readonly string[] => {
  const reach = reachedFiles(files, resolve);
  return [...files.keys()]
    .filter((path) => path.startsWith('src/pages/') && path.endsWith('.astro'))
    .filter((page) => reach(page).has(LAYOUT))
    .sort();
};
