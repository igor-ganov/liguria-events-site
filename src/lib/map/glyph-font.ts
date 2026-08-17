import { branch } from '../branch.ts';

/**
 * Map a style's font name onto one of our self-hosted glyph folders.
 * Folders are hyphenated and space-free (GitHub Pages 404s spaced paths), and
 * only the Noto Sans faces exist — anything else (Dark Matter ships MapTiler
 * fonts) falls back to Regular rather than 404-ing every label.
 */
export const glyphFont = (font: string): string =>
  branch(/^noto sans (regular|bold|italic)$/i.test(font))(
    () => font.toLowerCase().replace(/\s+/g, '-'),
    () => 'noto-sans-regular',
  );
