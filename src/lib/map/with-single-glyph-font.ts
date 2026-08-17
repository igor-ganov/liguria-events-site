import { branch } from '../branch.ts';
import { glyphFont } from './glyph-font.ts';
import type { StyleLayer } from './style-types.ts';

/**
 * The label font stack a layer declares, or undefined when it has none.
 * `Object(x)` boxes primitives and yields `{}` for the nullish values, so the
 * nested reads stay safe on arbitrary style JSON without a cast or a guard.
 */
const fontStackOf = (layer: StyleLayer): readonly string[] | undefined => {
  const fonts: unknown = Object(layer['layout'])['text-font'];
  return branch(Array.isArray(fonts))(
    () => Array.from(Object(fonts)).filter((font: unknown): font is string => typeof font === 'string'),
    () => undefined,
  );
};

/**
 * Collapse every label font stack to ONE self-hosted face. A glyph folder holds
 * a single face, so comma-joined stacks ("a,b") 404 against it — every label on
 * the map disappears. Layers without a stack pass through untouched.
 */
export const withSingleGlyphFont = (layers: readonly StyleLayer[]): readonly StyleLayer[] =>
  layers.map((layer) => {
    const fonts = fontStackOf(layer);
    return branch(fonts === undefined)(
      () => layer,
      () => ({
        ...layer,
        layout: {
          ...Object(layer['layout']),
          'text-font': [glyphFont(fonts?.[0] ?? 'Noto Sans Regular')],
        },
      }),
    );
  });
