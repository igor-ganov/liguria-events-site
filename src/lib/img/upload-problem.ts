import { uploadExt } from './upload-ext.ts';

const MAX_BYTES = 8 * 1024 * 1024;

const isFile = (candidate: unknown): candidate is File => candidate instanceof File;

/** Why this form field is not an acceptable event image, in the order the
 *  endpoint has always checked: not a file at all, then an unsupported type,
 *  then too large. Nothing at all means "carry on". The wording is the wording
 *  the browser already shows. */
export const uploadProblem = (candidate: unknown): string | undefined =>
  [
    ...[candidate].filter((value) => !isFile(value)).map(() => 'No file.'),
    ...[candidate]
      .filter(isFile)
      .filter((file) => uploadExt(file.type) === undefined)
      .map(() => 'Use a JP, PNG, WebP, AVIF or GIF image.'),
    ...[candidate]
      .filter(isFile)
      .filter((file) => file.size > MAX_BYTES)
      .map(() => 'Image must be under 8 MB.'),
  ].at(0);
