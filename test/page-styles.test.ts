// A page carries the styles it can be shown to use, not the styles of the
// whole site. What a page uses is read off its own imports: a rule stays when a
// class it styles is written somewhere the page reaches, and when nobody can
// say where its classes come from it stays everywhere.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { cssBlocks } from '../scripts/lib/page-styles/css-blocks.ts';
import { importsOf } from '../scripts/lib/page-styles/imports-of.ts';
import { pageCss } from '../scripts/lib/page-styles/page-css.ts';
import { pageSheetName } from '../scripts/lib/page-styles/page-sheet-name.ts';
import { pagesWithLayout } from '../scripts/lib/page-styles/pages-with-layout.ts';
import { SHEETS } from '../scripts/lib/page-styles/sheets.ts';
import { leadsTo, sourceFiles } from '../scripts/lib/page-styles/source-files.ts';
import { styledClasses } from '../scripts/lib/page-styles/styled-classes.ts';

describe('cssBlocks', () => {
  test('cuts a sheet into its top-level rules, each with the comment over it', () => {
    const css = '/* one */\n.a { color: red; }\n@media (min-width: 1px) {\n  .b { top: 0; }\n}\n.c{}';
    assert.deepEqual(cssBlocks(css), ['/* one */\n.a { color: red; }', '\n@media (min-width: 1px) {\n  .b { top: 0; }\n}', '\n.c{}']);
  });
  test('a brace inside a comment opens nothing', () => {
    assert.equal(cssBlocks('/* { */ .a { top: 0; }').length, 1);
  });
  test('what follows the last rule is kept with it, so nothing is lost', () => {
    const css = '.a{}\n/* the end */\n';
    assert.equal(cssBlocks(css).join(''), css);
  });
});

describe('styledClasses', () => {
  test('names every class a rule selects by', () => {
    assert.deepEqual(styledClasses('.card:hover > .title, a.link { color: red; }'), ['card', 'title', 'link']);
  });
  test('reads the rules inside a media query', () => {
    assert.deepEqual(styledClasses('@media (min-width: 44rem) { .wide { top: 0; } .side { top: 0; } }'), ['wide', 'side']);
  });
  test('a decimal in a value or a class in a comment is not a class', () => {
    assert.deepEqual(styledClasses('/* .ghost */ .real { margin: 0.5rem; background: url(a.png); }'), ['real']);
  });
  test('a rule on elements alone names none', () => {
    assert.deepEqual(styledClasses('body, main > p { margin: 0; }'), []);
  });
});

describe('importsOf', () => {
  test('finds what a file imports, however it says so', () => {
    const text = "import a from './a.ts';\nimport type { B } from '../b.ts';\nimport './side.css';\nexport { c } from './c.ts';\nconst d = await import('./d.ts');";
    assert.deepEqual(importsOf(text), ['./a.ts', '../b.ts', './side.css', './c.ts', './d.ts']);
  });
});

