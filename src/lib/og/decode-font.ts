/** A face as it travels in the bundle, back into the bytes a renderer opens. */
export const decodeFont = (base64: string): ArrayBuffer => {
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  Array.from(raw).forEach((ch, i) => {
    out[i] = ch.charCodeAt(0);
  });
  return out.buffer;
};
