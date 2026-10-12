import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, posix, relative } from 'node:path';
import type { Resolve } from './reached-files.ts';

const walk = (dir: string): readonly string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

/** Every component and script of the site, by its path from the root
 *  (`src/pages/…`). Stylesheets are not sources: a class named in one is the
 *  thing being placed, not evidence of where it is used. */
export const sourceFiles = (root: string): ReadonlyMap<string, string> =>
  new Map(
    walk(join(root, 'src'))
      .map((path) => relative(root, path).split('\\').join('/'))
      .filter((path) => /\.(astro|ts)$/.test(path) && !path.startsWith('src/styles/'))
      .map((path) => [path, readFileSync(join(root, path), 'utf8')] as const),
  );

/** An import as these sources write them: relative, to a file or a folder. */
export const leadsTo =
  (files: ReadonlyMap<string, string>): Resolve =>
  (from, spec) => {
    const base = posix.normalize(posix.join(posix.dirname(from), spec));
    return [spec]
      .filter((written) => written.startsWith('.'))
      .flatMap(() => [base, `${base}.ts`, `${base}/index.ts`])
      .find((path) => files.has(path));
  };
