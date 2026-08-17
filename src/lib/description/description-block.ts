/** One parsed block of an event description: a section heading, a paragraph, or
 *  a bullet list. Produced by parseDescriptionBlocks, consumed by the renderers. */
export type DescriptionBlock =
  | { readonly kind: 'h'; readonly text: string }
  | { readonly kind: 'p'; readonly text: string }
  | { readonly kind: 'ul'; readonly items: readonly string[] };
