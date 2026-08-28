import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { isDetailPath } from '../src/components/analytics/is-detail-path.ts';

describe('isDetailPath', () => {
  test('a bare event page is a detail view', () => {
    assert.equal(isDetailPath('/event/abc123'), true);
  });
  test('a localized event page is a detail view', () => {
    assert.equal(isDetailPath('/it/event/abc123'), true);
  });
  test('the edit page is not a detail view', () => {
    assert.equal(isDetailPath('/event/abc123/edit'), false);
  });
  test('a region feed is not a detail view', () => {
    assert.equal(isDetailPath('/liguria/'), false);
  });
  test('an "eventi" city segment does not match', () => {
    assert.equal(isDetailPath('/liguria/eventi'), false);
  });
});
