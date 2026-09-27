import {describe,it,expect} from 'vitest';
import {checkAnswer} from '../src/review/checkAnswer.js';
import {questionById} from '../src/curriculum/sections.js';
describe('review answer checking',()=>{
  it('checks choices and gives feedback',()=>{const q=questionById['S1-Q1'];expect(checkAnswer(q,'0').correct).toBe(true);expect(checkAnswer(q,'1').correct).toBe(false);expect(checkAnswer(q,'').feedback).toMatch(/Choose/);});
  it('trims blanks without evaluating them',()=>{const q=questionById['S1-Q4'];expect(checkAnswer(q,' new ').correct).toBe(true);expect(checkAnswer(q,'NEW').correct).toBe(false);expect(checkAnswer(q,'').correct).toBe(false);expect(checkAnswer(q,'new; alert(1)').correct).toBe(false);});
});
