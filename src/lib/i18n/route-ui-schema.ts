import { Schema } from 'effect';

/** Copy for the route generator, its editor, the timeline and the saved-route
 *  pages — the largest section of the dictionary. */
export const RouteUiSchema = Schema.Struct({
  walk: Schema.String, drive: Schema.String, transit: Schema.String, generate: Schema.String,
  save: Schema.String, saved: Schema.String, tight: Schema.String, min: Schema.String, empty: Schema.String,
  link: Schema.String, saveFailed: Schema.String, mine: Schema.String, open: Schema.String,
  private: Schema.String, public: Schema.String, makePrivate: Schema.String, makePublic: Schema.String,
  remove: Schema.String, title: Schema.String, by: Schema.String,
  moveDay: Schema.String, moveUp: Schema.String, moveDown: Schema.String, addFav: Schema.String, saveChanges: Schema.String,
  viewList: Schema.String, viewTimeline: Schema.String, pdf: Schema.String,
  day: Schema.String, setDefault: Schema.String,
  setBase: Schema.String, setBaseDefault: Schema.String, clearBase: Schema.String, clickMap: Schema.String,
  dayBase: Schema.String, dayFinal: Schema.String, fromBase: Schema.String, toBase: Schema.String,
});
