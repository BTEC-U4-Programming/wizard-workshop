import 'virtual:lesson-styles.css';
import lessons from 'virtual:edp-lesson-content';
import sectionContent from 'virtual:edp-section-content';
import {brand, tomeUrl} from '../shared/moduleShell.js';
import {createCodeEditor} from '../editor/createEditor.js';
import {createCelebration} from '../game/celebration.js';
import {renderSection} from '../review/renderSection.js';
import {renderRecap} from '../review/renderRecap.js';
import {checkpoints, byId} from './curriculum/checkpoints.js';
import {sections, sectionByChapter} from './curriculum/sections.js';
import {stages} from './curriculum/stages.js';
import {story} from './curriculum/story.js';
import {
  journey,
  screenId,
  parseScreen,
  nextScreen,
  previousScreen
} from './curriculum/journey.js';
import {edpModule} from './moduleDescriptor.js';
import {parseEdpSource, eventNames} from './validation/parse.js';
import {EdpRunner} from './client.js';
import {insertGap} from './insertGap.js';
import {
  loadEdpState,
  saveEdpState,
  parseEdpImport,
  replaceEdpDraft,
  canCommitEdp
} from './state/store.js';
import {readTomeOneLook} from './state/look.js';
import {
  activityAttempted,
  isScreenComplete,
  sectionProgress,
  chapterOfScreen
} from './state/journeyProgress.js';
import {renderStage} from './stage/renderStage.js';
import {createCrystalBall, logText} from './stage/crystalBall.js';
import {renderActivity} from './activities/renderActivity.js';
const node = (tag, text, className) => {
  const n = document.createElement(tag);
  if (text !== undefined) n.textContent = text;
  if (className) n.className = className;
  return n;
};
// Only build-time curriculum HTML passes through this helper. Learner data is text.
const rich = (tag, html) => {
  const n = node(tag);
  n.innerHTML = html;
  return n;
};
const $ = (selector) => document.querySelector(selector);
const text = (selector, value) => {
  $(selector).textContent = value;
};

