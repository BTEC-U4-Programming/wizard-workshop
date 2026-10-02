import {parse} from 'acorn';

// Inserts a checkpoint's exercise gap into the learner's draft.
// The gap is merged rather than blindly appended, so it never re-declares a
// variable the draft already has (a duplicate `const` is a SyntaxError) and
// it upgrades a matching listener in place instead of adding a second one.

const MARKER = '// ✦ gap goes here';

const parseBody = (source) => {
  try {
    return parse(source, {ecmaVersion: 2022, sourceType: 'script'}).body;
  } catch {
    return null;
  }
};

// Names declared by a top-level `const`, `let` or `var` statement.
const declaredNames = (statement) =>
  statement.type === 'VariableDeclaration'
    ? statement.declarations
        .filter((d) => d.id.type === 'Identifier')
        .map((d) => d.id.name)
    : [];

// A key for statements the gap may upgrade in place: a named function
// ("function:showStats") or a listener ("listener:thing:click").
const replaceKey = (statement) =>
  statement.type === 'FunctionDeclaration'
    ? 'function:' + statement.id.name
    : listenerKey(statement);

// `thing.addEventListener("click", ...)` → "listener:thing:click".
const listenerKey = (statement) => {
  const call = statement.type === 'ExpressionStatement' && statement.expression;
  if (!call || call.type !== 'CallExpression') return null;
  const {callee} = call;
  const [eventType] = call.arguments;
  if (
    callee.type !== 'MemberExpression' ||
    callee.object.type !== 'Identifier' ||
    callee.property.name !== 'addEventListener' ||
    eventType?.type !== 'Literal'
  )
    return null;
  return 'listener:' + callee.object.name + ':' + eventType.value;
};

// Removes [start, end) ranges from text, applied from the end backwards.
const cut = (text, ranges) =>
  [...ranges]
    .sort((a, b) => b.start - a.start)
    .reduce((t, r) => t.slice(0, r.start) + t.slice(r.end), text);

// Fallback for drafts that do not parse yet: drop gap declarations whose
// names the draft already declares.
function dedupeText(source, gap) {
  return gap.replace(
    /^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=[^\n]*\n?/gm,
    (line, name) =>
      new RegExp(`\\b(?:const|let|var)\\s+${name}\\b`).test(source)
        ? ''
        : line
  );
}

// Puts the gap at the starter's marker, or after the draft. When parts of the
// gap were merged away, `tidy` trims the blank lines they leave behind.
function place(source, gap, tidy = false) {
  const rest = tidy ? gap.replace(/^\s*\n/, '').trimEnd() : gap;
  if (source.includes(MARKER)) return source.replace(MARKER, rest);
  if (tidy && !rest) return source;
  return source + '\n' + rest;
}

export function mergeGap(source, gap) {
  const draftBody = parseBody(source);
  const gapBody = parseBody(gap);
  if (!draftBody || !gapBody) {
    const deduped = dedupeText(source, gap);
    return place(source, deduped, deduped !== gap);
  }

  const declared = new Set(draftBody.flatMap(declaredNames));
  const upgradable = new Map();
  for (const statement of draftBody) {
    const key = replaceKey(statement);
    if (key && !upgradable.has(key)) upgradable.set(key, statement);
  }

  const removeFromGap = [];
  const replacements = [];
  for (const statement of gapBody) {
    const names = declaredNames(statement);
    const key = replaceKey(statement);
    if (names.length && names.every((name) => declared.has(name))) {
      removeFromGap.push(statement);
    } else if (key && upgradable.has(key)) {
      const target = upgradable.get(key);
      replacements.push({
        start: target.start,
        end: target.end,
        text: gap.slice(statement.start, statement.end)
      });
      removeFromGap.push(statement);
    }
  }

  // Swap matching draft listeners for the gap's version, from the end back.
  let next = source;
  for (const r of replacements.sort((a, b) => b.start - a.start))
    next = next.slice(0, r.start) + r.text + next.slice(r.end);

  // Remove moved or duplicate statements, plus any comment on the same line
  // and the blank line after each.
  let remaining = cut(
    gap,
    removeFromGap.map((s) => ({
      start: s.start,
      end:
        s.end +
        gap.slice(s.end).match(/^[ \t]*(?:\/\/[^\n]*)?\n?[ \t]*\n?/)[0].length
    }))
  );
  if (removeFromGap.length) {
    // Comment lines the draft already has would only repeat themselves.
    const draftLines = new Set(next.split('\n').map((line) => line.trim()));
    remaining = remaining
      .split('\n')
      .filter((line) => {
        const text = line.trim();
        return !(text.startsWith('//') && draftLines.has(text));
      })
      .join('\n');
  }
  return place(next, remaining, removeFromGap.length > 0);
}

// Checkpoint-specific placements that predate the general merge.
export function insertGap(id, source, gap) {
  if (id === 'E4.1')
    return source.replace(
      /\s*\/\/ ✦ Add ArrowUp[^\n]*/,
      '\n    ' + gap.replaceAll('\n', '\n    ')
    );
  return mergeGap(source, gap);
}
