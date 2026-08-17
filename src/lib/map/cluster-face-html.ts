/**
 * The inner markup of a cluster plaque — the count of the points it stands for.
 * `prefix` is the layer's class stem (`ev`, `lm`, `pl`), so each layer's cluster
 * keeps its own shape in CSS while sharing this markup.
 */
export const clusterFaceHtml =
  (prefix: string) =>
  (count: number): string =>
    `<div class="${prefix}-cluster-face"><span>${count}</span></div>`;
