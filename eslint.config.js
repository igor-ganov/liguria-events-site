// Functional-frontend enforcement (spec AC-5.1): what can be lint, is lint.
import tseslint from 'typescript-eslint';

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
    files: ['test/**/*.ts'],
    rules: { 'functional/one-value-export': 'off', 'functional/max-lines-no-imports': 'off' },
  },
);
