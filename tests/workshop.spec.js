import {test,expect} from '@playwright/test';
import {byId,finalSolution} from '../src/curriculum/checkpoints.js';
import {emptyState,STORAGE_KEY} from '../src/state/store.js';
async function typeFile(page,file,source){
  await page.getByRole('tab',{name:file,exact:true}).click();
  const editor=page.getByRole('textbox',{name:`${file} JavaScript editor`});
  // CodeMirror owns its DOM and selection. Use its keyboard selection command
  // instead of contenteditable.fill(), which can bypass the editor selection.
  await editor.focus();await page.keyboard.press('Control+a');
  if(source)await page.keyboard.insertText(source);else await page.keyboard.press('Backspace');
  await expect.poll(()=>page.evaluate(({storageKey,file})=>{const s=JSON.parse(localStorage.getItem(storageKey));return s?.draftsByCheckpoint[s.currentCheckpointId]?.[file==='character.js'?'characterSource':'actionsSource'];},{storageKey:STORAGE_KEY,file})).toBe(source);
}
async function putSolution(page,id){await page.getByLabel('Choose a checkpoint (teacher navigation)').selectOption(id);await typeFile(page,'character.js',byId[id].solution.characterSource);if(byId[id].chapter>=3)await typeFile(page,'actions.js',byId[id].solution.actionsSource);}
async function run(page){await page.getByRole('button',{name:'Run code',exact:false}).click();await expect(page.locator('#result')).toHaveAttribute('data-status','success',{timeout:15000});await page.getByRole('button',{name:'Skip animation'}).click();}

test('instruction snippets and worked examples have syntax colours on small screens',async({page},testInfo)=>{
  await page.goto('/');await page.locator('#checkpoint').selectOption('C1.1b');
  await page.locator('#instructions summary').click();
  const snippet=page.locator('#instruction-list .expressive-code');
  await expect(snippet).toContainText('this.name = name;');
  expect(await snippet.locator('.ec-line').count()).toBe(3);
  expect(await snippet.locator('span[style]').evaluateAll(spans=>new Set(spans.map(s=>getComputedStyle(s).color)).size)).toBeGreaterThan(2);
  await expect(page.locator('#objective code').first()).toHaveText('constructor(name)');
  await page.locator('#hint').click();await page.locator('#hint').click();await page.locator('#hint').click();
  await expect(page.locator('#hints .expressive-code')).toContainText('class Wizard');
  await expect(page.locator('#hints .header')).toContainText('character.js');
  for(const width of [1366,390]){
    await page.setViewportSize({width,height:844});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:`verification/${testInfo.project.name}-highlighting-${width}.png`,fullPage:true});
  }
});

