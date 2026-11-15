/** The control somebody pressed last, and when (performance.now()). */
export type Press<T> = Readonly<{ target: T; at: number }>;
