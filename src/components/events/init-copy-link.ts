import { bindOnce } from '../../lib/dom/bind-once.ts';
import { branch } from '../../lib/branch.ts';
import { COPY_LINK } from './copy-link-selectors.ts';

const REVERT_MS = 2000;

const flash = (button: Element, done: string): void => {
  const resting = button.textContent ?? '';
  button.replaceChildren(done);
  button.setAttribute(COPY_LINK.stateAttr, 'copied');
  setTimeout(() => {
    button.replaceChildren(resting);
    button.removeAttribute(COPY_LINK.stateAttr);
  }, REVERT_MS);
};

/** Copy the new event's link. The field is selected as well, so a browser that
 *  refuses the clipboard still leaves the URL ready to copy by hand. */
const copy = async (button: Element): Promise<void> => {
  const field = document.querySelector<HTMLInputElement>(COPY_LINK.fieldSelector);
  field?.select();
  await branch(field === null)(
    () => Promise.resolve(),
    () =>
      navigator.clipboard
        .writeText(field?.value ?? '')
        .then(() => flash(button, button.getAttribute(COPY_LINK.doneAttr) ?? ''))
        .catch(() => undefined),
  );
};

// Once per button: a page brought back as it was left keeps its listeners.
export const initCopyLink = (): void =>
  document
    .querySelectorAll<HTMLElement>(COPY_LINK.buttonSelector)
    .forEach((node) => bindOnce(node, 'copyBound', (button) => button.addEventListener('click', () => void copy(button))));
