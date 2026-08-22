import { afterEach, describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { archivedEvent } from '../src/lib/events/archived-event.ts';

const EVENTS_URL = 'https://collector.example/events.json';
const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

const answering = (handler: (url: string) => Response | Promise<Response>): void => {
  globalThis.fetch = ((input: RequestInfo | URL) =>
    Promise.resolve(handler(String(input)))) as typeof fetch;
};

const stored = {
  id: 'abc123def456',
  t: 'Concerto',
  s: '2020-08-05',
  c: ['music'],
  u: 'https://source/1',
};

describe('archivedEvent', () => {
  test('asks the collector for the one event, beside its events.json', async () => {
    const seen: string[] = [];
    answering((url) => {
      seen.push(url);
      return Response.json(stored);
    });
    const found = await archivedEvent(EVENTS_URL, 'abc123def456');
    assert.deepEqual(seen, ['https://collector.example/event/abc123def456']);
    assert.equal(found?.id, 'abc123def456');
    assert.equal(found?.s, '2020-08-05');
  });

  test('an id the archive does not know is nothing, not an error', async () => {
    answering(() => Response.json({ error: 'not_found' }, { status: 404 }));
    assert.equal(await archivedEvent(EVENTS_URL, 'ghost'), undefined);
  });

  test('an archive outage is nothing either — one page 404s, none of them 500', async () => {
    answering(() => {
      throw new Error('network down');
    });
    assert.equal(await archivedEvent(EVENTS_URL, 'abc123def456'), undefined);
  });

  test('an answer that is not an event is rejected rather than half-rendered', async () => {
    answering(() => Response.json({ nonsense: true }));
    assert.equal(await archivedEvent(EVENTS_URL, 'abc123def456'), undefined);
  });
});
