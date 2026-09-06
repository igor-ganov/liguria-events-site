const LOCALES = ['it', 'ru'];

// An event's address is its words followed by a date and a twelve-character
// id. The words are the part a person recognises.
const EVENT = /^(.*)-\d{4}-\d{2}-\d{2}-[0-9a-f]{12}$/;

const titled = (segment: string): string =>
  segment
    .split('-')
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`)
    .join(' ');

// Sentence case, not title case: an event is a sentence somebody wrote, and
// "Concerto In Cortile" reads as a heading nobody typed.
const sentence = (slug: string): string =>
  [slug.split('-').join(' ')].map((words) => `${words.slice(0, 1).toUpperCase()}${words.slice(1)}`).at(0) ?? '';

const eventName = (slug: string): string =>
  [EVENT.exec(slug) ?? undefined]
    .filter((match) => match !== undefined)
    .map((match) => sentence(match[1] ?? ''))
    .at(0) ?? sentence(slug);

/**
 * A path, as something a reader would recognise in a list.
 *
 * Not the path itself: "/event/concerto-in-cortile-2026-12-05-51a5e3abbc8f/"
 * is forty characters of slug, and reading it back to somebody as a link title
 * would be worse than saying nothing at all.
 */
export const offlineLabel = (path: string): string => {
  const parts = path.split('/').filter((part) => part !== '');
  const bare = parts.filter((part, index) => !(index === 0 && LOCALES.includes(part)));
  return [bare]
    .filter((segments) => segments[0] === 'event')
    .map((segments) => eventName(segments[1] ?? ''))
    .at(0) ?? bare.map(titled).join(' · ');
};
