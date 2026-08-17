import { initRouteView } from './route-view.ts';
import { initRouteEditor } from './route-editor.ts';
import { initRoutePdf } from './route-pdf.ts';
import { authorToken } from './author-token.ts';
import { branch } from '../../lib/branch.ts';

/** The author's device proves itself with the token it stored alongside the
 *  route, and gets the editor the server could not hand it. */
const claimOwnership = (root: Element): void => {
  authorToken(root.getAttribute('data-id') ?? '').forEach((token) => {
    root.setAttribute('data-owned', '1');
    root.setAttribute('data-edit-token', token);
    document
      .querySelectorAll('[data-route-edit-actions]')
      .forEach((el) => el.removeAttribute('hidden'));
  });
};

// The logged-in owner edits in place. For an ANONYMOUS route, only the author's
// device — which stored the route + its secret edit token in localStorage — may
// edit; a plain public link is read-only.
const start = (root: Element): void => {
  branch(root.getAttribute('data-owned') !== '1' && root.getAttribute('data-anon') === '1')(
    () => claimOwnership(root),
    () => undefined,
  );
  branch(root.getAttribute('data-owned') === '1')(initRouteEditor, initRouteView);
};

const run = (): void => {
  document.querySelectorAll('[data-route-root]').forEach(start);
};

export const initRoutePage = (): void => {
  run();
  document.addEventListener('astro:page-load', run);
  // "Download PDF" generates a real PDF file (jsPDF), not a print dialog.
  initRoutePdf();
};
