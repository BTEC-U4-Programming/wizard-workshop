import {describe, it, expect} from 'vitest';
import {checkpoints, byId} from '../src/edp/curriculum/checkpoints.js';
import {sections, optionOrder} from '../src/edp/curriculum/sections.js';
import {stages} from '../src/edp/curriculum/stages.js';
import {journey, parseScreen, screenId} from '../src/edp/curriculum/journey.js';
import {
  activityAttempted,
  sectionProgress
} from '../src/edp/state/journeyProgress.js';
import {
  emptyEdpState,
  parseEdpImport,
  loadEdpState,
  saveEdpState
} from '../src/edp/state/store.js';
import {readTomeOneLook} from '../src/edp/state/look.js';
import {emptyState, STORAGE_KEY, parseImport} from '../src/state/store.js';
import {oopModule} from '../src/oop/moduleDescriptor.js';
import {parseEdpSource} from '../src/edp/validation/parse.js';
import {recapMarkdown} from '../src/edp/curriculum/recap.js';
const storageFor = (state) => {
  const map = new Map([[STORAGE_KEY, JSON.stringify(state)]]);
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, value)
  };
};
describe('curriculum and navigation contracts', () => {
  it('has 31 stable checkpoints and the exact 44-screen journey', () => {
    expect(checkpoints).toHaveLength(31);
    expect(journey).toHaveLength(44);
    expect(journey[0]).toBe('welcome');
    expect(journey.at(-1)).toBe('review:6');
    expect(new Set(journey).size).toBe(44);
    for (const id of [...journey, 'recap'])
      expect(screenId(parseScreen(id))).toBe(id);
    expect(parseScreen('bad')).toEqual({type: 'welcome'});
    for (const cp of checkpoints) {
      expect(cp.trials.length).toBeGreaterThan(0);
      expect(cp.trials.length).toBeLessThanOrEqual(12);
      for (const trial of cp.trials) {
        expect(trial.steps.length).toBeLessThanOrEqual(60);
        for (const step of trial.steps)
          if (step.target && step.target !== 'document')
            expect(
              stages[cp.stage].elements.some((e) => '#' + e.id === step.target)
            ).toBe(true);
      }
      if (cp.gap) expect(cp.gap).toContain('____');
      expect(cp.solution.spellsSource).not.toContain('____');
      for (const name of cp.reads)
        expect(cp.solution.spellsSource).toContain(name);
    }
  });
  it('preserves Tome I descriptor boundaries and completion targets', () => {
    expect([1, 2, 3, 4, 5].map(oopModule.firstScreenOfChapter)).toEqual([
      'C1.1a',
      'C2.1a',
      'C3.1a',
      'C4.1',
      'C5.1a'
    ]);
    expect([1, 2, 3, 4, 5].map(oopModule.lastScreenOfChapter)).toEqual([
      'C1.2',
      'C2.7',
      'C3.5',
      'C4.5',
      'C5.4'
    ]);
    expect(oopModule.backToReviewId).toBe('review:5');
  });
  it('bounds introduction text and keeps stable, shuffled review options and known revisit links', () => {
    const ids = new Set();
    let shuffled = false;
    for (const section of sections) {
      expect(section.intro.objectives).toHaveLength(3);
      expect(section.intro.hook.length).toBeLessThanOrEqual(140);
      expect(section.intro.summary.length).toBeLessThanOrEqual(240);
      for (const q of section.review.questions) {
        expect(ids.has(q.id)).toBe(false);
        ids.add(q.id);
        expect(q.revisit.startsWith('intro:') || !!byId[q.revisit]).toBe(true);
        if (q.type === 'blank') expect(q.code.match(/____/g)).toHaveLength(1);
        else {
          expect(optionOrder(q)).toEqual(optionOrder(q));
          shuffled ||= optionOrder(q)[0].correct === false;
        }
      }
    }
    expect(shuffled).toBe(true);
  });
  it('counts attempts separately from activity correctness and code completion', () => {
    const state = emptyEdpState(),
      cp = byId['E1.5'];
    state.completedCheckpointIds.push(cp.id);
    expect(sectionProgress(1, state).done).toBe(0);
    state.activityAnswersByCheckpoint[cp.id] = {
      cards: Object.fromEntries(cp.activity.cards.map((card) => [card.id, '0']))
    };
    expect(activityAttempted(cp, state)).toBe(true);
    expect(sectionProgress(1, state).done).toBe(1);
    state.activityAnswersByCheckpoint['E5.1'] = {prediction: ''};
    expect(activityAttempted(byId['E5.1'], state)).toBe(false);
  });
});
describe('import boundaries and preferences', () => {
  it('copies preferences once and rejects cross-tome work files', () => {
    const oop = emptyState();
    oop.preferences = {codeFontSize: 20, reduceMotion: true};
    const storage = storageFor(oop);
    const edp = loadEdpState(storage).state;
    expect(edp.preferences).toMatchObject(oop.preferences);
    saveEdpState(edp, storage);
    oop.preferences.codeFontSize = 14;
    storage.setItem(STORAGE_KEY, JSON.stringify(oop));
    expect(loadEdpState(storage).state.preferences.codeFontSize).toBe(20);
    expect(() => parseImport(JSON.stringify(edp))).toThrow();
    expect(() => parseEdpImport(JSON.stringify(oop))).toThrow();
    expect(readTomeOneLook(storage)).toMatchObject({
      name: 'Aster',
      cloakColour: 'grey'
    });
  });
  it('rejects malformed sources, removes unknown activity fields and clamps battle totals', () => {
    const state = emptyEdpState();
    state.activityAnswersByCheckpoint['E1.5'] = {
      cards: {card0: '', unknown: '1'}
    };
    state.battleRecord = {attempts: 2, wins: 500, lastStats: {bad: true}};
    const imported = parseEdpImport(JSON.stringify(state));
    expect(imported.activityAnswersByCheckpoint['E1.5'].cards).toEqual({});
    expect(imported.battleRecord).toEqual({
      attempts: 2,
      wins: 2,
      lastStats: null
    });
    state.draftsByCheckpoint['unknown'] = {spellsSource: ''};
    expect(() => parseEdpImport(JSON.stringify(state))).toThrow();
    expect(
      loadEdpState({
        getItem() {
          throw new Error('disabled');
        }
      }).error
    ).toMatch(/Autosave/);
  });
  it('retains oversize editing recovery drafts but rejects them for execution', () => {
    const state = emptyEdpState();
    state.draftsByCheckpoint['E1.1'] = {
      spellsSource: ' '.repeat(31000),
      revision: 1
    };
    const imported = parseEdpImport(JSON.stringify(state));
    expect(imported.draftsByCheckpoint['E1.1'].spellsSource).toHaveLength(
      31000
    );
    expect(
      parseEdpSource(
        imported.draftsByCheckpoint['E1.1'].spellsSource,
        byId['E1.1']
      ).diagnostics[0].code
    ).toBe('source-limit');
  });
});
describe('parser and recap', () => {
  it.each([
    'window',
    'fetch',
    'eval',
    'Function',
    'Date',
    'setInterval',
    'Math.random',
    'import("anything")',
    'async function wait() {}',
    'class Wizard {}',
    'const wizard=1;',
    'let gap=____;'
  ])('rejects unsupported source %s', (source) => {
    expect(
      parseEdpSource(source, byId['E1.1']).diagnostics.length
    ).toBeGreaterThan(0);
  });
  it('allows DOM/timers/console and leaves spelling warnings non-blocking', () => {
    const parsed = parseEdpSource(
      'document.addEventListener("Click",()=>{setTimeout(()=>console.log("hello"),0);});',
      byId['E1.1']
    );
    expect(parsed.diagnostics).toEqual([]);
    expect(parsed.warnings[0].code).toBe('event-name');
  });
  it('includes report evidence, stats and safely fenced learner code', () => {
    const markdown = recapMarkdown(
      {spellsSource: '// ```\nconst name = "<script>";'},
      {
        battleRecord: {
          attempts: 2,
          wins: 1,
          lastStats: {
            events: {click: 8},
            spells: {fire: 2},
            turns: 2,
            scried: 3
          }
        }
      }
    );
    for (const phrase of [
      'Truth table',
      'Trace table',
      'Questions to answer in your own words',
      'Your battle',
      'Your final code',
      'Visual Basic',
      '````javascript'
    ])
      expect(markdown).toContain(phrase);
  });
});
it('treats inherited property names and non-string IDs as unknown imported content', () => {
  for (const id of ['__proto__', 'constructor', 'toString', ['E1.1']]) {
    const state = emptyEdpState();
    state.currentCheckpointId = id;
    expect(() => parseEdpImport(JSON.stringify(state))).toThrow();
  }
  const state = emptyEdpState();
  state.seenIntroChapters = ['__proto__', [1], 1];
  state.completedCheckpointIds = ['constructor', ['E1.1'], 'E1.1'];
  const parsed = parseEdpImport(JSON.stringify(state));
  expect(parsed.seenIntroChapters).toEqual([1]);
  expect(parsed.completedCheckpointIds).toEqual(['E1.1']);
  expect(parseScreen('__proto__')).toEqual({type: 'welcome'});
});
