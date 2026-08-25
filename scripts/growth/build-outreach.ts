/**
 * Who to write to about a link, and what to say.
 *
 *   bun run scripts/growth/build-outreach.ts [outDir]     # default: out/outreach
 *
 * Writes `targets.csv` — the list, ranked by what we already hold for each one
 * — and `letters.md`, one ready-to-send letter per target.
 *
 * Contacts are NOT collected here, on purpose. Scraping addresses and mailing
 * them in bulk is spam under Italian and EU rules, and a hundred identical
 * link requests is the link scheme Google penalises. A venue's own site is
 * filled in only when the match is beyond doubt; everything else carries a
 * search link, and looking the address up by hand is the friction that keeps
 * the volume where it belongs.
 */
import { Effect } from 'effect';
import { loadEvents } from '../../src/data/load-events.ts';
import { isUpcoming } from '../../src/lib/events/is-upcoming.ts';
import { outreachLetter } from './outreach-letter.ts';
import { matchVenueSite } from './match-venue-site.ts';
import { outreachTargets } from './outreach-targets.ts';
import { toCsv } from './to-csv.ts';

const EVENTS_URL =
  process.env.EVENTS_URL ?? 'https://liguria-events-bot.igor-ganov.workers.dev/events.json';

const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });

const CACHE = 'scripts/.cache/overture-liguria.ndjson';

const cachedPlaces = async (): Promise<readonly { name: string; website?: string; lat: number; lng: number }[]> => {
  const file = Bun.file(CACHE);
  if (!(await file.exists())) return [];
  return (await file.text())
    .split('\n')
    .filter((line) => line !== '')
    .map((line): unknown => JSON.parse(line))
    .filter((row): row is { name: string; website?: string; lat: number; lng: number } => {
      const place = row as { name?: unknown; lat?: unknown; lng?: unknown };
      return typeof place.name === 'string' && typeof place.lat === 'number' && typeof place.lng === 'number';
    });
};

const main = async (): Promise<void> => {
  const outDir = process.argv[2] ?? 'out/outreach';
  const payload = await Effect.runPromise(loadEvents(EVENTS_URL));
  const events = payload.events.filter(isUpcoming(today));
  const targets = outreachTargets(events);
  // Overture's cache carries websites; the shipped shards drop them for size.
  // Only Liguria is cached locally, so the rest is looked up by hand.
  const places = await cachedPlaces();
  const sites = new Map(
    targets
      .filter((target) => target.kind === 'venue')
      .map((target): readonly [string, string | undefined] => {
        const at = events.find((event) => event.v === target.name && event.g !== undefined)?.g;
        return [
          target.name,
          at === undefined ? undefined : matchVenueSite({ name: target.name, lat: at[0], lng: at[1] }, places),
        ];
      }),
  );

  await Bun.write(
    `${outDir}/targets.csv`,
    toCsv([
      ['Kind', 'Name', 'City', 'Events we hold', 'Their page on dovego.it', 'Their site', 'Find the address'],
      ...targets.map((t) => [
        t.kind,
        t.name,
        t.city,
        String(t.events),
        t.page,
        sites.get(t.name) ?? '',
        t.findContact,
      ]),
    ]),
  );

  await Bun.write(
    `${outDir}/letters.md`,
    [
      `# Outreach letters — ${today}`,
      '',
      'One per target, in Italian, ready to paste. Send them by hand, a few a',
      'day, and change a line in each: a letter that is obviously one of a',
      'hundred reads like one of a hundred.',
      '',
      ...targets.flatMap((t) => [`## ${t.name} — ${t.city} (${t.events})`, '', '```', outreachLetter(t), '```', '']),
    ].join('\n'),
  );

  const venues = targets.filter((t) => t.kind === 'venue').length;
  console.log(`${targets.length} targets (${venues} venues, ${targets.length - venues} comuni) → ${outDir}`);
};

await main();
