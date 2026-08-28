import { CARD_FONT_BASE64 } from './card-font-data.ts';

/**
 * The face the card is drawn with, decoded once per isolate. It travels in the
 * bundle rather than being fetched: a worker has no fonts of its own, and the
 * origin it believes it is answering for is not the one the request came in on.
 */
const held: { face: ArrayBuffer | undefined } = { face: undefined };

const decode = (): ArrayBuffer => {
  const raw = atob(CARD_FONT_BASE64);
  const out = new Uint8Array(raw.length);
  Array.from(raw).forEach((ch, i) => {
    out[i] = ch.charCodeAt(0);
  });
  return out.buffer;
};

export const cardFont = (): ArrayBuffer => (held.face ??= decode());
