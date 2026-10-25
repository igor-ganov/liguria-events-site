import { describe, expect, test } from 'bun:test';
import { langSwapUrl } from '../src/lib/i18n/lang-swap-url.ts';

const at = (href: string): URL => new URL(href, 'https://dovego.it');

describe('langSwapUrl', () => {
  test('says the same page in another language', () => {
    expect(langSwapUrl(at('/en/liguria/landmarks/'), 'it')?.pathname).toBe('/it/liguria/landmarks/');
  });

  test('keeps the query and the fragment', () => {
    expect(langSwapUrl(at('/it/liguria/map/?at=44.4,8.9#here'), 'ru')?.href).toBe(
      'https://dovego.it/ru/liguria/map/?at=44.4,8.9#here',
    );
  });

  test('is nothing for a page already in that language', () => {
    expect(langSwapUrl(at('/ru/releases/'), 'ru')).toBeUndefined();
  });

  test('is nothing for a page in no language', () => {
    expect(langSwapUrl(at('/privacy/'), 'it')).toBeUndefined();
    expect(langSwapUrl(at('/'), 'it')).toBeUndefined();
  });
});
