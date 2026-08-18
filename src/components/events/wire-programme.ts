import { branch } from '../../lib/branch.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { isHtmlElement } from '../../lib/dom/is-html-element.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import { syncEventKind } from './sync-event-kind.ts';

const isInput = (node: HTMLElement): node is HTMLInputElement => node instanceof HTMLInputElement;

// Both the attribute and the live property: a clone carries the attribute the
// row was rendered with, while the property holds whatever was typed into it.
const blank = (root: HTMLElement): void =>
  queryAll(root, 'input')
    .filter(isInput)
    .forEach((input) => {
      input.setAttribute('value', '');
      input.value = '';
    });

const rowsOf = (root: HTMLElement): readonly HTMLElement[] => queryAll(root, '[data-programme-row]');

// A new row is a blanked copy of the first, so the markup lives in the
// component rather than in a string inside a script.
const addRow = (form: HTMLFormElement): void => {
  const rows = rowsOf(form);
  rows
    .slice(0, 1)
    .forEach((template) =>
      [template.cloneNode(true)].filter(isHtmlElement).forEach((copy) => {
        blank(copy);
        // Inserted after the LAST row so dates stack downwards, and with
        // insertAdjacentElement rather than append: the worker types' own
        // `append` wins the overload and rejects an element.
        rows.at(-1)?.insertAdjacentElement('afterend', copy);
      }),
    );
};

// The last row is emptied rather than removed: an editor with no rows leaves
// the author nothing to type into.
const removeRow = (row: HTMLElement): void =>
  branch(rowsOf(row.parentElement ?? row).length > 1)<void>(
    () => {
      row.remove();
    },
    () => blank(row),
  );

const clicked = (form: HTMLFormElement, selector: string, target: EventTarget | undefined) =>
  queryAll(form, selector).filter((element) => element === target);

/** Wire the programme editor: the kind toggle, adding a date, removing one. */
export const wireProgramme = (form: HTMLFormElement): void => {
  syncEventKind(form);
  form.addEventListener('change', () => syncEventKind(form));
  form.addEventListener('click', (event) => {
    clicked(form, '[data-programme-add]', event.target ?? undefined).forEach(() => addRow(form));
    clicked(form, '[data-programme-remove]', event.target ?? undefined)
      .flatMap((button) => [button.closest('[data-programme-row]')])
      .filter(isHtmlElement)
      .filter(isDefined)
      .forEach(removeRow);
  });
};
