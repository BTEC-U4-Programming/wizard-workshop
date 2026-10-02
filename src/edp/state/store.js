import {
  byId,
  checkpoints,
  edpCurriculumVersion
} from '../curriculum/checkpoints.js';
import {sectionByChapter} from '../curriculum/sections.js';
import {screenId, parseScreen} from '../curriculum/journey.js';
import {validEdpResult, validStats} from '../validation/result.js';
import {loadState} from '../../state/store.js';
export const EDP_STORAGE_KEY = 'wizard-workshop:edp:v1';
export {edpCurriculumVersion};
const plain = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const size = (text) => new TextEncoder().encode(text).length;
const validDraft = (draft, limit = 30 * 1024) =>
  plain(draft) &&
  typeof draft.spellsSource === 'string' &&
  size(draft.spellsSource) <= limit;
const count = (value) =>
  Math.min(9999, Math.max(0, Math.floor(Number(value) || 0)));
// Save layout. Layout 2 (2 October 2026) retired the old Section 5 steps
// E5.4–E5.6 and renumbered the finished battle from E5.7 to E5.4. A save
// without this marker uses the old numbering, so its E5.4 means the old
// Fireball step, not the battle.
export const EDP_SAVE_LAYOUT = 2;
const oldSectionFive = ['E5.4', 'E5.5', 'E5.6', 'E5.7'];
const record = (value) => (plain(value) ? value : {});
// Rewrites an old-layout save into the current numbering before validation.
// Old E5.4–E5.6 work is dropped; anyone on those steps or on the old E5.7
// moves to the new E5.4. The old E5.7 draft was the learner's own battle,
// so it becomes the new E5.4's restorable backup instead of replacing the
// complete battle that E5.4 now starts from.
export function upgradeEdpSave(value) {
  if (!plain(value) || value.saveLayout === EDP_SAVE_LAYOUT) return value;
  const upgraded = {...value, saveLayout: EDP_SAVE_LAYOUT};
  const moveCurrent = (id) => (oldSectionFive.includes(id) ? 'E5.4' : id);
  upgraded.currentCheckpointId = moveCurrent(value.currentCheckpointId);
  if (plain(value.currentScreen) && value.currentScreen.type === 'checkpoint')
    upgraded.currentScreen = {
      ...value.currentScreen,
      id: moveCurrent(value.currentScreen.id)
    };
  const without = (source) => {
    const copy = {...record(source)};
    for (const id of oldSectionFive) delete copy[id];
    return copy;
  };
  upgraded.draftsByCheckpoint = plain(value.draftsByCheckpoint)
    ? without(value.draftsByCheckpoint)
    : value.draftsByCheckpoint;
  upgraded.lastGoodSnapshotByCheckpoint = without(
    value.lastGoodSnapshotByCheckpoint
  );
  upgraded.backupsByCheckpoint = without(value.backupsByCheckpoint);
  upgraded.lastSuccessfulSourcesByCheckpoint = without(
    value.lastSuccessfulSourcesByCheckpoint
  );
  upgraded.hintDepthByCheckpoint = without(value.hintDepthByCheckpoint);
  const oldBattle = record(value.draftsByCheckpoint)['E5.7'];
  if (oldBattle) upgraded.backupsByCheckpoint['E5.4'] = oldBattle;
  const oldSuccess = record(value.lastSuccessfulSourcesByCheckpoint)['E5.7'];
  if (oldSuccess)
    upgraded.lastSuccessfulSourcesByCheckpoint['E5.4'] = oldSuccess;
  if (Array.isArray(value.completedCheckpointIds))
    upgraded.completedCheckpointIds = value.completedCheckpointIds
      .filter((id) => !['E5.4', 'E5.5', 'E5.6'].includes(id))
      .map((id) => (id === 'E5.7' ? 'E5.4' : id));
  return upgraded;
}
export const emptyEdpState = () => ({
  curriculumVersion: edpCurriculumVersion,
  saveLayout: EDP_SAVE_LAYOUT,
  currentCheckpointId: 'E1.1',
  currentScreen: {type: 'welcome'},
  seenWelcome: false,
  seenIntroChapters: [],
  reviewByChapter: {},
  draftsByCheckpoint: {},
  lastSuccessfulSourcesByCheckpoint: {},
  lastGoodSnapshotByCheckpoint: {},
  completedCheckpointIds: [],
  hintDepthByCheckpoint: {},
  backupsByCheckpoint: {},
  activityAnswersByCheckpoint: {},
  battleRecord: {attempts: 0, wins: 0, lastStats: null},
  preferences: {
    codeFontSize: 16,
    reduceMotion: false,
    apprenticeMode: false,
    slowMotion: null
  },
  activeRun: null,
  activeSession: null
});
export function parseEdpImport(text, {localRestore = false} = {}) {
  if (size(text) > (localRestore ? 10 : 2) * 1024 * 1024)
    throw new Error(
      'Work files must be under 2MB; local recovery is bounded at 10MB.'
    );
  const value = upgradeEdpSave(JSON.parse(text));
  if (
    !plain(value) ||
    value.curriculumVersion !== edpCurriculumVersion ||
    typeof value.currentCheckpointId !== 'string' ||
    !byId[value.currentCheckpointId] ||
    !plain(value.draftsByCheckpoint)
  )
    throw new Error('This file is not a compatible Tome II save.');
  const state = emptyEdpState();
  state.currentCheckpointId = value.currentCheckpointId;
  const screen = value.currentScreen;
  if (plain(screen)) {
    const id = screenId(screen),
      parsed = parseScreen(id);
    if (screenId(parsed) === id) state.currentScreen = parsed;
  }
  if (state.currentScreen.type === 'checkpoint')
    state.currentCheckpointId = state.currentScreen.id;
  state.seenWelcome = value.seenWelcome === true;
  state.seenIntroChapters = Array.isArray(value.seenIntroChapters)
    ? [
        ...new Set(
          value.seenIntroChapters.filter(
            (chapter) => Number.isInteger(chapter) && sectionByChapter[chapter]
          )
        )
      ]
    : [];
  for (const [id, draft] of Object.entries(value.draftsByCheckpoint)) {
    if (!byId[id] || !validDraft(draft, 2 * 1024 * 1024))
      throw new Error(
        'A saved draft is unknown, malformed or exceeds the 2MB editing recovery limit.'
      );
    state.draftsByCheckpoint[id] = {
      spellsSource: draft.spellsSource,
      revision:
        Number.isSafeInteger(draft.revision) && draft.revision >= 0
          ? draft.revision
          : 0
    };
  }
  state.completedCheckpointIds = Array.isArray(value.completedCheckpointIds)
    ? [
        ...new Set(
          value.completedCheckpointIds.filter(
            (id) => typeof id === 'string' && byId[id]
          )
        )
      ]
    : [];
  for (const cp of checkpoints) {
    const id = cp.id,
      source = value.lastSuccessfulSourcesByCheckpoint?.[id],
      backup = value.backupsByCheckpoint?.[id],
      saved = value.lastGoodSnapshotByCheckpoint?.[id];
    if (validDraft(source))
      state.lastSuccessfulSourcesByCheckpoint[id] = {
        spellsSource: source.spellsSource
      };
    if (validDraft(backup, 2 * 1024 * 1024))
      state.backupsByCheckpoint[id] = {spellsSource: backup.spellsSource};
    if (
      saved &&
      ['success', 'validButIncomplete'].includes(saved.status) &&
      validEdpResult(saved, id)
    )
      state.lastGoodSnapshotByCheckpoint[id] = saved;
    state.hintDepthByCheckpoint[id] = Math.floor(
      Math.min(3, Math.max(0, Number(value.hintDepthByCheckpoint?.[id]) || 0))
    );
    const activity = cp.activity,
      answer = value.activityAnswersByCheckpoint?.[id];
    if (!activity || !plain(answer)) continue;
    if (
      activity.type === 'predict' &&
      typeof answer.prediction === 'string' &&
      /^\d+$/.test(answer.prediction) &&
      activity.options[Number(answer.prediction)] !== undefined
    )
      state.activityAnswersByCheckpoint[id] = {prediction: answer.prediction};
    else {
      const key = activity.type === 'sort' ? 'cards' : 'cells',
        entries = {};
      for (const item of activity[key] ?? []) {
        const response = answer[key]?.[item.id];
        if (typeof response !== 'string' || response.length > 60) continue;
        if (
          key === 'cards' &&
          (!/^\d+$/.test(response) || !activity.bins[Number(response)])
        )
          continue;
        if (item.options && !item.options.includes(response)) continue;
        entries[item.id] = response;
      }
      state.activityAnswersByCheckpoint[id] = {[key]: entries};
    }
  }
  for (const section of Object.values(sectionByChapter)) {
    const saved = value.reviewByChapter?.[section.chapter];
    if (!plain(saved?.answers)) continue;
    const answers = {};
    for (const question of section.review.questions) {
      const response = saved.answers[question.id]?.response;
      if (typeof response !== 'string' || response.length > 200) continue;
      if (
        question.type === 'choice' &&
        !question.options.some((o) => o.id === response)
      )
        continue;
      answers[question.id] = {response};
    }
    state.reviewByChapter[section.chapter] = {answers};
  }
  state.battleRecord = {
    attempts: count(value.battleRecord?.attempts),
    wins: count(value.battleRecord?.wins),
    lastStats: validStats(value.battleRecord?.lastStats)
      ? value.battleRecord.lastStats
      : null
  };
  state.battleRecord.wins = Math.min(
    state.battleRecord.attempts,
    state.battleRecord.wins
  );
  const p = value.preferences;
  state.preferences = {
    codeFontSize: Math.min(24, Math.max(14, Number(p?.codeFontSize) || 16)),
    reduceMotion: p?.reduceMotion === true,
    apprenticeMode: p?.apprenticeMode === true,
    slowMotion: typeof p?.slowMotion === 'boolean' ? p.slowMotion : null
  };
  return state;
}
export function loadEdpState(storage) {
  try {
    const text = storage.getItem(EDP_STORAGE_KEY);
    if (text)
      return {state: parseEdpImport(text, {localRestore: true}), error: null};
    const state = emptyEdpState();
    const oop = loadState(storage);
    if (!oop.error) {
      state.preferences.codeFontSize = oop.state.preferences.codeFontSize;
      state.preferences.reduceMotion = oop.state.preferences.reduceMotion;
    }
    return {state, error: null};
  } catch (error) {
    return {
      state: emptyEdpState(),
      error:
        'Autosave unavailable or unreadable — download your work. ' +
        error.message
    };
  }
}
export function saveEdpState(state, storage) {
  try {
    const text = JSON.stringify({
      ...state,
      activeRun: null,
      activeSession: null
    });
    if (size(text) > 10 * 1024 * 1024) throw new Error('Recovery limit');
    storage.setItem(EDP_STORAGE_KEY, text);
    return null;
  } catch {
    return 'Autosave unavailable — download your work.';
  }
}
export function canCommitEdp(state, response) {
  const active = state.activeRun;
  return (
    !!active &&
    active.runId === response.runId &&
    active.checkpointId === response.checkpointId &&
    active.revision === response.revision &&
    state.currentScreen.type === 'checkpoint' &&
    state.currentCheckpointId === response.checkpointId &&
    state.draftsByCheckpoint[response.checkpointId]?.revision ===
      response.revision
  );
}
export function replaceEdpDraft(state, id, draft) {
  state.backupsByCheckpoint[id] = structuredClone(
    state.draftsByCheckpoint[id] ?? byId[id].starter
  );
  state.draftsByCheckpoint[id] = {
    spellsSource: draft.spellsSource,
    revision: (state.draftsByCheckpoint[id]?.revision ?? 0) + 1
  };
}
