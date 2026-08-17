// The traveller's base (accommodation): a point the day departs from and
// returns to, settable at three levels (day > route > global) like the day
// window. A day may also override just its FINAL point (end somewhere other than
// the base). Input is a map click, so a point is bare coordinates + a label.
export type Point = Readonly<{ lat: number; lng: number; label?: string }>;

// The base to depart from / return to on a day, and an optional different final
// point for that day.
export type DayBase = Readonly<{ base?: Point | undefined; final?: Point | undefined }>;
