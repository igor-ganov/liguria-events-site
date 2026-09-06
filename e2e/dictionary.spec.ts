// The dictionary the client actually receives.
//
// Every page prints its copy into an island the browser decodes. When that
// decode fails the site does not break — it silently falls back to empty or
// English defaults, and nobody notices until a screen is missing a sentence.
// It had been failing on every page in every language: the content schema did
// not declare two keys, zod strips what it does not name, and the client
// schema required them.
//
// The check lives here rather than in a unit test because the input is a page
// the build produced, and a unit test that reads dist is a unit test that
// fails wherever the build has not run yet.
import { Either, Schema } from 'effect';
import { expect, test } from '@playwright/test';
import { PageDataSchema } from '../src/lib/i18n/ui-schema.ts';

const PAGES = [
  ['English', '/liguria/'],
  ['Italian', '/it/liguria/'],
  ['Russian', '/ru/liguria/'],
] as const;

PAGES.forEach(([language, path]) =>
  test(`the ${language} page hands the client a dictionary it can read`, async ({ page }) => {
    await page.goto(path);
    const island = await page.locator('#ui-data').textContent();
    const decoded = Schema.decodeUnknownEither(PageDataSchema)(JSON.parse(island ?? '{}'));
    const why = [decoded].filter(Either.isLeft).map((left) => String(left.left)).at(0) ?? '';
    const missing = why
      .split(/\r?\n/)
      .map((line, index, all) => `${all[index - 1] ?? ''} ${line}`)
      .filter((line) => /is missing/.test(line))
      .slice(0, 6)
      .join(' | ');
    expect(Either.isRight(decoded), missing).toBe(true);
  }),
);
