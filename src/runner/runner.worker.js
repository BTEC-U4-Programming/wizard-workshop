import {newQuickJSWASMModuleFromVariant, newVariant} from 'quickjs-emscripten-core';
import variant from '@jitl/quickjs-wasmfile-release-sync';
import wasmURL from '@jitl/quickjs-wasmfile-release-sync/wasm?url';
import {runProgram} from './engine.js';
import {runEdpProgram,EdpSession} from '../edp/engine.js';
let session;
let runtime;
try {
  runtime = await newQuickJSWASMModuleFromVariant(newVariant(variant,{wasmLocation:wasmURL}));
  self.postMessage({type:'ready'});
} catch(e) {self.postMessage({type:'load-error',detail:String(e)});}
self.onmessage = ({data}) => {
  if (!runtime) return;
  if (data.type === 'run' || data.type === 'edp-run') {
    const result = data.type === 'run' ? runProgram(runtime,data) : runEdpProgram(runtime,data);
    self.postMessage({type:'result',runId:data.runId,checkpointId:data.checkpointId,revision:data.revision,result});
  } else if (data.type?.startsWith('edp-session-')) {
    try {
      if(data.type==='edp-session-start'){session?.dispose();session=null;session=new EdpSession(runtime,data);self.postMessage(session.state());}
      else if(session?.id===data.sessionId){
        if(data.type==='edp-session-end'){session.dispose();session=null;}
        else self.postMessage(session.update(data));
      }
    } catch(error) {
      session?.dispose();session=null;
      self.postMessage({type:'edp-session-error',sessionId:data.sessionId,seq:data.seq??0,message:String(error.message).slice(0,300)});
    }
  }
};
