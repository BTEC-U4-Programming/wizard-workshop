import {sectionByChapter, optionOrder} from './curriculum/sections.js';
import {checkpoints, byId} from './curriculum/checkpoints.js';
import {recap, recapMarkdown} from './curriculum/recap.js';
export const edpModule = {
  id: 'edp',
  sectionCount: 5,
  sectionByChapter,
  byId,
  optionOrder,
  firstScreenOfChapter: (chapter) =>
    checkpoints.find((cp) => cp.chapter === chapter).id,
  lastScreenOfChapter: (chapter) =>
    checkpoints.filter((cp) => cp.chapter === chapter).at(-1).id,
  showCourseMapInChapter: null,
  courseMapText: [],
  finishLabel: 'Finish Tome II: see your spellbook →',
  finishTarget: 'recap',
  recap,
  recapMarkdown,
  recapFilename: 'wizard-workshop-tome-2-summary.md',
  backToReviewId: 'review:5',
  finalCodeLabel: 'Your final code'
};
