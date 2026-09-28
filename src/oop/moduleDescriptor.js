import {sectionByChapter} from '../curriculum/sections.js';
import {checkpoints,byId} from '../curriculum/checkpoints.js';
import {recap,recapMarkdown} from '../curriculum/recap.js';
export const oopModule = {
  id:'oop', sectionCount:5, sectionByChapter, byId,
  firstScreenOfChapter:chapter=>checkpoints.find(c=>c.chapter===chapter).id,
  lastScreenOfChapter:chapter=>checkpoints.filter(c=>c.chapter===chapter).at(-1).id,
  showCourseMapInChapter:1,
  courseMapText:[
    'Across five sections, you will create a wizard, share code with a goblin, then script their interactions.',
    'By the end of the course, you will be able to create objects, set properties, write methods and decisions, use inheritance, and make objects interact.',
  ],
  reviewRecap:'Course recap: you have created objects, customised their properties, defined and called methods, shared code through inheritance, and made two objects interact. Use the questions below to explain how each part works.',
  finishLabel:'Finish course: see your summary →', finishTarget:'recap',
  recap,recapMarkdown,recapFilename:'wizard-workshop-summary.md',backToReviewId:'review:5',finalCodeLabel:'Your own final code',
};
