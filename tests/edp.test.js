import {beforeAll, describe, it, expect} from 'vitest';
import {getQuickJS} from 'quickjs-emscripten';
import {
  EdpContext,
  EdpSession,
  runEdpProgram,
  runEdpExample
} from '../src/edp/engine.js';
import {checkpoints, byId} from '../src/edp/curriculum/checkpoints.js';
import {sections} from '../src/edp/curriculum/sections.js';
import {parseEdpSource} from '../src/edp/validation/parse.js';
import {validEdpResult} from '../src/edp/validation/result.js';
import {
  emptyEdpState,
  parseEdpImport,
  saveEdpState,
  loadEdpState,
  EDP_STORAGE_KEY,
  canCommitEdp
} from '../src/edp/state/store.js';
import {simulateBalance} from '../scripts/balance-edp.mjs';
let QuickJS;
beforeAll(async () => {
  QuickJS = await getQuickJS();
});
const run = (cp, source = cp.solution.spellsSource) =>
  runEdpProgram(QuickJS, {checkpointId: cp.id, source});
function stage(source, steps = [], stageId = 'tower-bedroom', reads = []) {
  const vm = new EdpContext(QuickJS, {stage: stageId, source, reads});
  try {
    for (const step of steps) vm.step(step);
    return vm.snapshot();
  } finally {
    vm.dispose();
  }
}
describe('Tome II curriculum', () => {
  it.each(checkpoints)(
    '$id solution executes and its prepared starter matches its declared status',
    (cp) => {
      const solution = run(cp);
      expect(
        solution.status,
        JSON.stringify(solution.trials ?? solution.diagnostics)
      ).toBe('success');
      expect(validEdpResult(solution, cp.id)).toBe(true);
      expect(
        solution.snapshot.log.filter((entry) => entry.type === 'click')
      ).toHaveLength(0);
      expect(run(cp, cp.starter.spellsSource).status).toBe(
        cp.starterExpected.status
      );
      expect(cp.instructions.length).toBeGreaterThan(0);
      expect(cp.hints).toHaveLength(3);
    }
  );
  it.each(sections)(
    '$id complete introduction produces its stated result and has both question types',
    (section) => {
      expect(runEdpExample(QuickJS, section.intro.example)).toBe(true);
      const questions = section.review.questions;
      expect(
        questions.filter((q) => q.type === 'choice').length
      ).toBeGreaterThanOrEqual(2);
      expect(
        questions.filter((q) => q.type === 'blank').length
      ).toBeGreaterThanOrEqual(2);
      for (const question of questions)
        if (question.type === 'choice')
          expect(question.options.filter((o) => o.correct)).toHaveLength(1);
        else expect(question.accept.length).toBeGreaterThan(0);
    }
  );
  it('accepts equivalent handlers and identifies called functions, event spelling, selectors and removal references', () => {
    expect(
      run(
        byId['E1.3'],
        byId['E1.3'].solution.spellsSource.replace(
          'goToSleep);',
          '() => goToSleep());'
        )
      ).status
    ).toBe('success');
    for (const [source, code] of [
      ['document.querySelector("wake-button")', 'selector'],
      ['document.addEventListener("Click", () => {});', 'event-name'],
      ['document.removeEventListener("click", () => {});', 'remove-inline']
    ])
      expect(
        parseEdpSource(source, byId['E1.1']).warnings.some(
          (w) => w.code === code
        )
      ).toBe(true);
  });
});
describe('simulated browser semantics and bounded execution', () => {
  it('bubbles from child to parent, preserving target and changing currentTarget and this', () => {
    const data = stage(
      `const book=document.querySelector('#spellbook');book.addEventListener('click',function(event){console.log(event.target.id,event.currentTarget.id,this.id);});`,
      [{do: 'click', target: '#fire-card'}],
      'spell-room'
    );
    expect(
      data.log.some(
        (entry) => entry.message === 'fire-card spellbook spellbook'
      )
    ).toBe(true);
  });
  it('honours once, duplicate references, removals during dispatch and propagation stops', () => {
    const data = stage(
      `const bell=document.querySelector('#wake-button');let count=0;function later(){count+=10;}function first(event){count++;bell.removeEventListener('click',later);event.stopPropagation();}bell.addEventListener('click',first,{once:true});bell.addEventListener('click',first);bell.addEventListener('click',later);document.addEventListener('click',()=>count+=100);`,
      [
        {do: 'click', target: '#wake-button'},
        {do: 'click', target: '#wake-button'}
      ],
      'tower-bedroom',
      ['count']
    );
    expect(data.globals.count).toBe(101);
    expect(
      data.registrations.filter((r) => r.accepted && r.operation !== 'remove')
    ).toHaveLength(3);
  });
  it('runs zero-delay timers after setup and preserves ordering and cancellation', () => {
    const data = stage(
      `console.log(1);setTimeout(()=>console.log(2),0);console.log(3);const id=setTimeout(()=>console.log('cancelled'),50);clearTimeout(id);setTimeout(()=>console.log(4),100);setTimeout(()=>console.log(5),100);`,
      [{do: 'wait', ms: 100}]
    );
    expect(
      data.log.filter((e) => e.type === 'console').map((e) => e.message)
    ).toEqual(['1', '3', '2', '4', '5']);
  });
  it('continues after handler errors, maps errors to learner source and stops loops without poisoning the next run', () => {
    const data = stage(
      `document.addEventListener('click',()=>{throw new Error('oops');});document.addEventListener('click',()=>wizard.wake());`,
      [{do: 'click', target: '#wake-button'}]
    );
    expect(data.world.wizard.awake).toBe(true);
    expect(data.errors[0].detail).toMatch(/spells.js/);
    expect(run(byId['E1.1'], 'while(true){}').status).toBe('stopped');
    expect(run(byId['E1.1']).status).toBe('success');
  });
  it('keeps object identity, exposes no host facilities, protects datasets and bounds text and position', () => {
    const data = stage(
      `const button=document.querySelector('#wake-button');console.log(button===document.querySelector('#wake-button'));console.log(typeof fetch,typeof Date,typeof Math.random,typeof window);button.textContent='x'.repeat(500);wizard.moveTo(999,-5);try{button.dataset.power='fire';}catch(error){console.log('protected');}`
    );
    expect(data.log.some((e) => e.message === 'true')).toBe(true);
    expect(
      data.log.some(
        (e) => e.message === 'undefined undefined undefined undefined'
      )
    ).toBe(true);
    expect(data.elements['wake-button'].text).toHaveLength(200);
    expect(data.world.wizard).toMatchObject({x: 280, y: 40});
    for (const source of [
      'setInterval(()=>{},1);',
      'const __wwHack=1;',
      'async function wait() {}',
      'const wizard={};'
    ])
      expect(
        parseEdpSource(source, byId['E1.1']).diagnostics.length
      ).toBeGreaterThan(0);
  });
  it('records default scrolling only when it was not prevented', () => {
    expect(
      stage('', [{do: 'key', key: 'ArrowDown', target: 'document'}]).page
        .scrollNudges
    ).toBe(1);
    expect(
      stage(`document.addEventListener('keydown',e=>e.preventDefault());`, [
        {do: 'key', key: 'ArrowDown', target: 'document'}
      ]).page.scrollNudges
    ).toBe(0);
  });
  it('validates host results before accepting them', () => {
    const valid = run(byId['E1.1']);
    expect(
      validEdpResult(
        {...valid, snapshot: {...valid.snapshot, elements: {}}},
        'E1.1'
      )
    ).toBe(false);
    valid.snapshot.world.wizard.name = '<img src=x onerror=alert(1)>';
    expect(validEdpResult(valid, 'E1.1')).toBe(false);
    expect(validEdpResult({status: 'success'}, 'E1.1')).toBe(false);
  });
  it('maintains live state separately from fresh trials and uses bounded elapsed time', () => {
    const request = {
      checkpointId: 'E1.1',
      source: byId['E1.1'].solution.spellsSource,
      sessionId: 's'
    };
    const live = new EdpSession(QuickJS, request);
    try {
      live.update({
        type: 'edp-session-event',
        seq: 1,
        step: {do: 'click', target: '#wake-button'}
      });
      expect(live.state().snapshot.world.wizard.awake).toBe(true);
      expect(run(byId['E1.1']).snapshot.world.wizard.awake).toBe(false);
    } finally {
      live.dispose();
    }
  });
});
describe('Tome II persistence', () => {
  it('stores independently, sanitises review/activities and never restores active execution', () => {
    const map = new Map([['wizard-workshop:v1', 'untouched']]);
    const storage = {
      getItem: (key) => map.get(key) ?? null,
      setItem: (key, value) => map.set(key, value)
    };
    const state = emptyEdpState();
    state.activeSession = {id: 2};
    state.activeRun = {runId: 2};
    state.draftsByCheckpoint['E1.1'] = {
      spellsSource: '// my draft',
      revision: 5
    };
    state.reviewByChapter[1] = {answers: {unknown: {response: 'bad'}}};
    expect(saveEdpState(state, storage)).toBeNull();
    expect(map.get('wizard-workshop:v1')).toBe('untouched');
    const restored = loadEdpState(storage).state;
    expect(restored.activeSession).toBeNull();
    expect(restored.activeRun).toBeNull();
    expect(restored.draftsByCheckpoint['E1.1'].spellsSource).toBe(
      '// my draft'
    );
    expect(restored.reviewByChapter[1].answers).toEqual({});
    expect(map.has(EDP_STORAGE_KEY)).toBe(true);
    expect(() => parseEdpImport('{')).toThrow();
    expect(() =>
      parseEdpImport(JSON.stringify({...state, curriculumVersion: 999}))
    ).toThrow();
  });
  it('rejects stale revisions and navigation, including revisiting the same checkpoint', () => {
    const state = emptyEdpState();
    state.currentScreen = {type: 'checkpoint', id: 'E1.1'};
    state.draftsByCheckpoint['E1.1'] = {spellsSource: '', revision: 2};
    state.activeRun = {runId: 1, checkpointId: 'E1.1', revision: 2};
    const reply = {...state.activeRun};
    expect(canCommitEdp(state, reply)).toBe(true);
    state.draftsByCheckpoint['E1.1'].revision++;
    expect(canCommitEdp(state, reply)).toBe(false);
    state.activeRun = null;
    expect(canCommitEdp(state, reply)).toBe(false);
  });
});
describe('battle balance through reference listeners', () => {
  it('meets the two 1,000-seed strategy targets', () => {
    const results = simulateBalance(QuickJS);
    expect(results.fireOnly.winRate).toBeGreaterThanOrEqual(0.65);
    expect(results.fireOnly.winRate).toBeLessThanOrEqual(0.85);
    expect(results.fullControls.winRate).toBeGreaterThanOrEqual(0.9);
    expect(results.fullControls.winRate).toBeLessThanOrEqual(0.99);
  }, 120000);
});

