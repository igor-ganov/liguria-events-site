// What is left of the thread in code: which rows are marked as ours, and the
// line above a generated route. The thread itself is drawn by the browser's
// own scroll-driven animation now, so its behaviour is checked end to end.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { stopClass } from '../src/components/percorso/stop-class.ts';
import { routeSpanHtml } from '../src/components/favorites/route-span-html.ts';

describe('stopClass', () => {
  test('a filled stop means made here, a hollow one means found elsewhere', () => {
    assert.equal(stopClass(true), 'fermata fermata--nostra');
    assert.equal(stopClass(false), 'fermata');
  });
});

describe('routeSpanHtml', () => {
  test('a route across days keeps the arrow', () => {
    assert.ok(routeSpanHtml('2026-07-04', '2026-07-06', 'en').includes('→'));
  });

  test('a route inside one day names that day once', () => {
    const html = routeSpanHtml('2026-07-04', '2026-07-04', 'en');
    assert.ok(!html.includes('→'), html);
    assert.equal(html.split('July').length - 1, 1, html);
  });
});
