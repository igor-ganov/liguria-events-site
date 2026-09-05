// Contrast, checked in milliseconds instead of in a browser.
//
// axe finds these too, but it finds them one page at a time, after a build,
// after a navigation, and it names the element rather than the colour. The
// palette is where the answer actually lives, and it is four numbers — so it
// is checked here, and the browser sweep is left to catch the cases a token
// cannot know about.
//
// The thresholds are WCAG 2.2 AA: 4.5:1 for body text, 3:1 for large text and
// for the boundary of a control somebody has to find.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { contrastRatio } from '../src/lib/a11y/contrast-ratio.ts';
import { paletteOf } from '../src/lib/a11y/palette-of.ts';
import { readFileSync } from 'node:fs';

const css = readFileSync('src/styles/filo-tokens.css', 'utf8');
const light = paletteOf(css, ':root');
const dark = paletteOf(css, ":root[data-theme='dark']");

const BODY = 4.5;
const LARGE = 3;

describe('contrastRatio', () => {
  test('agrees with the two ratios everybody knows', () => {
    assert.equal(Math.round(contrastRatio('#000000', '#ffffff')), 21);
    assert.equal(Math.round(contrastRatio('#ffffff', '#ffffff')), 1);
  });

  test('does not care which colour is named first', () => {
    assert.equal(
      contrastRatio('#767b84', '#fbfaf7').toFixed(4),
      contrastRatio('#fbfaf7', '#767b84').toFixed(4),
    );
  });
});

for (const [name, palette] of [
  ['the light palette', light],
  ['the dark palette', dark],
] as const) {
  describe(name, () => {
    test('has every colour the tests below name', () => {
      ['carta', 'superficie', 'alzata', 'testo', 'tenue', 'filo', 'sosta', 'gratis', 'allarme'].forEach((token) => {
        assert.ok(palette[token], `--${token} is missing`);
      });
    });

    test('body text is readable on every surface', () => {
      ['carta', 'superficie', 'alzata'].forEach((ground) => {
        const ratio = contrastRatio(palette['testo'] ?? '', palette[ground] ?? '');
        assert.ok(ratio >= BODY, `--testo on --${ground} is ${ratio.toFixed(2)}:1`);
      });
    });

    test('secondary text is readable too — it is text, not decoration', () => {
      // --tenue carries dates, venues, distances and the empty-state line.
      // Somebody has to read all of it.
      ['carta', 'superficie', 'alzata'].forEach((ground) => {
        const ratio = contrastRatio(palette['tenue'] ?? '', palette[ground] ?? '');
        assert.ok(ratio >= BODY, `--tenue on --${ground} is ${ratio.toFixed(2)}:1`);
      });
    });

    test('a link and the states that mean something are readable as text', () => {
      // Body text, not large: these colours carry badges and labels at 0.8rem.
      ['filo', 'sosta', 'gratis', 'allarme'].forEach((token) => {
        ['carta', 'superficie'].forEach((ground) => {
          const ratio = contrastRatio(palette[token] ?? '', palette[ground] ?? '');
          assert.ok(ratio >= BODY, `--${token} on --${ground} is ${ratio.toFixed(2)}:1`);
        });
      });
    });

    test('a state colour reads on its own veil, which is where badges sit', () => {
      [
        ['sosta', 'sosta-velo'],
        ['gratis', 'gratis-velo'],
        ['filo', 'filo-velo'],
      ].forEach(([token, veil]) => {
        const ratio = contrastRatio(palette[token ?? ''] ?? '', palette[veil ?? ''] ?? '');
        assert.ok(ratio >= BODY, `--${token} on --${veil} is ${ratio.toFixed(2)}:1`);
      });
    });

    test('and reads the other way round, where the colour is the fill', () => {
      // A pin or a badge filled with the colour and captioned on top. The ink
      // is --su-filo, not white: on the dark theme the fills are light and the
      // caption has to be dark, which is the whole reason that token exists.
      ['sosta', 'gratis', 'filo'].forEach((token) => {
        const ratio = contrastRatio(palette['su-filo'] ?? '', palette[token] ?? '');
        assert.ok(ratio >= LARGE, `--su-filo on --${token} is ${ratio.toFixed(2)}:1`);
      });
    });

    test('the primary action reads against its own fill', () => {
      const ratio = contrastRatio(palette['su-filo'] ?? '', palette['filo'] ?? '');
      assert.ok(ratio >= BODY, `--su-filo on --filo is ${ratio.toFixed(2)}:1`);
    });
  });
}
