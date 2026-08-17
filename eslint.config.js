// Functional-frontend enforcement (spec AC-5.1): what can be lint, is lint.
import tseslint from 'typescript-eslint';
import * as astroParser from 'astro-eslint-parser';

const MAX_LINES = 50;

/** max-lines excluding import lines, blanks and comment-only lines. */
const maxLinesNoImports = {
  meta: { type: 'suggestion', schema: [] },
  create(context) {
    return {
      Program(program) {
        const source = context.sourceCode;
        const importLines = new Set(
          program.body
            .filter((node) => node.type === 'ImportDeclaration')
            .flatMap((node) =>
              Array.from(
                { length: node.loc.end.line - node.loc.start.line + 1 },
                (_, i) => node.loc.start.line + i,
              ),
            ),
        );
        const commentLines = new Set(
          source.getAllComments().flatMap((comment) =>
            Array.from(
              { length: comment.loc.end.line - comment.loc.start.line + 1 },
              (_, i) => comment.loc.start.line + i,
            ),
          ),
        );
        const count = source.lines.filter(
          (text, index) =>
            text.trim() !== '' && !importLines.has(index + 1) && !commentLines.has(index + 1),
        ).length;
        if (count > MAX_LINES) {
          context.report({
            node: program,
            message: `File has ${count} code lines (max ${MAX_LINES}, imports/comments excluded) — split it.`,
          });
        }
      },
    };
  },
};

/** At most one exported VALUE per file (type-only exports are free). */
const oneValueExport = {
  meta: { type: 'suggestion', schema: [] },
  create(context) {
    return {
      Program(program) {
        const valueExports = program.body.filter(
          (node) =>
            node.type === 'ExportDefaultDeclaration' ||
            (node.type === 'ExportNamedDeclaration' &&
              node.exportKind !== 'type' &&
              node.declaration !== null &&
              node.declaration !== undefined &&
              ['VariableDeclaration', 'FunctionDeclaration', 'ClassDeclaration'].includes(
                node.declaration.type,
              )),
        );
        if (valueExports.length > 1) {
          context.report({
            node: valueExports[1],
            message: `File exports ${valueExports.length} values — one exported function/value per file.`,
          });
        }
      },
    };
  },
};

export default tseslint.config(
  { ignores: ['dist/**', '.astro/**', 'node_modules/**'] },
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    extends: [tseslint.configs.recommended],
    plugins: { functional: { rules: { 'max-lines-no-imports': maxLinesNoImports, 'one-value-export': oneValueExport } } },
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: 'IfStatement', message: 'No if — use switch / Match / strategy maps.' },
        { selector: 'ConditionalExpression', message: 'No ternary — use branch()/Match.' },
      ],
      'functional/max-lines-no-imports': 'error',
      'functional/one-value-export': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    // `.astro` files were linted by NOTHING — `eslint src` only matched *.ts, so
    // a 1000-line <script> in a component never met the size or no-branching
    // rules that the rest of src/ lives by. They are linted here: an .astro file
    // is a THIN markup shell, its logic belongs in tested pure functions under
    // src/lib or src/components as .ts.
    files: ['src/**/*.astro'],
    languageOptions: {
      parser: astroParser,
      // The frontmatter and <script> blocks are TypeScript — hand them to the TS
      // parser, or every annotated component is a parse error.
      parserOptions: { parser: tseslint.parser, extraFileExtensions: ['.astro'] },
    },
    plugins: { functional: { rules: { 'max-lines-no-imports': maxLinesNoImports } } },
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: 'IfStatement', message: 'No if — use switch / Match / strategy maps.' },
        { selector: 'ConditionalExpression', message: 'No ternary — use branch()/Match.' },
      ],
      'functional/max-lines-no-imports': 'error',
    },
  },
  {
    // LEGACY DEBT — files that already violated the rules on the day .astro
    // linting was switched on (2026-08-17). The rules above apply to every
    // OTHER .astro file, so nothing new can land; this list exists only so CI
    // stays green while the backlog is paid down.
    //
    // THIS LIST MUST ONLY EVER SHRINK. Never add a file to it — split the file
    // instead, moving its logic into tested pure functions.
    files: [
      // Being decomposed: its style transforms, marker markup and every popup
      // builder already moved to tested pure functions under src/lib/map/. The
      // remaining bulk is one long imperative setup() — extract it flow by flow
      // (clustering, layer toggles, geolocation, URL state).
      'src/components/views/MapView.astro',
    ],
    rules: { 'no-restricted-syntax': 'off', 'functional/max-lines-no-imports': 'off' },
  },
  {
    files: ['test/**/*.ts'],
    rules: { 'functional/one-value-export': 'off', 'functional/max-lines-no-imports': 'off' },
  },
  {
    // Astro endpoints legitimately export GET/POST + prerender from one file.
    files: ['src/pages/**/*.ts'],
    rules: { 'functional/one-value-export': 'off' },
  },
  {
    // Astro's content collections put every locale's copy through one Zod schema;
    // the per-area schema modules under src/content/schema/ are field lists, not
    // logic, so the one-export rule buys nothing there.
    files: ['src/content/schema/*.ts'],
    rules: { 'functional/one-value-export': 'off' },
  },
  {
    // Declaration files use ambient idioms (empty extending interfaces, import()).
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'functional/one-value-export': 'off',
    },
  },
);