export function mountEdpApp() {
  document.title = 'Tome II · Wizard Workshop';
  $('#app').innerHTML =
    `<header class="app-header">${brand()}<div class="header-tools"><span id="saved" role="status">Saved locally</span><button id="download">Download work</button><details class="tools"><summary>Workspace tools</summary><div><button id="download-mobile">Download work (JSON)</button><button id="download-code">Download code</button><label class="file-button">Import work<input id="import" type="file" accept=".json,application/json"></label><button id="restore">Restore previous draft</button><label>Code size <select id="font-size"><option>14</option><option>16</option><option>18</option><option>20</option><option>24</option></select></label><label><input id="reduce-motion" type="checkbox"> Reduce motion</label><label><input id="apprentice-mode" type="checkbox"> Apprentice mode: longer Fireball window, gentler hits</label><label><input id="slow-motion" type="checkbox"> Show event queue slowly</label><button id="refresh-look">Refresh from Tome I</button><button id="retry">Reload code runner</button></div></details></div></header>
  <div class="course-bar"><span class="tome-label">Tome II · Event-Driven Programming</span><label for="checkpoint">YOUR JOURNEY</label><select id="checkpoint" aria-label="Choose a checkpoint (teacher navigation)"></select><span id="progress"></span><a class="jump" href="#preview">Jump to preview ↓</a><button class="mobile-switch" id="view-switch">Show preview</button></div><p id="save-warning" role="status" hidden></p>
  <main hidden><section id="lesson" class="workbench" aria-label="Code and lesson"><div class="lesson-card"><div class="eyebrow"><span id="stage"></span><span id="scaffold"></span></div><h1 id="title" tabindex="-1"></h1><p id="objective"></p><details id="instructions"><summary>Step instructions &amp; success checklist</summary><ol id="instruction-list"></ol><ul id="checklist" class="trial-list"></ul><p id="starter-note"></p><p>Each Run starts fresh. Your listeners stay ready until you edit, stop or leave the step.</p></details><div id="activity" class="activity-panel" hidden></div></div>
  <div class="editor-shell"><div class="editor-tabs" role="tablist" aria-label="Stage files"><button role="tab" id="spells-tab" aria-selected="true" aria-controls="editor">spells.js</button><button role="tab" id="html-tab" aria-selected="false" aria-controls="stage-html">stage.html</button><span id="dirty">Not run yet</span></div><div id="editor" role="tabpanel" aria-labelledby="spells-tab"></div><div id="stage-html" role="tabpanel" aria-labelledby="html-tab" tabindex="0" hidden></div><div class="editor-help">JavaScript · Ctrl/Cmd+Enter to run · Ctrl/Cmd+] to indent · Tab leaves editor · Ctrl+Space for choices</div></div>
  <div class="run-bar"><button class="primary" id="run">▶ Run code</button><button id="stop" disabled>Stop</button><button id="hint">Hint 1</button><button id="reset">Reset step</button><button id="gaps">Insert exercise gaps</button></div><div id="result" class="result" role="status" aria-live="polite" aria-atomic="true"></div><button id="error-link" hidden>Go to problem</button><details id="technical" hidden><summary>Technical detail</summary><pre></pre></details><section id="hints" aria-label="Optional help" hidden></section><details id="reflection"><summary>Predict, explain &amp; self-check</summary><div></div></details><nav class="lesson-nav"><button id="previous">← Previous</button><span id="badge"></span><button id="next" disabled>Next step →</button></nav></section>
  <section id="preview" class="preview" tabindex="-1" aria-label="The Stage"><div class="preview-heading"><div><span class="eyebrow">THE STAGE</span><h2>Your spells, listening</h2></div><span id="live-label" class="live-label">○ NOT LISTENING YET</span></div><p id="stage-title"></p><div class="stage-frame" tabindex="0" aria-label="Stage. Keys you press here are sent to your spells."></div><p class="muted">Click the stage, then press keys. Tab moves out.</p><div class="character-strip"><div id="character-summary"></div><div id="world-summary"></div></div><div id="goblin-summary" hidden></div><div id="battle-hud" class="battle-hud" hidden><span id="turn-banner" role="status" aria-live="polite"></span><span id="battle-resources"></span></div><p id="preview-note" class="muted"></p><p id="scroll-notice" hidden>In a real web page, that key would also have scrolled the page.</p><section id="battle-ending" hidden></section><details id="crystal-ball" class="crystal-ball" open></details><details id="registered"><summary>Registered listeners</summary><div class="activity-table"><table><thead><tr><th>Target</th><th>Event</th><th>Handler</th></tr></thead><tbody></tbody></table></div></details><details id="trial-logs"><summary>Spell Trial logs</summary><div></div></details></section></main>
  <section id="section-screen" class="section-screen" aria-labelledby="section-title"></section><footer>Made for learning, one object at a time. <span>No accounts. Progress stays in this browser.</span></footer><dialog id="confirm-dialog"><form method="dialog"><h2 id="confirm-title"></h2><p>A recoverable backup of your current draft will be kept.</p><div><button value="cancel">Keep my draft</button><button value="confirm" class="primary">Replace and keep backup</button></div></form></dialog>`;
  let storage;
  try {
    storage = localStorage;
  } catch {
    storage = {
      getItem() {
        throw new Error('Storage disabled');
      },
      setItem() {
        throw new Error('Storage disabled');
      }
    };
  }
  const loaded = loadEdpState(storage);
  let state = loaded.state,
    look = readTomeOneLook(storage);
  let uiRunId = null;
  let runId = 0,
    verifiedRevision = null,
    stageView = null,
    activityView = null,
    saveTimer,
    lintTimer,
    sessionTimer,
    eventTimer,
    queue = [],
    inFlight = false,
    lastSent = 0,
    sessionClock = 0,
    lastDiagnostics = [],
    liveAttempt = false,
    battleCounted = false,
    endedCounted = false;
  const cp = () => byId[state.currentCheckpointId],
    draft = () => state.draftsByCheckpoint[cp().id];
  const reduced = () =>
    state.preferences.reduceMotion ||
    matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slow = () => state.preferences.slowMotion ?? false;
  const celebration = createCelebration($('#run'), reduced);
  const crystal = createCrystalBall($('#crystal-ball'), {
    reducedMotion: reduced,
    slowMotion: slow
  });
  function save() {
    clearTimeout(saveTimer);
    const error = saveEdpState(state, storage);
    text('#saved', error || 'Saved locally');
    text('#save-warning', error || '');
    $('#save-warning').hidden = !error;
  }
  function result(message, status = 'notRun') {
    text('#result', message);
    $('#result').dataset.status = status;
  }
  const runner = new EdpRunner((status, message) => {
    if (state.activeRun) result(message, status);
  });
  const editor = createCodeEditor($('#editor'), {
    choices: {},
    fontSize: () => state.preferences.codeFontSize,
    completionFields: () => [
      ...stages[cp().stage].elements.map((e) => `"#${e.id}"`),
      ...eventNames.map((name) => `"${name}"`)
    ],
    onRun: run,
    onChange(source) {
      draft().spellsSource = source;
      draft().revision++;
      invalidate();
      text('#dirty', 'Changes not run');
      saveTimer = setTimeout(save, 500);
      clearTimeout(lintTimer);
      const id = cp().id;
      lintTimer = setTimeout(() => {
        if (cp().id === id)
          showDiagnostics(parseEdpSource(draft().spellsSource, cp()));
      }, 350);
    }
  });
  function showDiagnostics(parsed) {
    lastDiagnostics = [...parsed.diagnostics, ...parsed.warnings];
    editor.diagnostics(lastDiagnostics, 'spells.js');
  }
  function initialise(id, sequential = false) {
    if (state.draftsByCheckpoint[id]) return;
    const current = byId[id],
      previous = checkpoints[current.index - 1];
    let source = current.starter.spellsSource;
    if (
      sequential &&
      current.starterStrategy === 'previous-success' &&
      state.lastSuccessfulSourcesByCheckpoint[previous?.id]
    )
      source =
        state.lastSuccessfulSourcesByCheckpoint[previous.id].spellsSource +
        '\n' +
        current.appendComment;
    state.draftsByCheckpoint[id] = {spellsSource: source, revision: 0};
  }
  function refreshJourney() {
    const select = $('#checkpoint');
    const current = screenId(state.currentScreen);
    select.replaceChildren();
    for (const section of sections) {
      const group = node('optgroup');
      const p = sectionProgress(section.chapter, state);
      group.label = `Section ${section.chapter} · ${section.title} — ${p.done} of ${p.total} done`;
      for (const id of journey.filter(
        (id) => chapterOfScreen(id) === section.chapter
      )) {
        const option = node(
          'option',
          (id === 'welcome'
            ? 'Tome II · Welcome'
            : id.startsWith('intro:')
              ? 'Section introduction'
              : id.startsWith('review:')
                ? 'Section review'
                : id + ' · ' + byId[id].title) +
            (isScreenComplete(id, state) ? ' — ✓ Done' : '')
        );
        option.value = id;
        group.append(option);
      }
      select.append(group);
    }
    const option = node('option', 'Tome II complete · Your spellbook');
    option.value = 'recap';
    select.append(option);
    select.value = current;
    text(
      '#progress',
      `${state.completedCheckpointIds.length} / ${checkpoints.length} completed`
    );
  }
  function endSession() {
    clearTimeout(sessionTimer);
    clearTimeout(eventTimer);
    queue = [];
    inFlight = false;
    runner.endSession();
    state.activeSession = null;
    stageView?.setLive(false);
    text('#live-label', '○ NOT LISTENING YET');
  }
  function invalidate() {
    uiRunId = null;
    celebration.stop();
    runId++;
    state.activeRun = null;
    endSession();
    runner.stop();
    verifiedRevision = null;
    $('#next').disabled = true;
    $('#stop').disabled = true;
    $('#run').disabled =
      cp().activity?.type === 'predict' && !activityAttempted(cp(), state);
  }
  function navigate(id, sequential = false) {
    save();
    invalidate();
    clearTimeout(lintTimer);
    stageView?.dispose();
    stageView = null;
    state.currentScreen = parseScreen(id);
    if (state.currentScreen.type === 'checkpoint') {
      state.currentCheckpointId = id;
      initialise(id, sequential);
    }
    showScreen();
    save();
  }
  function finalCode() {
    for (const current of [...checkpoints].reverse())
      if (
        current.chapter === 5 &&
        state.lastSuccessfulSourcesByCheckpoint[current.id]
      )
        return state.lastSuccessfulSourcesByCheckpoint[current.id];
    return null;
  }
  function showScreen() {
    refreshJourney();
    const checkpoint = state.currentScreen.type === 'checkpoint';
    $('main').hidden = !checkpoint;
    $('#section-screen').hidden = checkpoint;
    $('#view-switch').hidden = !checkpoint;
    $('.jump').hidden = !checkpoint;
    document.body.classList.toggle(
      'battle-mode',
      checkpoint && cp().id === 'E5.7'
    );
    if (checkpoint) showLesson();
    else if (state.currentScreen.type === 'welcome') showWelcome();
    else if (state.currentScreen.type === 'recap')
      renderRecap($('#section-screen'), sectionContent, {
        module: edpModule,
        navigate,
        download,
        finalCode: finalCode(),
        extras: {battleRecord: state.battleRecord}
      });
    else
      renderSection(
        $('#section-screen'),
        state.currentScreen,
        sectionContent,
        state,
        navigate,
        () => {
          save();
          refreshJourney();
        },
        {module: edpModule, celebrate: (button) => celebration.play(button)}
      );
  }
  function showWelcome() {
    state.seenWelcome = true;
    const welcome = sectionContent.welcome;
    const frame = $('#section-screen');
    frame.replaceChildren(
      node('p', 'TOME II · EVENT-DRIVEN PROGRAMMING', 'eyebrow')
    );
    const heading = node('h1', 'Awaken your wizard');
    heading.id = 'section-title';
    heading.tabIndex = -1;
    frame.append(
      heading,
      rich('p', welcome.prologue),
      rich('p', 'You will make: ' + welcome.build),
      node('h2', 'By the end of Tome II, you will be able to:')
    );
    const goals = node('ul');
    goals.append(...welcome.objectives.map((s) => rich('li', s)));
    frame.append(goals);
    const route = node('ol');
    route.append(...sections.map((s) => node('li', s.title)));
    frame.append(route);
    const start = node(
      'button',
      state.completedCheckpointIds.length
        ? 'Continue Tome II →'
        : 'Start Tome II →',
      'primary'
    );
    start.onclick = () => navigate('intro:1');
    frame.append(start);
    const prerequisite = node('details');
    prerequisite.append(node('summary', 'Prerequisite reminder'));
    const link = node('a', 'Tome I: objects, methods and this');
    link.href = tomeUrl('oop');
    prerequisite.append(
      link,
      node(
        'p',
        'A property (also called an attribute) stores data. A method — a function that belongs to a class — runs when called on an object.'
      )
    );
    for (const [title, copy] of [
      ['What’s new in Tome II', welcome.newInTome],
      ['Unit 4 connection', welcome.assignment]
    ]) {
      const details = node('details');
      details.append(node('summary', title), rich('p', copy));
      frame.append(details);
    }
    frame.append(prerequisite);
    heading.focus();
    save();
    refreshJourney();
  }
  function showFile(file) {
    const html = file === 'stage.html';
    $('#spells-tab').setAttribute('aria-selected', String(!html));
    $('#html-tab').setAttribute('aria-selected', String(html));
    $('#spells-tab').tabIndex = html ? -1 : 0;
    $('#html-tab').tabIndex = html ? 0 : -1;
    $('#editor').hidden = html;
    $('#stage-html').hidden = !html;
  }
  function showLesson() {
    const current = cp(),
      content = lessons[current.id];
    liveAttempt = false;
    battleCounted = false;
    endedCounted = false;
    verifiedRevision = null;
    text(
      '#stage',
      `SECTION ${current.chapter} · ${sectionByChapter[current.chapter].title.toUpperCase()} / ${current.id}`
    );
    text('#scaffold', current.scaffold);
    text('#title', current.title);
    $('#objective').innerHTML = content.objective;
    $('#instruction-list').replaceChildren(
      ...content.instructions.map((s) => rich('li', s))
    );
    // Open the steps by default where the task has several new ideas.
    $('#instructions').open = ['E1.1', 'E2.3', 'E3.2'].includes(current.id);
    text(
      '#starter-note',
      current.starterStrategy === 'prepared'
        ? 'This step uses a prepared example. Earlier drafts remain available.'
        : 'Sequential steps carry your previous successful spells.'
    );
    $('#gaps').hidden = !current.gap;
    $('#gaps').disabled = draft().spellsSource.includes('____');
    $('#reflection').hidden = !current.reflection;
    $('#reflection div').innerHTML =
      content.reflection + (content.comparison ?? '');
    $('#stage-html').replaceChildren(
      node(
        'p',
        'Read-only: the page’s HTML. Your JavaScript in spells.js makes it react.'
      ),
      rich('div', content.stage)
    );
    editor.show(current.id, 'spells.js', draft().spellsSource);
    showFile('spells.js');
    showDiagnostics(parseEdpSource(draft().spellsSource, current));
    activityView = renderActivity($('#activity'), current, state, () => {
      save();
      refreshCompletion();
    });
    $('#run').disabled =
      current.activity?.type === 'predict' &&
      !activityAttempted(current, state);
    $('#stop').disabled = true;
    $('#next').disabled = true;
    text('#dirty', 'Not run yet');
    text(
      '#badge',
      state.completedCheckpointIds.includes(current.id)
        ? '✓ Previously completed'
        : ''
    );
    $('#error-link').hidden = true;
    $('#technical').hidden = true;
    crystal.reset();
    crystal.showOnly(current.crystalFilters);
    const saved = state.lastGoodSnapshotByCheckpoint[current.id];
    stageView = renderStage(
      $('.stage-frame'),
      stages[current.stage],
      saved?.snapshot,
      {onStep: (step) => enqueue({step}), reducedMotion: reduced}
    );
    text('#stage-title', stages[current.stage].title);
    $('#battle-ending').hidden = true;
    renderSnapshot(saved?.snapshot, false);
    renderTrials(saved?.trials ?? []);
    showHints();
    result('Ready when you are. This draft needs a fresh Run.');
    text(
      '#preview-note',
      saved
        ? 'Last saved successful stage — rerun to make it live.'
        : 'Run your code to make the stage listen.'
    );
    $('#title').focus();
    $('#slow-motion').checked = slow();
  }
  function renderTrials(trials) {
    $('#checklist').replaceChildren(
      ...cp().trials.map((trial, index) => {
        const outcome = trials[index];
        const li = node(
          'li',
          `${outcome ? (outcome.passed ? '✓' : '✗') : '○'} ${trial.category ? trial.category[0].toUpperCase() + trial.category.slice(1) + ' — ' : ''}${trial.name}`
        );
        li.className = 'trial-tag';
        return li;
      })
    );
    const frame = $('#trial-logs div');
    frame.replaceChildren();
    for (const trial of trials) {
      const details = node('details');
      details.append(
        node(
          'summary',
          `${trial.passed ? '✓' : '✗'} ${trial.name} · ${trial.category ?? 'Trial'}`
        )
      );
      const list = node('ol');
      list.append(...trial.log.map((item) => node('li', logText(item))));
      details.append(node('p', trial.message), list);
      frame.append(details);
    }
  }
  function meter(parent, label, value, max) {
    const m = node('meter');
    m.min = 0;
    m.max = max;
    m.value = value;
    m.setAttribute('aria-label', label);
    parent.append(m);
  }
  function renderSnapshot(snapshot, live) {
    stageView?.update(snapshot, {live});
    text('#live-label', live ? '● LIVE' : '○ NOT LISTENING YET');
    const wizard = snapshot?.world.wizard,
      goblin = snapshot?.world.goblin;
    const summary = $('#character-summary');
    summary.replaceChildren(node('p', `Your wizard from Tome I: ${look.name}`));
    if (wizard) {
      summary.append(
        node(
          'p',
          `${wizard.name} · Health ${wizard.health}/${wizard.maxHealth} · Mana ${wizard.mana}/${wizard.maxMana} · ${wizard.awake ? 'awake' : 'asleep'} · Position ${wizard.x}, ${wizard.y}${wizard.shielded ? ' · Shield raised' : ''}`
        )
      );
      summary.append(
        node(
          'p',
          `Level ${wizard.level} · ${wizard.cloakColour} ${wizard.cloakPattern} cloak · ${wizard.wand} wand · Power: ${wizard.specialPower}${wizard.lastSpell ? ' · Last spell: ' + wizard.lastSpell : ''}`
        ),
        node('p', wizard.lastSpeech)
      );
      meter(summary, 'Wizard health', wizard.health, 100);
      meter(summary, 'Wizard mana', wizard.mana, 20);
    }
    const world = snapshot?.world;
    const facts = [];
    if (world?.lantern)
      facts.push('Lantern: ' + (world.lantern.lit ? 'lit' : 'dark'));
    if (world?.runeDoor)
      facts.push(
        `Rune Door: ${world.runeDoor.isOpen ? 'open' : 'closed'}; ${world.runeDoor.runesLit} runes lit; red flashes: ${world.runeDoor.redFlashes}`
      );
    if (world?.tower)
      facts.push('Tower: ' + (world.tower.awake ? 'awake' : 'asleep'));
    if (world?.dummy) facts.push('Dummy health: ' + world.dummy.health);
    text('#world-summary', facts.join(' · '));
    $('#goblin-summary').hidden = !goblin;
    if (goblin) {
      text(
        '#goblin-summary',
        `${goblin.name} · Health ${goblin.health}/${goblin.maxHealth}`
      );
      meter(
        $('#goblin-summary'),
        'Grub health',
        goblin.health,
        goblin.maxHealth
      );
    }
    $('#scroll-notice').hidden = !(snapshot?.page.scrollNudges > 0);
    const tbody = $('#registered tbody');
    tbody.replaceChildren(
      ...(snapshot?.registrations ?? []).map((r) => {
        const row = node('tr');
        row.append(
          node('td', r.target),
          node('td', r.type),
          node(
            'td',
            (r.handler ?? 'no function') + (r.accepted ? '' : ' — ' + r.reason)
          )
        );
        return row;
      })
    );
    $('#battle-hud').hidden = !snapshot?.battle;
    if (snapshot?.battle) {
      const b = snapshot.battle;
      const seconds =
        b.windowEnd === null
          ? null
          : Math.max(0, Math.ceil((b.windowEnd - b.time) / 1000));
      const turn =
        b.state === 'wizardTurn'
          ? 'Your turn'
          : b.state === 'goblinTurn'
            ? 'Grub is thinking…'
            : b.state === 'incantation'
              ? 'Type IGNIS, then Enter'
              : b.state === 'victory'
                ? 'Wizard Wins'
                : 'Goblin Wins';
      if ($('#turn-banner').textContent !== turn) text('#turn-banner', turn);
      text(
        '#battle-resources',
        ` · Potions ${wizard.potions}${seconds === null ? '' : ` · Fireball window: ${seconds}s left`}${state.preferences.apprenticeMode ? ' · Apprentice mode' : ''}`
      );
    }
    if (live && snapshot) {
      crystal.append(snapshot.log);
      if (snapshot.battle) recordBattle(snapshot);
    }
  }
  function recordBattle(snapshot) {
    const b = snapshot.battle;
    if ((b.stats.turns > 0 || b.state === 'incantation') && !battleCounted) {
      battleCounted = true;
      liveAttempt = true;
      state.battleRecord.attempts = Math.min(
        9999,
        state.battleRecord.attempts + 1
      );
      refreshCompletion();
    }
    if (battleCounted) state.battleRecord.lastStats = structuredClone(b.stats);
    if (!['victory', 'defeat'].includes(b.state) || endedCounted) return;
    endedCounted = true;
    if (b.state === 'victory')
      state.battleRecord.wins = Math.min(9999, state.battleRecord.wins + 1);
    const frame = $('#battle-ending');
    frame.hidden = false;
    frame.replaceChildren(
      node('h2', b.state === 'victory' ? 'Wizard Wins' : 'Grub wins this time'),
      node('p', b.state === 'victory' ? story.victory : story.defeat)
    );
    const tip = !b.stats.scried
      ? 'Scry Grub by hover or keyboard focus before choosing a spell.'
      : !b.stats.spells.fireball
        ? 'Try Fireball when you have 8 mana.'
        : !b.stats.shields
          ? 'Use a shield before a Big Bonk.'
          : 'Try a potion before health gets low.';
    if (b.state === 'defeat') frame.append(node('p', 'Quill’s tip: ' + tip));
    frame.append(
      node(
        'p',
        `Turns: ${b.stats.turns}. Scried: ${b.stats.scried}. Spells: ${Object.entries(
          b.stats.spells
        )
          .map(([power, n]) => power + ' ' + n)
          .join(', ')}.`
      )
    );
    frame.append(
      node(
        'p',
        'Events delivered: ' +
          Object.entries(b.stats.events)
            .map(([type, count]) => type + ' ' + count)
            .join(', ')
      ),
      node('p', `Shields: ${b.stats.shields}. Potions: ${b.stats.potions}.`)
    );
    if (b.state === 'victory') {
      const bell = node('button', 'Ring the Rune Bell', 'primary');
      bell.onclick = () => {
        enqueue({step: {do: 'bell'}});
        frame.append(
          node('p', story.bell),
          node(
            'p',
            '✓ Tome II complete — the Rune Bell rings through the tower.'
          )
        );
        bell.disabled = true;
      };
      frame.append(bell);
    }
    const retry = node('button', 'Retry battle');
    retry.onclick = () => startLive();
    frame.append(retry);
    if (state.battleRecord.attempts - state.battleRecord.wins >= 2) {
      const apprentice = node('button', 'Try Apprentice mode');
      apprentice.onclick = () => {
        state.preferences.apprenticeMode = true;
        $('#apprentice-mode').checked = true;
        save();
        startLive();
      };
      frame.append(apprentice);
    }
    save();
  }
  function refreshCompletion() {
    const current = cp(),
      qualified =
        verifiedRevision === draft().revision &&
        activityAttempted(current, state) &&
        (current.id !== 'E5.7' || liveAttempt);
    $('#next').disabled = !qualified;
    if (qualified && !state.completedCheckpointIds.includes(current.id)) {
      state.completedCheckpointIds.push(current.id);
      text('#badge', '✓ Checkpoint complete');
    }
    if (!state.activeRun)
      $('#run').disabled =
        current.activity?.type === 'predict' &&
        !activityAttempted(current, state);
    refreshJourney();
    save();
  }
  function scheduleTick(response) {
    clearTimeout(sessionTimer);
    if (
      document.hidden ||
      response.nextTimerInMs === null ||
      !state.activeSession
    )
      return;
    const delay = Math.min(response.nextTimerInMs, 1000),
      started = performance.now();
    sessionTimer = setTimeout(
      () => enqueue({elapsedMs: Math.min(2000, performance.now() - started)}),
      delay
    );
  }
  function acceptSession(response) {
    if (
      response.sessionId !== state.activeSession?.id ||
      state.currentScreen.type !== 'checkpoint' ||
      state.activeSession.revision !== draft().revision
    )
      return;
    renderSnapshot(response.snapshot, true);
    scheduleTick(response);
  }
  function enqueue(action) {
    if (!state.activeSession) return;
    queue.push(action);
    if (queue.length > 100) queue.shift();
    pump();
  }
  async function pump() {
    if (inFlight || !queue.length || !state.activeSession) return;
    const delay = Math.max(0, 50 - (performance.now() - lastSent));
    clearTimeout(eventTimer);
    if (delay) {
      eventTimer = setTimeout(pump, delay);
      return;
    }
    inFlight = true;
    lastSent = performance.now();
    const elapsedMs = Math.min(2000, Math.max(0, lastSent - sessionClock));
    sessionClock = lastSent;
    const action = queue.shift(),
      sessionId = state.activeSession.id;
    try {
      const response = action.step
        ? await runner.sendEvent(action.step, elapsedMs)
        : await runner.tick(elapsedMs);
      acceptSession(response);
    } catch (error) {
      if (state.activeSession?.id === sessionId) {
        endSession();
        result(
          '⚠ ' + error.message + ' Run again to restart the stage.',
          'stopped'
        );
      }
    } finally {
      if (state.activeSession?.id === sessionId) {
        inFlight = false;
        pump();
      }
    }
  }
  async function startLive() {
    endSession();
    crystal.reset();
    liveAttempt = false;
    battleCounted = false;
    endedCounted = false;
    $('#battle-ending').hidden = true;
    const id = `edp-${++runId}`,
      revision = draft().revision,
      checkpointId = cp().id;
    const seed =
      import.meta.env.DEV && Number.isInteger(window.__wwTestSeed)
        ? window.__wwTestSeed
        : crypto.getRandomValues(new Uint32Array(1))[0];
    sessionClock = performance.now();
    state.activeSession = {id, revision, checkpointId};
    $('#stop').disabled = false;
    try {
      const response = await runner.startSession({
        sessionId: id,
        checkpointId,
        source: draft().spellsSource,
        seed,
        look,
        apprentice: state.preferences.apprenticeMode
      });
      acceptSession(response);
    } catch (error) {
      if (state.activeSession?.id === id) {
        endSession();
        result(
          '⚠ ' + error.message + ' Run again to restart the stage.',
          'stopped'
        );
      }
    }
  }
  async function run() {
    if (
      state.activeRun ||
      state.currentScreen.type !== 'checkpoint' ||
      (cp().activity?.type === 'predict' && !activityAttempted(cp(), state))
    )
      return;
    celebration.stop();
    endSession();
    save();
    const request = {
      runId: ++runId,
      checkpointId: cp().id,
      revision: draft().revision,
      source: draft().spellsSource,
      look,
      apprentice: state.preferences.apprenticeMode
    };
    state.activeRun = request;
    uiRunId = request.runId;
    $('#run').disabled = true;
    $('#stop').disabled = false;
    $('#next').disabled = true;
    $('#error-link').hidden = true;
    $('#technical').hidden = true;
    verifiedRevision = null;
    result('Checking your spells…', 'checking');
    try {
      const parsed = parseEdpSource(request.source, cp());
      showDiagnostics(parsed);
      const response = parsed.diagnostics.length
        ? {
            ...request,
            result: {status: 'error', diagnostics: parsed.diagnostics}
          }
        : await runner.run(request);
      if (!canCommitEdp(state, response)) return;
      const value = response.result;
      if (['success', 'validButIncomplete'].includes(value.status)) {
        state.lastGoodSnapshotByCheckpoint[cp().id] = value;
        renderSnapshot(value.snapshot, false);
        renderTrials(value.trials);
        activityView?.afterRun();
        if (value.status === 'success') {
          verifiedRevision = draft().revision;
          state.lastSuccessfulSourcesByCheckpoint[cp().id] = {
            spellsSource: request.source
          };
          result('✓ ' + cp().effect, 'success');
          celebration.play();
        } else
          result(
            '○ Your spells ran. Next: ' +
              value.trials.find((t) => !t.passed).message,
            'validButIncomplete'
          );
        text('#dirty', 'Run matches this draft');
        text(
          '#preview-note',
          'Your spells are listening. Experiment with the stage.'
        );
        refreshCompletion();
        state.activeRun = null;
        await startLive();
      } else {
        lastDiagnostics = value.diagnostics;
        editor.diagnostics(
          [...lastDiagnostics, ...parsed.warnings],
          'spells.js'
        );
        const d = lastDiagnostics[0];
        result(
          '⚠ ' +
            (d?.message ?? 'The run was stopped.') +
            ' Your last working stage is still here.',
          value.status
        );
        if (d) {
          $('#error-link').hidden = false;
          const line = request.source.slice(0, d.from).split('\n').length;
          const column =
            d.from - (request.source.lastIndexOf('\n', d.from - 1) + 1) + 1;
          text(
            '#error-link',
            `spells.js · line ${line}, column ${column} — go to problem`
          );
          $('#technical').hidden = !d.detail;
          text('#technical pre', d.detail ?? '');
        }
      }
      save();
    } catch (error) {
      if (state.activeRun?.runId === request.runId)
        result(
          '⚠ ' + error.message + ' Your last working stage is still here.',
          'stopped'
        );
    } finally {
      if (state.activeRun?.runId === request.runId) state.activeRun = null;
      if (
        uiRunId === request.runId &&
        state.currentScreen.type === 'checkpoint' &&
        state.currentCheckpointId === request.checkpointId &&
        draft().revision === request.revision
      ) {
        $('#run').disabled = false;
        $('#stop').disabled = !state.activeSession;
      }
    }
  }
  function showHints() {
    const depth = state.hintDepthByCheckpoint[cp().id] ?? 0;
    const frame = $('#hints');
    frame.hidden = !depth;
    frame.replaceChildren();
    for (let i = 0; i < depth; i++)
      frame.append(
        node(
          'h3',
          [
            'Hint 1 · Concept',
            'Hint 2 · Location and syntax',
            'Worked example'
          ][i]
        ),
        rich('p', lessons[cp().id].hints[i])
      );
    if (depth === 3) {
      frame.append(
        ...lessons[cp().id].solution.map((html) => rich('div', html))
      );
      const replace = node('button', 'Replace with worked example');
      replace.onclick = () =>
        replaceCode(cp().solution, 'Replace with the worked example?');
      frame.append(replace);
    }
    text(
      '#hint',
      depth === 0 ? 'Hint 1' : depth === 1 ? 'Hint 2' : 'Worked example'
    );
    $('#hint').disabled = depth === 3;
  }
  function confirmAction(title, action) {
    const dialog = $('#confirm-dialog');
    text('#confirm-title', title);
    dialog.returnValue = '';
    dialog.showModal();
    dialog.addEventListener(
      'close',
      () => {
        if (dialog.returnValue === 'confirm') action();
      },
      {once: true}
    );
  }
  function replaceCode(source, title) {
    confirmAction(title, () => {
      invalidate();
      replaceEdpDraft(state, cp().id, source);
      editor.invalidate(cp().id);
      stageView?.dispose();
      showLesson();
      save();
    });
  }
  function download(filename, content, type) {
    const url = URL.createObjectURL(new Blob([content], {type}));
    const link = node('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  $('#checkpoint').onchange = (event) => navigate(event.target.value);
  $('#run').onclick = run;
  $('#stop').onclick = () => {
    invalidate();
    result('Run stopped. Your last working stage is still here.', 'stopped');
  };
  $('#retry').onclick = () => {
    invalidate();
    result('Runner reset. Choose Run code to retry.');
  };
  $('#previous').onclick = () => navigate(previousScreen(cp().id));
  $('#next').onclick = () => {
    if (!$('#next').disabled) navigate(nextScreen(cp().id), true);
  };
  for (const tab of [$('#spells-tab'), $('#html-tab')])
    tab.onkeydown = (event) => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const next =
          event.key === 'Home'
            ? $('#spells-tab')
            : event.key === 'End'
              ? $('#html-tab')
              : tab.id === 'spells-tab'
                ? $('#html-tab')
                : $('#spells-tab');
        next.click();
        next.focus();
      }
    };
  $('#spells-tab').onclick = () => showFile('spells.js');
  $('#html-tab').onclick = () => showFile('stage.html');
  $('#hint').onclick = () => {
    state.hintDepthByCheckpoint[cp().id] = Math.min(
      3,
      (state.hintDepthByCheckpoint[cp().id] ?? 0) + 1
    );
    showHints();
    save();
  };
  $('#reset').onclick = () =>
    replaceCode(cp().starter, 'Reset this step to its starting example?');
  $('#restore').onclick = () => {
    if (state.backupsByCheckpoint[cp().id])
      replaceCode(
        state.backupsByCheckpoint[cp().id],
        'Restore the previous draft?'
      );
    else result('No replacement backup exists for this step yet.');
  };
  $('#gaps').onclick = () => {
    replaceCode(
      {spellsSource: insertGap(cp().id, draft().spellsSource, cp().gap)},
      'Insert this exercise gap into your draft?'
    );
  };
  $('#error-link').onclick = () => {
    showFile('spells.js');
    const d = lastDiagnostics[0];
    editor.focus(d.from, d.to);
  };
  $('#download').onclick = () => {
    save();
    download(
      'wizard-workshop-tome-2-work.json',
      JSON.stringify({...state, activeRun: null, activeSession: null}, null, 2),
      'application/json'
    );
  };
  $('#download-mobile').onclick = () => $('#download').click();
  $('#download-code').onclick = () =>
    download(
      'wizard-workshop-tome-2-spells.txt',
      '// spells.js\n' + draft().spellsSource,
      'text/plain'
    );
  $('#import').onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024)
        throw new Error('Work files must be under 2MB.');
      const imported = parseEdpImport(await file.text());
      confirmAction('Import work and replace saved drafts?', () => {
        invalidate();
        stageView?.dispose();
        const backups = {
          ...state.backupsByCheckpoint,
          ...state.draftsByCheckpoint
        };
        state = imported;
        state.backupsByCheckpoint = {...state.backupsByCheckpoint, ...backups};
        for (const cp of checkpoints) editor.invalidate(cp.id);
        initialise(state.currentCheckpointId);
        showScreen();
        save();
      });
    } catch (error) {
      text('#save-warning', 'Import could not be read: ' + error.message);
      $('#save-warning').hidden = false;
    }
    event.target.value = '';
  };
  $('#font-size').value = String(state.preferences.codeFontSize);
  $('#font-size').onchange = (event) => {
    state.preferences.codeFontSize = Number(event.target.value);
    editor.fontSize();
    save();
  };
  $('#reduce-motion').checked = state.preferences.reduceMotion;
  $('#reduce-motion').onchange = (event) => {
    state.preferences.reduceMotion = event.target.checked;
    document.body.classList.toggle(
      'reduce-motion',
      state.preferences.reduceMotion
    );
    celebration.stop();
    save();
  };
  document.body.classList.toggle(
    'reduce-motion',
    state.preferences.reduceMotion
  );
  $('#apprentice-mode').checked = state.preferences.apprenticeMode;
  $('#apprentice-mode').onchange = (event) => {
    state.preferences.apprenticeMode = event.target.checked;
    endSession();
    result('Apprentice mode changed. Run again to restart with this setting.');
    save();
  };
  $('#slow-motion').onchange = (event) => {
    state.preferences.slowMotion = event.target.checked;
    save();
  };
  $('#refresh-look').onclick = () => {
    look = readTomeOneLook(storage);
    endSession();
    result(`Your Tome I look is refreshed: ${look.name}. Run again to use it.`);
    save();
  };
  $('#view-switch').onclick = () => {
    const preview = document.body.classList.toggle('preview-only');
    text('#view-switch', preview ? 'Show code' : 'Show preview');
    if (preview) $('#preview').focus();
    else editor.focus();
  };
  document.addEventListener('visibilitychange', () => {
    clearTimeout(sessionTimer);
    if (document.hidden) sessionClock = 0;
    else sessionClock = performance.now();
    if (!document.hidden && state.activeSession) enqueue({elapsedMs: 0});
  });
  window.addEventListener('beforeunload', () => {
    save();
    runner.stop();
    crystal.dispose();
  });
  initialise(state.currentCheckpointId);
  showScreen();
  if (loaded.error) {
    text('#save-warning', loaded.error);
    $('#save-warning').hidden = false;
  }
}
