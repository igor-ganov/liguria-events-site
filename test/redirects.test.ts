import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { parseRedirectRules } from '../src/lib/redirects/redirect-rules.ts';
import { splatCount } from '../src/lib/redirects/splat-count.ts';
import { REGION_NAMES } from '../src/lib/region/regions.ts';

const RULES = parseRedirectRules(readFileSync(resolve('public/_redirects'), 'utf8'));
const sourceOf = (source: string) => RULES.find((rule) => rule.source === source);

describe('parseRedirectRules', () => {
  test('skips comments and blank lines', () => {
    assert.deepEqual(parseRedirectRules('# comment\n\n/from /to 301\n'), [
      { source: '/from', destination: '/to', status: 301 },
    ]);
  });
  test("defaults an omitted status to Cloudflare's implicit 302, so the guard below sees it", () => {
    assert.equal(parseRedirectRules('/from /to\n').at(0)?.status, 302);
  });
});

describe('public/_redirects', () => {
  // Cloudflare allows one splat per pattern and silently DROPS a rule that
  // breaks it. A dropped rule is a 404 that nothing reports.
  test('never uses more than one splat per rule', () => {
    for (const rule of RULES) {
      assert.ok(splatCount(rule.source) <= 1, `source: ${rule.source}`);
    }
  });

  // Without :splat the rest of the path is thrown away, and /genova/calendar/
  // lands on the region's feed instead of its calendar.
  test('a source with a splat carries it into the destination, and only then', () => {
    for (const rule of RULES) {
      assert.equal(
        rule.destination.includes(':splat'),
        splatCount(rule.source) === 1,
        `destination: ${rule.destination}`,
      );
    }
  });

  // The city URLs were live long enough for browsers to cache the 301s pointing
  // at them; they have to keep resolving.
  test('the legacy city paths redirect permanently, page and all', () => {
    assert.equal(sourceOf('/genova/*')?.destination, '/liguria/:splat');
    assert.equal(sourceOf('/genova/*')?.status, 301);
    assert.equal(sourceOf('/milano/*')?.destination, '/lombardia/:splat');
    assert.equal(sourceOf('/torino/*')?.destination, '/piemonte/:splat');
    assert.equal(sourceOf('/it/genova/*')?.destination, '/it/liguria/:splat');
  });

  // A 301 is cached by the browser forever. "/" pointing at the default region
  // is exactly the kind of thing that changes — and when it did, every browser
  // that had cached it went on following the old answer to a page that no
  // longer existed.
  test('the default-region redirects are temporary', () => {
    for (const source of ['/', '/calendar', '/map', '/it', '/ru']) {
      assert.equal(sourceOf(source)?.status, 302, `source: ${source}`);
    }
  });

  // A rule whose source also matches a destination is a loop. `/:lang/calendar`
  // would have been one: the first segment of `/liguria/calendar/` is not a
  // language, but the pattern cannot tell.
  test('no rule redirects a region page back into itself', () => {
    const regions = Object.keys(REGION_NAMES);
    for (const rule of RULES) {
      const pattern = new RegExp(`^${rule.source.replace('*', '.*')}$`);
      for (const region of regions) {
        assert.ok(!pattern.test(`/${region}/`), `${rule.source} swallows /${region}/`);
        assert.ok(!pattern.test(`/${region}/map/`), `${rule.source} swallows /${region}/map/`);
      }
    }
  });
});