test('confetti celebrates only correct runs and respects cancellation and reduced motion',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');
  const confetti=page.locator('canvas.celebration');
  await page.locator('#run').click();await expect(page.locator('#result')).toHaveAttribute('data-status','validButIncomplete');await expect(confetti).toBeHidden();
  await typeFile(page,'character.js','class Wizard {}');await page.locator('#run').click();
  await expect(page.locator('#result')).toHaveAttribute('data-status','success');await expect(confetti).toBeVisible();
  await expect.poll(()=>confetti.evaluate(c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4===3&&v>0))).toBe(true);
  await expect(confetti).toBeHidden({timeout:5000});
  await page.locator('#run').click();await expect(confetti).toBeVisible();
  await typeFile(page,'character.js','class Wizard {');await expect(confetti).toBeHidden();
  await page.locator('#run').click();await expect(page.locator('#result')).toHaveAttribute('data-status','error');await expect(confetti).toBeHidden();
  await typeFile(page,'character.js','class Wizard {}');await page.locator('#run').click();await expect(confetti).toBeVisible();
  await page.emulateMedia({reducedMotion:'reduce'});await expect(confetti).toBeHidden();await run(page);await expect(confetti).toBeHidden();
  await page.emulateMedia({reducedMotion:'no-preference'});await page.getByText('Workspace tools',{exact:true}).click();await page.locator('#reduce-motion').check();await run(page);await expect(confetti).toBeHidden();
  await page.locator('#reduce-motion').uncheck();await page.getByText('Workspace tools',{exact:true}).click();await page.locator('#run').click();await expect(confetti).toBeVisible();
  await page.locator('#checkpoint').selectOption('C1.1b');await expect(confetti).toBeHidden();
  await page.reload();await expect(confetti).toBeHidden();
});
test('student journey, error and fix, inheritance and deterministic battle',async({page})=>{
  const external=[];page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:')&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))external.push(r.url());});
  await page.goto('/');await expect(page.locator('#character-summary')).toContainText('will appear');
  await typeFile(page,'character.js','class Wizard {}');await run(page);await expect(page.locator('#character-summary')).toContainText('will appear');
  await page.getByRole('button',{name:'Next step'}).click();await typeFile(page,'character.js',byId['C1.1b'].solution.characterSource);await run(page);
  await page.getByRole('button',{name:'Next step'}).click();await typeFile(page,'character.js',byId['C1.1c'].solution.characterSource);await run(page);await expect(page.locator('#character-summary')).toContainText('Aster');
  await page.getByRole('button',{name:'Previous',exact:false}).click();await expect(page.locator('#title')).toHaveText('Give the recipe a constructor');await run(page);await page.getByRole('button',{name:'Next step'}).click();await expect(page.locator('.cm-content')).toContainText('const wizard');await run(page);
  await putSolution(page,'C2.1b');await run(page);await expect(page.locator('#object')).toContainText('purple');await expect(page.locator('#defaults')).toContainText('grey');
  await typeFile(page,'character.js',byId['C2.1b'].solution.characterSource.replace('"purple"','"pink"'));await page.getByRole('button',{name:'Run code',exact:false}).click();await expect(page.locator('#result')).toHaveAttribute('data-status','error');await expect(page.locator('#object')).toContainText('purple');await expect(page.locator('#next')).toBeDisabled();
  await typeFile(page,'character.js',byId['C2.1b'].solution.characterSource);await run(page);
  for(const id of ['C3.1b','C3.3c','C4.4','C5.3']){await putSolution(page,id);await run(page);}
  await expect(page.locator('#goblin-summary')).toContainText('42/60');await expect(page.locator('#character-summary')).toContainText('Level 3');await run(page);await expect(page.locator('#goblin-summary')).toContainText('42/60');expect(external).toEqual([]);
});
test('saved drafts, hints, reset cancellation, backup recovery and import/export',async({page})=>{
  await page.goto('/');await typeFile(page,'character.js','class Wizard {}\n// my draft');await page.waitForTimeout(600);await page.reload();await expect(page.locator('.cm-content')).toContainText('my draft');
  await page.getByRole('button',{name:'Hint 1',exact:true}).click();await page.getByRole('button',{name:'Hint 2',exact:true}).click();await page.getByRole('button',{name:'Worked example',exact:true}).click();await expect(page.locator('#hints')).toContainText('class Wizard');
  await page.getByRole('button',{name:'Reset step'}).click();await page.getByRole('button',{name:'Keep my draft'}).click();await expect(page.locator('.cm-content')).toContainText('my draft');
  await page.getByRole('button',{name:'Replace with worked example'}).click();await page.getByRole('button',{name:'Replace and keep backup'}).click();await expect(page.locator('.cm-content')).not.toContainText('my draft');
  await page.getByText('Workspace tools',{exact:true}).click();await page.getByRole('button',{name:'Restore previous draft'}).click();await page.getByRole('button',{name:'Replace and keep backup'}).click();await expect(page.locator('.cm-content')).toContainText('my draft');
  const dl=page.waitForEvent('download');await page.getByRole('button',{name:'Download work',exact:true}).click();expect((await dl).suggestedFilename()).toBe('wizard-workshop-work.json');
  const state=emptyState();state.currentCheckpointId='C5.3';state.draftsByCheckpoint['C5.3']={...finalSolution,revision:0};await page.locator('#import').setInputFiles({name:'work.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(state))});await page.getByRole('button',{name:'Replace and keep backup'}).click();await expect(page.locator('#title')).toHaveText('Script a battle');await expect(page.locator('#next')).toBeDisabled();await run(page);
});
test('loop recovery, edit cancellation, keyboard exit and reduced motion',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await putSolution(page,'C5.3');await run(page);
  await typeFile(page,'character.js',finalSolution.characterSource.replace('target.takeDamage(damage);','while (true) {}'));await page.getByRole('button',{name:'Run code',exact:false}).click();await expect(page.locator('#result')).toHaveAttribute('data-status',/stopped|error/);await expect(page.locator('#goblin-summary')).toContainText('42/60');
  await typeFile(page,'character.js',finalSolution.characterSource);await run(page);
  const editor=page.getByRole('textbox',{name:'character.js JavaScript editor'});await editor.focus();await page.keyboard.press('Tab');await expect(editor).not.toBeFocused();
  await editor.focus();await page.keyboard.press('Control+Enter');await expect(page.locator('#result')).toHaveAttribute('data-status','success');
  await page.locator('#checkpoint').selectOption('C1.1a');await expect(page.locator('#character-summary')).toContainText('will appear');
});
test('desktop, tablet, phone and zoom layouts preserve usable editor',async({page},testInfo)=>{
  await page.goto('/');await putSolution(page,'C5.3');await run(page);
  expect(await page.locator('#editor').evaluate(e=>e.clientHeight)).toBeGreaterThanOrEqual(384);
  for(const [name,width,height] of [['desktop',1366,768],['tablet',1024,768],['phone',390,844]]){
    await page.setViewportSize({width,height});await expect(page.locator('#run')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:`test-results/${testInfo.project.name}-${name}.png`,fullPage:true});
  }
  await page.getByRole('button',{name:'Show preview'}).click();await expect(page.locator('#preview')).toBeVisible();await expect(page.locator('#lesson')).not.toBeVisible();await page.getByRole('button',{name:'Show code'}).click();await expect(page.locator('.cm-content')).toContainText('wizard.castSpell(goblin)');
  // Browser zoom to 200% halves the available CSS viewport on this laptop.
  await page.setViewportSize({width:683,height:384});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`test-results/${testInfo.project.name}-zoom.png`,fullPage:true});
});
test('late worker results cannot overwrite an edited draft or a different checkpoint',async({page})=>{
  // Hold actual results until the edit/navigation has happened. A fixed delay
  // can expire before Firefox finishes the keyboard steps on a busy machine.
  await page.addInitScript(()=>{window.__heldResults=[];window.__holdResults=false;window.__releaseResults=()=>{window.__holdResults=false;window.__heldResults.splice(0).forEach(deliver=>deliver());};const NativeWorker=window.Worker;window.Worker=class extends NativeWorker{set onmessage(handler){super.onmessage=e=>e.data.type==='result'&&window.__holdResults?window.__heldResults.push(()=>handler(e)):handler(e);}};});
  await page.goto('/');await putSolution(page,'C2.1b');await run(page);
  await typeFile(page,'character.js',byId['C2.1b'].solution.characterSource.replace('"purple"','"gold"'));
  await page.evaluate(()=>{window.__holdResults=true;});
  await page.getByRole('button',{name:'Run code',exact:false}).click();await expect(page.locator('#result')).toHaveAttribute('data-status','running');
  await expect.poll(()=>page.evaluate(()=>window.__heldResults.length)).toBe(1);
  await typeFile(page,'character.js',byId['C2.1b'].solution.characterSource.replace('"purple"','"green"'));
  await page.evaluate(()=>window.__releaseResults());await expect(page.locator('#object')).toContainText('purple');await expect(page.locator('#next')).toBeDisabled();await expect(page.locator('.cm-content')).toContainText('green');await expect(page.locator('.celebration')).toBeHidden();
  await page.evaluate(()=>{window.__holdResults=true;});await page.getByRole('button',{name:'Run code',exact:false}).click();await expect.poll(()=>page.evaluate(()=>window.__heldResults.length)).toBe(1);await page.locator('#checkpoint').selectOption('C1.1a');await page.evaluate(()=>window.__releaseResults());await expect(page.locator('#character-summary')).toContainText('will appear');await expect(page.locator('#next')).toBeDisabled();await expect(page.locator('.celebration')).toBeHidden();
});
test('keyboard-only first checkpoint and Enter do not auto-run',async({page})=>{
  await page.goto('/');await page.getByRole('textbox',{name:'character.js JavaScript editor'}).focus();await page.keyboard.press('Control+a');await page.keyboard.type('class Wizard {}');await page.keyboard.press('Enter');await expect(page.locator('#dirty')).toHaveText('Changes not run');await expect(page.locator('#next')).toBeDisabled();await page.keyboard.press('Control+Enter');await expect(page.locator('#result')).toHaveAttribute('data-status','success');await page.keyboard.press('Tab');await expect(page.getByRole('textbox')).not.toBeFocused();
});
test('blocked WASM produces retryable infrastructure feedback',async({page})=>{
  await page.route(/\.wasm(?:\?|$)/,route=>route.abort());await page.goto('/');await typeFile(page,'character.js','class Wizard {}');await page.getByRole('button',{name:'Run code',exact:false}).click();await expect(page.locator('#result')).toContainText('runner could not load',{timeout:15000});await page.unroute(/\.wasm(?:\?|$)/);await page.getByText('Workspace tools',{exact:true}).click();await page.getByRole('button',{name:'Reload code runner'}).click();await run(page);
});
test('oversized draft survives reload while Run remains blocked and last good scene remains',async({page})=>{
  await page.goto('/');await putSolution(page,'C1.1c');await run(page);
  const longSource=byId['C1.1c'].solution.characterSource+'\n// '+ 'x'.repeat(40000);await typeFile(page,'character.js',longSource);
  await page.getByRole('button',{name:'Run code',exact:false}).click();await expect(page.locator('#result')).toContainText('30KB');await expect(page.locator('#character-summary')).toContainText('Aster');
  await page.reload();await expect(page.locator('#checkpoint')).toHaveValue('C1.1c');await expect(page.locator('#preview-note')).toContainText('Last saved successful preview');
  await page.getByRole('button',{name:'Run code',exact:false}).click();await expect(page.locator('#result')).toContainText('30KB');
  await typeFile(page,'character.js',byId['C1.1c'].solution.characterSource);await run(page);
});
