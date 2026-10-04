// What a venue page can say about itself when nothing is on: the dates that
// already happened there. The corpus holds only upcoming events — measured
// 2026-10-04: 1 397 events, none in the past — so this reads the collector's
// archive, which keeps every record that left the feed.
import { describe, expect, test } from 'bun:test';
import { pastAtVenue } from '../src/lib/events/past-at-venue.ts';
import type { ArchivedEvent } from '../src/lib/events/archived-schema.ts';

const TODAY = '2026-10-05';

const archive: readonly ArchivedEvent[] = [
  { id: 'a', t: 'Concerto di settembre', v: 'Palazzo Ducale', s: '2026-09-12', ct: 'genova' },
  { id: 'b', t: 'Mostra estiva', v: 'Palazzo Ducale', s: '2026-07-01', e: '2026-08-31', ct: 'genova' },
  { id: 'c', t: 'Serata di ottobre', v: 'Palazzo Ducale', s: '2026-10-02', ct: 'genova' },
  // Another town's venue of the same name: the archive carries no region, so
  // the town is the only thing that separates them.
  { id: 'd', t: 'Altro Palazzo', v: 'Palazzo Ducale', s: '2026-09-20', ct: 'mantova' },
  { id: 'e', t: 'Altro luogo', v: 'Teatro Carlo Felice', s: '2026-09-20', ct: 'genova' },
  // Still to come: the feed's job, not the archive's.
  { id: 'f', t: 'Domani', v: 'Palazzo Ducale', s: '2026-10-06', ct: 'genova' },
  // A record with no venue at all cannot belong to one.
  { id: 'g', t: 'Senza luogo', s: '2026-09-01', ct: 'genova' },
];

describe('pastAtVenue', () => {
  const found = pastAtVenue(archive, { city: 'genova', slug: 'palazzo-ducale', today: TODAY });

  test('keeps what happened at this venue, in this town', () => {
    expect(found.map((event) => event.id)).toEqual(['c', 'a', 'b']);
  });

  test('newest first, because the last thing that happened is the interesting one', () => {
    expect(found.at(0)?.t).toBe('Serata di ottobre');
  });

  test('a run that is still going today is not past', () => {
    const running = [{ id: 'h', t: 'In corso', v: 'Palazzo Ducale', s: '2026-09-01', e: TODAY, ct: 'genova' }];
    expect(pastAtVenue(running, { city: 'genova', slug: 'palazzo-ducale', today: TODAY })).toHaveLength(0);
  });

  test('and the list is capped, since a page is not a ledger', () => {
    const many = Array.from({ length: 30 }, (_, index) => ({
      id: `m${index}`,
      t: `Evento ${index}`,
      v: 'Palazzo Ducale',
      s: `2026-09-${String((index % 28) + 1).padStart(2, '0')}`,
      ct: 'genova',
    }));
    expect(pastAtVenue(many, { city: 'genova', slug: 'palazzo-ducale', today: TODAY })).toHaveLength(8);
  });

  test('a venue nobody has a record of says nothing rather than something empty', () => {
    expect(pastAtVenue(archive, { city: 'genova', slug: 'teatro-che-non-esiste', today: TODAY })).toEqual([]);
  });
});
