/** The three elements the drag/open wiring needs from one menu wrapper. */
export type FabParts = Readonly<{
  fab: HTMLButtonElement;
  overlay: HTMLElement;
  panel: HTMLElement;
}>;

/** The wrapper's parts as a 0-or-1 element list, so a half-rendered menu is
 *  skipped by iterating nothing rather than by a guard clause. */
export const fabParts = (wrap: HTMLElement): readonly FabParts[] =>
  [
    {
      fab: wrap.querySelector<HTMLButtonElement>('[data-fab-toggle]') ?? undefined,
      overlay: wrap.querySelector<HTMLElement>('[data-fab-overlay]') ?? undefined,
      panel: wrap.querySelector<HTMLElement>('[data-fab-panel]') ?? undefined,
    },
  ].filter(
    (parts): parts is FabParts =>
      parts.fab !== undefined && parts.overlay !== undefined && parts.panel !== undefined,
  );
