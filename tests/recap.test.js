import {describe,it,expect} from 'vitest';
import {parse} from 'acorn';
import {recap,recapMarkdown} from '../src/curriculum/recap.js';
import {sections} from '../src/curriculum/sections.js';
import {parseScreen,screenId,journey} from '../src/curriculum/journey.js';
import {emptyState,parseImport} from '../src/state/store.js';

// Snippets may be a whole program, class members or statements inside a method.
const parses=code=>[code,`class Example {\n${code}\n}`,`function example() {\n${code}\n}`].some(source=>{try{parse(source,{ecmaVersion:2022});return true;}catch{return false;}});

describe('course summary',()=>{
  it('covers every section with explained, valid code examples',()=>{
    expect(recap.sections.map(section=>section.chapter)).toEqual(sections.map(section=>section.chapter));
    for(const section of recap.sections){
      expect(section.concepts.length).toBeGreaterThanOrEqual(2);
      for(const concept of section.concepts){
        expect(concept.term&&concept.explanation&&concept.report).toBeTruthy();
        expect(parses(concept.code),concept.term).toBe(true);
        for(const text of [concept.term,concept.explanation,concept.report])expect(text.split('`').length%2,text).toBe(1);
      }
    }
  });
  it('builds Markdown with headings and fenced JavaScript, plus optional learner code',()=>{
    const markdown=recapMarkdown();
    expect(markdown.startsWith('# ')).toBe(true);
    expect(markdown).toContain('## Section 5: Objects working together');
    expect(markdown.split('```javascript').length-1).toBe(recap.sections.flatMap(section=>section.concepts).length);
    expect(markdown).not.toContain('Your own final code');
    const withCode=recapMarkdown({characterSource:'class Wizard {}\n',actionsSource:'wizard.levelUp();\n'});
    expect(withCode).toContain('## Your own final code');expect(withCode).toContain('wizard.levelUp();');
  });
  it('is reachable after the final review without becoming a progress step',()=>{
    expect(parseScreen('recap')).toEqual({type:'recap'});expect(screenId({type:'recap'})).toBe('recap');
    expect(journey.includes('recap')).toBe(false);
    const saved={...emptyState(),currentScreen:{type:'recap'}};
    expect(parseImport(JSON.stringify(saved)).currentScreen).toEqual({type:'recap'});
  });
});
