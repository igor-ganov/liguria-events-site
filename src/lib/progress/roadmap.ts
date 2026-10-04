import { Schema } from 'effect';
import data from '../../data/roadmap.json' with { type: 'json' };
import { RoadmapSchema } from './roadmap-schema.ts';

/** The roadmap as written in src/data/roadmap.json. Decoding at import means a
 *  malformed entry fails the build instead of reaching a reader. */
export const ROADMAP = Schema.decodeUnknownSync(RoadmapSchema)(data);
