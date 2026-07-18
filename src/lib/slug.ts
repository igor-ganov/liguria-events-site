// Readable, unique, locale-stable slugs for detail URLs, derived at runtime (no
// stored field, no payload growth). The readable prefix comes from the name (for
// humans + SEO); the trailing `--<token>` is a stable hash of the INTERNAL id, so
// it is unique and identical across locales — matching is done on the token, so
// a link keeps working when the language (and thus the readable name) changes.

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'x';

// FNV-1a → base36, ~6 chars. Stable for a given internal id across builds/locales.
const token = (id: string): string => {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return (h >>> 0).toString(36);
};

export const slug = {
  of: (name: string, id: string): string => `${slugify(name)}--${token(id)}`,
  token: (raw: string): string => raw.split('--').pop() ?? raw,
  matches: (id: string, raw: string): boolean => token(id) === (raw.split('--').pop() ?? raw) || id === raw,
};
