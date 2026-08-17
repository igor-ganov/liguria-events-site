import { isElement } from './is-element.ts';
import { isHtmlElement } from '../../lib/dom/is-html-element.ts';
import { toggleFavorite } from './toggle-favorite.ts';

/** Shell: one capturing listener covers every favourite button on the page —
 *  those rendered now and those added after any SPA nav. */
export const onFavoriteClick = (event: MouseEvent): void => {
  [event.target]
    .filter(isElement)
    .map((target) => target.closest('[data-fav-toggle]'))
    .filter(isHtmlElement)
    .forEach((button) => {
      event.preventDefault();
      event.stopPropagation();
      toggleFavorite(button);
    });
};
