import { buildFeedIndex } from './build-feed-index.ts';
import { paintFavorites } from '../favorites/paint-favorites.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import type { Locale } from '../../lib/i18n/locales.ts';

// The order the server gave each folded day, stamped before the days join the
// page: stamping the whole page again would overwrite the order of days the
// reader has already re-sorted.
const stamp = (fold: HTMLTemplateElement): void => {
  queryAll(fold.content, '.feed-list').forEach((list) => {
    queryAll(list, ':scope > li').forEach((item, index) => {
      item.dataset['ord'] = String(index);
    });
  });
};

/**
 * Bring the folded days onto the page: the page opens with the nearest days
 * rendered and the rest inert in a `<template>`, where they cost the browser
 * nothing. Whatever needs every event — a search, a filter, a sort, the end of
 * the list coming into view — calls this first. The days take their place, the
 * search index learns them, saved hearts are filled. Says whether there was
 * anything to unfold, so a caller can skip work when there was not.
 */
export const unfoldFeed = (lang: Locale): boolean => {
  const folds = [...document.querySelectorAll<HTMLTemplateElement>('template[data-feed-tail]')];
  folds.forEach((fold) => {
    stamp(fold);
    fold.replaceWith(fold.content);
  });
  folds.slice(0, 1).forEach(() => {
    queryAll(document, '[data-feed-more]').forEach((marker) => marker.remove());
    buildFeedIndex(lang);
    paintFavorites();
  });
  return folds.length > 0;
};
