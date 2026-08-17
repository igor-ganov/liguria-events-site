import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { uploadHeaders } from '../src/lib/img/upload-headers.ts';

const stored = (contentType: string) => ({
  httpEtag: '"abc"',
  writeHttpMetadata: (headers: Headers) => headers.set('content-type', contentType),
});

describe('uploadHeaders', () => {
  test("keeps the object's own content metadata", () => {
    assert.equal(uploadHeaders(stored('image/webp')).get('content-type'), 'image/webp');
  });

  test('carries the etag so conditional requests keep working', () => {
    assert.equal(uploadHeaders(stored('image/png')).get('etag'), '"abc"');
  });

  test('caches immutably for a year — the key already carries a random id', () => {
    assert.equal(
      uploadHeaders(stored('image/png')).get('cache-control'),
      'public, max-age=31536000, immutable',
    );
  });
});
