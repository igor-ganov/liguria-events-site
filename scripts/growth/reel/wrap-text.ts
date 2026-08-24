/**
 * Break a headline into lines that fit a width.
 *
 * SVG has no automatic wrapping and resvg exposes no font metrics, so the fit
 * is estimated from character count. Sans-serif glyphs average around 0.52 em,
 * which is close enough at these sizes and errs on the narrow side — a line
 * that stops early looks intentional, one that overflows the frame does not.
 */
const PER_EM = 0.52;

const fold = (width: number) => (lines: readonly string[], word: string): readonly string[] => {
  const last = lines.at(-1) ?? '';
  const joined = last === '' ? word : `${last} ${word}`;
  return joined.length <= width
    ? [...lines.slice(0, -1), joined]
    : [...lines.filter((line) => line !== ''), word];
};

export const wrapText = (
  text: string,
  boxWidth: number,
  fontSize: number,
  maxLines: number,
): readonly string[] => {
  const perLine = Math.max(1, Math.floor(boxWidth / (fontSize * PER_EM)));
  const lines = text.trim().split(/\s+/).filter(Boolean).reduce(fold(perLine), []);
  const kept = lines.slice(0, maxLines);
  return lines.length <= maxLines
    ? kept
    : [...kept.slice(0, -1), `${(kept.at(-1) ?? '').slice(0, perLine - 1)}…`];
};
