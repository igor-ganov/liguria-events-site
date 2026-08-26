// Pulls the two Filo typefaces out of Google Fonts and puts them in
// public/fonts, so no page has to block on a third party to paint. Run it
// again to refresh: `bun run scripts/fetch-fonts.ts`.
import { mkdir, writeFile } from 'node:fs/promises';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const OUT = 'public/fonts';
const CSS = 'src/styles/filo-faces.css';

// The alphabets this site is actually written in. Every other subset Google
// offers is bytes nobody here will read.
const WANTED = new Set(['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext']);

const FAMILIES = [
  'Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..700,0..100,0..1;1,9..144,300..700,0..100,0..1',
  'Rubik:ital,wght@0,300..600;1,300..500',
];

type Face = Readonly<{ subset: string; block: string; url: string }>;

const facesOf = (css: string): readonly Face[] =>
  [...css.matchAll(/\/\* ([\w-]+) \*\/\s*(@font-face \{[^}]+\})/g)].flatMap((m) => {
    const [, subset = '', block = ''] = m;
    const url = /url\((https:[^)]+\.woff2)\)/.exec(block)?.[1] ?? '';
    return WANTED.has(subset) && url !== '' ? [{ subset, block, url }] : [];
  });

const nameOf = (face: Face): string => {
  const family = /font-family: '([^']+)'/.exec(face.block)?.[1] ?? 'font';
  const italic = face.block.includes('font-style: italic') ? '-italic' : '';
  return `${family.toLowerCase()}-${face.subset}${italic}.woff2`;
};

const grab = async (family: string): Promise<readonly string[]> => {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}&display=swap`, {
    headers: { 'User-Agent': UA },
  }).then((r) => r.text());
  return Promise.all(
    facesOf(css).map(async (face) => {
      const name = nameOf(face);
      const bytes = await fetch(face.url).then((r) => r.arrayBuffer());
      await writeFile(`${OUT}/${name}`, new Uint8Array(bytes));
      return face.block.replace(/url\(https:[^)]+\)/, `url(/fonts/${name})`);
    }),
  );
};

await mkdir(OUT, { recursive: true });
const blocks = (await Promise.all(FAMILIES.map(grab))).flat();
await writeFile(
  CSS,
  `/* ══ Filo — the faces ═══════════════════════════════════════════════\n   Served from this origin. A stylesheet from fonts.googleapis.com is a\n   render-blocking request to somebody else's server on every page: it\n   cost the feed its load event under a slow network, and it hands every\n   visitor to a third party for nothing.\n   Regenerate with: bun run scripts/fetch-fonts.ts\n   ══════════════════════════════════════════════════════════════════ */\n\n${blocks.join('\n\n')}\n`,
);
console.log(`${blocks.length} faces → ${OUT}`);
