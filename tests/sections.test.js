import {describe,it,expect} from 'vitest';
import {parse} from 'acorn';
import {getQuickJS} from 'quickjs-emscripten';
import {sections} from '../src/curriculum/sections.js';
import {byId} from '../src/curriculum/checkpoints.js';
import {journey} from '../src/curriculum/journey.js';

describe('section curriculum',()=>{
  it('has five ordered sections and a complete journey',()=>{
    expect(sections.map(section=>section.chapter)).toEqual([1,2,3,4,5]);
    expect(new Set(sections.map(section=>section.id)).size).toBe(5);
    expect(journey[0]).toBe('intro:1');expect(journey.at(-1)).toBe('review:5');
    expect(journey.length).toBe(54);
  });
  it('gives each section complete content and a runnable worked example',async()=>{
    const quickjs=await getQuickJS();
    for(const section of sections){
      const intro=section.intro;expect(section.title).toBeTruthy();expect(intro.objectives.length).toBeGreaterThanOrEqual(2);expect(intro.objectives.length).toBeLessThanOrEqual(3);expect(intro.hook.length).toBeLessThanOrEqual(140);expect(intro.build.length).toBeLessThanOrEqual(140);expect(intro.summary.length).toBeLessThanOrEqual(240);expect(intro.concepts.length).toBeGreaterThan(0);expect(intro.example.walkthrough.length).toBeGreaterThan(0);expect(intro.predict.length).toBe(2);
      expect(()=>parse(intro.example.code,{ecmaVersion:2022})).not.toThrow();
      const context=quickjs.newContext();try{const result=context.evalCode(`${intro.example.code}\n${intro.example.check}`);expect(result.error).toBeUndefined();expect(context.dump(result.value)).toBe(true);result.value.dispose();}finally{context.dispose();}
    }
  });
  it('keeps reviews answerable and linked to explanations',()=>{
    const ids=new Set();
    for(const section of sections){const questions=section.review.questions;expect(questions.filter(q=>q.type==='choice').length).toBeGreaterThanOrEqual(2);expect(questions.filter(q=>q.type==='blank').length).toBeGreaterThanOrEqual(2);
      for(const question of questions){expect(ids.has(question.id)).toBe(false);ids.add(question.id);expect(byId[question.revisit]||question.revisit===`intro:${section.chapter}`).toBeTruthy();
        if(question.type==='choice'){expect(question.options.length).toBeGreaterThanOrEqual(3);expect(question.options.filter(option=>option.correct).length).toBe(1);expect(question.options.every(option=>option.feedback)).toBe(true);}
        else {expect(question.code.match(/____/g)).toHaveLength(1);expect(question.accept.length).toBeGreaterThan(0);expect(question.explanation).toBeTruthy();expect(question.hint).toBeTruthy();}
      }
    }
  });
});
