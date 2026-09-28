import { choices, byId } from '../curriculum/checkpoints.js';
import {diagnostic, findClass, findMethod, contains, hasAssignment} from './parse.js';
export const atLeast = (cp, id) => cp.index >= byId[id].index;
function hasPowerDecision(method) {
  const readsPower=node=>contains(node,n=>n.type==='MemberExpression'&&n.object.type==='ThisExpression'&&n.property.name==='specialPower');
  const aliases=new Set();
  contains(method,n=>{if(n.type==='VariableDeclarator'&&n.id.type==='Identifier'&&readsPower(n.init))aliases.add(n.id.name);return false;});
  return contains(method,n=>{
    const test=n.type==='SwitchStatement'?n.discriminant:['IfStatement','ConditionalExpression'].includes(n.type)?n.test:null;
    return !!test&&(readsPower(test)||contains(test,n=>n.type==='Identifier'&&aliases.has(n.name)));
  });
}
export function modelProblem(model, cp, {isDefault = false, goblin = false, allowMissing = []} = {}) {
  if (!model) return 'The object is missing. Create it with new Wizard(...) or new Goblin(...).';
  const fields = goblin ? ['name','level','maxHealth','health'] : cp.requiredFields;
  for (const field of fields) {
    const value = model[field];
    if (value === undefined) { if (allowMissing.includes(field)) continue; return `${field} is missing. Add this property in the constructor.`; }
    if (field === 'name' && (typeof value !== 'string' || value.trim() !== value || value.length < 1 || value.length > 20)) return 'Use a name of 1–20 characters with no spaces at the ends.';
    if (field === 'level' && (!Number.isInteger(value) || value < 1 || value > 20)) return 'Level needs a whole number from 1 to 20, without quotes.';
    if (choices[field] && field !== 'level' && !choices[field].includes(value)) return `Check ${field}: use ${choices[field].map(v => JSON.stringify(v)).join(', ')}.`;
    if (field === 'maxHealth' && value !== (goblin ? 60 : 100)) return `maxHealth must be ${goblin ? 60 : 100}.`;
    if (field === 'health' && (!Number.isInteger(value) || value < 0 || value > model.maxHealth)) return 'Health must be a whole number from zero to maxHealth.';
  }
  // Validate any introduced early optional values, too: rendering must not hide an invalid state.
  for (const [field, allowed] of Object.entries(choices)) if (field !== 'level' && model[field] !== undefined && !allowed.includes(model[field])) return `Check the supported choices for ${field}.`;
  return null;
}
export function objectives(cp, parsed, data, trace) {
  const tree = parsed.trees['character.js'], wiz = findClass(tree,'Wizard'), base = findClass(tree,'Character'), gob = findClass(tree,'Goblin');
  const constructor = findMethod(wiz,'constructor');
  const missing = [];
  const need = (condition, message) => { if (!condition) missing.push(message); };
  need(wiz, 'declare class Wizard');
  if (atLeast(cp,'C1.1b')) need(hasAssignment(constructor,'this','name') || (wiz?.superClass && data.defaults?.name === 'Probe'), 'give each new object its supplied name in a constructor');
  if (atLeast(cp,'C1.1c')) need(data.wizardInstance, 'create wizard using new Wizard(...)');
  if (cp.id === 'C1.2') need(data.apprenticeInstance && data.independent && hasAssignment(tree,'apprentice','name') && data.apprentice?.name === 'Rowan' && data.wizard?.name !== 'Rowan', 'create a separate apprentice and change only its name to Rowan');
  if (cp.field) {
    need(hasAssignment(constructor,'this',cp.field) && data.defaults?.[cp.field] === cp.defaultValue, `add constructor default ${cp.field} = ${JSON.stringify(cp.defaultValue)}`);
    if (cp.kind === 'override') need(hasAssignment(tree,'wizard',cp.field) && data.wizard?.[cp.field] !== cp.defaultValue && (cp.field !== 'level' || data.wizard.level === 3), `customise wizard.${cp.field} after creating the object`);
  }
  for(const [key,value] of Object.entries(cp.defaultExpectations))need(data.defaults?.[key]===value,`give each new Wizard the default ${key} = ${JSON.stringify(value)}`);
  if (cp.method) {
    const owner = cp.method === 'attack' ? gob : cp.method === 'takeDamage' ? base : wiz;
    need(findMethod(owner,cp.method), `define ${cp.method} inside ${cp.method === 'attack' ? 'Goblin' : cp.method === 'takeDamage' ? 'Character' : 'Wizard'}`);
  }
  if (cp.call) need(trace.some(a => a.method === cp.call), `call ${cp.call} in actions.js`);
  for (const [id,name] of [['C3.1a','castSpell'],['C3.3b','recoverHealth'],['C3.4a','levelUp']]) if(atLeast(cp,id))
    need(findMethod(wiz,name) || (wiz?.superClass?.name==='Character' && findMethod(base,name)), `keep the ${name} method available on Wizard`);
  if(atLeast(cp,'C5.1a')) need(findMethod(wiz,'castSpell')?.value.params.length >= 1, 'give castSpell a parameter: castSpell(target)');
  if(atLeast(cp,'C5.1c')) {
    const spell=findMethod(wiz,'castSpell'),names=new Set();
    contains(spell,n=>{if(n.type==='VariableDeclarator'&&n.id.type==='Identifier')names.add(n.id.name);return false;});
    need(contains(spell,n=>n.type==='CallExpression'&&n.callee.property?.name==='takeDamage'&&n.arguments[0]?.type==='Identifier'&&names.has(n.arguments[0].name)), 'store the damage in a variable (let damage = 10;) and pass it: target.takeDamage(damage);');
  }
  if(atLeast(cp,'C5.2')) need(findMethod(gob,'attack'),'keep Goblin.attack(target)');
  if (cp.branches || atLeast(cp,'C3.2c')) need(hasPowerDecision(findMethod(wiz,'castSpell')), 'use a conditional whose decision reads this.specialPower');
  if (cp.id === 'C3.3a') need(data.setup?.wizard?.health === 50 && data.defaults?.health === 100 && data.defaults?.maxHealth === 100 && hasAssignment(tree,'wizard','health'), 'add full-health defaults and set wizard.health = 50 for practice');
  if (cp.id === 'C3.3b') need(data.setup?.wizard?.health === 50 && data.wizard?.health === 70, 'call recovery from the practice health of 50 to reach 70');
  if (cp.id === 'C3.5') need(trace.length === 3, 'write exactly three action calls');
  if (atLeast(cp,'C4.1')) need(gob, 'add class Goblin');
  if (atLeast(cp,'C4.2a')) need(base && ['name','level','maxHealth','health'].every(k => hasAssignment(findMethod(base,'constructor'),'this',k)), 'add Character’s four shared properties');
  if (atLeast(cp,'C4.2b')) need(findMethod(base,'recoverHealth') && findMethod(base,'levelUp'), 'move both shared methods into Character');
  if (atLeast(cp,'C4.3a')) need(wiz?.superClass?.name === 'Character' && findMethod(wiz,'constructor')?.value.body.body[0]?.expression?.callee?.type === 'Super', 'extend Character and call super(name, 100) first');
  if (atLeast(cp,'C4.3b')) need(!['name','level','maxHealth','health'].some(k => hasAssignment(constructor,'this',k)), 'remove shared property assignments from Wizard');
  if (atLeast(cp,'C4.3c')) need(!findMethod(wiz,'recoverHealth') && !findMethod(wiz,'levelUp') && data.wizardInherited, 'inherit recoverHealth and levelUp from Character');
  if (atLeast(cp,'C4.4')) need(gob?.superClass?.name === 'Character' && data.goblinInherited && data.goblinInstance && !['name','level','maxHealth','health'].some(k => hasAssignment(findMethod(gob,'constructor'),'this',k)), 'make Goblin inherit Character’s properties and methods');
  if (atLeast(cp,'C4.5')) need(findMethod(base,'takeDamage') && !findMethod(wiz,'takeDamage') && !findMethod(gob,'takeDamage'), 'share takeDamage through Character');
  if (atLeast(cp,'C5.3')) {
    need(data.setup?.wizard?.health === 100 && data.setup?.goblin?.health === 60, 'start both characters at full health');
    need(['castSpell','attack','recoverHealth'].every(m => trace.some(a => a.method === m)), 'include a spell, goblin response and recovery');
  }
  return missing;
}
export function valueDiagnostic(message, parsed, field) {
  let node;
  contains(parsed.trees['character.js'], n => { if (n.type === 'AssignmentExpression' && n.left.property?.name === field) node = n; return false; });
  return diagnostic(message,node,'character.js','model');
}
