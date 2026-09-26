import {beforeAll,describe,it,expect} from 'vitest';
import {getQuickJS} from 'quickjs-emscripten';
import {byId,finalSolution} from '../src/curriculum/checkpoints.js';
import {runProgram} from '../src/runner/engine.js';
import {parseSources} from '../src/validation/parse.js';
let Q;
beforeAll(async()=>{Q=await getQuickJS();});
const run=(sources=finalSolution,id='C5.3')=>runProgram(Q,{checkpointId:id,sources});
const edit=(fn,actions)=>({...finalSolution,characterSource:fn(finalSolution.characterSource),actionsSource:actions??finalSolution.actionsSource});
describe('real interpreter and transactional actions',()=>{
  it('produces the authoritative trace, repeatedly without accumulated state',()=>{
    for(let i=0;i<3;i++){
      const r=run();expect(r.status).toBe('success');expect(r.trace.map(t=>t.change)).toEqual([-18,-8,8,1]);
      expect(r.snapshot.wizard).toMatchObject({health:100,level:3});expect(r.snapshot.goblin.health).toBe(42);
    }
  });
  it('victory uses actual remaining damage; a sixth action rolls back everything',()=>{
    const victory=edit(s=>s.replace('wizard.level = 2','wizard.level = 1').replace('wizard.specialPower = "electricity"','wizard.specialPower = "fire"'),'wizard.castSpell(goblin);\n'.repeat(5));
    const r=run(victory,'C5.1b');expect(r.status).toBe('success');expect(r.trace.map(t=>t.change)).toEqual([-14,-14,-14,-14,-4]);expect(r.snapshot.goblin.health).toBe(0);
    const fail=run({...victory,actionsSource:victory.actionsSource+'wizard.levelUp();'},'C5.1b');expect(fail.status).toBe('error');expect(fail.snapshot).toBeUndefined();expect(fail.trace).toBeUndefined();expect(fail.diagnostics[0].message).toMatch(/battle has concluded/);
  });
  it('invalid final action discards earlier valid trial actions',()=>{
    const r=run({...finalSolution,actionsSource:finalSolution.actionsSource+'\nwizard.castSpell(wizard);'});expect(r.status).toBe('error');expect(r.snapshot).toBeUndefined();expect(r.diagnostics[0]).toMatchObject({file:'actions.js',code:'action'});
  });
  it('rejects intermediate corruption even when a later action could repair it',()=>{
    const r=run(edit(s=>s.replace('target.takeDamage(8);','target.health = -8;'),'goblin.attack(wizard);\nwizard.recoverHealth();'));expect(r.status).toBe('error');expect(r.trace).toBeUndefined();
  });
  it('independent probes catch a method accidentally using the global wizard',()=>{
    const r=run(edit(s=>s.replace('this.health = this.health + 20','wizard.health = wizard.health + 20')));expect(r.status).toBe('error');expect(r.diagnostics[0].message).toMatch(/wrong value/);
  });
  it.each([
    ['wrong power',s=>s.replace('return this.specialPower;','return "fire";')],
    ['wrong damage',s=>s.replace('14 + this.level * 2','14 + this.level * 3')],
    ['side effect',s=>s.replace('target.takeDamage(damage);','target.takeDamage(damage); this.cloakColour = "green";')],
    ['target name side effect',s=>s.replace('target.takeDamage(damage);','target.takeDamage(damage); target.name = "Changed";')],
    ['uncapped health',s=>s.replace('this.health = this.maxHealth;\n    }','this.health = this.health;\n    }')],
    ['uncapped level',s=>s.replace('this.level < 20','this.level <= 20')],
    ['uncapped damage',s=>s.replace('Math.max(0, this.health - amount)','this.health - amount')],
    ['throwing method',s=>s.replace('target.takeDamage(damage);','throw new Error("Oops");')],
    ['wrong name parameter',s=>s.replace('this.name = name;','this.name = "Always";')],
  ])('rejects %s with no candidate result',(_,transform)=>{const r=run(edit(transform));expect(r.status).toBe('error');expect(r.snapshot).toBeUndefined();expect(r.diagnostics[0].message.length).toBeGreaterThan(10);});
  it('accepts equivalent arithmetic, comments, single quotes and missing semicolons',()=>{
    const r=run(edit(s=>s.replaceAll('"',"'").replace('this.health = this.health + 20;', 'this.health += 20; // arithmetic variant').replace('this.level = this.level + 1;', 'this.level++;').replaceAll(';','')));expect(r.status).toBe('success');
  });
  it('supports the gradual health cap and conditional branches',()=>{
    expect(run(byId['C3.3b'].solution,'C3.3b').status).toBe('success');
    expect(run(byId['C3.3b'].solution,'C3.3c').status).toBe('error');
    for(const id of ['C3.2a','C3.2b','C3.2c','C4.3a','C4.3b','C4.3c'])expect(run(byId[id].solution,id).status).toBe('success');
  });
  it('does not let a comment or object literal satisfy a class objective',()=>{
    expect(run({characterSource:'// class Wizard {}',actionsSource:''},'C1.1a').status).toBe('validButIncomplete');
    expect(run({characterSource:'const wizard = {name:"Aster"};',actionsSource:''},'C1.1c').status).toBe('error');
  });
  it('separates constructor defaults from explicit object overrides',()=>{
    expect(run(byId['C2.1a'].solution,'C2.1b').status).toBe('validButIncomplete');
    const s=byId['C2.1b'].solution;expect(run({...s,characterSource:s.characterSource.replace('this.cloakColour = "grey"','this.cloakColour = "purple"')},'C2.1b').status).toBe('validButIncomplete');
  });
  it('allows not-yet-introduced fields but reports a removed earlier field',()=>{
    expect(run(byId['C1.1c'].solution,'C1.1c').snapshot.wizard.cloakColour).toBeUndefined();
    const s=byId['C2.2a'].solution;expect(run({...s,characterSource:s.characterSource.replace('this.cloakColour = "grey";','')},'C2.2a').status).toBe('error');
  });
  it.each([
    ['loop','while (true) {}'],['recursion','return this.castSpell(target);'],['allocation','const items = []; while(true) { items.push(new Array(10000).fill(123)); }'],
  ])('stops %s and can run a valid fixture afterwards',(_,body)=>{
    const r=run(edit(s=>s.replace('target.takeDamage(damage);',body)));expect(['error','stopped']).toContain(r.status);expect(r.snapshot).toBeUndefined();expect(run().status).toBe('success');
  });
  it.each(['window','document','localStorage','fetch','postMessage','importScripts','setTimeout'])('does not expose %s to the guest',name=>{
    const r=run(edit(s=>s.replace('target.takeDamage(damage);',`target.takeDamage(damage); ${name}("probe");`)));expect(r.status).toBe('error');
    // Also bypass the spelling preflight via a computed string inside real guest code.
    const guest=run(edit(s=>s.replace('target.takeDamage(damage);',`target.takeDamage(damage); if (typeof globalThis[${JSON.stringify(name)}] !== "undefined") throw new Error("host bridge exposed");`)));expect(guest.status).toBe('success');
  });
  it('rejects oversized source, action count and result',()=>{
    expect(run({...finalSolution,characterSource:finalSolution.characterSource+'/*'+'x'.repeat(31000)+'*/'}).diagnostics[0].code).toBe('source-limit');
    expect(run({...finalSolution,actionsSource:'wizard.levelUp();\n'.repeat(31)}).diagnostics[0].code).toBe('action-limit');
    expect(run(edit(s=>s+'\nwizard.extra = "x".repeat(140000);')).diagnostics[0].code).toBe('result-limit');
  });
});
describe('source diagnostics use AST locations',()=>{
  it.each([
    ['brace','class Wizard {','syntax'],
    ['gap','class Wizard { constructor(name) { this.____ = name; } }','gap'],
    ['spelling','class Wizard { constructor() { this.cloakColor = "purple"; } }','spelling'],
    ['choice','class Wizard { constructor() { this.cloakColour = "Purple"; } }','value'],
    ['numeric string','class Wizard { constructor() { this.level = "3"; } }','value'],
    ['receiver','class Wizard { constructor() { cloakColour = "purple"; } }','receiver'],
    ['new','class Wizard {}\nconst wizard = Wizard("Aster");','new'],
  ])('%s has an honest offset and explanation',(_,source,code)=>{
    const p=parseSources({characterSource:source,actionsSource:''},byId['C2.1a']);const d=p.diagnostics.find(d=>d.code===code);expect(d).toBeTruthy();expect(d.from).toBeGreaterThanOrEqual(0);expect(d.to).toBeLessThanOrEqual(source.length+1);
  });
  it.each(['wizard.castSpell();','wizard.castSpell("goblin");','wizard.castspell(goblin);','for (;;) {}','goblin.takeDamage(-1);'])('rejects invalid battle action %s',actionsSource=>{
    expect(run({...finalSolution,actionsSource}).status).toBe('error');
  });
  it('maps runtime errors to a learner file',()=>{
    const r=run(edit(s=>s.replace('target.takeDamage(damage);','missingName();')));expect(r.diagnostics[0].detail).toContain('character.js');expect(r.diagnostics[0].file).toBe('character.js');expect(r.diagnostics[0].from).toBeGreaterThan(0);
  });
  it('maps a candidate-only invalid state to the exact offending action',()=>{
    const sources=edit(s=>s.replace('this.health = this.maxHealth;\n    }','this.health = this.maxHealth;\n    }\n    if (this.name === "Aster") this.health = -1;'));
    const r=run(sources);expect(r.status).toBe('error');expect(r.diagnostics[0].file).toBe('actions.js');expect(r.diagnostics[0].from).toBe(sources.actionsSource.indexOf('wizard.recoverHealth'));
  });
  it('tests non-battle spell branches at different levels too',()=>{
    const s=byId['C3.2c'].solution;const r=run({...s,characterSource:s.characterSource.replace('castSpell() {','castSpell() { if (this.level === 20) return "fire";')},'C3.2c');expect(r.status).toBe('error');
  });
  it('accepts equivalent ternary and switch decisions, but not an unrelated if',()=>{
    const s=byId['C3.1a'].solution;
    for(const body of ['return this.specialPower === "fire" ? "fire" : this.specialPower === "ice" ? "ice" : "electricity";', 'const power = this.specialPower; switch(power) { case "fire": return "fire"; case "ice": return "ice"; default: return "electricity"; }'])expect(run({...s,characterSource:s.characterSource.replace('return this.specialPower;',body)},'C3.2c').status).toBe('success');
    expect(run({...s,characterSource:s.characterSource.replace('return this.specialPower;','if (true) { return this.specialPower; }')},'C3.2c').status).toBe('validButIncomplete');
  });
});
