import { queryAll } from '../../lib/dom/query-all.ts';

const isInput = (node: HTMLElement): node is HTMLInputElement => node instanceof HTMLInputElement;

const valueOf = (row: HTMLElement, selector: string): string =>
  queryAll(row, selector)
    .filter(isInput)
    .map((input) => input.value.trim())
    .at(0) ?? '';

/**
 * The programme as the API takes it. Only the dated rows are sent — the empty
 * row waiting at the bottom of the editor is part of the UI, not an occurrence,
 * and the server drops undated rows for the same reason.
 */
export const readProgramme = (form: HTMLFormElement): readonly Record<string, string>[] =>
  queryAll(form, '[data-programme-row]')
    .map((row) => ({
      date: valueOf(row, '[data-session-date]'),
      time: valueOf(row, '[data-session-time]'),
      title: valueOf(row, '[data-session-title]'),
    }))
    .filter((session) => session.date !== '');
