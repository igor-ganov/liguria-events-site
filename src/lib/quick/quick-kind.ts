/** The feed's quick time filters, in the order they are offered. */
export const QUICK_KINDS = ['tonight', 'weekend', 'sunday'] as const;

export type QuickKind = (typeof QUICK_KINDS)[number];
