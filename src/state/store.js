import {byId,checkpoints,curriculumVersion} from '../curriculum/checkpoints.js';
import {LIMITS} from '../validation/parse.js';
import {validResult} from '../runner/client.js';
export const STORAGE_KEY='wizard-workshop:progress:v1';
export const emptyState=()=>({curriculumVersion,currentCheckpointId:checkpoints[0].id,draftsByCheckpoint:{},lastSuccessfulSourcesByCheckpoint:{},lastGoodSnapshotByCheckpoint:{},completedCheckpointIds:[],hintDepthByCheckpoint:{},backupsByCheckpoint:{},preferences:{codeFontSize:16,reduceMotion:false},activeRun:null});
export function validDraft(draft,limit=LIMITS.source) {return draft && typeof draft.characterSource==='string' && typeof draft.actionsSource==='string' && new TextEncoder().encode(draft.characterSource+draft.actionsSource).length <= limit;}
export function parseImport(text,{localRestore=false}={}) {
  if(new TextEncoder().encode(text).length > (localRestore?10:2)*1024*1024) throw new Error('Work files must be under 2MB; local recovery is bounded at 10MB.');
  const value=JSON.parse(text);
  if(value.curriculumVersion!==curriculumVersion || !byId[value.currentCheckpointId] || !value.draftsByCheckpoint || typeof value.draftsByCheckpoint!=='object' || Array.isArray(value.draftsByCheckpoint)) throw new Error('This file is not a compatible Wizard Workshop save.');
  const state=emptyState();state.currentCheckpointId=value.currentCheckpointId;
  for(const [id,draft] of Object.entries(value.draftsByCheckpoint)) {
    // Drafts may temporarily exceed the RUN limit (for example after a paste).
    // Preserve them so learners can undo or trim instead of losing their work.
    if(!byId[id] || !validDraft(draft,2*1024*1024)) throw new Error('A saved draft is unknown, malformed or exceeds the 2MB editing recovery limit.');
    state.draftsByCheckpoint[id]={characterSource:draft.characterSource,actionsSource:draft.actionsSource,revision:Number.isSafeInteger(draft.revision) ? draft.revision : 0};
  }
  // Imported achievements and code are untrusted. A fresh Run is always needed
  // before Next is enabled; historical badges never substitute for validation.
  state.completedCheckpointIds=Array.isArray(value.completedCheckpointIds) ? value.completedCheckpointIds.filter(id=>byId[id]) : [];
  for(const id of Object.keys(byId)) {
    if(validDraft(value.lastSuccessfulSourcesByCheckpoint?.[id])) state.lastSuccessfulSourcesByCheckpoint[id]=value.lastSuccessfulSourcesByCheckpoint[id];
    const saved=value.lastGoodSnapshotByCheckpoint?.[id];
    if(saved && ['success','validButIncomplete'].includes(saved.status) && validResult(saved,id)) state.lastGoodSnapshotByCheckpoint[id]=saved;
    state.hintDepthByCheckpoint[id]=Math.min(3,Math.max(0,Number(value.hintDepthByCheckpoint?.[id])||0));
    if(validDraft(value.backupsByCheckpoint?.[id],2*1024*1024)) state.backupsByCheckpoint[id]=value.backupsByCheckpoint[id];
  }
  state.preferences={codeFontSize:Math.min(24,Math.max(14,Number(value.preferences?.codeFontSize)||16)),reduceMotion:!!value.preferences?.reduceMotion};
  return state;
}
export function loadState(storage) {try {const text=storage.getItem(STORAGE_KEY);return {state:text?parseImport(text,{localRestore:true}):emptyState(),error:null};} catch(e) {return {state:emptyState(),error:'Autosave unavailable or unreadable — download your work. '+e.message};}}
export function saveState(state,storage) {try {storage.setItem(STORAGE_KEY,JSON.stringify({...state,activeRun:null}));return null;}catch{return 'Autosave unavailable — download your work.';}}
export function canCommit(state,response) {const a=state.activeRun;return !!a && a.runId===response.runId && a.checkpointId===response.checkpointId && a.revision===response.revision && state.currentCheckpointId===response.checkpointId && state.draftsByCheckpoint[response.checkpointId]?.revision===response.revision;}
export function replaceDraft(state,id,draft) {state.backupsByCheckpoint[id]=structuredClone(state.draftsByCheckpoint[id]);state.draftsByCheckpoint[id]={...draft,revision:(state.draftsByCheckpoint[id]?.revision||0)+1};}
