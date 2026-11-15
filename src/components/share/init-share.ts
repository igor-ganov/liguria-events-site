import { bindOnce } from '../../lib/dom/bind-once.ts';
import { branch } from '../../lib/branch.ts';
import { SHARE } from './share-selectors.ts';
import { shareableUrl } from './shareable-url.ts';

const REVERT_MS = 2000;

/** Say it worked, then go back to the resting label. */
const flash = (button: Element, copied: string): void => {
  const label = button.querySelector(SHARE.labelSelector);
  const resting = label?.textContent ?? '';
  branch(label === null)(
    () => undefined,
    () => {
      label?.replaceChildren(copied);
      button.setAttribute(SHARE.stateAttr, 'copied');
      setTimeout(() => {
        label?.replaceChildren(resting);
        button.removeAttribute(SHARE.stateAttr);
      }, REVERT_MS);
    },
  );
};

/** The native sheet where the browser has one — on iOS it is the only route
 *  into WhatsApp — and the clipboard everywhere else. */
const share = async (button: Element): Promise<void> => {
  const url = button.getAttribute(SHARE.urlAttr) ?? shareableUrl(globalThis.location.href);
  const title = button.getAttribute(SHARE.titleAttr) ?? document.title;
  await branch('share' in navigator)(
    () => navigator.share({ title, url }).catch(() => undefined),
    () =>
      navigator.clipboard
        .writeText(url)
        .then(() => flash(button, button.getAttribute(SHARE.copiedAttr) ?? ''))
        .catch(() => undefined),
  );
};

// Once per button: a feed brought back as it was left (keepFeed) keeps its
// buttons, and their listeners with them.
export const initShare = (): void =>
  document
    .querySelectorAll<HTMLElement>(SHARE.buttonSelector)
    .forEach((node) => bindOnce(node, 'shareBound', (button) => button.addEventListener('click', () => void share(button))));
