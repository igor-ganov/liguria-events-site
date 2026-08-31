import { CARD_FAMILIES } from './card-families.ts';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
// Workers refuse to compile WebAssembly from a buffer at runtime, so the module
// is bound at deploy time by the adapter's wasmModuleImports mode.
import wasm from '@resvg/resvg-wasm/index_bg.wasm';

/** One isolate, one initialisation. */
const started = { at: undefined as Promise<void> | undefined };

const ready = (): Promise<void> => (started.at ??= initWasm(wasm));

/**
 * The card, as the PNG a chat app will actually show. There are no system
 * fonts in a worker, so every face the drawing asks for has to be handed over,
 * and each is found by the family name it carries in itself — see
 * card-families.ts for why that name has to be exact.
 */
export const renderCard = async (svg: string, fonts: readonly ArrayBuffer[]): Promise<ArrayBuffer> => {
  await ready();
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    font: {
      fontBuffers: fonts.map((face) => new Uint8Array(face)),
      defaultFontFamily: CARD_FAMILIES.text,
      loadSystemFonts: false,
    },
  }).render();
  // A plain buffer of its own: the worker's Response does not take the view
  // type resvg hands back, and the view may sit on shared memory.
  const bytes = png.asPng();
  const out = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(out).set(bytes);
  return out;
};
