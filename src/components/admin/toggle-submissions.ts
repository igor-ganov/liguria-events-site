import { isDefined } from '../../lib/is-defined.ts';

/** Expand or collapse the submissions panel that belongs to a person's row. */
export const toggleSubmissions = (button: HTMLButtonElement): void => {
  const selector = `.submissions[data-for="${button.dataset['toggle']}"]`;
  [document.querySelector<HTMLTableRowElement>(selector) ?? undefined]
    .filter(isDefined)
    .forEach((panel) => {
      const open = panel.hidden;
      panel.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
    });
};
