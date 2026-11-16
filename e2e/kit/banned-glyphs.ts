// The Unicode ranges an icon used to be typed from: arrows, technical signs,
// geometric shapes, dingbats, braille dots and emoji, plus the multiplication
// sign and the single guillemets that served as crosses and chevrons. Read by
// the source guard (test/no-symbol-glyphs.test.ts) and the page checks alike.
export const BANNED_GLYPHS =
  /[\u00D7\u2039\u203A\u2190-\u21FF\u2300-\u23FF\u25A0-\u27BF\u2800-\u28FF\u2B00-\u2BFF\u{1F300}-\u{1FAFF}]/u;
