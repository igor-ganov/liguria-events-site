// public/.well-known/assetlinks.json, written from the same module the app id
// and the signing fingerprints live in. It is generated rather than edited so
// that adding the Play App Signing certificate is one change, in one place,
// covered by a test — and not a hand-edit to a file nobody reads again.
import { assetLinks } from '../src/lib/pwa/asset-links.ts';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('public/.well-known', { recursive: true });
await writeFile('public/.well-known/assetlinks.json', `${JSON.stringify(assetLinks(), undefined, 2)}\n`);
process.stdout.write('assetlinks.json written\n');
