// The thread: the drawn path and how far it has been drawn.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { threadPath } from '../src/components/percorso/thread-path.ts';
import { threadProgress } from '../src/components/percorso/thread-progress.ts';
import { stopClass } from '../src/components/percorso/stop-class.ts';
import { stopMark } from '../src/components/percorso/stop-mark.ts';

describe('threadPath', () => {
  test('starts at the top of the lane and reaches the bottom', () => {
    const d = threadPath(600);
    assert.ok(d.startsWith('M9,0 '), d.slice(0, 12));
    assert.ok(d.endsWith('9,600'), d.slice(-12));
  });

  test('wanders off the centre line — a hand does not draw straight', () => {
    const scostamenti = [...threadPath(600).matchAll(/C([\d.]+),/g)].map((m) => Number(m[1]));
    assert.ok(scostamenti.length > 0);
    assert.ok(scostamenti.every((x) => Math.abs(x - 9) > 1));
  });

  test('keeps one bend per stretch however tall the column is', () => {
    const bende = (h: number) => threadPath(h).split('C').length - 1;
    assert.ok(bende(2400) > bende(600));
    // Even a column shorter than one stretch gets a drawn line, not a stub.
    assert.ok(bende(40) >= 2);
  });
});

describe('threadProgress', () => {
  const alto = 1000;
  test('nothing is drawn before the thread comes into view', () => {
    assert.equal(threadProgress({ top: alto, height: 800, viewport: alto }), 0);
  });

  test('it is fully drawn once the column has passed the reading line', () => {
    assert.equal(threadProgress({ top: -900, height: 800, viewport: alto }), 1);
  });

  test('it grows as the page scrolls', () => {
    const presto = threadProgress({ top: 600, height: 800, viewport: alto });
    const tardi = threadProgress({ top: 200, height: 800, viewport: alto });
    assert.ok(tardi > presto, `${tardi} should exceed ${presto}`);
    assert.ok(presto >= 0 && tardi <= 1);
  });

  test('a column of no height never divides by zero', () => {
    const p = threadProgress({ top: 0, height: 0, viewport: alto });
    assert.ok(Number.isFinite(p));
    assert.equal(p, 1);
  });
});

describe('stopMark', () => {
  test('sits on the line at the height it was given', () => {
    assert.ok(stopMark(240, false).includes('translate(2,233)'));
  });

  test('a stop made here is marked as such, and only that one', () => {
    assert.ok(stopMark(10, true).includes('percorso__nodo--nostra'));
    assert.ok(!stopMark(10, false).includes('--nostra'));
  });

  test('the circle it draws does not close', () => {
    // Same rule as the buttons: the hand stops short of its starting point.
    const d = /d="M([\d.]+),([\d.]+).*?([\d.]+),([\d.]+)"/.exec(stopMark(0, false));
    assert.ok(d);
    assert.notEqual(`${d?.[1]},${d?.[2]}`, `${d?.[3]},${d?.[4]}`);
  });
});

describe('stopClass', () => {
  test('a filled stop means made here, a hollow one means found elsewhere', () => {
    assert.equal(stopClass(true), 'fermata fermata--nostra');
    assert.equal(stopClass(false), 'fermata');
  });
});
