// The judging half of the e2e kit.
//
// Every audit is split in two: a probe that collects plain numbers from the
// page, and a pure function that decides whether those numbers are a fault.
// The split is what makes the rules arguable here, in milliseconds, instead of
// by reading a screenshot — and it is why a rule can be tightened without
// running a browser to find out what it now rejects.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { budgetFaults } from '../e2e/kit/audit/budget-faults.ts';
import { missingLandmarks } from '../e2e/kit/audit/missing-landmarks.ts';
import { overflowFaults } from '../e2e/kit/audit/overflow-faults.ts';
import { tapTargetFaults } from '../e2e/kit/audit/tap-target-faults.ts';
import type { Box } from '../e2e/kit/audit/box.ts';

const box = (over: Partial<Box>): Box => ({
  label: 'div.thing',
  left: 0,
  right: 100,
  top: 0,
  bottom: 40,
  width: 100,
  height: 40,
  scrollable: false,
  inline: false,
  ...over,
});

describe('overflowFaults', () => {
  test('an element reaching past the viewport is a fault, named', () => {
    const faults = overflowFaults(390, [box({ label: 'h1.title', right: 460 })]);
    assert.equal(faults.length, 1);
    assert.match(faults[0] ?? '', /h1\.title/);
    assert.match(faults[0] ?? '', /460/);
  });

  test('a pixel over is rounding, not a broken layout', () => {
    // Sub-pixel geometry routinely lands a hair past the edge; failing on it
    // would make every spec a coin toss on a different DPI.
    assert.deepEqual(overflowFaults(390, [box({ right: 390.6 })]), []);
  });

  test('content inside something meant to scroll sideways is not a fault', () => {
    // A wide table in its own overflow-x container is the correct answer to
    // wide content, not a symptom.
    assert.deepEqual(overflowFaults(390, [box({ right: 900, scrollable: true })]), []);
  });

  test('content a clipping ancestor holds in is not a fault either', () => {
    // A map marker past the right edge of a map with overflow:hidden cannot
    // make the page scroll. The probe reports both cases as `scrollable`.
    assert.deepEqual(overflowFaults(320, [box({ label: 'div.ev-marker', right: 325, scrollable: true })]), []);
  });

  test('an element off the left edge is a fault too', () => {
    const faults = overflowFaults(390, [box({ label: 'nav', left: -40, right: 200 })]);
    assert.equal(faults.length, 1);
    assert.match(faults[0] ?? '', /nav/);
  });

  test('a hidden element has no geometry and cannot overflow', () => {
    assert.deepEqual(overflowFaults(390, [box({ width: 0, height: 0, right: 4000 })]), []);
  });
});

describe('tapTargetFaults', () => {
  test('a control smaller than the minimum is a fault', () => {
    const faults = tapTargetFaults(24, [box({ label: 'button.close', width: 18, height: 18 })]);
    assert.equal(faults.length, 1);
    assert.match(faults[0] ?? '', /button\.close/);
    assert.match(faults[0] ?? '', /18/);
  });

  test('exactly the minimum passes — the rule is "at least"', () => {
    assert.deepEqual(tapTargetFaults(24, [box({ width: 24, height: 24 })]), []);
  });

  test('a control judged and a control reported are the same number', () => {
    // Real geometry arrives as 23.99. Failing that while printing "24" is a
    // report nobody can act on, and it is how a whole navigation bar became a
    // failure on two form factors and not on the other two.
    assert.deepEqual(tapTargetFaults(24, [box({ width: 60, height: 23.6 })]), []);
    assert.equal(tapTargetFaults(24, [box({ width: 60, height: 23.4 })]).length, 1);
  });

  test('a link inside a sentence is exempt, as the guideline says', () => {
    // WCAG 2.2 exempts targets in a line of text: making them 24px tall would
    // wreck the paragraph it sits in.
    assert.deepEqual(tapTargetFaults(24, [box({ label: 'a', width: 60, height: 19, inline: true })]), []);
  });

  test('a control that is not rendered is not a target', () => {
    assert.deepEqual(tapTargetFaults(24, [box({ width: 0, height: 0 })]), []);
  });
});

describe('missingLandmarks', () => {
  test('names what a page lost, so a vanished header cannot pass quietly', () => {
    const faults = missingLandmarks(['header', 'main', 'footer'], ['header', 'main']);
    assert.deepEqual(faults, ['footer']);
  });

  test('everything present is silence', () => {
    assert.deepEqual(missingLandmarks(['main'], ['header', 'main', 'footer']), []);
  });
});

describe('budgetFaults', () => {
  const budget = { cls: 0.1, lcpMs: 2500, biggestJsKb: 250 };

  test('a metric over budget is reported with both numbers', () => {
    const faults = budgetFaults(budget, { cls: 0.42, lcpMs: 1200, biggestJsKb: 90 });
    assert.equal(faults.length, 1);
    assert.match(faults[0] ?? '', /cls/);
    assert.match(faults[0] ?? '', /0\.42/);
    assert.match(faults[0] ?? '', /0\.1/);
  });

  test('every metric over budget is reported, not just the first', () => {
    assert.equal(budgetFaults(budget, { cls: 1, lcpMs: 9000, biggestJsKb: 900 }).length, 3);
  });

  test('a metric the page could not measure is not a pass', () => {
    // LCP is absent on a page that never painted anything worth measuring.
    // Reading that as "under budget" is how a broken page scores well.
    const faults = budgetFaults(budget, { cls: 0, lcpMs: undefined, biggestJsKb: 10 });
    assert.equal(faults.length, 1);
    assert.match(faults[0] ?? '', /lcpMs/);
    assert.match(faults[0] ?? '', /not measured/);
  });

  test('a metric the budget does not name is not judged', () => {
    // Layout shift under artificial throttling is a property of the page; the
    // largest paint in the same run is mostly a measurement of how busy the
    // machine is. A spec has to be able to assert the first without the second.
    assert.deepEqual(budgetFaults({ cls: 0.1 }, { cls: 0.05, lcpMs: 99_999, biggestJsKb: 9_999 }), []);
    assert.equal(budgetFaults({ cls: 0.1 }, { cls: 0.9, lcpMs: undefined, biggestJsKb: undefined }).length, 1);
  });

  test('inside budget is silence', () => {
    assert.deepEqual(budgetFaults(budget, { cls: 0.01, lcpMs: 900, biggestJsKb: 200 }), []);
  });
});
