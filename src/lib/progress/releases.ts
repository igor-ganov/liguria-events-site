import { Schema } from 'effect';
import data from '../../data/releases.json' with { type: 'json' };
import { ReleasesSchema } from './releases-schema.ts';

/** The release notes, newest first whatever order the file is kept in. */
export const RELEASES = [...Schema.decodeUnknownSync(ReleasesSchema)(data)].sort((a, b) =>
  b.date.localeCompare(a.date),
);
