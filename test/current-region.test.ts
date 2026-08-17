// The region a client-rendered grid loads: the page stamps it on the global
// scope, and a page that does not is Liguria, the founding region.
import { afterEach, describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { currentRegion } from '../src/lib/region/current-region.ts';

const stamp = (value: unknown): void => {
  Reflect.set(globalThis, '__REGION__', value);
};

afterEach(() => {
  Reflect.deleteProperty(globalThis, '__REGION__');
});

describe('currentRegion', () => {
  test('reads the region the page stamped', () => {
    stamp('toscana');
    assert.equal(currentRegion(), 'toscana');
  });
  test('an unstamped page is Liguria', () => {
    assert.equal(currentRegion(), 'liguria');
  });
  test('a non-string stamp is ignored rather than trusted', () => {
    stamp(42);
    assert.equal(currentRegion(), 'liguria');
    stamp(undefined);
    assert.equal(currentRegion(), 'liguria');
  });
});
