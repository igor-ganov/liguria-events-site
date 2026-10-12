import { importsOf } from './imports-of.ts';

/** Where an import written in one file leads, when it leads to a source file. */
export type Resolve = (from: string, spec: string) => string | undefined;

/**
 * Every source file a page reaches by following imports, itself included: the
 * components it is built of, the scripts they load, the helpers those call.
 * Whatever markup can end up on the page is written in one of these.
 */
export const reachedFiles =
  (files: ReadonlyMap<string, string>, resolve: Resolve) =>
  (page: string): ReadonlySet<string> => {
    const seen = new Set<string>();
    const walk = (file: string): void => {
      const fresh = !seen.has(file) && files.has(file);
      [file]
        .filter(() => fresh)
        .forEach((one) => {
          seen.add(one);
          importsOf(files.get(one) ?? '')
            .map((spec) => resolve(one, spec))
            .filter((next): next is string => next !== undefined)
            .forEach(walk);
        });
    };
    walk(page);
    return seen;
  };
