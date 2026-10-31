import { escapeMarkup } from '../../lib/escape-markup.ts';

/** One feed row: the attributes the filter and the sort read, around a card. */
export const feedItemHtml = (attrs: Readonly<Record<string, string>>, card: string): string =>
  `<li${Object.entries(attrs)
    .map(([name, value]) => ` ${name}="${escapeMarkup(value)}"`)
    .join('')}>${card}</li>`;
