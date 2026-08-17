import { downloadRoutePdf } from './download-route-pdf.ts';
import { isElement } from './is-element.ts';

const wiring = { wired: false };

/** Shell: one delegated click listener, attached once, for every "Download PDF"
 *  button on the page. */
export const initRoutePdf = (): void => {
  [wiring]
    .filter((state) => !state.wired)
    .forEach((state) => {
      state.wired = true;
      document.addEventListener('click', (event) => {
        [event.target]
          .filter(isElement)
          .filter((target) => Boolean(target.closest('[data-route-pdf]')))
          .forEach(() => void downloadRoutePdf());
      });
    });
};
