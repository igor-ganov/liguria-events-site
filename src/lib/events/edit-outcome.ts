/** Whether an edit landed, or was overtaken while it waited. */
export type EditOutcome = 'saved' | 'conflict';

/**
 * What happened to an edit, given the version it claimed and how many rows it
 * changed.
 *
 * An edit can now sit in the offline queue for hours, so it carries the
 * version it was based on and the update is guarded by it. Zero rows changed
 * under that guard means the event moved on in the meantime — writing anyway
 * would overwrite whatever moved, silently, and the author would never know
 * they had undone somebody's change or their own from another device.
 *
 * Without a guard there is nothing to have been overtaken by: zero rows means
 * the values already matched.
 */
export const editOutcome = (base: string | undefined, changes: number): EditOutcome =>
  [base]
    .filter((claimed) => claimed !== undefined)
    .filter(() => changes === 0)
    .map((): EditOutcome => 'conflict')
    .at(0) ?? 'saved';
