// The feature graphic Play shows above a listing: 1024×500, no transparency,
// and it is cropped on some surfaces, so nothing that matters goes near an
// edge. Drawn here for the same reason the icons are — one drawing of the pin
// in the repository, not four in a design tool.
//
// Run: bun run scripts/build-store-graphic.ts
import { Resvg } from '@resvg/resvg-js';
import { mkdir, writeFile } from 'node:fs/promises';

const PIN = 'M16 1.6C8.6 1.6 2.6 7.5 2.6 14.9 2.6 24.4 16 38.4 16 38.4S29.4 24.4 29.4 14.9C29.4 7.5 23.4 1.6 16 1.6Z';
const WAVE = 'M8.2 16.4C10.7 12.7 13.6 12.7 16 16.4 18.4 20.1 21.3 20.1 23.8 16.4';
const CREAM = '#fbfaf7';
const INK = '#16181c';
const ORANGE = '#f2822a';
const TEAL = '#2f6f7a';

const WIDTH = 1024;
const HEIGHT = 500;

const pin = (x: number, y: number, height: number, body: string): string => {
  const factor = height / 40;
  return `<g transform="translate(${x} ${y}) scale(${factor})">
    <path d="${PIN}" fill="${body}"/>
    <path d="${WAVE}" fill="none" stroke="${CREAM}" stroke-width="2.7" stroke-linecap="round"/>
  </g>`;
};

/** A scatter of pins, as a map of somewhere without being any one place. */
const scatter = (): string =>
  [
    [120, 300, 54, ORANGE],
    [250, 170, 38, TEAL],
    [330, 360, 32, INK],
    [830, 150, 44, TEAL],
    [900, 330, 34, ORANGE],
    [700, 380, 28, INK],
  ]
    .map(([x, y, size, colour]) => pin(Number(x), Number(y), Number(size), String(colour)))
    .join('');

const artwork = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${CREAM}"/>
  ${scatter()}
  ${pin(WIDTH / 2 - 62, HEIGHT / 2 - 92, 184, ORANGE)}
</svg>`;

await mkdir('store', { recursive: true });
const png = new Resvg(artwork, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();
await writeFile('store/feature-graphic.png', png);
process.stdout.write(`feature-graphic.png ${png.byteLength}B\n`);
