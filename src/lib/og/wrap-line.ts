import { branch } from '../branch.ts';

const fits = (line: string, width: number, taken: number): boolean =>
  line.length <= width && taken > 0;

const lay = (width: number) =>
  (out: readonly string[], word: string): readonly string[] => {
    const joined = `${out.at(-1) ?? ''} ${word}`.trim();
    return branch(fits(joined, width, out.length))(
      () => [...out.slice(0, -1), joined],
      () => [...out, word],
    );
  };

/**
 * Break a line on words to fit a width, keeping at most `lines` of it. A word
 * longer than the width is left whole and allowed to overflow: losing it
 * entirely would be worse than it sticking out.
 */
export const wrapLine = (text: string, width: number, lines = 3): readonly string[] => {
  const laid = text.trim().split(/\s+/).filter(Boolean).reduce(lay(width), []);
  return laid.slice(0, lines).map((line, index) =>
    branch(index === lines - 1 && laid.length > lines)(
      () => `${line.slice(0, width - 1)}…`,
      () => line,
    ),
  );
};
