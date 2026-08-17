import { uploadExt } from './upload-ext.ts';
import { uploadProblem } from './upload-problem.ts';

/** A form field that passed every image check, with the extension it stores as. */
export type AcceptedUpload = Readonly<{ file: File; ext: string }>;

/** The upload as a 0-or-1 array, so the endpoint can `.map()` the storing step
 *  instead of guarding it. Acceptance is defined as "uploadProblem finds nothing
 *  to object to", so the two can never disagree about the same file. */
export const acceptedUpload = (candidate: unknown): readonly AcceptedUpload[] =>
  [candidate]
    .filter((value): value is File => value instanceof File)
    .filter(() => uploadProblem(candidate) === undefined)
    .map((file) => ({ file, ext: uploadExt(file.type) ?? '' }));
