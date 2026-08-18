import { isDefined } from '../../lib/is-defined.ts';
import { queryAll } from '../../lib/dom/query-all.ts';

const isInput = (node: HTMLElement): node is HTMLInputElement => node instanceof HTMLInputElement;

const checked = (form: HTMLFormElement): boolean =>
  queryAll(form, '[data-container-toggle]')
    .filter(isInput)
    .map((input) => input.checked)
    .at(0) ?? false;

/**
 * Reflect the chosen kind onto the form: `data-container` drives which block the
 * stylesheet shows, and the start date stops being required for a container —
 * its run comes from the programme, so an untouched date field must not block
 * the submit.
 */
export const syncEventKind = (form: HTMLFormElement): void => {
  const container = checked(form);
  queryAll(form, '[data-when]')
    .filter(isDefined)
    .forEach((field) => {
      field.dataset['container'] = String(container);
    });
  queryAll(form, 'input[name=startDate]')
    .filter(isInput)
    .forEach((input) => {
      input.required = !container;
    });
};