describe('pageCss', () => {
  const sheets = ['.shared { top: 0; }\n.feed-card { top: 0; }\n.map-pin { top: 0; }\n.drawn-by-a-library { top: 0; }\nbody { margin: 0; }'];
  const files = new Map([
    ['/src/pages/feed.astro', "import '../Layout.astro';\nimport './card.ts';\n<p class=\"shared\">"],
    ['/src/pages/card.ts', "export const card = '<a class=\"feed-card shared\">';"],
    ['/src/pages/map.astro', "import '../Layout.astro';\n<i class=\"map-pin shared\">"],
    ['/src/Layout.astro', '<body>'],
  ]);
  const css = pageCss({ sheets, files, resolve: (from, spec) => `${from.slice(0, from.lastIndexOf('/'))}/${spec}`.replace('/pages/../', '/').replace('/./', '/') });

  test('a rule stays on the page that reaches a file naming its class', () => {
    assert.ok(css('/src/pages/feed.astro').includes('.feed-card'));
    assert.ok(css('/src/pages/map.astro').includes('.map-pin'));
  });
  test('and is left off the page that does not', () => {
    assert.equal(css('/src/pages/feed.astro').includes('.map-pin'), false);
    assert.equal(css('/src/pages/map.astro').includes('.feed-card'), false);
  });
  test('a class nobody writes in the source, and a rule with no class, stay everywhere', () => {
    ['/src/pages/feed.astro', '/src/pages/map.astro'].forEach((page) => {
      assert.ok(css(page).includes('.drawn-by-a-library'));
      assert.ok(css(page).includes('body {'));
    });
  });
  // A rule is judged selector by selector, and a media query rule by rule: a
  // token set on the root beside a class the page lacks is still the page's.
  const mixed = pageCss({
    sheets: [
      [
        ':root, .map-pin { --ink: black; }',
        '@media (min-width: 44rem) {',
        '  :root { --pad: 2rem; }',
        '  .map-pin { top: 0; }',
        '  .feed-card { left: 0; }',
        '}',
        '@media print { .map-pin { display: none; } }',
        '@keyframes spin { to { rotate: 1turn; } }',
      ].join('\n'),
    ],
    files,
    resolve: (from, spec) => `${from.slice(0, from.lastIndexOf('/'))}/${spec}`.replace('/pages/../', '/').replace('/./', '/'),
  })('/src/pages/feed.astro');

  test('a selector with no class keeps its rule, whatever stands beside it', () => {
    assert.ok(mixed.includes(':root, .map-pin { --ink: black; }'));
  });
  test('a media query keeps the rules inside it that concern the page, and only those', () => {
    assert.ok(mixed.includes(':root { --pad: 2rem; }'));
    assert.ok(mixed.includes('.feed-card { left: 0; }'));
    assert.equal(mixed.includes('.map-pin { top: 0; }'), false);
    assert.ok(mixed.includes('@media (min-width: 44rem) {'));
  });
  test('a media query left with nothing inside is not written at all', () => {
    assert.equal(mixed.includes('@media print'), false);
  });
  test('an animation is kept whole', () => {
    assert.ok(mixed.includes('@keyframes spin { to { rotate: 1turn; } }'));
  });

  test('the rules that stay keep the order they were written in', () => {
    const kept = css('/src/pages/feed.astro');
    assert.ok(kept.indexOf('.shared') < kept.indexOf('.feed-card'));
    assert.ok(kept.indexOf('.feed-card') < kept.indexOf('.drawn-by-a-library'));
  });
});

// The arrangement only holds while every page keeps to it: a page that forgets
// its sheet is shown unstyled, and a sheet imported anywhere shared puts the
// styles of the whole site back on every page.
describe('the pages of the site', () => {
  const root = resolve(import.meta.dirname, '..');
  const files = sourceFiles(root);
  const pages = pagesWithLayout(files, leadsTo(files));
  const sheetImports = (text: string): readonly string[] => importsOf(text).filter((spec) => spec.endsWith('.css') && spec.includes('styles/'));

  test('there are pages to speak of', () => {
    // Fewer than there were, and that is the point: English used to be a second
    // copy of the route tree at the root — twenty files saying what [lang]/
    // already said. It has a prefix like the other two languages now, so one
    // set of routes serves all three.
    assert.ok(pages.length > 30);
  });
  test('each one imports its own stylesheet, and no other', () => {
    const wrong = pages.filter((page) => {
      const found = sheetImports(files.get(page) ?? '').map((spec) => spec.slice(spec.lastIndexOf('/') + 1));
      return found.length !== 1 || found[0] !== pageSheetName(page);
    });
    assert.deepEqual(wrong, []);
  });
  test('nothing a page shares with another imports one of the site sheets', () => {
    const shared = [...files].filter(([path]) => !path.startsWith('src/pages/'));
    const importing = shared.filter(([, text]) => sheetImports(text).some((spec) => SHEETS.some((name) => spec.endsWith(`/${name}`)) || spec.includes('styles/pages/')));
    assert.deepEqual(importing.map(([path]) => path), []);
  });
});
