/** A stored number as the text a form field shows; a column with no value shows
 *  an empty field rather than the string "null". */
export const numberText = (value: number | null): string =>
  [value]
    .filter((candidate): candidate is number => candidate !== null)
    .map((candidate) => String(candidate))
    .at(0) ?? '';
