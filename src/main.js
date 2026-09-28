import './styles.css';
import 'virtual:lesson-styles.css';
import lessons from 'virtual:lesson-content';
import sectionContent from 'virtual:section-content';
import {createCelebration} from './game/celebration.js';
import {checkpoints,byId,choices,curriculumVersion} from './curriculum/checkpoints.js';
import {createCodeEditor} from './editor/createEditor.js';
import {parseSources,findClass} from './validation/parse.js';
import {Runner} from './runner/client.js';
import {loadState,saveState,replaceDraft,parseImport,canCommit} from './state/store.js';
import {renderScene,TracePlayer,palettes,battleOutcome} from './game/renderScene.js';
import {sections,sectionByChapter} from './curriculum/sections.js';
import {journey,nextScreen,previousScreen,screenId,parseScreen,RECAP} from './curriculum/journey.js';
import {renderSection} from './review/renderSection.js';
import {renderRecap} from './review/renderRecap.js';
import {isScreenComplete,chapterOfScreen,sectionProgress} from './state/journeyProgress.js';

document.querySelector('#app').innerHTML=`
  <header class="app-header"><a class="brand" href="#lesson"><span class="brand-mark" aria-hidden="true">✦</span><span>WIZARD <strong>WORKSHOP</strong><small>Small steps. Real JavaScript. Your creation.</small></span></a><div class="header-tools"><span id="saved" role="status">Saved locally</span><button id="download">Download work</button><details class="tools"><summary>Workspace tools</summary><div><button id="download-mobile">Download work (JSON)</button><button id="download-code">Download code</button><label class="file-button">Import work<input id="import" type="file" accept=".json,application/json"></label><button id="restore">Restore previous draft</button><label>Code size <select id="font-size"><option>14</option><option>16</option><option>18</option><option>20</option><option>24</option></select></label><label><input id="reduce-motion" type="checkbox"> Reduce motion</label><button id="retry">Reload code runner</button></div></details></div></header>
  <div class="course-bar"><label for="checkpoint">YOUR JOURNEY</label><select id="checkpoint" aria-label="Choose a checkpoint (teacher navigation)"></select><span id="progress"></span><a class="jump" href="#preview">Jump to preview ↓</a><button class="mobile-switch" id="view-switch">Show preview</button></div>
  <p id="save-warning" role="status" hidden></p>
  <main><section id="lesson" class="workbench" aria-label="Code and lesson"><div class="lesson-card"><div class="eyebrow"><span id="stage"></span><span id="scaffold"></span></div><h1 id="title"></h1><p id="objective"></p><aside id="file-notice" class="file-notice" role="note" hidden><h2></h2><p></p><button type="button"></button></aside><details id="instructions"><summary>Step instructions &amp; success checklist</summary><ol id="instruction-list"></ol><ul id="checklist"></ul><button id="locate">Find insertion point</button><p class="expected" id="expected"></p><p id="starter-note"></p><p>Run rebuilds every object from your source. Constructor changes affect these new objects; later override lines run again.</p></details><div id="comparison" hidden></div></div>
    <div class="editor-shell"><div class="editor-tabs" role="tablist" aria-label="JavaScript files"><button role="tab" id="character-tab" aria-selected="true">character.js</button><button role="tab" id="actions-tab" aria-selected="false">actions.js <span class="tab-badge" aria-hidden="true" hidden>NEW</span></button><span id="dirty">Not run yet</span></div><div id="editor"></div><div class="editor-help">JavaScript · Ctrl/Cmd+Enter to run · Ctrl/Cmd+] to indent · Tab leaves editor · Ctrl+Space for choices</div></div>
    <div class="run-bar"><button class="primary" id="run"><span aria-hidden="true">▶</span> Run code</button><button id="stop" disabled>Stop</button><button id="hint">Hint 1</button><button id="reset">Reset step</button><button id="gaps" hidden>Insert exercise gaps</button></div>
    <div id="result" class="result" role="status" aria-live="polite" aria-atomic="true">Ready when you are. Write a little code, then run it.</div><button id="error-link" hidden>Go to problem</button><details id="technical" hidden><summary>Technical detail</summary><pre></pre></details>
    <section id="hints" aria-label="Optional help" hidden></section><details id="reflection" hidden><summary>Predict, explain &amp; self-check</summary><p></p></details>
    <nav class="lesson-nav" aria-label="Checkpoint navigation"><button id="previous">← Previous</button><span id="badge"></span><button id="next" disabled>Next step →</button></nav>
  </section>
  <section id="preview" class="preview" aria-label="Character preview" tabindex="-1"><div class="preview-heading"><div><span class="eyebrow">THE CONJURING ROOM</span><h2>Your code, brought to life</h2></div><span class="live-label">● LOCAL PREVIEW</span></div><div class="scene"><canvas width="320" height="240" aria-hidden="true"></canvas><span class="scene-label">THE WORKSHOP · EST. LEVEL 1</span></div><div class="character-strip"><div id="character-summary">Your wizard will appear here after you create an object.</div><button id="skip">Skip animation</button></div><div id="goblin-summary" hidden></div><p id="preview-note" class="muted"></p>
    <div class="inspector-heading"><h2>Look inside the objects</h2><span>READ ONLY</span></div><div class="inspectors"><section><h3>What a new Wizard starts with</h3><p>Values on a fresh probe object</p><dl id="defaults"></dl></section><section><h3>Your object</h3><p>Values after setup and actions</p><dl id="object"></dl></section></div><div id="apprentice" hidden></div>
    <details class="reference" open><summary>Property reference · exact choices to type</summary><p>These are the workshop’s rules, not JavaScript type restrictions.</p><div id="choices"></div></details>
    <details class="action-log" open><summary>Action log <span id="action-count">0 actions</span></summary><ol id="log"></ol><p id="empty-log">Methods run only when you call them. Each Run starts fresh.</p></details>
  </section></main><section id="section-screen" class="section-screen" tabindex="-1" aria-labelledby="section-title" hidden></section><footer>Made for learning, one object at a time. <span>No accounts. Progress stays in this browser.</span></footer>
  <dialog id="confirm-dialog"><form method="dialog"><h2 id="confirm-title">Replace this draft?</h2><p id="confirm-copy">A recoverable backup of your current draft will be kept.</p><div><button value="cancel">Keep my draft</button><button class="primary" value="confirm">Replace and keep backup</button></div></form></dialog>`;
