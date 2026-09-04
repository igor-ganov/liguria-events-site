// The launcher icons, rasterised from the same two paths the favicon draws so
// there is one drawing of the pin in the repository and not four.
//
// Run: bun run scripts/build-icons.ts (wired into `bun run build`).
//
// Two shapes, because Android uses them differently. A plain icon is shown as
// it is, so it keeps the transparent ground and a little air around the pin. A
// maskable one is cropped by the launcher to whatever shape the device likes —
// a circle, a squircle, a teardrop — so it is full-bleed orange with the pin
// inside the 80% safe circle, and the artwork survives every crop.
import { Resvg } from '@resvg/resvg-js';
import { mkdir, writeFile } from 'node:fs/promises';

const PIN = 'M16 1.6C8.6 1.6 2.6 7.5 2.6 14.9 2.6 24.4 16 38.4 16 38.4S29.4 24.4 29.4 14.9C29.4 7.5 23.4 1.6 16 1.6Z';
const WAVE = 'M8.2 16.4C10.7 12.7 13.6 12.7 16 16.4 18.4 20.1 21.3 20.1 23.8 16.4';
const ORANGE = '#f2822a';
const CREAM = '#fbfaf7';

/** The pin drawn into a square box: `scale` is its height as a share of the box. */
const square = (size: number, ground: string, pin: string, wave: string, scale: number): string => {
  const height = size * scale;
  const factor = height / 40;
  const left = (size - 32 * factor) / 2;
  const top = (size - height) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${ground}"/>
  <g transform="translate(${left} ${top}) scale(${factor})">
    <path d="${PIN}" fill="${pin}"/>
    <path d="${WAVE}" fill="none" stroke="${wave}" stroke-width="2.7" stroke-linecap="round"/>
  </g>
</svg>`;
};

const ICONS: readonly (readonly [string, string])[] = [
  ['icon-192.png', square(192, 'none', ORANGE, '#ffffff', 0.86)],
  ['icon-512.png', square(512, 'none', ORANGE, '#ffffff', 0.86)],
  // 0.57 keeps the drawing inside the maskable safe circle (80% of the width).
  ['icon-maskable-512.png', square(512, ORANGE, '#ffffff', ORANGE, 0.57)],
  // iOS composites nothing behind a home-screen icon, so this one has a ground.
  ['apple-touch-icon.png', square(180, CREAM, ORANGE, '#ffffff', 0.78)],
];

await mkdir('public/icons', { recursive: true });
const written = await Promise.all(
  ICONS.map(async ([name, svg]) => {
    const png = new Resvg(svg).render().asPng();
    await writeFile(`public/icons/${name}`, png);
    return `${name} ${png.byteLength}B`;
  }),
);
// A build step that says nothing is a build step nobody notices has stopped.
process.stdout.write(`icons: ${written.join(', ')}\n`);
