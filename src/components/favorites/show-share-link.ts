import { branch } from '../../lib/branch.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { setInnerHtml } from './set-inner-html.ts';
import { setText } from '../../lib/dom/set-text.ts';
import { shareLinkHtml } from './share-link-html.ts';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Shell: reveal the share box — with the saved route's absolute link, or the
 *  failure notice when the save never reached the API. */
export const showShareLink = (url: string | undefined): void => {
  const { ui } = readUiIsland();
  [document.querySelector<HTMLElement>('[data-route-share]') ?? undefined]
    .filter(isDefined)
    .forEach((box) => {
      box.hidden = false;
      branch(url === undefined || url === '')<void>(
        () => setText(box, ui.route.saveFailed),
        () => setInnerHtml(box, shareLinkHtml(`${location.origin}${BASE}${url ?? ''}`, ui.route.link)),
      );
    });
};
