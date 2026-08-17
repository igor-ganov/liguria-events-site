import type { Verdict } from './verdict-types.ts';

// Held is the safe default: a verdict this map does not name never publishes.
const STATUSES = new Map<Verdict['verdict'], string>([
  ['allow', 'published'],
  ['reject', 'rejected'],
  ['hold', 'held'],
]);

/** The event status an AI verdict puts the event into. */
export const statusFor = (verdict: Verdict['verdict']): string => STATUSES.get(verdict) ?? 'held';
