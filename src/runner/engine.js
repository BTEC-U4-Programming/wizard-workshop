import {parseSources, diagnostic, LIMITS, findClass, findMethod} from '../validation/parse.js';
import {modelProblem, objectives, atLeast} from '../validation/model.js';
import {byId} from '../curriculum/checkpoints.js';

export const timeoutMessage = 'This run took too long and was stopped. Check for a loop or a method calling itself.';
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
// How strictly a targeted spell's damage is checked at this checkpoint.
export const spellRule = cp => cp.chapter < 5 ? null : atLeast(cp,'C5.1e') ? 'level' : atLeast(cp,'C5.1d') ? 'power' : 'any';
const snapshotExpression = `({wizard: typeof wizard === 'undefined' ? null : wizard, goblin: typeof goblin === 'undefined' ? null : goblin, apprentice: typeof apprentice === 'undefined' ? null : apprentice})`;
class RunError extends Error {
  constructor(message, node, file='character.js', code='behaviour', detail='') { super(message); this.diagnostic = {...diagnostic(message,node,file,code),detail}; }
}
function contextFor(QuickJS, source, deadline) {
  const runtime = QuickJS.newRuntime();
  runtime.setMemoryLimit(16 * 1024 * 1024);
  runtime.setMaxStackSize(256 * 1024);
  runtime.setInterruptHandler(() => Date.now() > deadline);
  const context = runtime.newContext();
  function evaluate(code, file='workshop-checks.js') {
    if (Date.now() > deadline) throw new RunError(timeoutMessage,null,file,'timeout');
    const result = context.evalCode(code,file);
    if (result.error) {
      const e = context.dump(result.error); result.error.dispose();
      const timedOut = /interrupted/.test(e.message || '');
      const message = timedOut ? timeoutMessage : /before.*super|super.*before|uninitialized/.test(e.message || '') ? 'Call super(name, 100) before using this in the Wizard constructor.' : `This run stopped in ${file}. ${String(e.message || e).slice(0,250)}. Your last working scene is unchanged.`;
      throw new RunError(message,null,file,timedOut ? 'timeout' : 'runtime',String(e.stack || ''));
    }
    const value = context.dump(result.value); result.value.dispose();
    if(typeof value==='string'&&new TextEncoder().encode(value).length>LIMITS.result)throw new RunError('The result exceeds the 128KB limit. Shorten the program.',null,file,'result-limit');
    return value;
  }
  const read = expression => {
    const text = evaluate(`JSON.stringify(${expression})`);
    if (typeof text !== 'string' || new TextEncoder().encode(text).length > LIMITS.result) throw new RunError('The result exceeds the 128KB limit or is not readable.',null,'character.js','result-limit');
    return JSON.parse(text);
  };
  try {
    // The course has no random or clock-driven game state. Keep the interpreter
    // deterministic while leaving normal arithmetic (including min/max) intact.
    evaluate('delete globalThis.Date; delete Math.random;');
    evaluate(source,'character.js');
  }
  catch(e) { context.dispose(); runtime.dispose(); throw e; }
  return {evaluate,read,snapshot:()=>read(snapshotExpression),dispose:()=>{context.dispose();runtime.dispose();}};
}
function contract(before, after, actor, method, target, amount, power, battle) {
  const expected = structuredClone(before), obj = expected[actor];
  if (!obj) return `Create ${actor} before calling its methods.`;
  if (method === 'recoverHealth') obj.health = Math.min(obj.maxHealth,obj.health + 20);
  else if (method === 'levelUp') obj.level = Math.min(20,obj.level + 1);
  else if (method === 'takeDamage') obj.health = Math.max(0,obj.health - amount);
  else if (method === 'castSpell') {
    if (power !== obj.specialPower) return `The ${obj.specialPower} test returned ${String(power)}. Check which property the condition compares and what the method returns.`;
    if (battle) {
      const start = before[target].health, end = after[target]?.health;
      if (battle === 'any') {
        // Early Section 5 steps only require that the spell really hits its target.
        if (!(end < start)) return 'castSpell(target) did not damage its target. Inside castSpell, call target.takeDamage(10); before the if, so the target loses health.';
        expected[target].health = end;
      } else {
        const base = ({fire:12,ice:10,electricity:14})[power], withLevel = base + obj.level * 2;
        // The power step also accepts the level bonus, so learners who are ahead are not blocked.
        const allowed = battle === 'power' ? [base, withLevel] : [withLevel];
        const damage = allowed.find(amount => end === Math.max(0,start - amount)) ?? allowed.at(-1);
        expected[target].health = Math.max(0,start - damage);
        if (end !== expected[target].health) return battle === 'power'
          ? `A ${power} spell should deal ${base} damage, so the target's health should go from ${start} to ${Math.max(0,start - base)}, but it went to ${end}. Check the damage value in the ${power} branch, and that target.takeDamage(damage); runs once, after the if.`
          : `A level ${obj.level} ${power} spell should deal ${withLevel} damage (${base} + ${obj.level} × 2), so the target's health should go from ${start} to ${Math.max(0,start - withLevel)}, but it went to ${end}. Check the level bonus in the ${power} branch.`;
      }
    }
  } else if (method === 'attack') expected[target].health = Math.max(0,expected[target].health - 8);
  return same(expected,after) ? null : `${method} changed the wrong value or amount. Recovery changes only health by up to 20; levelUp changes only level by one; attacks damage only their target.`;
}
function validateSnapshot(snapshot, cp, allowMissing=[]) {
  if (snapshot.wizard) {
    const error = modelProblem(snapshot.wizard,cp,{allowMissing});
    if (error) throw new RunError(error);
  } else if (atLeast(cp,'C1.2')) throw new RunError('Create const wizard = new Wizard("Aster"); below the class.');
  if (snapshot.goblin) {const e = modelProblem(snapshot.goblin,cp,{goblin:true}); if(e) throw new RunError(e);}
  else if (atLeast(cp,'C4.4') && cp.id !== 'C4.4') throw new RunError('Create const goblin = new Goblin("Grub"); below the classes.');
}

