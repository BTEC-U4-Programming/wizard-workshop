import {parse} from 'acorn';
import * as walk from 'acorn-walk';
import {diagnostic, LIMITS} from '../../validation/parse.js';
import {stages} from '../curriculum/stages.js';
export const EDP_LIMITS = {
  ...LIMITS,
  execution: 500,
  event: 100,
  trials: 12,
  steps: 60,
  virtualTime: 60000,
  timers: 50
};
export const eventNames = [
  'click',
  'mouseover',
  'mouseout',
  'mouseenter',
  'mouseleave',
  'focus',
  'blur',
  'keydown',
  'input',
  'turnStarted',
  'battleEnded',
  'bellRung'
];
export const eventSuggestions = {
  onclick: 'click',
  Click: 'click',
  mouseOver: 'mouseover',
  hover: 'mouseover',
  keypress: 'keydown',
  keyDown: 'keydown',
  onkeydown: 'keydown'
};
const forbidden = new Set([
  'window',
  'globalThis',
  'self',
  'fetch',
  'XMLHttpRequest',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'postMessage',
  'importScripts',
  'Worker',
  'eval',
  'Function',
  'Date',
  'setInterval',
  'requestAnimationFrame',
  'alert',
  'prompt',
  'confirm'
]);
const supplied = new Set([
  'wizard',
  'goblin',
  'battle',
  'lantern',
  'runeDoor',
  'tower',
  'document',
  'console',
  'setTimeout',
  'clearTimeout',
  'CustomEvent',
  'dummy'
]);
export function parseEdpSource(source, cp) {
  const diagnostics = [],
    warnings = [];
  const add = (message, node, code, warning = false) => {
    const d = diagnostic(message, node, 'spells.js', code);
    if (warning) d.severity = 'warning';
    (warning ? warnings : diagnostics).push(d);
  };
  if (
    typeof source !== 'string' ||
    new TextEncoder().encode(source).length > LIMITS.source
  ) {
    add(
      'spells.js exceeds 30KB. Shorten the source before running.',
      null,
      'source-limit'
    );
    return {diagnostics, warnings, tree: null};
  }
  let tree;
  try {
    tree = parse(source, {
      ecmaVersion: 2022,
      sourceType: 'script',
      locations: true
    });
  } catch (e) {
    add(
      'JavaScript could not read this line. Check brackets, braces and spelling.',
      {start: e.pos, end: e.pos + 1},
      'syntax'
    );
    diagnostics[0].detail = e.message;
    return {diagnostics, warnings, tree: null};
  }
  walk.fullAncestor(tree, (n, ancestors) => {
    if (
      (n.type === 'Identifier' && n.name.includes('____')) ||
      (n.type === 'MemberExpression' &&
        !n.computed &&
        n.property.name.includes('____')) ||
      (n.type === 'Literal' &&
        typeof n.value === 'string' &&
        n.value.includes('____'))
    )
      add('There is still an exercise gap to fill.', n, 'gap');
    if (n.type === 'Identifier' && n.name.startsWith('__ww'))
      add(
        'Names beginning __ww are reserved for the workshop runner.',
        n,
        'reserved'
      );
    if (n.type === 'Identifier' && forbidden.has(n.name))
      add(
        n.name === 'setInterval'
          ? 'Tome II uses setTimeout for timers.'
          : `${n.name} isn't part of the Tome II stage. Use the stage's document, setTimeout and console.log instead.`,
        n,
        'unsupported'
      );
    if (
      (n.type === 'MemberExpression' &&
        n.object.name === 'Math' &&
        (n.property.name === 'random' || n.property.value === 'random')) ||
      ['ImportExpression', 'AwaitExpression', 'YieldExpression'].includes(
        n.type
      ) ||
      n.async ||
      n.generator
    )
      add(
        'Use synchronous JavaScript in this workshop; modules and asynchronous code are not needed.',
        n,
        'unsupported'
      );
    if (
      n.type === 'ClassDeclaration' &&
      ['Wizard', 'Goblin', 'Character', 'BattleWizard'].includes(n.id.name)
    )
      add(
        'Your wizard and Grub already exist in Tome II. Use wizard and goblin directly.',
        n,
        'redeclare'
      );
    if (
      (n.type === 'VariableDeclarator' || n.type === 'FunctionDeclaration') &&
      supplied.has(n.id?.name)
    )
      add(
        'This name belongs to the stage. Use the existing object instead of declaring it again.',
        n,
        'redeclare'
      );
    if (n.type !== 'CallExpression') return;
    const method = n.callee.property?.name,
      first = n.arguments[0],
      second = n.arguments[1];
    if (method === 'addEventListener') {
      if (typeof first?.value === 'string' && !eventNames.includes(first.value))
        add(
          `Nothing will ever fire an event called "${first.value}". Try "${eventSuggestions[first.value] ?? 'click'}"; event names are case-sensitive.`,
          first,
          'event-name',
          true
        );
      if (second?.type === 'CallExpression')
        add(
          'This calls the function now. Did you mean to hand it over without brackets?',
          second,
          'called-handler',
          true
        );
      if (
        ancestors.some(
          (a) =>
            ['FunctionExpression', 'ArrowFunctionExpression'].includes(
              a.type
            ) &&
            ancestors.some(
              (b) =>
                b.type === 'CallExpression' &&
                b.callee.property?.name === 'addEventListener' &&
                b.arguments[1] === a
            )
        )
      )
        add(
          'Every click adds another listener. Move addEventListener outside the handler.',
          n,
          'nested-listener',
          true
        );
    }
    if (
      method === 'querySelector' &&
      typeof first?.value === 'string' &&
      !first.value.startsWith('#') &&
      stages[cp?.stage]?.elements.some((e) => e.id === first.value)
    )
      add(
        `document.querySelector("${first.value}") found nothing. IDs need a # in front: "#${first.value}".`,
        first,
        'selector',
        true
      );
    if (
      method === 'removeEventListener' &&
      ['FunctionExpression', 'ArrowFunctionExpression'].includes(second?.type)
    )
      add(
        "This creates a brand-new function, so it can't remove the one you added. Use the function's name.",
        second,
        'remove-inline',
        true
      );
  });
  return {diagnostics, warnings, tree};
}
