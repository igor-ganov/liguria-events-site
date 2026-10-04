// Claude Code PreToolUse hook: stops a `git push` that changes the site without
// a release note. Wired in .claude/settings.json; the rule itself is the pure
// function next door, which is what the tests hold.
//
// It fails OPEN on anything it cannot read — no upstream ref, not a push, a
// malformed payload. A guard that blocks work because git was in an odd state
// is a guard that gets removed.
import { $ } from 'bun';
import { needsReleaseNote } from './needs-release-note.ts';

// Overridable so the blocking path can be exercised against any older commit.
const BASE = process.env.RELEASE_NOTE_BASE ?? 'origin/main';
const ADVICE = `This push changes the site but src/data/releases.json is untouched.
Add a release note (title and body in en/it/ru, an example path on the site) and move the
roadmap item in src/data/roadmap.json — see .claude/skills/roadmap-and-releases/SKILL.md.
If there is nothing a reader would notice, say so in a commit message of this push:
  Release-Note: none (<the reason>)`;

const lines = (text: string): readonly string[] => text.split('\n').map((line) => line.trim()).filter(Boolean);

const command = await Bun.stdin
  .json()
  .then((payload: { tool_input?: { command?: string } }) => payload.tool_input?.command ?? '')
  .catch(() => '');

const verdict = /\bgit\b[^\n]*\bpush\b/.test(command)
  ? await Promise.all([
      $`git diff --name-only ${BASE}...HEAD`.quiet().text(),
      $`git log --format=%B%x00 ${BASE}..HEAD`.quiet().text(),
    ])
      .then(([files, log]) => needsReleaseNote(lines(files), log.split('\0')))
      .catch(() => false)
  : false;

verdict && process.stderr.write(`${ADVICE}\n`);
process.exit(verdict ? 2 : 0);
