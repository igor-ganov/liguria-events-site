// The picture every archived event page wears instead of a photograph of a
// night that is over. One drawing, one file, shipped with the site.
//
// Run: bun run scripts/build-archive-cover.ts (wired into `bun run build`).
//
// Wordless on purpose: the same file is served to a reader in three languages,
// and a caption in one of them would be wrong on two pages out of three. The
// page says it in words; this says it at a glance.
import { Resvg } from '@resvg/resvg-js';
import { mkdir, writeFile } from 'node:fs/promises';

const PIN = 'M16 1.6C8.6 1.6 2.6 7.5 2.6 14.9 2.6 24.4 16 38.4 16 38.4S29.4 24.4 29.4 14.9C29.4 7.5 23.4 1.6 16 1.6Z';
const WAVE = 'M8.2 16.4C10.7 12.7 13.6 12.7 16 16.4 18.4 20.1 21.3 20.1 23.8 16.4';
const CREAM = '#fbfaf7';
const INK = '#16181c';
const TERRACOTTA = '#9c5a32';

// The open-graph rectangle, which is also what the page shows at the top.
const WIDTH = 1200;
const HEIGHT = 630;

/** A clock reading twenty past four, drawn large and quiet: an hour that has
 *  gone. The hub is a solid dot so the hands read as hands and not as a crack. */
const clock = (cx: number, cy: number, r: number): string => `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${TERRACOTTA}" stroke-width="${r * 0.075}"/>
  <path d="M${cx} ${cy} L${cx + r * 0.34} ${cy + r * 0.34}" fill="none" stroke="${TERRACOTTA}"
        stroke-width="${r * 0.075}" stroke-linecap="round"/>
  <path d="M${cx} ${cy} L${cx + r * 0.62} ${cy - r * 0.3}" fill="none" stroke="${TERRACOTTA}"
        stroke-width="${r * 0.055}" stroke-linecap="round"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.06}" fill="${TERRACOTTA}"/>`;

const pin = (x: number, y: number, height: number): string => {
  const factor = height / 40;
  return `<g transform="translate(${x} ${y}) scale(${factor})">
    <path d="${PIN}" fill="${INK}" opacity="0.9"/>
    <path d="${WAVE}" fill="none" stroke="${CREAM}" stroke-width="2.7" stroke-linecap="round"/>
  </g>`;
};

const artwork = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${CREAM}"/>
  ${clock(WIDTH / 2, HEIGHT / 2 - 28, 168)}
  ${pin(WIDTH / 2 - 21, HEIGHT / 2 + 190, 56)}
</svg>`;

await mkdir('public/og', { recursive: true });
const png = new Resvg(artwork, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();
await writeFile('public/og/archive.png', png);
process.stdout.write(`archive.png ${png.byteLength}B\n`);
