import type { ArchivedEvent } from './archived-schema.ts';

// What changes between one year's edition and the next, and therefore cannot
// be part of the name: the year itself, and the ordinal a feast counts itself
// by — "4^ Festa dell'Olio" is the same feast as "5ª Festa dell'Olio".
const ENTITY = /&#?\w+;/g;
const YEAR = /\b(19|20)\d{2}\b/g;
const ORDINAL = /\b\d+\s*[°ºª^]/g;

/**
 * What makes two listings the same event held twice.
 *
 * The town is part of it: two towns hold a patron feast under one name, and
 * they are two feasts. Everything else is the title with the parts that count
 * the editions taken out.
 */
export const editionKey = (event: ArchivedEvent): string =>
  [
    event.t
      .replace(ENTITY, ' ')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(ORDINAL, ' ')
      .replace(YEAR, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim(),
    event.ct ?? '',
  ].join('|');
