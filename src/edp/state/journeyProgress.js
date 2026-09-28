import {journey, parseScreen} from '../curriculum/journey.js';
import {byId} from '../curriculum/checkpoints.js';
import {sectionByChapter} from '../curriculum/sections.js';
import {checkAnswer} from '../../review/checkAnswer.js';
export function activityAttempted(cp, state) {
  if (!cp.activity) return true;
  const answer = state.activityAnswersByCheckpoint[cp.id];
  if (!answer) return false;
  if (cp.activity.type === 'predict')
    return (
      typeof answer.prediction === 'string' &&
      /^\d+$/.test(answer.prediction) &&
      cp.activity.options[Number(answer.prediction)] !== undefined
    );
  if (cp.activity.type === 'sort')
    return cp.activity.cards.every(
      (card) => answer.cards?.[card.id] !== undefined
    );
  return cp.activity.cells.every((cell) =>
    String(answer.cells?.[cell.id] ?? '').trim()
  );
}
export function isScreenComplete(id, state) {
  const screen = parseScreen(id);
  if (screen.type === 'welcome') return state.seenWelcome;
  if (screen.type === 'intro')
    return state.seenIntroChapters.includes(screen.chapter);
  if (screen.type === 'checkpoint')
    return (
      state.completedCheckpointIds.includes(screen.id) &&
      activityAttempted(byId[screen.id], state)
    );
  if (screen.type === 'recap') return false;
  const answers = state.reviewByChapter[screen.chapter]?.answers ?? {};
  return sectionByChapter[screen.chapter].review.questions.every(
    (q) => checkAnswer(q, answers[q.id]?.response).correct
  );
}
export const chapterOfScreen = (id) => {
  const screen = parseScreen(id);
  return screen.type === 'welcome'
    ? 1
    : screen.type === 'checkpoint'
      ? byId[id].chapter
      : screen.chapter;
};
export const sectionProgress = (chapter, state) => {
  const ids = journey.filter((id) => chapterOfScreen(id) === chapter);
  return {
    done: ids.filter((id) => isScreenComplete(id, state)).length,
    total: ids.length
  };
};
