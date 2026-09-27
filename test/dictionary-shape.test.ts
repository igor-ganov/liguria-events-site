// The dictionary is declared twice, in two libraries: zod in the content
// config, which decides what survives being read out of the markdown, and
// Effect Schema in the runtime dictionary. Both strip what they were not told
// about, and neither says a word when they disagree.
//
// That has now cost a day twice. A word added to one and not the other reaches
// no page in any language, and what a reader sees is an empty element where a
// sentence should be — the bar that says a page came off the device went blank
// exactly this way.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';

const CONFIG = await Bun.file('src/content.config.ts').text();
const RUNTIME = await Bun.file('src/lib/i18n/ui-dict-schema.ts').text();

/** The text of one group's declaration, from its opening brace to the brace
 *  that closes it. */
const block = (source: string, head: string): string => {
  const from = source.indexOf(head);
  const body = source.slice(from + head.length);
  const end = [...body].reduce(
    (state, char, index) => {
      const depth = state.depth + Number(char === '{') - Number(char === '}');
      return { depth, at: state.at === 0 && depth < 0 ? index : state.at };
    },
    { depth: 0, at: 0 },
  );
  return body.slice(0, end.at);
};

/** The names declared directly in a group — not the ones inside a nested
 *  object, which is a group of its own. */
const keys = (body: string): readonly string[] => {
  const flat = body.replace(/\{[^{}]*\}/g, '');
  return [...flat.matchAll(/(\w+):/g)].map((match) => match[1] ?? '').sort();
};

const GROUPS = [...CONFIG.matchAll(/^\s+(\w+): z\.object\(\{/gm)].map((match) => match[1] ?? '');

describe('the two declarations of the dictionary', () => {
  test('there are groups to compare at all', () => {
    assert.ok(GROUPS.length > 5, GROUPS.join(' '));
  });

  GROUPS.filter((group) => RUNTIME.includes(`${group}: Schema.Struct({`)).forEach((group) => {
    test(`${group} says the same in both`, () => {
      assert.deepEqual(
        keys(block(CONFIG, `${group}: z.object({`)),
        keys(block(RUNTIME, `${group}: Schema.Struct({`)),
        group,
      );
    });
  });
});

// The third place a word can go missing: declared in both schemas, absent from
// one language's markdown. Nothing fails — that locale simply renders an empty
// element, which is the same silent blank by another route.
const LOCALES = ['en', 'it', 'ru'] as const;

// From the runtime schema rather than the content config: the latter also
// declares the collection itself, which is not a group of words.
// Two spaces exactly: a group nested inside another is written deeper, and it
// appears in the markdown inside its parent rather than at the start of a line.
const DICT_GROUPS = [...RUNTIME.matchAll(/^ {2}(\w+): Schema\.Struct\(\{/gm)].map((m) => m[1] ?? '');

const DICTS = await Promise.all(
  LOCALES.map(async (locale) => ({ locale, text: await Bun.file(`src/content/ui/${locale}.md`).text() })),
);

describe('every language carries every group', () => {
  DICTS.forEach(({ locale, text }) => {
    test(`${locale} declares all of them`, () => {
      const missing = DICT_GROUPS.filter((group) => !new RegExp(`^${group}:`, 'm').test(text));
      assert.deepEqual(missing, [], `${locale} is missing: ${missing.join(', ')}`);
    });
  });
});
