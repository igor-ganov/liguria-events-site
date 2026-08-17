/**
 * The zoom at which Genoa's civic address numbers appear. They are a street-level
 * detail (thousands of labels per neighbourhood), so both the style layer and the
 * WFS fetch loop gate on this one threshold.
 */
export const CIVIC_MIN_ZOOM = 16.5;
