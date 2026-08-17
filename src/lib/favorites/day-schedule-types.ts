// The shapes the day timeline is laid out in. Types only — the functions that
// produce them live one per file next to this one.

export type Durations = Readonly<Record<string, number>>;

// Kept for the payload schema (legacy routes carry per-stop start times); the
// sequence model no longer uses them for positioning.
export type Times = Readonly<Record<string, string>>;

export type ScheduledStop = Readonly<{
  id: string;
  startMin: number;
  endMin: number;
  /** Estimated travel minutes from the previous stop (0 for the first). */
  travelMin: number;
  /** The scheduled block falls outside the event's official window — placed
   *  before it opens, or running past its close. Stops without a fixed time
   *  (POIs/landmarks) are flexible and never off-schedule. */
  offSchedule: boolean;
}>;
