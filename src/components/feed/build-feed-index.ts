import { feedLiDoc } from './feed-li-doc.ts';
import { feedState } from './feed-state.ts';
import { prepare } from '../../lib/search/index.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import type { Locale } from '../../lib/i18n/locales.ts';

/** (Re)build the fuzzy index over the cards currently in the list. */
export const buildFeedIndex = (lang: Locale): void => {
  const docs = queryAll(document, '[data-feed-list] li').map(feedLiDoc(lang));
  feedState.index = prepare({ lang, docs });
};
