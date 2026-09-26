import { parse } from 'acorn';
import * as walk from 'acorn-walk';
import { choices } from '../curriculum/checkpoints.js';
export const LIMITS = {source: 30 * 1024, actions: 30, result: 128 * 1024, execution: 500, watchdog: 2000, loading: 10000};
const knownNames=['name','cloakColour','cloakPattern','wand','beardType','specialPower','level','maxHealth','health','castSpell','recoverHealth','levelUp','takeDamage','attack'];
export function spellingSuggestion(value) {
  if(typeof value!=='string'||value.length>30||knownNames.includes(value))return null;
  const distance=(a,b)=>{let row=Array.from({length:b.length+1},(_,i)=>i);for(let i=0;i<a.length;i++){const next=[i+1];for(let j=0;j<b.length;j++)next[j+1]=Math.min(next[j]+1,row[j+1]+1,row[j]+(a[i]===b[j]?0:1));row=next;}return row[b.length];};
  return knownNames.find(name=>Math.abs(name.length-value.length)<=1&&distance(value,name)<=1)||null;
}
export function diagnostic(message, node, file = 'character.js', code = 'workshop', hint = '') {
  return {file, from: node?.start ?? 0, to: node?.end ?? node?.start ?? 0, severity: 'error', code, message, hint};
}
export function parseSources(sources, cp) {
  const diagnostics = [], trees = {};
  if (new TextEncoder().encode(sources.characterSource + sources.actionsSource).length > LIMITS.source)
    return {diagnostics: [diagnostic('The two files exceed 30KB. Shorten the source before running.', null, 'character.js', 'source-limit')], trees};
  for (const [file, source] of [['character.js', sources.characterSource], ['actions.js', sources.actionsSource]]) {
    try { trees[file] = parse(source, {ecmaVersion: 2022, sourceType: 'script', locations: true}); }
    catch (e) { diagnostics.push({...diagnostic('JavaScript could not read this line. Check brackets, braces and spelling.', {start:e.pos,end:e.pos+1}, file, 'syntax', 'A block may not be closed. Check the braces around the constructor or method.'), detail: e.message}); continue; }
    walk.full(trees[file], n => {
      if ((n.type === 'Identifier' && n.name.includes('____')) || (n.type === 'MemberExpression' && !n.computed && n.property.name.includes('____')) || (n.type === 'Literal' && typeof n.value === 'string' && n.value.includes('____')))
        diagnostics.push(diagnostic('There is still an exercise gap to fill.', n, file, 'gap'));
      if (n.type === 'Identifier' && n.name.startsWith('__ww')) diagnostics.push(diagnostic('Names beginning __ww are reserved for the workshop runner.', n, file, 'reserved'));
      if (n.type === 'Identifier' && ['window','document','fetch','localStorage','sessionStorage','postMessage','importScripts','Worker','setTimeout','setInterval','console','Date'].includes(n.name))
        diagnostics.push(diagnostic(`${n.name} is outside the workshop. Use synchronous classes, properties and methods.`, n, file, 'unsupported'));
      if (['ImportExpression','AwaitExpression','YieldExpression'].includes(n.type) || n.async || n.generator)
        diagnostics.push(diagnostic('Use synchronous JavaScript in this workshop; modules and asynchronous code are not needed.', n, file, 'unsupported'));
      if(n.type==='MemberExpression'&&n.object.name==='Math'&&(n.property.name==='random'||n.property.value==='random'))diagnostics.push(diagnostic('Workshop battles are deterministic. Use fixed values and arithmetic instead of Math.random().',n,file,'unsupported'));
      if (n.type === 'MemberExpression' && !n.computed && n.property.name === 'cloakColor')
        diagnostics.push(diagnostic('The workshop expects cloakColour. Compare the spelling with the property card.', n.property, file, 'spelling'));
      else if(n.type==='MemberExpression'&&!n.computed&&(n.object.type==='ThisExpression'||['wizard','goblin','apprentice','target'].includes(n.object.name))){
        const suggestion=spellingSuggestion(n.property.name);
        if(suggestion)diagnostics.push(diagnostic(`Check ${n.property.name}. Did you mean ${suggestion}? Workshop names are case-sensitive.`,n.property,file,'spelling'));
      }
      if (n.type === 'CallExpression' && n.callee.name === 'Wizard') diagnostics.push(diagnostic('Creating an object from a class needs new Wizard(...).', n, file, 'new'));
      if (n.type === 'AssignmentExpression') {
        const key = n.left.type === 'MemberExpression' && !n.left.computed ? n.left.property.name : null;
        if (n.left.type === 'Identifier' && Object.hasOwn(choices,n.left.name)) diagnostics.push(diagnostic('Which object should change? Use this inside the constructor or wizard after creating the object.', n, file, 'receiver'));
        if (key && n.right.type === 'Literal') {
          const v = n.right.value;
          if (key === 'level' && (!Number.isInteger(v) || v < 1 || v > 20)) diagnostics.push(diagnostic('Level needs a whole number from 1 to 20. Try 3 without quotes.', n.right, file, 'value'));
          else if (choices[key] && key !== 'level' && !choices[key].includes(v)) diagnostics.push(diagnostic(`That ${key} is not in the workshop choices. Try ${choices[key].map(JSON.stringify).join(', ')}.`, n.right, file, 'value'));
        }
      }
    });
  }
  const setup = trees['character.js'];
  if (setup) for (const n of setup.body) {
    const declaration = n.type === 'VariableDeclaration' && n.declarations.every(d => ['wizard','goblin','apprentice'].includes(d.id.name) && d.init?.type === 'NewExpression' && ['Wizard','Goblin'].includes(d.init.callee.name));
    const assignment = n.type === 'ExpressionStatement' && n.expression.type === 'AssignmentExpression' && n.expression.left.type === 'MemberExpression' && ['wizard','goblin','apprentice'].includes(n.expression.left.object.name) && !n.expression.left.computed;
    const classOk = n.type === 'ClassDeclaration' && ['Wizard','Goblin','Character'].includes(n.id.name);
    if (!classOk && !declaration && !assignment && n.type !== 'EmptyStatement') diagnostics.push(diagnostic('character.js holds classes, new objects and property assignments. Put action calls in actions.js.', n, 'character.js', 'setup-format'));
  }
  const actionNodes = (trees['actions.js']?.body || []).filter(n => n.type !== 'EmptyStatement');
  if (actionNodes.length > LIMITS.actions) diagnostics.push(diagnostic('Use at most 30 action lines per run.', actionNodes[30], 'actions.js', 'action-limit'));
  const actions = [];
  for (const n of actionNodes) {
    const call = n.expression, member = call?.callee;
    if (n.type !== 'ExpressionStatement' || call?.type !== 'CallExpression' || member?.type !== 'MemberExpression' || member.computed || !['wizard','goblin'].includes(member.object.name) || !['castSpell','recoverHealth','levelUp','attack','takeDamage'].includes(member.property.name)) {
      const name = member?.property?.name;
      diagnostics.push(diagnostic(name?.toLowerCase() === 'castspell' ? 'Method names are case-sensitive. Check castSpell.' : 'Each action must be a method call on wizard or goblin, such as wizard.castSpell().', n, 'actions.js', 'action-format')); continue;
    }
    const method = member.property.name, actor = member.object.name, args = call.arguments;
    let target = null, amount = null;
    if ((method === 'castSpell' && cp.chapter >= 5) || method === 'attack') {
      if (args.length !== 1 || args[0].type !== 'Identifier' || !['wizard','goblin'].includes(args[0].name))
        diagnostics.push(diagnostic(args[0]?.type === 'Literal' ? 'Pass the goblin object without quotes: wizard.castSpell(goblin).' : 'This method needs a target object. Put goblin or wizard inside the brackets.', n, 'actions.js', 'target'));
      else target = args[0].name;
    } else if (method === 'takeDamage') {
      if (cp.chapter >= 5 || args.length !== 1 || args[0].type !== 'Literal' || !Number.isInteger(args[0].value) || args[0].value < 0)
        diagnostics.push(diagnostic('Use takeDamage with a non-negative whole number in the damage lesson. In battle, use castSpell or attack.', n, 'actions.js', 'damage-argument'));
      else amount = args[0].value;
    } else if (args.length) diagnostics.push(diagnostic('This method does not need an argument at this checkpoint.', n, 'actions.js', 'arguments'));
    if ((method === 'castSpell' && actor !== 'wizard') || (method === 'attack' && actor !== 'goblin')) diagnostics.push(diagnostic('Wizard casts spells; Goblin uses attack.', n, 'actions.js', 'actor'));
    actions.push({actor,method,target,amount,source:sources.actionsSource.slice(call.start,call.end),from:n.start,to:n.end,line:n.loc.start.line});
  }
  return {diagnostics, trees, actions};
}
export const findClass = (tree, name) => tree?.body.find(n => n.type === 'ClassDeclaration' && n.id.name === name);
export const findMethod = (cls, name) => cls?.body.body.find(n => n.type === 'MethodDefinition' && n.key.name === name);
export function contains(node, predicate) { let found = false; if (node) walk.full(node, n => { if (predicate(n)) found = true; }); return found; }
export const hasAssignment = (node, receiver, field) => contains(node, n => n.type === 'AssignmentExpression' && n.left.type === 'MemberExpression' && !n.left.computed && (receiver === 'this' ? n.left.object.type === 'ThisExpression' : n.left.object.name === receiver) && n.left.property.name === field);
