import {journey,parseScreen} from '../curriculum/journey.js';
import {byId} from '../curriculum/checkpoints.js';
import {sectionByChapter} from '../curriculum/sections.js';
import {checkAnswer} from '../review/checkAnswer.js';

// A journey screen counts as completed only when the learner has earned it:
// a checkpoint needs a validated Run, an introduction needs a visit and a
// review needs every question answered correctly (retries are free).
export function isScreenComplete(id,state){
  const screen=parseScreen(id);
  if(screen.type==='checkpoint')return state.completedCheckpointIds.includes(screen.id);
  if(screen.type==='intro')return state.seenIntroChapters.includes(screen.chapter);
  const answers=state.reviewByChapter[screen.chapter]?.answers??{};
  return sectionByChapter[screen.chapter].review.questions.every(question=>checkAnswer(question,answers[question.id]?.response).correct);
}

export const chapterOfScreen=id=>{const screen=parseScreen(id);return screen.type==='checkpoint'?byId[screen.id].chapter:screen.chapter;};

export function sectionProgress(chapter,state){
  const ids=journey.filter(id=>chapterOfScreen(id)===chapter);
  return {done:ids.filter(id=>isScreenComplete(id,state)).length,total:ids.length};
}
