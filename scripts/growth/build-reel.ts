/**
 * The weekly vertical video for one city.
 *
 *   bun run scripts/growth/build-reel.ts <city-slug> [outDir]
 *
 * One creative serves three places at once: a YouTube Short, a Reel, and the
 * video asset a YouTube campaign needs. It is made from photographs the corpus
 * already holds, so it costs nothing to produce and can be rebuilt every week.
 *
 * Needs ffmpeg on PATH.
 */
import { Resvg } from '@resvg/resvg-js';
import { Effect } from 'effect';
import { coverSvg } from './reel/cover-svg.ts';
import { dataUri } from './reel/data-uri.ts';
import { busiestCities } from './busiest-cities.ts';
import { pickReelEvents } from './reel/pick-reel-events.ts';
import { slideSvg } from './reel/slide-svg.ts';
import { slideWhen } from './reel/slide-when.ts';
import { cityName } from '../../src/lib/region/city-name.ts';
import { loadEvents } from '../../src/data/load-events.ts';
import { titleOf } from '../../src/lib/events/title-of.ts';
import type { CompactEvent } from '../../src/lib/events/event-schema.ts';

const EVENTS_URL = process.env.EVENTS_URL ?? 'https://liguria-events-bot.igor-ganov.workers.dev/events.json';
const SLIDES = 6;
const SLIDE_SECONDS = 2.6;

// Rome, not UTC: a reel built at half past midnight would otherwise be titled
// with yesterday's week.
const iso = (date: Date): string =>
  date.toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });
const dayMonth = (value: string): string =>
  new Date(`${value}T12:00:00Z`).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });

const png = (svg: string): Uint8Array =>
  new Resvg(svg, { fitTo: { mode: 'width', value: 1080 }, font: { loadSystemFonts: true } })
    .render()
    .asPng();

const run = async (args: readonly string[]): Promise<void> => {
  const proc = Bun.spawn(['ffmpeg', '-y', '-loglevel', 'error', ...args]);
  const code = await proc.exited;
  if (code !== 0) throw new Error(`ffmpeg failed: ${args.join(' ')}`);
};

const slideOf = (from: string) => async (event: CompactEvent): Promise<string | undefined> => {
  const photo = await dataUri(event.img ?? '');
  return photo === undefined
    ? undefined
    : slideSvg({
        title: titleOf('it')(event),
        when: slideWhen(event, from),
        where: event.v ?? cityName(event.ct ?? ''),
        photo,
      });
};

const reelFor = async (
  city: string,
  outDir: string,
  from: string,
  to: string,
  all: readonly CompactEvent[],
): Promise<void> => {
  const events = pickReelEvents(
    all.filter((event) => event.ct === city),
    from,
    to,
    SLIDES,
  );
  if (events.length < 3) {
    console.log(`${city}: ${events.length} events with a photograph this week — not enough for a reel`);
    return;
  }

  const svgs = [
    coverSvg(`Questa settimana a ${cityName(city)}`, `${dayMonth(from)} – ${dayMonth(to)} · ${events.length} eventi`),
    ...(await Promise.all(events.map(slideOf(from)))).filter((svg): svg is string => svg !== undefined),
  ];

  const work = `${outDir}/${city}`;
  await Promise.all(svgs.map((svg, i) => Bun.write(`${work}/frame-${i}.png`, png(svg))));
  // A still frame in a feed reads as a broken video, so each slide gets a slow
  // push in. Encoding per slide and concatenating keeps every clip identical,
  // which is what the concat demuxer needs.
  await Promise.all(
    svgs.map((_, i) =>
      run([
        '-loop', '1', '-i', `${work}/frame-${i}.png`, '-t', String(SLIDE_SECONDS),
        '-vf', `zoompan=z='min(zoom+0.0009,1.10)':d=${Math.round(SLIDE_SECONDS * 30)}:s=1080x1920:fps=30,format=yuv420p`,
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', `${work}/clip-${i}.mp4`,
      ]),
    ),
  );
  await Bun.write(`${work}/list.txt`, svgs.map((_, i) => `file 'clip-${i}.mp4'`).join('\n'));
  // A silent track, because several platforms reject a video without audio.
  await run([
    '-f', 'concat', '-safe', '0', '-i', `${work}/list.txt`,
    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
    '-shortest', '-c:v', 'copy', '-c:a', 'aac', `${outDir}/${city}-week.mp4`,
  ]);
  console.log(`${outDir}/${city}-week.mp4 — ${svgs.length} slides, ${(svgs.length * SLIDE_SECONDS).toFixed(1)}s`);
};

/** `<city-slug>` for one, or `top:N` for the N busiest cities this week. */
const main = async (): Promise<void> => {
  const target = process.argv[2] ?? '';
  const outDir = process.argv[3] ?? 'out/reels';
  if (target === '') throw new Error('usage: build-reel.ts <city-slug|top:N> [outDir]');

  const from = iso(new Date());
  const to = iso(new Date(Date.parse(`${from}T12:00:00Z`) + 6 * 86_400_000));
  const payload = await Effect.runPromise(loadEvents(EVENTS_URL));
  const top = /^top:(\d+)$/.exec(target);
  const cities = top === null ? [target] : busiestCities(payload.events, from, to, Number(top[1]));
  // One at a time: each city runs several ffmpeg encodes of its own, and a CI
  // runner has two cores.
  for (const city of cities) await reelFor(city, outDir, from, to, payload.events);
};

await main();
