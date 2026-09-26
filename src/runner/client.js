import {LIMITS} from '../validation/parse.js';
import {timeoutMessage} from './engine.js';
import {byId} from '../curriculum/checkpoints.js';
import {modelProblem} from '../validation/model.js';
export function validResult(result,checkpointId) {
  if (!result || !['success','validButIncomplete','error','stopped'].includes(result.status) || !Array.isArray(result.diagnostics) || JSON.stringify(result).length > LIMITS.result) return false;
  if(!result.diagnostics.every(d=>d&&typeof d.message==='string'&&typeof d.hint==='string'&&['character.js','actions.js','workshop-checks.js'].includes(d.file)&&Number.isInteger(d.from)&&Number.isInteger(d.to)&&d.from>=0&&d.to>=d.from))return false;
  if (['success','validButIncomplete'].includes(result.status)) {
    if (!result.snapshot || !Array.isArray(result.trace) || result.trace.length > 30 || !Array.isArray(result.missing)) return false;
    const plain = value => value === null || (typeof value === 'object' && !Array.isArray(value));
    if (!plain(result.snapshot.wizard) || !plain(result.snapshot.goblin) || !plain(result.snapshot.defaults)) return false;
    if (!result.trace.every(a=>['wizard','goblin'].includes(a.actor) && ['castSpell','attack','recoverHealth','levelUp','takeDamage'].includes(a.method) && a.before && a.after && typeof a.change === 'number')) return false;
    const cp=byId[checkpointId];
    if(cp){
      const allowMissing=cp.kind==='default'?[cp.field]:cp.id==='C3.3a'?['maxHealth','health']:[];
      for(const snapshot of [result.snapshot,...result.trace.flatMap(a=>[a.before,a.after])]){
        if(!snapshot||!plain(snapshot.wizard)||!plain(snapshot.goblin))return false;
        if(snapshot.wizard&&modelProblem(snapshot.wizard,cp,{allowMissing}))return false;
        if(snapshot.goblin&&modelProblem(snapshot.goblin,cp,{goblin:true}))return false;
      }
    }
  }
  return true;
}
export class Runner {
  constructor(onStatus=()=>{}) {this.onStatus=onStatus;this.worker=null;this.pending=null;this.loading=null;}
  stop(message='Run stopped. Your last working wizard is still here.') {
    this.worker?.terminate();this.worker=null;
    clearTimeout(this.timer);clearTimeout(this.loadTimer);
    this.pending?.reject(new Error(message));this.pending=null;
    this.loading?.reject(new Error(message));this.loading=null;
  }
  async ready() {
    if (this.worker?.isReady) return;
    this.onStatus('checking','Loading the local code runner…');
    await new Promise((resolve,reject)=>{
      this.loading={resolve,reject};
      const worker = this.worker = new Worker(new URL('./runner.worker.js',import.meta.url),{type:'module'});
      const failure = detail => {this.stop(`The code runner could not load. Your work is saved. Retry loading the runner. ${detail || ''}`);};
      this.loadTimer=setTimeout(()=>failure('Loading exceeded 10 seconds.'),LIMITS.loading);
      worker.onerror = e => failure(e.message);
      worker.onmessage=({data})=>{
        if (worker !== this.worker) return;
        if(data.type === 'ready') {clearTimeout(this.loadTimer);worker.isReady=true;this.loading=null;resolve();}
        else if(data.type === 'load-error') failure(data.detail);
        else if(data.type === 'result' && this.pending) {
          clearTimeout(this.timer);const p=this.pending;this.pending=null;
          if(validResult(data.result,data.checkpointId)) p.resolve(data); else p.reject(new Error('The runner returned an unreadable result. Retry loading the runner.'));
        }
      };
    });
  }
  async run(request) {
    await this.ready();
    if(!this.worker?.isReady)throw new Error('Run stopped. Your last working wizard is still here.');
    this.onStatus('running','Running your code and checking independent probes…');
    return new Promise((resolve,reject)=>{
      this.pending={resolve,reject};
      this.timer=setTimeout(()=>this.stop(timeoutMessage),LIMITS.watchdog);
      this.worker.postMessage({type:'run',...request});
    });
  }
}
