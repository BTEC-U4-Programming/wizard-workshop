import {describe,it,expect,vi,afterEach} from 'vitest';
import {Runner,validResult} from '../src/runner/client.js';
class SilentWorker {
  static instances=[];
  constructor(){this.terminated=false;SilentWorker.instances.push(this);}
  terminate(){this.terminated=true;}
  postMessage(){}
  deliver(data){this.onmessage?.({data});}
}
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();SilentWorker.instances=[];});
describe('main-thread watchdog and loading lifecycle',()=>{
  it('terminates a worker that never loads after ten seconds',async()=>{
    vi.useFakeTimers();vi.stubGlobal('Worker',SilentWorker);const r=new Runner();const pending=r.ready();const assertion=expect(pending).rejects.toThrow('runner could not load');await vi.advanceTimersByTimeAsync(10001);await assertion;expect(SilentWorker.instances[0].terminated).toBe(true);
  });
  it('terminates a stuck execution at two seconds independently of guest interrupts',async()=>{
    vi.useFakeTimers();vi.stubGlobal('Worker',SilentWorker);const r=new Runner();const pending=r.run({runId:1,checkpointId:'C1.1a',revision:0,sources:{characterSource:'class Wizard {}',actionsSource:''}});const assertion=expect(pending).rejects.toThrow('This run took too long');SilentWorker.instances[0].deliver({type:'ready'});await vi.advanceTimersByTimeAsync(2001);await assertion;expect(SilentWorker.instances[0].terminated).toBe(true);
  });
  it('Stop rejects a request, releases its worker and permits a fresh one',async()=>{
    vi.useFakeTimers();vi.stubGlobal('Worker',SilentWorker);const r=new Runner();const pending=r.run({runId:1});const assertion=expect(pending).rejects.toThrow('Run stopped');SilentWorker.instances[0].deliver({type:'ready'});await Promise.resolve();r.stop();await assertion;const reload=r.ready();SilentWorker.instances[1].deliver({type:'ready'});await reload;expect(SilentWorker.instances).toHaveLength(2);r.stop();
  });
  it('rejects unreadable or oversized result payloads',()=>{
    expect(validResult({status:'success',diagnostics:[],trace:[],missing:[],snapshot:{wizard:'wrong',goblin:null,defaults:null}})).toBe(false);
    expect(validResult({status:'error',diagnostics:[{file:'evil.js',message:'wrong',from:-1,to:0}]})).toBe(false);
    expect(validResult({status:'error',diagnostics:[],extra:'x'.repeat(150000)})).toBe(false);
  });
});
