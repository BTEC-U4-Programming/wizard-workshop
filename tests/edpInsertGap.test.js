import {describe, expect, it} from 'vitest';
import {parse} from 'acorn';
import {checkpoints, byId} from '../src/edp/curriculum/checkpoints.js';
import {insertGap, mergeGap} from '../src/edp/insertGap.js';

const parses = (source) =>
  parse(source, {ecmaVersion: 2022, sourceType: 'script'});
const count = (text, pattern) => (text.match(pattern) ?? []).length;
// Top-level names declared more than once make the draft a SyntaxError.
const duplicateDeclarations = (source) => {
  const names = parses(source).body.flatMap((s) =>
    s.type === 'VariableDeclaration'
      ? s.declarations.map((d) => d.id.name)
      : s.type === 'FunctionDeclaration'
        ? [s.id.name]
        : []
  );
  return names.filter((name, i) => names.indexOf(name) !== i);
};

describe('Insert exercise gaps', () => {
  // Some gaps are fragments (E5.6's is a lone `if` line); only complete gaps
  // can be merged by syntax, so only they are held to this contract.
  const completeGaps = checkpoints.filter((cp) => {
    if (!cp.gap) return false;
    try {
      parses(cp.gap);
      return true;
    } catch {
      return false;
    }
  });
  it.each(completeGaps.map((cp) => [cp.id]))(
    '%s: the gap merges into its starter without duplicate declarations',
    (id) => {
      const cp = byId[id];
      const next = insertGap(id, cp.starter.spellsSource, cp.gap);
      expect(next).toContain('____');
      expect(duplicateDeclarations(next)).toEqual([]);
    }
  );

  it('E2.3: upgrades the Step 3 exploration listener instead of re-declaring spellbook', () => {
    const cp = byId['E2.3'];
    const draft =
      cp.starter.spellsSource +
      '\nconst spellbook = document.querySelector("#spellbook");\n\n' +
      'spellbook.addEventListener("click", function (event) {\n' +
      '  console.log(event.target.dataset.power);\n});\n';
    const next = insertGap('E2.3', draft, cp.gap);
    expect(count(next, /const spellbook\b/g)).toBe(1);
    expect(count(next, /spellbook\.addEventListener/g)).toBe(1);
    expect(next).not.toContain('console.log(event.target.dataset.power)');
    expect(next).toContain('event.target.____.power');
    expect(next).toContain('fireCard.addEventListener');
    expect(duplicateDeclarations(next)).toEqual([]);
  });

  it('E2.3: with the blanks filled and old listeners deleted, the merge equals the solution', () => {
    const cp = byId['E2.3'];
    const filled = mergeGap('', cp.gap)
      .replace('____.power', 'dataset.power')
      .replace('if (____)', 'if (power)')
      .replace(/\n *\/\/[^\n]*/g, '');
    expect(filled.replace(/\s+/g, '')).toBe(
      cp.solution.spellsSource.replace(/\s+/g, '')
    );
  });

  it('does not re-declare a variable even when the draft has a syntax error', () => {
    const draft = 'const spellbook = document.querySelector("#spellbook");\nspellbook.addEventListener("click", function (event) {\n';
    const next = mergeGap(draft, byId['E2.3'].gap);
    expect(count(next, /const spellbook\b/g)).toBe(1);
  });

  it('appends the gap unchanged when nothing overlaps', () => {
    const gap = 'const a = 1;\nfoo.addEventListener("click", go);';
    expect(mergeGap('const b = 2;', gap)).toBe('const b = 2;\n' + gap);
  });
});
