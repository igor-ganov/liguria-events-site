import { assetImports } from './asset-imports.ts';
import { pageAssets } from './page-assets.ts';
import { storeAsset } from './store-asset.ts';

/** The whole module graph of a page, bounded. Sixty files is every chunk a
 *  page of this site loads; the map engine sits behind a dynamic import and is
 *  deliberately not part of it — a megabyte is not a courtesy. */
const BUDGET = 60;

/**
 * Fetch what a stored page needs in order to behave like itself.
 *
 * A page kept on its own is markup: with no signal its menu does not open, its
 * filters do nothing, and anything it builds after loading is absent. Following
 * the imports matters as much as the scripts themselves — a module whose first
 * import is missing fails as completely as one that was never there.
 */
export const warmAssets = async (html: string, origin: string): Promise<void> => {
  const queue = [...pageAssets(html, origin)];
  const seen = new Set(queue);
  for (const path of queue) {
    const code = await storeAsset(`${origin}${path}`);
    assetImports(code, path, origin)
      .filter((next) => !seen.has(next))
      .filter(() => queue.length < BUDGET)
      .forEach((next) => {
        seen.add(next);
        queue.push(next);
      });
  }
};
