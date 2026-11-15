// The loading tips: which one is shown, in what order, and when a load has
// lasted long enough to show one at all.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { decodeTips } from '../src/lib/loading/decode-tips.ts';
import { nextTip } from '../src/lib/loading/next-tip.ts';
import { pressedTarget } from '../src/lib/loading/pressed-target.ts';
import { PRESS_WINDOW_MS } from '../src/lib/loading/press-window-ms.ts';
import { startCursor } from '../src/lib/loading/start-cursor.ts';
import { tipDue } from '../src/lib/loading/tip-due.ts';
import { tipsUrl } from '../src/lib/loading/tips-url.ts';
import { TIP_THRESHOLD_MS } from '../src/lib/loading/tip-threshold-ms.ts';
import type { Tip } from '../src/lib/loading/tip.ts';

const TIPS: readonly Tip[] = [
  { kind: 'place', text: 'a' },
  { kind: 'event', text: 'b' },
  { kind: 'site', text: 'c' },
];

describe('nextTip', () => {
  test('hands out the tip under the cursor and moves the cursor on', () => {
    assert.deepEqual(nextTip(TIPS, 1), { tip: TIPS[1], cursor: 2 });
  });

  test('wraps round, so a long session cycles through every tip', () => {
    const seen = [0, 1, 2, 3, 4].map((cursor) => nextTip(TIPS, cursor).tip?.text);
    assert.deepEqual(seen, ['a', 'b', 'c', 'a', 'b']);
  });

  test('has nothing to hand out while no tips are in hand', () => {
    assert.deepEqual(nextTip([], 3), { tip: undefined, cursor: 3 });
  });
});

describe('startCursor', () => {
  test('starts somewhere inside the list, so two sessions open on different tips', () => {
    assert.equal(startCursor(() => 0, 5), 0);
    assert.equal(startCursor(() => 0.999, 5), 4);
    assert.equal(startCursor(() => 0.5, 0), 0);
  });
});

describe('tipDue', () => {
  test('a fast load shows no tip; one past the threshold does', () => {
    assert.equal(tipDue(TIP_THRESHOLD_MS)(TIP_THRESHOLD_MS - 1), false);
    assert.equal(tipDue(TIP_THRESHOLD_MS)(TIP_THRESHOLD_MS), true);
  });

  test('the threshold is short: under a second', () => {
    assert.ok(TIP_THRESHOLD_MS > 0 && TIP_THRESHOLD_MS < 1000);
  });
});

describe('tips file', () => {
  test('one small file per language', () => {
    assert.equal(tipsUrl('it'), '/tips/it.json');
  });

  test('a malformed file yields no tips rather than an exception', () => {
    assert.deepEqual(decodeTips({ tips: [{ kind: 'weird', text: 1 }] }), []);
    assert.deepEqual(decodeTips('nope'), []);
    assert.deepEqual(decodeTips({ tips: [{ kind: 'site', text: 'ok' }] }), [{ kind: 'site', text: 'ok' }]);
  });
});

describe('the shipped tips', () => {
  const read = async (lang: string): Promise<{ size: number; tips: readonly Tip[] }> => {
    const text = await Bun.file(`public${tipsUrl(lang)}`).text();
    return { size: Buffer.byteLength(text), tips: decodeTips(JSON.parse(text)) };
  };

  test('every language has the same tips, each file under 8 KB', async () => {
    const all = await Promise.all(['en', 'it', 'ru'].map(read));
    const kinds = all.map((file) => file.tips.map((tip) => tip.kind).join());
    assert.ok((all[0]?.tips.length ?? 0) >= 12);
    assert.deepEqual(new Set(kinds).size, 1);
    all.forEach((file) => assert.ok(file.size < 8192, `${file.size} bytes`));
  });
});

describe('pressedTarget', () => {
  const within = pressedTarget(PRESS_WINDOW_MS);

  test('a load that starts right after a press belongs to the control pressed', () => {
    assert.equal(within({ target: 'chip', at: 1000 }, 1000 + PRESS_WINDOW_MS), 'chip');
  });

  test('a load long after the last press, or with no press at all, belongs to none', () => {
    assert.equal(within({ target: 'chip', at: 1000 }, 1001 + PRESS_WINDOW_MS), undefined);
    assert.equal(within(undefined, 5), undefined);
  });
});