const $=selector=>document.querySelector(selector);
let storage;
try {storage=window.localStorage;} catch {storage={getItem(){throw new Error('Browser storage is disabled.');},setItem(){throw new Error('Browser storage is disabled.');}};}
const loaded=loadState(storage);let state=loaded.state,activeFile='character.js',lastDiagnostics=[],saveTimer,lintTimer,runId=0,verifiedRevision=null;
const cp=()=>byId[state.currentCheckpointId];
const draft=()=>state.draftsByCheckpoint[state.currentCheckpointId];
const sourceKey=()=>activeFile==='character.js'?'characterSource':'actionsSource';
const text=(selector,value)=>{$(selector).textContent=value;};
const node=(tag,value,className)=>{const n=document.createElement(tag);if(value!==undefined)n.textContent=value;if(className)n.className=className;return n;};
// HTML is generated at build time solely from the trusted curriculum.
const lessonNode=(tag,html)=>{const n=node(tag);n.innerHTML=html;return n;};
const celebration=createCelebration($('#run'),()=>state.preferences.reduceMotion);
const saveProgress=()=>{save();refreshJourney();};
function save(){clearTimeout(saveTimer);const error=saveState(state,storage);text('#saved',error||'Saved locally');$('#save-warning').hidden=!error;text('#save-warning',error||'');}
const runner=new Runner((status,message)=>{if(state.activeRun){state.activeRun.status=status;setResult(message,status);}});
const player=new TracePlayer((snapshot,effect)=>{renderScene($('.scene canvas'),snapshot,effect);summarise(snapshot);});
const editor=createCodeEditor($('#editor'),{completionFields:()=>cp().requiredFields,fontSize:()=>state.preferences.codeFontSize,onRun:run,onChange(source){
  draft()[sourceKey()]=source;draft().revision++;invalidate();text('#dirty','Changes not run');text('#saved','Saving…');saveTimer=setTimeout(save,500);
  clearTimeout(lintTimer);lintTimer=setTimeout(()=>{lastDiagnostics=parseSources(draft(),cp()).diagnostics;editor.diagnostics(lastDiagnostics,activeFile);},350);
}});
// Each journey option holds its label plus a status span. Browsers with a
// customisable select style these as badges; others show them as plain text.
const journeyOptions=new Map(),journeyGroups=new Map();
for(const section of sections){
  const group=node('optgroup');journeyGroups.set(section.chapter,group);
  for(const id of journey.filter(id=>chapterOfScreen(id)===section.chapter)){
    const label=id.startsWith('intro:')?`Section ${section.chapter} · Introduction`:id.startsWith('review:')?`Section ${section.chapter} · Review quiz`:`${id} · ${byId[id].title}`;
    const status=node('span',undefined,'journey-status');const option=node('option');option.value=id;
    option.append(node('span',label,'journey-label'),status);journeyOptions.set(id,option);group.append(option);
  }
  $('#checkpoint').append(group);
}
{const group=node('optgroup');group.label='Course complete';const option=node('option');option.value=RECAP;option.append(node('span','Course summary · download your spellbook','journey-label'));group.append(option);$('#checkpoint').append(group);}
// The learner's most recent successful battle code, for the summary download.
const finalCode=()=>{for(const item of [...checkpoints].reverse()){const code=state.lastSuccessfulSourcesByCheckpoint[item.id];if(code&&item.chapter===5)return code;}return null;};
function refreshJourney(){
  for(const [id,option] of journeyOptions){
    const done=isScreenComplete(id,state);option.classList.toggle('is-complete',done);
    option.querySelector('.journey-status').replaceChildren(...(done?[node('span',' — ','journey-separator'),document.createTextNode('✓ Done')]:[]));
  }
  for(const section of sections){
    const {done,total}=sectionProgress(section.chapter,state);
    journeyGroups.get(section.chapter).label=`Section ${section.chapter} · ${section.title} — ${done===total?'✓ Section complete':`${done} of ${total} done`}`;
  }
}
for(const [key,values] of Object.entries(choices)){
  const group=node('div',undefined,'choice-group');group.append(node('strong',key));const row=node('div');
  for(const value of values){const card=node('code',JSON.stringify(value));if(key==='cloakColour'){const swatch=node('span');swatch.style.background=palettes[value];swatch.setAttribute('aria-hidden','true');card.prepend(swatch);}row.append(card);}
  group.append(row);$('#choices').append(group);
}
function setResult(message,status='notRun'){text('#result',message);$('#result').dataset.status=status;}
function invalidate(){celebration.stop();runId++;state.activeRun=null;runner.stop();player.skip();verifiedRevision=null;$('#next').disabled=true;$('#stop').disabled=true;$('#run').disabled=false;$('#skip').disabled=false;}
function initialise(id,sequential){
  if(state.draftsByCheckpoint[id])return;
  const current=byId[id],previous=checkpoints[current.index-1];let source=structuredClone(current.starter);
  if(sequential&&previous&&state.lastSuccessfulSourcesByCheckpoint[previous.id]){
    source=structuredClone(state.lastSuccessfulSourcesByCheckpoint[previous.id]);
    if(id==='C2.1a'){
      const tree=parseSources(source,byId[previous.id]).trees['character.js'];
      if(tree)for(const n of [...tree.body].reverse())if(n.declarations?.some(d=>d.id.name==='apprentice')||n.expression?.left?.object?.name==='apprentice')source.characterSource=source.characterSource.slice(0,n.start)+source.characterSource.slice(n.end);
    }
    if(id==='C3.2a')source.characterSource+='\nwizard.specialPower = "fire";\n';
    if(id==='C4.1'){
      const reference=current.starter.characterSource;const tree=parseSources(current.starter,current).trees['character.js'];const goblin=findClass(tree,'Goblin');
      source.characterSource+=`\n${reference.slice(goblin.start,goblin.end)}\nconst goblin = new Goblin("Grub");\n`;
    }
    if(id==='C5.1a'){source.characterSource+='\nwizard.health = wizard.maxHealth;\ngoblin.health = goblin.maxHealth;\n';source.actionsSource='// actions.js runs after character.js.\n// In the next step you will aim your spell at the goblin here.\n';}
  }
  if(id==='C3.1b'&&!source.actionsSource.trim())source.actionsSource=byId[id].starter.actionsSource;
  state.draftsByCheckpoint[id]={...source,revision:0};
}
function navigate(id,sequential=false){
  save();invalidate();state.currentScreen=parseScreen(id);if(state.currentScreen.type==='checkpoint'){initialise(id,sequential);state.currentCheckpointId=id;activeFile=cp().activeFile;lastDiagnostics=[];}showScreen();save();
}
function showScreen(){const screen=state.currentScreen;const checkpoint=screen.type==='checkpoint';$('main').hidden=!checkpoint;$('#section-screen').hidden=checkpoint;$('#view-switch').hidden=!checkpoint;$('.jump').hidden=!checkpoint;$('#checkpoint').value=screenId(screen);text('#progress',`${state.completedCheckpointIds.length} / ${checkpoints.length} completed`);if(checkpoint)showLesson();else if(screen.type===RECAP)renderRecap($('#section-screen'),sectionContent,{navigate,download,finalCode:finalCode()});else renderSection($('#section-screen'),screen,sectionContent,state,navigate,saveProgress,{celebrate:button=>celebration.play(button)});refreshJourney();}
function showLesson(){
  const current=cp(),lesson=lessons[current.id];$('#checkpoint').value=current.id;text('#stage',`SECTION ${current.chapter} · ${sectionByChapter[current.chapter].title.toUpperCase()} / ${current.id}`);text('#scaffold',current.scaffold);text('#title',current.title);$('#objective').innerHTML=lesson.objective;
  $('#instruction-list').replaceChildren(...lesson.instructions.map(s=>lessonNode('li',s)));$('#checklist').replaceChildren(...lesson.checklist.map(s=>lessonNode('li','○ '+s)));
  text('#expected','Expected: '+current.expectedVisibleResult);text('#starter-note',current.starterStrategy==='prepared'?'This step starts from a prepared example. Earlier checkpoint drafts remain available.':'New sequential steps start from your previous successful code. Teacher jumps load a starting example, not an earned completion.');
  $('#actions-tab').hidden=current.chapter<3;$('#actions-tab .tab-badge').hidden=current.id!=='C3.1b';$('#gaps').hidden=!current.gap;$('#previous').disabled=false;$('#next').disabled=true;
  $('#file-notice').hidden=!current.fileNotice;if(current.fileNotice){text('#file-notice h2',current.fileNotice.title);$('#file-notice p').innerHTML=lesson.fileNotice;}
  $('#reflection').hidden=!current.reflection;$('#reflection p').innerHTML=lesson.reflection;$('#instructions').open=!!current.openInstructions;
  text('#badge',state.completedCheckpointIds.includes(current.id)?'✓ Previously completed':'');text('#progress',`${state.completedCheckpointIds.length} / ${checkpoints.length} completed`);
  text('#dirty','Not run yet');setResult('Ready when you are. This draft needs a fresh Run.');$('#error-link').hidden=true;$('#technical').hidden=true;
  $('#comparison').hidden=current.id!=='C4.1';$('#comparison').replaceChildren();
  if(current.id==='C4.1'){
    $('#comparison').append(node('p','Which members do both classes share?'));
    for(const value of ['name','level','maxHealth','health','recoverHealth','levelUp','cloakColour','wand']){const b=node('button',value);b.onclick=()=>{b.textContent=value+(['cloakColour','wand'].includes(value)?' — Wizard only':' — shared by both');};$('#comparison').append(b);}
  }
  showFile(activeFile);showHints();showAccepted(true);
  if(state.completedCheckpointIds.length===checkpoints.length)text('#badge','✦ Course complete');
}
function showFile(file){activeFile=file;$('#character-tab').setAttribute('aria-selected',String(file==='character.js'));$('#actions-tab').setAttribute('aria-selected',String(file==='actions.js'));editor.show(cp().id,file,draft()[sourceKey()]);editor.diagnostics(lastDiagnostics,file);if(cp().fileNotice)text('#file-notice button',file==='actions.js'?'Show my character.js':'Back to actions.js');}
function summarise(snapshot){const w=snapshot?.wizard,g=snapshot?.goblin;
  const blueprint=!w&&snapshot?.blueprint,outcome=battleOutcome(snapshot);
  text('#character-summary',w?`${w.name ?? 'Unnamed'}${w.level!==undefined?' · Level '+w.level:''}${w.health!==undefined?' · Health '+w.health+'/'+w.maxHealth:''}${w.specialPower?' · '+w.specialPower:''}${outcome&&w.health===0?' · Defeated':''}${outcome?` · Game Over: ${outcome}`:''}`:blueprint?`Class Wizard is ready — the dotted outline is the recipe, not a wizard yet.${blueprint.properties.length?` Every new wizard will get: ${blueprint.properties.join(', ')}.`:''} No object exists until new Wizard(...) creates one.`:'Your wizard will appear here after you create an object.');
  $('#character-summary').replaceChildren(node('span',$('#character-summary').textContent));
  if(w?.health!==undefined){const meter=document.createElement('meter');meter.min=0;meter.max=w.maxHealth;meter.value=w.health;meter.setAttribute('aria-label','Wizard health');$('#character-summary').append(meter);}
  $('#goblin-summary').hidden=!g;if(g){text('#goblin-summary',`${g.name} · Level ${g.level} · Health ${g.health}/${g.maxHealth}${g.health===0?' · Defeated':''}`);const meter=document.createElement('meter');meter.min=0;meter.max=g.maxHealth;meter.value=g.health;meter.setAttribute('aria-label','Goblin health');$('#goblin-summary').append(meter);}
}
function inspector(selector,object){const dl=$(selector);dl.replaceChildren();for(const key of ['name',...Object.keys(choices),'maxHealth','health']) {dl.append(node('dt',key),node('dd',object?.[key]===undefined?'Not added yet':String(object[key])));}}
function showAccepted(restored=false){const accepted=state.lastGoodSnapshotByCheckpoint[cp().id];const snapshot=accepted?.snapshot||{};renderScene($('.scene canvas'),snapshot);summarise(snapshot);inspector('#defaults',snapshot.defaults);inspector('#object',snapshot.wizard);
  $('#apprentice').hidden=!snapshot.apprentice;if(snapshot.apprentice)text('#apprentice',`Second object · apprentice.name = ${JSON.stringify(snapshot.apprentice.name)}. Its properties belong to a separate instance.`);
  text('#preview-note',accepted?(restored?'Last saved successful preview — rerun to verify this draft.':snapshot.blueprint?'Accepted result · A class on its own is only a recipe (the dotted outline). The next step creates an object from it.':'Accepted result · Your last working wizard is still here.'):'Waiting for your first object.');
  $('#log').replaceChildren();const trace=accepted?.trace||[];text('#action-count',`${trace.length} actions`);$('#empty-log').hidden=trace.length>0;
  for(const a of trace){const health=a.after[a.target||a.actor]?.health;const summary=`${a.actor}.${a.method}(${a.target||a.amount||''})${a.power?' · '+a.power:''} · ${a.method==='levelUp'?'level '+a.after[a.actor].level: (a.change>0?'+':'')+a.change+(health!==undefined?' health → '+health:'')} · actions.js:${a.line}`;const li=node('li',summary.slice(0,200));$('#log').append(li);}
}
function showHints(){const depth=state.hintDepthByCheckpoint[cp().id]||0;$('#hints').hidden=depth===0;$('#hints').replaceChildren();
  for(let i=0;i<depth;i++){$('#hints').append(node('h3',['Hint 1 · Concept','Hint 2 · Location and syntax','Worked example'][i]),lessonNode('p',lessons[cp().id].hints[i]));}
  if(depth===3){for(const html of lessons[cp().id].solution)$('#hints').append(lessonNode('div',html));const b=node('button','Replace with worked example');b.onclick=()=>confirmReplacement(cp().solution,'Replace with the worked example?');$('#hints').append(b);}
  text('#hint',depth===0?'Hint 1':depth===1?'Hint 2':'Worked example');$('#hint').disabled=depth===3;
}
async function run(){
  if(state.activeRun)return;
  celebration.stop();player.stop();save();lastDiagnostics=[];$('#error-link').hidden=true;$('#technical').hidden=true;
  const request={runId:++runId,checkpointId:cp().id,revision:draft().revision,sources:{characterSource:draft().characterSource,actionsSource:draft().actionsSource}};
  state.activeRun={...request,status:'checking'};$('#run').disabled=true;$('#stop').disabled=false;$('#skip').disabled=true;$('#next').disabled=true;setResult('Checking your code…','checking');
  try {
    const preflight=parseSources(request.sources,cp());
    const response=preflight.diagnostics.length?{...request,result:{status:'error',diagnostics:preflight.diagnostics}}:await runner.run(request);
    if(!canCommit(state,response))return;
    const result=response.result;lastDiagnostics=result.diagnostics;editor.diagnostics(lastDiagnostics,activeFile);
    if(result.status==='success'||result.status==='validButIncomplete'){
      state.lastGoodSnapshotByCheckpoint[cp().id]=result;showAccepted();player.play(result,state.preferences.reduceMotion||matchMedia('(prefers-reduced-motion: reduce)').matches);
      if(result.status==='success') {verifiedRevision=draft().revision;state.lastSuccessfulSourcesByCheckpoint[cp().id]=structuredClone(request.sources);if(!state.completedCheckpointIds.includes(cp().id))state.completedCheckpointIds.push(cp().id);$('#next').disabled=false;const w=result.snapshot.wizard,g=result.snapshot.goblin;const observation=cp().field?`Your object’s ${cp().field} is ${JSON.stringify(w[cp().field])}. A new wizard starts with ${JSON.stringify(result.snapshot.defaults[cp().field])}.`:cp().chapter===5&&g?`Your script ran: ${w.name} has ${w.health}/${w.maxHealth} health at level ${w.level}; ${g.name} has ${g.health}/${g.maxHealth} health.${battleOutcome(result.snapshot)?` Game Over — ${battleOutcome(result.snapshot)}!`:''}`:cp().expectedVisibleResult;setResult('✓ '+observation,'success');text('#badge','✓ Checkpoint complete');refreshJourney();celebration.play();}
      else setResult('○ Your code ran. Next, '+result.missing[0]+'.','validButIncomplete');
      text('#dirty','Run matches this draft');text('#progress',`${state.completedCheckpointIds.length} / ${checkpoints.length} completed`);
      if(state.completedCheckpointIds.length===checkpoints.length)text('#badge','✦ Course complete');
    }else{
      const d=lastDiagnostics[0];setResult('⚠ '+(d?.message||'This run was stopped.')+' Your last working wizard is still here.',result.status);
      if(d){const src=d.file==='actions.js'?draft().actionsSource:draft().characterSource;const line=src.slice(0,d.from).split('\n').length;const col=d.from-(src.lastIndexOf('\n',d.from-1)+1)+1;$('#error-link').hidden=false;text('#error-link',`${d.file} · line ${line}, column ${col} — go to problem`);$('#technical').hidden=!d.detail;$('#technical pre').textContent=d.detail||'';}
    }
    save();
  }catch(e){if(state.activeRun?.runId===request.runId)setResult('⚠ '+e.message,'stopped');}
  finally{if(state.activeRun?.runId===request.runId){state.activeRun=null;$('#run').disabled=false;$('#stop').disabled=true;$('#skip').disabled=false;}}
}
function confirmAction(title,action){const dialog=$('#confirm-dialog');text('#confirm-title',title);dialog.returnValue='';dialog.showModal();dialog.addEventListener('close',()=>{if(dialog.returnValue==='confirm')action();},{once:true});}
function confirmReplacement(source,title){confirmAction(title,()=>{invalidate();replaceDraft(state,cp().id,source);editor.invalidate(cp().id);showFile(activeFile);showAccepted();setResult('Draft replaced. Restore previous draft is available in Workspace tools.');text('#dirty','Changes not run');save();});}
function download(filename,content,type){const url=URL.createObjectURL(new Blob([content],{type}));const link=document.createElement('a');link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('#run').onclick=run;$('#stop').onclick=()=>{invalidate();setResult('Run stopped. Your last working wizard is still here.','stopped');};
$('#retry').onclick=()=>{invalidate();setResult('Runner reset. Choose Run code to retry.');};
$('#skip').onclick=()=>{celebration.stop();player.skip();};
$('#checkpoint').onchange=e=>navigate(e.target.value);
$('#previous').onclick=()=>navigate(previousScreen(cp().id));
$('#next').onclick=()=>{if(verifiedRevision===draft().revision)navigate(nextScreen(cp().id),true);};
$('#file-notice button').onclick=()=>showFile(activeFile==='actions.js'?'character.js':'actions.js');
$('#character-tab').onclick=()=>showFile('character.js');$('#actions-tab').onclick=()=>showFile('actions.js');
$('#hint').onclick=()=>{state.hintDepthByCheckpoint[cp().id]=Math.min(3,(state.hintDepthByCheckpoint[cp().id]||0)+1);showHints();save();};
$('#reset').onclick=()=>confirmReplacement(cp().starter,'Reset this checkpoint to its starting example?');
$('#restore').onclick=()=>{const backup=state.backupsByCheckpoint[cp().id];if(backup)confirmReplacement(backup,'Restore the previous draft?');else setResult('No replacement backup exists for this checkpoint yet.');};
$('#error-link').onclick=()=>{const d=lastDiagnostics[0];if(d){showFile(d.file);editor.focus(d.from,d.to);}};
$('#locate').onclick=()=>{
  const current=cp();
  if(current.activeFile==='actions.js'){showFile('actions.js');editor.focus(draft().actionsSource.length);return;}
  const tree=parseSources(draft(),current).trees['character.js'];
  if(!tree){setResult('Fix the syntax problem first so the insertion point can be located.');return;}
  const owner=current.method==='attack'?'Goblin':current.method==='takeDamage'?'Character':'Wizard';const cls=findClass(tree,owner);const ctor=cls?.body.body.find(n=>n.kind==='constructor');
  const instance=tree.body.find(n=>n.declarations?.some(d=>d.id.name==='wizard'));
  const position=current.kind==='override'?(instance?.end??tree.end):current.kind==='default'?(ctor?.value.body.end?ctor.value.body.end-1:cls?.body.end-1):(current.method?(cls?.body.end?cls.body.end-1:tree.end):tree.end);
  showFile('character.js');editor.focus(Number.isFinite(position)?position:tree.end);
};
$('#gaps').onclick=()=>{
  const sources=structuredClone(draft());const gap=cp().gap;
  if(cp().kind==='default'){
    const tree=parseSources(sources,cp()).trees['character.js'];const cls=findClass(tree,'Wizard');const ctor=cls?.body.body.find(n=>n.kind==='constructor');
    if(!ctor){setResult('Add a constructor before inserting this gap.');return;}
    const pos=ctor.value.body.end-1;sources.characterSource=sources.characterSource.slice(0,pos)+'  '+gap+'\n  '+sources.characterSource.slice(pos);
  }else sources.characterSource+='\n'+gap+'\n';
  confirmReplacement(sources,'Insert this exercise gap into your draft?');
};
$('#download').onclick=()=>{save();download('wizard-workshop-work.json',JSON.stringify({...state,activeRun:null},null,2),'application/json');};
$('#download-mobile').onclick=()=>$('#download').click();
$('#download-code').onclick=()=>download('wizard-workshop-code.txt',`// character.js\n${draft().characterSource}\n\n// actions.js\n${draft().actionsSource}`,'text/plain');
$('#import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2*1024*1024)throw new Error('Work files must be under 2MB.');const imported=parseImport(await file.text());confirmAction('Import work and replace the saved drafts?',()=>{invalidate();const backups={...state.backupsByCheckpoint,...state.draftsByCheckpoint};state=imported;state.backupsByCheckpoint={...state.backupsByCheckpoint,...backups};initialise(state.currentCheckpointId,false);activeFile=cp().activeFile;for(const item of checkpoints)editor.invalidate(item.id);showScreen();save();});}catch(error){setResult('Import could not be read: '+error.message,'error');}e.target.value='';};
$('#font-size').value=String(state.preferences.codeFontSize);$('#font-size').onchange=e=>{state.preferences.codeFontSize=Number(e.target.value);editor.fontSize();save();};
$('#reduce-motion').checked=state.preferences.reduceMotion;$('#reduce-motion').onchange=e=>{state.preferences.reduceMotion=e.target.checked;celebration.stop();player.skip();save();};
$('#view-switch').onclick=()=>{const preview=document.body.classList.toggle('preview-only');text('#view-switch',preview?'Show code':'Show preview');if(preview)$('#preview').focus();else editor.view.focus();};
window.addEventListener('beforeunload',save);
initialise(state.currentCheckpointId,false);activeFile=cp().activeFile;showScreen();if(loaded.error){text('#saved',loaded.error);text('#save-warning',loaded.error);$('#save-warning').hidden=false;}
