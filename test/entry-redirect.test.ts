import { describe, expect, test } from 'bun:test';
import { negotiatedRedirect } from '../src/lib/http/negotiated-redirect.ts';

describe('negotiatedRedirect', () => {
  test('a temporary redirect, because the language it picked is not the only one', () => {
    expect(negotiatedRedirect('/it/liguria/').status).toBe(302);
    expect(negotiatedRedirect('/it/liguria/').headers.get('location')).toBe('/it/liguria/');
  });
  test('and it varies on the header it read, or a cache would answer for everyone', () => {
    expect(negotiatedRedirect('/it/liguria/').headers.get('vary')).toBe('accept-language');
  });
});
