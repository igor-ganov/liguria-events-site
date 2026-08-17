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
      'src/components/EventForm.astro',
      'src/components/LanguageSwitcher.astro',
      'src/components/MobileMenu.astro',
      'src/components/RegionPicker.astro',
      'src/components/shared/MiniCard.astro',
      'src/components/views/CalendarView.astro',
      'src/components/views/EventDetail.astro',
      'src/components/views/FeedView.astro',
      'src/components/views/LandmarkDetail.astro',
      // Being decomposed: its popup/URL helpers already moved to tested pure
      // functions under src/lib/map/. The remaining bulk is one long imperative
      // setup() — extract it flow by flow (markers, clustering, layers, geo).
      'src/components/views/MapView.astro',
      'src/components/views/PlaceDetail.astro',
      'src/layouts/Layout.astro',
      // Astro route files carry [param] segments — the brackets are escaped so
      // minimatch reads them as literals, not character classes.
      'src/pages/\\[lang\\]/event/\\[id\\].astro',
      'src/pages/\\[lang\\]/landmark/\\[region\\]/\\[slug\\].astro',
      'src/pages/\\[lang\\]/place/\\[region\\]/\\[slug\\].astro',
      'src/pages/admin/index.astro',
      'src/pages/admin/users.astro',
      'src/pages/auth/verify.astro',
      'src/pages/event/\\[id\\].astro',
      'src/pages/event/\\[id\\]/edit.astro',
      'src/pages/route/\\[id\\].astro',
      'src/pages/settings.astro',
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
    // Auth, API endpoints and middleware are guard-clause / validation heavy —
    // early returns and cohesive multi-export modules read safer here than the
    // branch()/one-export style used across the rest of the app.
    files: [
      'src/lib/auth/**/*.ts',
      'src/lib/moderation/**/*.ts',
      'src/lib/search/**/*.ts',
      'src/lib/landmarks/**/*.ts',
      'src/lib/places/**/*.ts',
      'src/lib/favorites/**/*.ts',
      'src/components/favorites/**/*.ts',
      'src/lib/region/region-bounds.ts',
      'src/lib/region/regions-cities-of.ts',
      'src/lib/img/**/*.ts',
      'src/lib/events/d1-published.ts',
      'src/lib/events/event-input.ts',
      'src/components/feed/**/*.ts',
      'src/components/events/**/*.ts',
      'src/components/landmarks/**/*.ts',
      'src/components/places/**/*.ts',
      'src/components/admin/**/*.ts',
      'src/components/region/**/*.ts',
      'src/components/shared/default-page-data.ts',
      'src/components/shared/image-fallback.ts',
      'src/lib/i18n/ui-schema.ts',
      'src/content.config.ts',
      'src/pages/api/**/*.ts',
      'src/pages/uploads/**/*.ts',
      'src/middleware.ts',
    ],
    rules: {
      'no-restricted-syntax': 'off',
      'functional/one-value-export': 'off',
      'functional/max-lines-no-imports': 'off',
    },
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
