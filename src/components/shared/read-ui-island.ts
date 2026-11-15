import { DEFAULT_PAGE_DATA } from './default-page-data.ts';
import { isLocale } from '../../lib/i18n/is-locale.ts';
import { readJsonIsland } from '../feed/read-json-island.ts';
import type { PageData } from '../../lib/i18n/ui-schema.ts';

const isPageData = (page: Partial<PageData>): page is PageData => isLocale(page.lang) && page.ui instanceof Object;

/**
 * Shell: read the page's embedded {lang, ui} island; malformed → EN default.
 *
 * Checked for shape, not decoded with the schema. The island is written by the
 * server from the dictionary the build already validated (src/content.config.ts),
 * so a second full decode here bought nothing but the schema library on every
 * page's first load — the largest script of the site, ahead of the feed being
 * wired, on every slow connection (measured 2026-11-15).
 */
export const readUiIsland = (): PageData =>
  [readJsonIsland<Partial<PageData>>('ui-data', {})].filter(isPageData).at(0) ?? DEFAULT_PAGE_DATA;