// Each behavioural scenario gets a fresh runtime and fresh setup. Probes never
// share candidate objects or produce visible actions.
function runProbes(QuickJS,sources,cp,parsed,deadline) {
  const wiz = findClass(parsed.trees['character.js'],'Wizard');
  const base = findClass(parsed.trees['character.js'],'Character');
  const gob = findClass(parsed.trees['character.js'],'Goblin');
  const methodPresent = (cls,name) => !!findMethod(cls,name) || (cls?.superClass?.name === 'Character' && !!findMethod(base,name));
  const scenarios = [];
  const push = (owner,method,setup,args,target,amount) => scenarios.push({owner,method,setup,args,target,amount});
  if (atLeast(cp,'C3.1a') && methodPresent(wiz,'castSpell')) {
    const powers = ['fire','ice','electricity'].slice(0,cp.branches || 3);
    for (const power of powers) for (const level of [1,3,20])
      push('Wizard','castSpell',`__wwActor.specialPower = ${JSON.stringify(power)}; __wwActor.level = ${level};`,cp.chapter >= 5 ? '__wwTarget' : '',cp.chapter >= 5 ? 'Goblin' : null);
  }
  if (atLeast(cp,'C3.3b')) for (const owner of ['Wizard',...(atLeast(cp,'C4.1') ? ['Goblin'] : []),...(atLeast(cp,'C4.2b') ? ['Character'] : [])]) {
    const cls = owner === 'Wizard' ? wiz : owner === 'Goblin' ? gob : base;
    if (!methodPresent(cls,'recoverHealth')) continue;
    const max = owner === 'Goblin' ? 60 : 100;
    for (const health of cp.id === 'C3.3b' ? [50] : [Math.min(50,max),max-5,max]) push(owner,'recoverHealth',`__wwActor.health = ${health};`,'',null);
  }
  if (atLeast(cp,'C3.4a')) for (const owner of ['Wizard',...(atLeast(cp,'C4.1') ? ['Goblin'] : []),...(atLeast(cp,'C4.2b') ? ['Character'] : [])]) {
    const cls = owner === 'Wizard' ? wiz : owner === 'Goblin' ? gob : base;
    if (methodPresent(cls,'levelUp')) for (const level of [1,19,20]) push(owner,'levelUp',`__wwActor.level = ${level};`,'',null);
  }
  if (atLeast(cp,'C4.5') && findMethod(base,'takeDamage')) for (const owner of ['Wizard','Goblin']) for (const health of [60,5]) push(owner,'takeDamage',`__wwActor.health = ${health};`,'14',null,14);
  if (atLeast(cp,'C5.2') && methodPresent(gob,'attack')) push('Goblin','attack','','__wwTarget','Wizard');
  for (const scenario of scenarios) {
    const {owner,method,setup,args,target,amount} = scenario;
    const vm = contextFor(QuickJS,sources.characterSource,deadline);
    try {
      vm.evaluate(`const __wwActor = new ${owner}("Probe"${owner === 'Character' ? ', 100' : ''}); const __wwTarget = ${target ? `new ${target}("Target")` : 'null'}; ${setup}`);
      const before = vm.read(`({actor:__wwActor,target:__wwTarget,game:${snapshotExpression}})`);
      const returned = vm.evaluate(`__wwActor.${method}(${args})`);
      const after = vm.read(`({actor:__wwActor,target:__wwTarget,game:${snapshotExpression}})`);
      const problem = contract(before,after,'actor',method,'target',amount,returned,spellRule(cp));
      if (problem) throw new RunError(`${owner}.${method}: ${problem}`, findMethod(owner === 'Wizard' ? wiz : owner === 'Goblin' ? gob : base,method) || findMethod(base,method));
    } finally {vm.dispose();}
  }
  if (atLeast(cp,'C4.2a') && base) {
    const vm = contextFor(QuickJS,sources.characterSource,deadline);
    try {
      const p = vm.read('new Character("Probe", 60)');
      if (p.name !== 'Probe' || p.level !== 1 || p.maxHealth !== 60 || p.health !== 60) throw new RunError('Character must use its name and maxHealth arguments and start at level 1 and full health.',findMethod(base,'constructor'));
    } finally {vm.dispose();}
  }
}
export function runProgram(QuickJS, request) {
  const cp = byId[request.checkpointId];
  if (!cp) return {status:'error',diagnostics:[diagnostic('Unknown checkpoint. Reload the course.')]};
  const sources = request.sources;
  const parsed = parseSources(sources,cp);
  if (parsed.diagnostics.length) return {status:'error',diagnostics:parsed.diagnostics};
  const deadline = Date.now() + LIMITS.execution;
  let vm;
  try {
    vm = contextFor(QuickJS,sources.characterSource,deadline);
    const data = vm.snapshot();
    const allowMissing = cp.kind === 'default' ? [cp.field] : cp.id === 'C3.3a' ? ['maxHealth','health'] : [];
    validateSnapshot(data,cp,allowMissing);
    const wiz = findClass(parsed.trees['character.js'],'Wizard');
    data.defaults = null;
    if (wiz && atLeast(cp,'C1.1b')) {
      // Default construction happens in a separate context as well.
      const probe = contextFor(QuickJS,sources.characterSource,deadline);
      try {
        data.defaults = probe.read('new Wizard("Probe")');
        if(findMethod(wiz,'constructor') && data.defaults.name !== undefined && (data.defaults.name !== 'Probe' || probe.read('new Wizard("Other")').name !== 'Other')) throw new RunError('The constructor must use its name parameter: this.name = name.',findMethod(wiz,'constructor'));
      } finally {probe.dispose();}
      const error = modelProblem(data.defaults,cp,{isDefault:true,allowMissing:[...allowMissing,...(cp.id === 'C1.1b' ? ['name'] : [])]});
      if (error) throw new RunError(error,findMethod(wiz,'constructor'));
    }
    Object.assign(data,vm.read(`({wizardInstance: typeof wizard !== 'undefined' && typeof Wizard !== 'undefined' && wizard instanceof Wizard, apprenticeInstance: typeof apprentice !== 'undefined' && apprentice instanceof Wizard, independent: typeof apprentice !== 'undefined' && typeof wizard !== 'undefined' && apprentice !== wizard, goblinInstance: typeof goblin !== 'undefined' && typeof Goblin !== 'undefined' && goblin instanceof Goblin, wizardInherited: typeof Character !== 'undefined' && typeof wizard !== 'undefined' && wizard instanceof Character && !Object.hasOwn(Wizard.prototype,'recoverHealth') && !Object.hasOwn(Wizard.prototype,'levelUp') && typeof Character.prototype.recoverHealth === 'function' && typeof Character.prototype.levelUp === 'function', goblinInherited: typeof Character !== 'undefined' && typeof goblin !== 'undefined' && goblin instanceof Character && !Object.hasOwn(Goblin.prototype,'recoverHealth') && !Object.hasOwn(Goblin.prototype,'levelUp') && typeof Character.prototype.recoverHealth === 'function' && typeof Character.prototype.levelUp === 'function'})`));
    if (data.wizard && !data.wizardInstance) throw new RunError('wizard must be an object created with new Wizard(...).');
    // Before any object exists, the preview draws the class as a hollow
    // "blueprint" outline, labelled with the properties its constructor sets.
    data.blueprint = wiz && !data.wizard ? {properties: data.defaults ? Object.keys(data.defaults) : []} : null;
    data.setup = {wizard:data.wizard,goblin:data.goblin,apprentice:data.apprentice,blueprint:data.blueprint};
    runProbes(QuickJS,sources,cp,parsed,deadline);
    const trace = [];
    for (const action of parsed.actions) {
      const before = vm.snapshot();
      const {actor,method,target,amount} = action;
      const node = {start:action.from,end:action.to};
      const fail = message => {throw new RunError(message,node,'actions.js','action');};
      if (!before[actor]) fail(`Create ${actor} in character.js before this action.`);
      if (cp.chapter >= 5) {
        if (before.wizard?.health === 0 || before.goblin?.health === 0) fail('The battle has concluded. Remove this extra action line and rerun. A defeated character cannot act.');
        if (target && (target === actor || !before[target] || before[target].health === 0)) fail('An attack must target the other living character. No self-targeting.');
      }
      let returned;
      try { returned = vm.evaluate('\n'.repeat(action.line-1) + action.source,'actions.js'); }
      catch(e) {if(e.diagnostic) {e.diagnostic.from=action.from;e.diagnostic.to=action.to;} throw e;}
      const after = vm.snapshot();
      try {validateSnapshot(after,cp,allowMissing);}catch(e){if(e.diagnostic){e.diagnostic.file='actions.js';e.diagnostic.from=action.from;e.diagnostic.to=action.to;}throw e;}
      const problem = contract(before,after,actor,method,target,amount,returned,spellRule(cp));
      if (problem) fail(problem);
      const healthTarget = target || actor;
      trace.push({...action,before,after,power:method === 'castSpell' ? returned : null,change: method === 'levelUp' ? after[actor].level-before[actor].level : (after[healthTarget]?.health ?? 0)-(before[healthTarget]?.health ?? 0)});
    }
    Object.assign(data,vm.snapshot());
    const missing = objectives(cp,parsed,data,trace);
    // Missing newly introduced fields are an unfinished objective, never fake values.
    for (const key of cp.requiredFields) if (data.wizard && data.wizard[key] === undefined && !missing.some(s=>s.includes(key))) missing.push(`add ${key} to your constructor`);
    const result = {status:missing.length ? 'validButIncomplete' : 'success',diagnostics:[],missing,snapshot:data,trace};
    if (new TextEncoder().encode(JSON.stringify(result)).length > LIMITS.result) throw new RunError('The result exceeds 128KB. Shorten the program.');
    return result;
  } catch(e) {
    const d = e.diagnostic || diagnostic('The runner could not finish this program. Check the technical detail.',null,'character.js','runtime');
    if (!d.detail && !e.diagnostic) d.detail = String(e);
    // QuickJS reports stable learner filenames. Only use an actual source stack match.
    if (d.code === 'runtime' && d.file !== 'actions.js') {
      const match = d.detail?.match(/character\.js:(\d+)(?::(\d+))?/);
      if (match) {
        d.file='character.js'; const lines=sources.characterSource.split('\n');
        d.from=lines.slice(0,Number(match[1])-1).reduce((n,s)=>n+s.length+1,0) + Math.max(0,Number(match[2] || 1)-1); d.to=d.from+1;
      }
    }
    return {status:d.code === 'timeout' ? 'stopped' : 'error',diagnostics:[d]};
  } finally {vm?.dispose();}
}
