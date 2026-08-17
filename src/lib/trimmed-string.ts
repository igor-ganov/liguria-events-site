/** A request field as a bounded string: trimmed and cut to `max`, with
 *  anything that is not a string reading as ''. */
export const trimmedString = (value: unknown, max: number): string =>
  [value]
    .filter((candidate): candidate is string => typeof candidate === 'string')
    .map((text) => text.trim().slice(0, max))
    .at(0) ?? '';
