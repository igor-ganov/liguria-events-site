import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { resized } from '../src/lib/img/resized.ts';

describe('resized', () => {
  test('an upload is wrapped for Cloudflare Transformations', () => {
    assert.equal(
      resized('/uploads/ev/a.jpg', 480),
      '/cdn-cgi/image/width=480,format=auto,quality=82/uploads/ev/a.jpg',
    );
  });

  test('the requested width is the one asked for', () => {
    assert.match(resized('/uploads/ev/a.jpg', 96), /width=96,/);
  });

  test('a remote URL passes through untouched', () => {
    const wiki = 'https://commons.wikimedia.org/wiki/Special:FilePath/A.jpg?width=480';
    assert.equal(resized(wiki, 96), wiki);
  });

  test('a path that merely mentions uploads is not wrapped', () => {
    assert.equal(resized('/assets/uploads/a.jpg', 96), '/assets/uploads/a.jpg');
  });
});
