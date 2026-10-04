// A reader who declines the location prompt is the common case, and until now
// that sent the subscription an empty place. Measured against the live sender:
// `place=region:lombardia` answers "Oggi · Lombardia: 98", anything it does not
// recognise answers "Oggi · tutta Italia" — so declining meant a national digest
// instead of the one thing the reader asked for.
import { describe, expect, test } from 'bun:test';
import { placeToken } from '../src/lib/region/place-token.ts';

describe('placeToken', () => {
  test('names a region the way the sender reads it', () => {
    expect(placeToken('lombardia')).toBe('region:lombardia');
    expect(placeToken('emilia-romagna')).toBe('region:emilia-romagna');
  });

  test('an unknown region is no token at all, rather than a prefix with nothing after it', () => {
    expect(placeToken('')).toBe('');
    expect(placeToken('   ')).toBe('');
  });

  test('and a value that already carries its kind is left alone', () => {
    expect(placeToken('region:lazio')).toBe('region:lazio');
    expect(placeToken('city:genova')).toBe('city:genova');
  });
});
