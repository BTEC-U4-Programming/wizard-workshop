import {beforeAll,describe,it,expect} from 'vitest';
import {getQuickJS} from 'quickjs-emscripten';
import {byId} from '../src/curriculum/checkpoints.js';
import {runProgram} from '../src/runner/engine.js';
import {battleOutcome} from '../src/game/renderScene.js';
let Q;
beforeAll(async()=>{Q=await getQuickJS();});
const run=(id,sources)=>runProgram(Q,{checkpointId:id,sources});
const withSpell=(id,from,to)=>{const s=byId[id].solution;return {...s,characterSource:s.characterSource.replace(from,to)};};

describe('class blueprint preview (C1.1a–C1.1c)',()=>{
  it('shows an empty blueprint for a bare class, a name label after the constructor, and nothing once an object exists',()=>{
    expect(run('C1.1a',byId['C1.1a'].solution).snapshot.blueprint).toEqual({properties:[]});
    expect(run('C1.1b',byId['C1.1b'].solution).snapshot.blueprint).toEqual({properties:['name']});
    expect(run('C1.1c',byId['C1.1c'].solution).snapshot.blueprint).toBeNull();
  });
});

describe('targeted spell steps (C5.1a–C5.1e)',()=>{
  it('C5.1a explains a spell that ignores its target',()=>{
    const r=run('C5.1a',byId['C5.1a'].starter);
    expect(r.status).toBe('error');expect(r.diagnostics[0].message).toMatch(/did not damage its target/);
  });
  it('C5.1a rejects takeDamage placed after the returning branches',()=>{
    const s=byId['C5.1a'].solution;
    const moved=s.characterSource.replace('    target.takeDamage(10);\n','').replace('return "electricity";\n    }','return "electricity";\n    }\n    target.takeDamage(10);');
    expect(run('C5.1a',{...s,characterSource:moved}).diagnostics[0].message).toMatch(/did not damage/);
  });
  it('C5.1a requires a parameter even when the spell hits a global goblin',()=>{
    const r=run('C5.1a',withSpell('C5.1a','castSpell(target) {\n    target.takeDamage(10);','castSpell() {\n    goblin.takeDamage(10);'));
    expect(r.status).not.toBe('success');
  });
  it('C5.1b passes the goblin object and deals the flat 10 damage',()=>{
    const r=run('C5.1b',byId['C5.1b'].solution);
    expect(r.status).toBe('success');expect(r.snapshot.goblin.health).toBe(50);
  });
  it('C5.1c needs the damage variable',()=>{
    const r=run('C5.1c',byId['C5.1b'].solution);
    expect(r.status).toBe('validButIncomplete');expect(r.missing.join(' ')).toMatch(/variable/);
  });
  it('C5.1d explains a wrong power damage and accepts the later level bonus',()=>{
    const wrong=run('C5.1d',withSpell('C5.1d','damage = 12;','damage = 20;'));
    expect(wrong.status).toBe('error');expect(wrong.diagnostics[0].message).toMatch(/fire spell should deal 12 damage/);
    expect(run('C5.1d',byId['C5.1e'].solution).status).toBe('success');
  });
  it('C5.1e requires the level bonus and explains the calculation',()=>{
    const r=run('C5.1e',byId['C5.1d'].solution);
    expect(r.status).toBe('error');expect(r.diagnostics[0].message).toMatch(/level 1 fire spell should deal 14 damage \(12 \+ 1 × 2\)/);
  });
});

describe('battle outcome',()=>{
  it('names the winner only when a character reaches zero health',()=>{
    expect(battleOutcome({wizard:{health:40},goblin:{health:0}})).toBe('Wizard Wins');
    expect(battleOutcome({wizard:{health:0},goblin:{health:12}})).toBe('Goblin Wins');
    expect(battleOutcome({wizard:{health:40},goblin:{health:12}})).toBeNull();
    expect(battleOutcome({wizard:{health:0},goblin:null})).toBeNull();
  });
});
