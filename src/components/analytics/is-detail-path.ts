/** `/event/<id>` and `/<lang>/event/<id>` are detail views; `/event/<id>/edit` is not. */
export const isDetailPath = (path: string): boolean =>
  path.split('/').includes('event') && !path.endsWith('/edit');