describe('battle edge cases and limits', () => {
  const source = byId['E5.4'].solution.spellsSource;
  const battle = (steps, options = {}) => {
    const vm = new EdpContext(QuickJS, {
      stage: 'grubbledown-bridge',
      source,
      seed: 7,
      ...options
    });
    try {
      for (const step of steps) vm.step(step);
      return vm.snapshot();
    } finally {
      vm.dispose();
    }
  };
  it('is reproducible and refuses actions during the other turn', () => {
    const steps = [
      {do: 'click', target: '#fire-card'},
      {do: 'click', target: '#ice-card'},
      {do: 'wait', ms: 1200}
    ];
    expect(battle(steps)).toEqual(battle(steps));
    expect(battle(steps).battle.stats.spells).toMatchObject({fire: 1, ice: 0});
  });
  it('expires the incantation window, charges the fizzle, and extends it for Apprentice mode', () => {
    const steps = [
      {do: 'click', target: '#fireball-button'},
      {do: 'wait', ms: 5000}
    ];
    const expired = battle(steps);
    expect(expired.battle.state).toBe('goblinTurn');
    expect(expired.world.wizard.mana).toBe(16);
    expect(expired.world.goblin.health).toBe(110);
    expect(battle(steps, {apprentice: true}).battle.state).toBe('incantation');
  });
  it('shields halve a Big Bonk and ice slows it by four', () => {
    // Seed 1 selects Big Bonk with the measured intent weights.
    const shield = battle(
      [
        {do: 'click', target: '#shield-button'},
        {do: 'wait', ms: 1200}
      ],
      {seed: 1}
    );
    expect(shield.world.wizard.health).toBe(92);
    expect(shield.world.wizard.shielded).toBe(false);
    const ice = battle(
      [
        {do: 'click', target: '#ice-card'},
        {do: 'wait', ms: 1200}
      ],
      {seed: 1}
    );
    expect(ice.world.wizard.health).toBe(88);
    expect(ice.world.wizard.mana).toBe(20);
    expect(
      battle(
        [
          {do: 'click', target: '#shield-button'},
          {do: 'wait', ms: 1200}
        ],
        {apprentice: true, seed: 1}
      ).world.wizard.health
    ).toBe(94);
  });
  it('announces the ending once, refuses later actions and accepts the trusted bell cascade only on victory', () => {
    const data = battle([
      {do: 'set', path: 'goblin.health', value: 14},
      {do: 'click', target: '#fire-card'},
      {do: 'key', key: 'f', target: 'document'},
      {do: 'click', target: '#fire-card'},
      {do: 'bell'}
    ]);
    expect(data.battle.state).toBe('victory');
    expect(data.log.filter((e) => e.type === 'battleEnded')).toHaveLength(1);
    expect(data.battle.stats.spells.fire).toBe(1);
    expect(data.log.some((e) => e.type === 'bellRung')).toBe(true);
    expect(battle([{do: 'bell'}]).log.some((e) => e.type === 'bellRung')).toBe(
      false
    );
  });
  it('stops event loops and timer/listener exhaustion, then allows a fresh valid run', () => {
    expect(
      run(
        byId['E1.1'],
        `document.querySelector('#wake-button').addEventListener('click',()=>{while(true){}});`
      ).status
    ).toBe('stopped');
    for (const code of [
      'for(let i=0;i<51;i++)setTimeout(()=>{},60000);',
      "for(let i=0;i<61;i++)document.addEventListener('click',()=>{});"
    ])
      expect(run(byId['E1.1'], code).status).toBe('error');
    expect(run(byId['E1.1']).status).toBe('success');
  });
  it('does not expose a newly learnt card before the trusted stage adds it', () => {
    const data = stage(
      `console.log(document.querySelector('#storm-card'));document.querySelector('#learn-button').addEventListener('click',()=>console.log(document.querySelector('#storm-card').dataset.power));`,
      [{do: 'click', target: '#learn-button'}],
      'spell-room'
    );
    expect(
      data.log.filter((e) => e.type === 'console').map((e) => e.message)
    ).toEqual(['null', 'electricity']);
  });
});
it('shows mapped timer callback errors and continues to the next timer', () => {
  const data = stage(
    `setTimeout(()=>{throw new Error("Timer problem");},0);setTimeout(()=>wizard.wake(),0);`
  );
  expect(data.world.wizard.awake).toBe(true);
  expect(
    data.log.some(
      (e) => e.type === 'error' && e.message.includes('spells.js, line')
    )
  ).toBe(true);
  expect(data.log.filter((e) => e.type === 'timer').map((e) => e.ok)).toEqual([
    false,
    true
  ]);
});
