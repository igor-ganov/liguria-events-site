// A venue puts one line on its own site and gets its programme back. The point
// is not the widget: it is that a theatre's site then links to ours, which is
// the authority the long tail needs and the one thing a sitemap cannot buy.
import { describe, expect, test } from 'bun:test';
import { embedRows } from '../src/lib/embed/embed-rows.ts';
import { embedSnippet } from '../src/lib/embed/embed-snippet.ts';
import { embedTarget } from '../src/lib/embed/embed-target.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

// A real id, because the address is built from it and a title with spaces in it
// would be percent-encoded into something no venue would paste.
const event = (over: Partial<CompactEvent> & Pick<CompactEvent, 't' | 's'>): CompactEvent => ({
  id: 'a1b2c3d4e5f6',
  c: ['music'],
  u: 'https://source/1',
  v: 'Teatro Carlo Felice',
  ct: 'genova',
  rg: 'liguria',
  ...over,
});

const SITE = new URL('https://dovego.it');

describe('embedTarget', () => {
  test('reads the venue a host page asked for', () => {
    expect(embedTarget('liguria/genova/teatro-carlo-felice')).toEqual({
      region: 'liguria',
      city: 'genova',
      slug: 'teatro-carlo-felice',
    });
  });

  test('tolerates the slashes a person leaves', () => {
    expect(embedTarget('/liguria/genova/teatro-carlo-felice/')?.slug).toBe('teatro-carlo-felice');
  });

  test('and refuses anything that is not one', () => {
    expect(embedTarget('liguria/genova')).toBeUndefined();
    expect(embedTarget('')).toBeUndefined();
    expect(embedTarget('../../etc/passwd')).toBeUndefined();
    expect(embedTarget('liguria/genova/teatro/extra')).toBeUndefined();
  });
});

describe('embedRows', () => {
  const events = [
    event({ t: 'Concerto di Natale', s: '2026-12-24' }),
    event({ t: 'Sagra passata', s: '2026-09-01' }),
    event({ t: 'Prima della Scala', s: '2026-10-10', h: '20:30' }),
    event({ t: 'Altrove', s: '2026-10-11', v: 'Teatro Altro' }),
  ];
  const rows = embedRows(events, { region: 'liguria', city: 'genova', slug: 'teatro-carlo-felice' }, '2026-10-04', SITE);

  test('this venue, still to come, soonest first', () => {
    expect(rows.map((row) => row.title)).toEqual(['Prima della Scala', 'Concerto di Natale']);
  });

  test('each row links to the event on our site, absolutely', () => {
    expect(rows[0]?.href).toBe(
      'https://dovego.it/it/event/prima-della-scala-teatro-carlo-felice-2026-10-10-a1b2c3d4e5f6/',
    );
  });

  test('and says when, the way an Italian reads it', () => {
    expect(rows[0]?.when).toContain('10 ottobre');
    expect(rows[0]?.when).toContain('20:30');
  });

  test('a venue with nothing on gives no rows rather than an error', () => {
    expect(embedRows(events, { region: 'liguria', city: 'genova', slug: 'nessuno' }, '2026-10-04', SITE)).toEqual([]);
  });
});

describe('embedSnippet', () => {
  const snippet = embedSnippet('liguria/genova/teatro-carlo-felice', SITE);

  test('the script a venue pastes names its own venue and our origin', () => {
    expect(snippet.script).toContain('https://dovego.it/embed.js');
    expect(snippet.script).toContain('data-venue="liguria/genova/teatro-carlo-felice"');
  });

  // An iframe is a frame, not a link: the plain snippet is the one that carries
  // authority back to us, so it is offered beside the script rather than hidden.
  test('and the plain one is a real link, for the sites that prefer HTML', () => {
    expect(snippet.plain).toContain('<a href="https://dovego.it/it/liguria/genova/teatro-carlo-felice/"');
    expect(snippet.plain).not.toContain('<script');
  });
});
