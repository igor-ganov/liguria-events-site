// The client reads its dictionary out of an island the page prints. If that
// decode ever fails the site silently falls back to empty English strings —
// which is exactly how an offline bar came to be shown with nothing written
// on it. The build's own output is the input here, so a dictionary that stops
// matching its schema fails a unit test rather than a screen.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { Either, Schema } from 'effect';
import { PageDataSchema } from '../src/lib/i18n/ui-schema.ts';
import { readFileSync } from 'node:fs';

const islandOf = (path: string): unknown => {
  const html = readFileSync(path, 'utf8');
  const opening = 'id="ui-data">';
  const start = html.indexOf(opening) + opening.length;
  return JSON.parse(html.slice(start, html.indexOf('</script>', start)));
};

const PAGES = [
  ['English', 'dist/liguria/index.html'],
  ['Italian', 'dist/it/liguria/index.html'],
  ['Russian', 'dist/ru/liguria/index.html'],
] as const;

describe('the ui island a built page prints', () => {
  PAGES.forEach(([name, path]) =>
    test(`decodes with the schema the client uses — ${name}`, () => {
    const decoded = Schema.decodeUnknownEither(PageDataSchema)(islandOf(path));
    const why = [decoded].filter(Either.isLeft).map((left) => String(left.left)).at(0) ?? '';
    const missing = why
      .split(/\r?\n/)
      .map((line, index, all) => `${all[index - 1] ?? ''} ${line}`)
      .filter((line) => /is missing/.test(line))
      .slice(0, 6)
      .join(' | ');
      assert.ok(Either.isRight(decoded), `${path}: ${missing}`);
    }),
  );
});
