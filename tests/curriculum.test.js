import {beforeAll, describe, it, expect} from 'vitest';
import {getQuickJS} from 'quickjs-emscripten';
import {checkpoints,byId} from '../src/curriculum/checkpoints.js';
import {runProgram} from '../src/runner/engine.js';
let Q;
beforeAll(async()=>{Q=await getQuickJS();});
describe('every checkpoint has an executable passing fixture',()=>{
  for(const cp of checkpoints) it(cp.id+' '+cp.title,()=>{
    const result=runProgram(Q,{checkpointId:cp.id,sources:cp.solution});
    expect(result,JSON.stringify(result)).toMatchObject({status:'success'});
    expect(cp.hints).toHaveLength(3);
    expect(byId[cp.id].index).toBeGreaterThanOrEqual(0);
  });
});
describe('every starter has its documented state',()=>{
  for(const cp of checkpoints)it(cp.id+' starter',()=>{
    const result=runProgram(Q,{checkpointId:cp.id,sources:cp.starter});
    expect(result.status,JSON.stringify(result)).toBe(cp.starterExpected.status);
    if(cp.starterExpected.code)expect(result.diagnostics[0].code).toBe(cp.starterExpected.code);
    expect(cp.structuralChecks.length).toBeGreaterThan(0);
  });
});
