import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { decideGesture } from '../src/components/favorites/decide-gesture.ts';
import { initialGesture } from '../src/components/favorites/initial-gesture.ts';
import { snapDuration } from '../src/components/favorites/snap-duration.ts';
import { resizeTopWindow } from '../src/components/favorites/resize-top-window.ts';
import { moveStartMin } from '../src/components/favorites/move-start-min.ts';
import { blockPx } from '../src/components/favorites/block-px.ts';
import { swipeOffset } from '../src/components/favorites/swipe-offset.ts';
import { isDeleteSwipe } from '../src/components/favorites/is-delete-swipe.ts';
import { reorderIndex } from '../src/components/favorites/reorder-index.ts';
import { dragCommit } from '../src/components/favorites/drag-commit.ts';

const VALUES = { id: 'e1', day: '2026-07-10', index: 2, startMin: 600, durMin: 45 };

describe('initialGesture', () => {
  test('an edge handle resizes from that edge', () => {
    assert.equal(initialGesture('top', false), 'resize-top');
    assert.equal(initialGesture('bottom', false), 'resize-bottom');
    assert.equal(initialGesture('', false), 'resize-bottom');
  });

  test('the grip moves, and a bare press decides nothing yet', () => {
    assert.equal(initialGesture(undefined, true), 'move');
    assert.equal(initialGesture(undefined, false), 'pending');
  });

  test('a handle wins over the grip it sits inside', () => {
    assert.equal(initialGesture('top', true), 'resize-top');
  });
});

describe('decideGesture', () => {
  test('a gesture decided at pointer-down is never re-read', () => {
    assert.equal(decideGesture('move', 200, 0, false), 'move');
    assert.equal(decideGesture('resize-top', 200, 0, true), 'resize-top');
  });

  test('a clear horizontal drag becomes a swipe, on touch as on mouse', () => {
    assert.equal(decideGesture('pending', -20, 3, false), 'swipe');
    assert.equal(decideGesture('pending', 20, 3, true), 'swipe');
  });

  test('a vertical drag moves with a mouse but is left to scroll on touch', () => {
    assert.equal(decideGesture('pending', 0, 20, true), 'move');
    assert.equal(decideGesture('pending', 0, 20, false), 'pending');
  });

  test('travel below the axis threshold decides nothing', () => {
    assert.equal(decideGesture('pending', 6, 0, true), 'pending');
    assert.equal(decideGesture('pending', 0, 6, true), 'pending');
    assert.equal(decideGesture('pending', 7, 0, false), 'swipe');
  });

  test('a diagonal drag follows its dominant axis', () => {
    assert.equal(decideGesture('pending', 30, 40, true), 'move');
    assert.equal(decideGesture('pending', 40, 30, true), 'swipe');
  });
});

describe('snapDuration', () => {
  test('stretches by the pointer travel, snapped to the quarter hour', () => {
    assert.equal(snapDuration(60, 0), 60);
    assert.equal(snapDuration(60, 27), 90); // 27px ≈ 30 min at 0.9 px/min
  });

  test('never shrinks below the minimum block', () => {
    assert.equal(snapDuration(60, -1000), 15);
    assert.equal(snapDuration(15, -20), 15);
  });
});

describe('resizeTopWindow', () => {
  test('moving the top down shortens the block and leaves its end put', () => {
    const next = resizeTopWindow(600, 90, 27);
    assert.deepEqual({ ...next }, { startMin: 630, durMin: 60 });
  });

  test('moving the top up lengthens the block', () => {
    const next = resizeTopWindow(600, 90, -27);
    assert.deepEqual({ ...next }, { startMin: 570, durMin: 120 });
  });

  test('the start cannot pass the minimum-duration limit', () => {
    assert.deepEqual({ ...resizeTopWindow(600, 90, 1000) }, { startMin: 675, durMin: 15 });
  });
});

describe('moveStartMin', () => {
  test('snaps the dragged start to the grid', () => {
    assert.equal(moveStartMin(600, 0), 600);
    assert.equal(moveStartMin(600, 27), 630);
    assert.equal(moveStartMin(600, -27), 570);
  });

  test('never lands before midnight', () => {
    assert.equal(moveStartMin(30, -1000), 0);
  });
});

describe('blockPx', () => {
  test('scales the duration onto the axis', () => {
    assert.equal(blockPx(100), 90);
  });

  test('keeps a floor so the grip and edges stay reachable', () => {
    assert.equal(blockPx(0), 20);
    assert.equal(blockPx(15), 20);
  });
});

describe('swipeOffset', () => {
  test('follows a leftward pull and ignores a rightward one', () => {
    assert.equal(swipeOffset(-40), -40);
    assert.equal(swipeOffset(40), 0);
    assert.equal(swipeOffset(0), 0);
  });
});

describe('isDeleteSwipe', () => {
  test('asks for deletion only past the trigger distance', () => {
    assert.equal(isDeleteSwipe(-91), true);
    assert.equal(isDeleteSwipe(-90), false);
    assert.equal(isDeleteSwipe(0), false);
  });
});

describe('reorderIndex', () => {
  test('counts the neighbours the block has passed', () => {
    assert.equal(reorderIndex([100, 200, 300], 50), 0);
    assert.equal(reorderIndex([100, 200, 300], 250), 2);
    assert.equal(reorderIndex([100, 200, 300], 999), 3);
  });

  test('a lone block always lands first', () => {
    assert.equal(reorderIndex([], 500), 0);
  });
});

describe('dragCommit', () => {
  test('a move commits its new place and start', () => {
    assert.deepEqual(dragCommit('move', VALUES), [
      { kind: 'move', id: 'e1', day: '2026-07-10', index: 2, startMin: 600 },
    ]);
  });

  test('a bottom resize commits only the duration', () => {
    assert.deepEqual(dragCommit('resize-bottom', VALUES), [
      { kind: 'resize', id: 'e1', day: '2026-07-10', durMin: 45 },
    ]);
  });

  test('a top resize commits both ends', () => {
    assert.deepEqual(dragCommit('resize-top', VALUES), [
      { kind: 'resize-top', id: 'e1', day: '2026-07-10', startMin: 600, durMin: 45 },
    ]);
  });

  test('a swipe or an undecided press commits nothing', () => {
    assert.deepEqual(dragCommit('swipe', VALUES), []);
    assert.deepEqual(dragCommit('pending', VALUES), []);
  });
});
