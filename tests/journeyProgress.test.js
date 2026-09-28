import {describe,it,expect} from 'vitest';
import {isScreenComplete,sectionProgress} from '../src/state/journeyProgress.js';
import {emptyState} from '../src/state/store.js';
import {sections} from '../src/curriculum/sections.js';

const correctResponse=question=>question.type==='choice'?question.options.find(option=>option.correct).id:question.accept[0];

describe('journey selector progress',()=>{
  it('starts with nothing completed',()=>{
    const state=emptyState();
    expect(isScreenComplete('intro:1',state)).toBe(false);expect(isScreenComplete('C1.1a',state)).toBe(false);expect(isScreenComplete('review:1',state)).toBe(false);
    expect(sectionProgress(1,state)).toEqual({done:0,total:6});
  });
  it('marks visited introductions, validated checkpoints and fully correct reviews',()=>{
    const state=emptyState();const questions=sections[0].review.questions;
    state.seenIntroChapters.push(1);state.completedCheckpointIds.push('C1.1a','C1.1b','C1.1c','C1.2');
    state.reviewByChapter[1]={answers:Object.fromEntries(questions.slice(0,-1).map(question=>[question.id,{response:correctResponse(question)}]))};
    expect(isScreenComplete('review:1',state)).toBe(false);expect(sectionProgress(1,state)).toEqual({done:5,total:6});
    state.reviewByChapter[1].answers[questions.at(-1).id]={response:` ${correctResponse(questions.at(-1))} `};
    expect(isScreenComplete('review:1',state)).toBe(true);expect(sectionProgress(1,state)).toEqual({done:6,total:6});
    state.reviewByChapter[1].answers[questions[0].id]={response:'1'};
    expect(isScreenComplete('review:1',state)).toBe(false);
  });
});
