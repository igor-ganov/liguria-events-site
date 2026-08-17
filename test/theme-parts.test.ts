// Pure decisions behind the theme toggle: the cycle, the resolved scheme, the
// label lookup and the reveal radius.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { nextThemePref } from '../src/lib/theme/next-theme-pref.ts';
import { resolveTheme } from '../src/lib/theme/resolve-theme.ts';
import { themeNameKey } from '../src/lib/theme/theme-name-key.ts';
import { revealRadius } from '../src/lib/theme/reveal-radius.ts';

describe('nextThemePref', () => {
  test('cycles light → dark → system → light', () => {
    assert.equal(nextThemePref('light'), 'dark');
    assert.equal(nextThemePref('dark'), 'system');
    assert.equal(nextThemePref('system'), 'light');
  });
  test('an unrecognised stored value restarts the cycle', () => {
    assert.equal(nextThemePref('sepia'), 'light');
    assert.equal(nextThemePref(''), 'light');
  });
});

describe('resolveTheme', () => {
  test('an explicit choice is taken at face value', () => {
    assert.equal(resolveTheme('light', true), 'light');
    assert.equal(resolveTheme('dark', false), 'dark');
  });
  test('system follows the OS', () => {
    assert.equal(resolveTheme('system', true), 'dark');
    assert.equal(resolveTheme('system', false), 'light');
  });
});

describe('themeNameKey', () => {
  test('names the data-name-* attribute of the current mode', () => {
    assert.equal(themeNameKey('light'), 'nameLight');
    assert.equal(themeNameKey('dark'), 'nameDark');
    assert.equal(themeNameKey('system'), 'nameSystem');
  });
  test('an unknown mode reads as system', () => {
    assert.equal(themeNameKey('sepia'), 'nameSystem');
  });
});

describe('revealRadius', () => {
  test('reaches the farthest corner from the tap', () => {
    assert.equal(revealRadius(0, 0, 3, 4), 5);
    assert.equal(revealRadius(3, 4, 3, 4), 5);
  });
  test('a tap in the middle still covers the whole viewport', () => {
    assert.equal(revealRadius(50, 50, 100, 100), Math.hypot(50, 50));
  });
});
