import { isElement } from './is-element.ts';
import { onRouteForget } from './on-route-forget.ts';
import { onRoutePrivacy } from './on-route-privacy.ts';
import { runClickAction } from './run-click-action.ts';

/** Shell: one delegated listener for the whole list, so it covers rows painted
 *  now and after any repaint. */
export const onMyRoutesClick = (event: MouseEvent): void => {
  [event.target].filter(isElement).forEach((target) =>
    runClickAction(target, [
      { selector: '[data-route-forget]', run: onRouteForget },
      { selector: '[data-route-privacy]', run: onRoutePrivacy },
    ]),
  );
};
