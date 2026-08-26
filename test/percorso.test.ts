// The thread: the drawn path and how far it has been drawn.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { threadWindow } from '../src/components/percorso/thread-window.ts';
import { stopClass } from '../src/components/percorso/stop-class.ts';
import { stopMark } from '../src/components/percorso/stop-mark.ts';
import { routeSpanHtml } from '../src/components/favorites/route-span-html.ts';

describe('threadWindow', () => {
  test('draws only the stretch asked for, in screen coordinates', () => {
    const d = threadWindow({ from: 0, to: 240, shift: 0 });
    assert.ok(d.startsWith('M9,0 '), d.slice(0, 12));
    assert.equal(d.split('C').length - 1, 2);
  });

  test('the shift moves the whole stretch onto the screen', () => {
    const fermo = threadWindow({ from: 0, to: 120, shift: 0 });
    const spostato = threadWindow({ from: 0, to: 120, shift: 50 });
    assert.notEqual(fermo, spostato);
    assert.ok(spostato.startsWith('M9,50 '), spostato.slice(0, 12));
  });

  test('the wobble is keyed to the column, so it travels with the content', () => {
    // The same absolute stretch drawn from two scroll positions must have the
    // same shape — otherwise the line shimmers in place instead of scrolling.
    const alto = threadWindow({ from: 1200, to: 1320, shift: 0 });
    const basso = threadWindow({ from: 1200, to: 1320, shift: -400 });
    const y = (p: string) => (p.match(/,(-?[\d.]+)/g) ?? []).map((n) => Number(n.slice(1)));
    assert.deepEqual(
      y(alto).map((n) => n - 400),
      y(basso),
    );
  });

  test('a window shorter than one bend still draws a line', () => {
    assert.ok(threadWindow({ from: 10, to: 20, shift: 0 }).includes('C'));
  });

  test('a window above the start of the column does not break', () => {
    const d = threadWindow({ from: -300, to: 100, shift: 300 });
    assert.ok(d.includes('C'));
    assert.ok(!d.includes('NaN'));
  });
});

describe('stopMark', () => {
  test('sits on the line at the height it was given', () => {
    assert.equal(stopMark(240, false).transform, 'translate(2,233)');
  });

  test('a fractional height still yields a whole coordinate', () => {
    // Card centres land on half pixels; a transform full of decimals makes
    // the browser resample the stroke and the circle goes fuzzy.
    assert.equal(stopMark(240.5, false).transform, 'translate(2,234)');
  });

  test('a stop made here is marked as such, and only that one', () => {
    assert.ok(stopMark(10, true).className.includes('percorso__nodo--nostra'));
    assert.ok(!stopMark(10, false).className.includes('--nostra'));
  });

  test('the circle it draws does not close', () => {
    // Same rule as the buttons: the hand stops short of its starting point.
    const punti = stopMark(0, false).d.match(/[\d.]+,[\d.]+/g) ?? [];
    assert.ok(punti.length > 2);
    assert.notEqual(punti.at(0), punti.at(-1));
  });
});

describe('stopClass', () => {
  test('a filled stop means made here, a hollow one means found elsewhere', () => {
    assert.equal(stopClass(true), 'fermata fermata--nostra');
    assert.equal(stopClass(false), 'fermata');
  });
});

describe('routeSpanHtml', () => {
  test('a route across days keeps the arrow', () => {
    const html = routeSpanHtml('2026-07-04', '2026-07-06', 'en');
    assert.ok(html.includes('→'), html);
  });

  test('a route inside one day names that day once', () => {
    const html = routeSpanHtml('2026-07-04', '2026-07-04', 'en');
    assert.ok(!html.includes('→'), html);
    assert.equal(html.split('July').length - 1, 1, html);
  });
});
