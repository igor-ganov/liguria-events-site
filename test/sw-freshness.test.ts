// A page-first worker serves what the device holds. Measured on a device on
// 2026-09-28: it held a page from 2026-09-08 and served it with a connection
// present, so the reader ran a three-week-old app — and every client-side change
// shipped since, instrumentation included, was invisible to it.
import { describe, expect, test } from 'bun:test';
import { freshEnough } from '../src/sw/fresh-enough.ts';

const NOW = Date.parse('2026-09-28T10:00:00Z');
const agoMs = (hours: number) => NOW - hours * 3_600_000;

describe('freshEnough', () => {
  test('a copy from this visit is the site', () => {
    expect(freshEnough(agoMs(0), NOW)).toBe(true);
    expect(freshEnough(agoMs(1), NOW)).toBe(true);
  });

  test('and so is one from earlier today, up to a rebuild away', () => {
    expect(freshEnough(agoMs(5.9), NOW)).toBe(true);
  });

  test('a copy older than the site itself is not', () => {
    expect(freshEnough(agoMs(6.1), NOW)).toBe(false);
    expect(freshEnough(agoMs(24), NOW)).toBe(false);
    expect(freshEnough(agoMs(20 * 24), NOW)).toBe(false);
  });

  test('a copy with no stamp is not trusted to be recent', () => {
    expect(freshEnough(0, NOW)).toBe(false);
    expect(freshEnough(Number.NaN, NOW)).toBe(false);
  });
});
