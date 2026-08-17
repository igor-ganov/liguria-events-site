import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { foldChar } from '../src/lib/search/fold-char.ts';
import { foldContribution } from '../src/lib/search/fold-contribution.ts';
import { foldWithMap } from '../src/lib/search/fold.ts';

describe('foldChar', () => {
  test('lower-cases', () => {
    assert.equal(foldChar('A'), 'a');
  });

  test('strips accents', () => {
    assert.equal(foldChar('É'), 'e');
    assert.equal(foldChar('ü'), 'u');
  });

  test('keeps a Cyrillic short i, which NFD would otherwise dismantle', () => {
    assert.equal(foldChar('й'), 'й');
    assert.equal(foldChar('Й'), 'й');
  });

  test('folds yo onto ye, a variant readers substitute freely', () => {
    assert.equal(foldChar('ё'), 'е');
    assert.equal(foldChar('Ё'), 'е');
  });

  test('a bare combining mark folds away entirely', () => {
    assert.equal(foldChar('́'), '');
  });
});

describe('foldContribution', () => {
  test('a letter contributes itself', () => {
    assert.deepEqual(foldContribution('a', undefined), ['a']);
  });

  test('a character that folded away contributes nothing', () => {
    assert.deepEqual(foldContribution('', undefined), []);
  });

  test('a separator becomes one space', () => {
    assert.deepEqual(foldContribution('-', 'a'), [' ']);
  });

  test('a separator after a space is swallowed', () => {
    assert.deepEqual(foldContribution('-', ' '), []);
  });

  test('a multi-character fold contributes each of its characters', () => {
    assert.deepEqual(foldContribution('ab', undefined), ['a', 'b']);
  });
});

describe('foldWithMap', () => {
  test('folds and maps a plain word back to its source', () => {
    const { text, map } = foldWithMap('Café');
    assert.equal(text, 'cafe');
    assert.deepEqual(map, [0, 1, 2, 3]);
  });

  test('collapses a run of separators into a single space', () => {
    assert.equal(foldWithMap('a -- b').text, 'a b');
  });

  test('the map points at the source offset of every folded character', () => {
    const { text, map } = foldWithMap('a--b');
    assert.equal(text, 'a b');
    assert.deepEqual(map, [0, 1, 3]);
  });

  test('a leading separator still emits its space (trimmed by normalize)', () => {
    assert.equal(foldWithMap('  a').text, ' a');
  });

  test('digits survive folding', () => {
    assert.equal(foldWithMap('Via 25 Aprile').text, 'via 25 aprile');
  });

  test('an emoji reads as a separator, not as a word character', () => {
    assert.equal(foldWithMap('a🎉b').text, 'a b');
  });

  test('empty text folds to empty', () => {
    assert.deepEqual(foldWithMap(''), { text: '', map: [] });
  });

  test('every map entry indexes a real source character', () => {
    const raw = 'Genová — Festa 2026!';
    const { text, map } = foldWithMap(raw);
    assert.equal(text.length, map.length);
    assert.ok(map.every((at) => at >= 0 && at < raw.length));
  });
});
