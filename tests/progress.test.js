import {describe,it,expect} from 'vitest';
import {emptyState,parseImport,saveState,loadState,replaceDraft,canCommit,STORAGE_KEY} from '../src/state/store.js';
import {finalSolution} from '../src/curriculum/checkpoints.js';
describe('local progress contract',()=>{
  it('saves and reloads both files without executing them',()=>{
    const storage={getItem:k=>storage[k],setItem:(k,v)=>storage[k]=v};const s=emptyState();s.draftsByCheckpoint['C5.3']={...finalSolution,revision:4};s.currentCheckpointId='C5.3';saveState(s,storage);expect(loadState(storage).state.draftsByCheckpoint['C5.3']).toEqual(s.draftsByCheckpoint['C5.3']);expect(loadState(storage).state.activeRun).toBeNull();
  });
  it('rejects wrong version, oversized work, invalid drafts and unknown checkpoint',()=>{
    expect(()=>parseImport('{"curriculumVersion":9}')).toThrow();expect(()=>parseImport(' '.repeat(2100000))).toThrow();
    const s=emptyState();s.draftsByCheckpoint['C1.1a']={characterSource:123,actionsSource:''};expect(()=>parseImport(JSON.stringify(s))).toThrow();
  });
  it('keeps a recoverable backup on replacement',()=>{
    const s=emptyState();s.draftsByCheckpoint['C1.1a']={characterSource:'// old',actionsSource:'',revision:3};replaceDraft(s,'C1.1a',finalSolution);expect(s.backupsByCheckpoint['C1.1a'].characterSource).toBe('// old');expect(s.draftsByCheckpoint['C1.1a'].revision).toBe(4);
  });
  it('rejects stale runs after editing or navigating and keeps historical completion',()=>{
    const s=emptyState();s.draftsByCheckpoint['C1.1a']={characterSource:'',actionsSource:'',revision:2};s.activeRun={runId:1,checkpointId:'C1.1a',revision:2};s.completedCheckpointIds=['C1.1a'];expect(canCommit(s,s.activeRun)).toBe(true);s.draftsByCheckpoint['C1.1a'].revision++;expect(canCommit(s,s.activeRun)).toBe(false);expect(s.completedCheckpointIds).toEqual(['C1.1a']);s.draftsByCheckpoint['C1.1a'].revision=2;s.currentCheckpointId='C1.1b';expect(canCommit(s,s.activeRun)).toBe(false);
  });
  it('reports unavailable storage without losing in-memory code',()=>{
    const storage={setItem(){throw new Error('Quota');},getItem(){throw new Error('Security');}};expect(saveState(emptyState(),storage)).toMatch(/Autosave unavailable/);expect(loadState(storage).error).toBeTruthy();expect(STORAGE_KEY).toMatch(/v1/);
  });
  it('preserves an over-limit draft for editing and recovery without allowing execution',()=>{
    const storage={getItem:k=>storage[k],setItem:(k,v)=>storage[k]=v};const s=emptyState();s.draftsByCheckpoint['C1.1a']={characterSource:'// '+ 'x'.repeat(40000),actionsSource:'',revision:1};saveState(s,storage);const restored=loadState(storage);expect(restored.error).toBeNull();expect(restored.state.draftsByCheckpoint['C1.1a'].characterSource).toBe(s.draftsByCheckpoint['C1.1a'].characterSource);expect(parseImport(storage[STORAGE_KEY]).draftsByCheckpoint['C1.1a'].characterSource.length).toBe(40003);
  });
});
describe('section progress compatibility',()=>{
  it('starts new work at the introduction and restores old v1 saves to checkpoints',()=>{
    expect(emptyState().currentScreen).toEqual({type:'intro',chapter:1});
    const legacy=emptyState();delete legacy.currentScreen;delete legacy.reviewByChapter;delete legacy.seenIntroChapters;
    expect(parseImport(JSON.stringify(legacy)).currentScreen).toEqual({type:'checkpoint',id:'C1.1a'});
  });
  it('round trips answers while ignoring stored correctness and unknown data',()=>{
    const state=emptyState();state.currentScreen={type:'review',chapter:1};state.reviewByChapter={1:{answers:{'S1-Q1':{response:'0',correct:true},'unknown':{response:'x'},'S1-Q4':{response:'x'.repeat(201)}}}};
    const restored=parseImport(JSON.stringify(state));expect(restored.currentScreen).toEqual({type:'review',chapter:1});expect(restored.reviewByChapter[1].answers).toEqual({'S1-Q1':{response:'0'}});
  });
});
