// The combobox keyboard: arrows move through every option of both groups as
// one list, wrapping at either end (WAI-ARIA combobox, listbox popup).
import { describe, expect, test } from 'bun:test';
import { moveActive } from '../src/lib/suggest/move-active.ts';
import { parseSemantic } from '../src/lib/suggest/parse-semantic.ts';

describe('moveActive', () => {
  test('down from nothing lands on the first option, then walks and wraps', () => {
    expect(moveActive(3, -1, 'ArrowDown')).toBe(0);
    expect(moveActive(3, 1, 'ArrowDown')).toBe(2);
    expect(moveActive(3, 2, 'ArrowDown')).toBe(0);
  });
  test('up from nothing or the first lands on the last', () => {
    expect(moveActive(3, -1, 'ArrowUp')).toBe(2);
    expect(moveActive(3, 0, 'ArrowUp')).toBe(2);
    expect(moveActive(3, 2, 'ArrowUp')).toBe(1);
  });
  test('no options, no active one; other keys change nothing', () => {
    expect(moveActive(0, -1, 'ArrowDown')).toBe(-1);
    expect(moveActive(3, 1, 'a')).toBe(1);
  });
});

describe('parseSemantic', () => {
  test('takes the two id lists the endpoint answers', () => {
    expect(parseSemantic({ events: ['a'], venues: ['venue:x'] })).toEqual({ events: ['a'], venues: ['venue:x'] });
  });
  test('anything else is no answer, so the letters alone decide', () => {
    expect(parseSemantic({ events: 'a' })).toBeUndefined();
    expect(parseSemantic({ events: [1], venues: [] })).toBeUndefined();
    expect(parseSemantic('nope')).toBeUndefined();
    expect(parseSemantic(undefined)).toBeUndefined();
  });
});
