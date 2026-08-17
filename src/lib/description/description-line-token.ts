import { isDefined } from '../is-defined.ts';

/** One source line classified. `text` carries the line's payload: the heading
 *  label, the bullet's item, the paragraph line — empty for a blank line. */
export type DescriptionLineToken = {
  readonly kind: 'blank' | 'h' | 'li' | 'text';
  readonly text: string;
};

// A section label: a `## Heading`, or a whole line that is entirely bold.
const HEADING = /^(?:#{2,4}\s+(.*)|\*\*(.+)\*\*)$/;
const BULLET = /^[-*•]\s+(.*)$/;

type Rule = readonly [RegExp, (match: RegExpExecArray) => DescriptionLineToken];

// First match wins, so a heading is never mistaken for a `*`-led bullet.
const RULES: readonly Rule[] = [
  [/^$/, (): DescriptionLineToken => ({ kind: 'blank', text: '' })],
  [HEADING, (match): DescriptionLineToken => ({ kind: 'h', text: match[1] ?? match[2] ?? '' })],
  [BULLET, (match): DescriptionLineToken => ({ kind: 'li', text: match[1] ?? '' })],
];

/** Classify one line of a description. */
export const descriptionLineToken = (raw: string): DescriptionLineToken => {
  const line = raw.trim();
  return (
    RULES.flatMap(([pattern, make]) =>
      [pattern.exec(line) ?? undefined].filter(isDefined).map(make),
    )[0] ?? { kind: 'text', text: line }
  );
};
