import {newQuickJSWASMModuleFromVariant, newVariant} from 'quickjs-emscripten-core';
import variant from '@jitl/quickjs-wasmfile-release-sync';
import wasmURL from '@jitl/quickjs-wasmfile-release-sync/wasm?url';
import {runProgram} from './engine.js';
let runtime;
try {
  runtime = await newQuickJSWASMModuleFromVariant(newVariant(variant,{wasmLocation:wasmURL}));
  self.postMessage({type:'ready'});
} catch(e) {self.postMessage({type:'load-error',detail:String(e)});}
self.onmessage = ({data}) => {
  if (data.type !== 'run' || !runtime) return;
  const result = runProgram(runtime,data);
  self.postMessage({type:'result',runId:data.runId,checkpointId:data.checkpointId,revision:data.revision,result});
};
