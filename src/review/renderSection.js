import {byId} from '../curriculum/checkpoints.js';
import {sectionByChapter} from '../curriculum/sections.js';
import {checkAnswer} from './checkAnswer.js';

const element=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
const rich=(tag,html,className)=>{const node=element(tag,undefined,className);node.innerHTML=html;return node;};
const disclosure=(title,className)=>{const details=element('details',undefined,className);details.append(element('summary',title));return details;};
function addBlank(frame,question){
  const walker=document.createTreeWalker(frame,NodeFilter.SHOW_TEXT);
  let target,count=0;
  while(walker.nextNode()){if(walker.currentNode.textContent.includes('____')){target=walker.currentNode;count++;}}
  if(count!==1)throw new Error(`Review ${question.id} needs one blank.`);
  const [before,after]=target.textContent.split('____');
  const input=element('input');input.type='text';input.className='blank-input';input.autocomplete='off';input.autocapitalize='off';input.spellcheck=false;input.setAttribute('aria-label',`Fill in the blank: ${question.code}`);
  target.replaceWith(document.createTextNode(before),input,document.createTextNode(after));
  return input;
}
export function renderSection(container,screen,content,state,navigate,save){
  const section=sectionByChapter[screen.chapter],html=content[section.id];
  container.replaceChildren();
  container.append(element('p',screen.type==='intro'?`SECTION ${section.chapter} OF 5`:`SECTION ${section.chapter} REVIEW`,'eyebrow'));
  const heading=element('h1',screen.type==='intro'?section.title:`Check your understanding: ${section.title}`);heading.id='section-title';heading.tabIndex=-1;container.append(heading);
  if(screen.type==='intro'){
    if(!state.seenIntroChapters.includes(section.chapter)){state.seenIntroChapters.push(section.chapter);save();}
    container.append(rich('p',html.hook,'intro-hook'),rich('p','You will make: '+html.build,'intro-build'),element('h2','By the end, you will be able to:'));
    const objectives=element('ul',undefined,'intro-objectives');objectives.append(...html.objectives.map(item=>rich('li',item)));
    container.append(objectives,rich('p','Key idea: '+html.summary,'intro-summary'),element('h2','See a complete example'),rich('div',html.example,'worked-example'),rich('p','Result: '+html.result,'intro-result'));
    const navigation=element('nav',undefined,'section-actions');if(section.chapter>1){const back=element('button','← Previous review');back.onclick=()=>navigate(`review:${section.chapter-1}`);navigation.append(back);}
    const start=element('button',`${section.chapter===1?'Start':'Continue'} section ${section.chapter} →`,'primary');start.onclick=()=>navigate(section.chapter===1?'C1.1a':section.chapter===2?'C2.1a':section.chapter===3?'C3.1a':section.chapter===4?'C4.1':'C5.1a',true);navigation.append(start);container.append(navigation);
    const explanation=disclosure('How the example works','intro-extra');const walkthrough=element('ol');walkthrough.append(...html.walkthrough.map(item=>rich('li',item)));explanation.append(walkthrough);container.append(explanation);
    const reminders=disclosure('Key terms and a quick reminder','intro-extra');reminders.append(rich('p',html.prerequisites));const terms=element('dl',undefined,'concept-list');for(const concept of html.concepts)terms.append(rich('dt',concept.term),rich('dd',concept.definition));reminders.append(terms);container.append(reminders);
    const prediction=disclosure('Try a prediction','intro-extra');prediction.append(rich('p',html.predict[0]));const answer=disclosure('Reveal the answer','prediction-answer');answer.append(rich('p',html.predict[1]));prediction.append(answer);container.append(prediction);
    if(section.chapter===1){const overview=disclosure('Course goals and section map','intro-extra');overview.append(element('p','Across five sections, you will create a wizard, share code with a goblin, then script their interactions.'),element('p','By the end of the course, you will be able to create objects, set properties, write methods and decisions, use inheritance, and make objects interact.'));const route=element('ol');for(const item of Object.values(sectionByChapter))route.append(element('li',`Section ${item.chapter}: ${item.title}`));overview.append(route);container.append(overview);}
    const assignment=disclosure('Unit 4 connection','intro-extra');assignment.append(rich('p',html.assignmentLink));container.append(assignment);
  }else{
    container.append(element('p','No time limit and no penalties. Try each question, read the feedback and have another go if you need to.'));
    if(section.chapter===5)container.append(element('p','Course recap: you have created objects, customised their properties, defined and called methods, shared code through inheritance, and made two objects interact. Use the questions below to explain how each part works.','course-recap'));
    const chapterState=state.reviewByChapter[section.chapter]??={answers:{}};
    const summary=element('p',undefined,'review-summary');
    const refresh=()=>{const correct=section.review.questions.filter(q=>checkAnswer(q,chapterState.answers[q.id]?.response).correct).length;summary.textContent=`You've answered ${correct} of ${section.review.questions.length} correctly. Keep going at your own pace.`;};
    section.review.questions.forEach((question,index)=>{
      const card=element('section',undefined,'question');const prompt=rich(question.type==='choice'?'legend':'h2',html.questions[index].prompt);let readResponse;
      if(question.type==='choice'){
        const group=element('fieldset');group.append(prompt);
        question.options.forEach((option,optionIndex)=>{const label=element('label',undefined,'choice-option');const input=element('input');input.type='radio';input.name=question.id;input.value=option.id;input.checked=chapterState.answers[question.id]?.response===option.id;label.append(input,rich('span',html.questions[index].options[optionIndex]));group.append(label);});card.append(group);
        readResponse=()=>card.querySelector('input:checked')?.value??'';
      }else{
        card.append(prompt);const frame=rich('div',html.questions[index].code,'blank-code');const input=addBlank(frame,question);input.value=chapterState.answers[question.id]?.response??'';card.append(frame);readResponse=()=>input.value;
        input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();check.click();}});
      }
      const check=element('button','Check answer');const feedback=element('p',undefined,'review-feedback');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
      const revisit=element('button',`Revisit ${question.revisit} · ${byId[question.revisit]?.title??'introduction'}`);revisit.hidden=true;revisit.onclick=()=>navigate(question.revisit);
      const reveal=element('button','Show answer');reveal.hidden=true;reveal.onclick=()=>{feedback.textContent=question.type==='choice'?`Answer: ${question.options.find(option=>option.correct).text}`:`Answer: ${question.accept.join(' or ')}`;};
      let attempts=0;
      const submit=()=>{const response=readResponse();const result=checkAnswer(question,response);if(!response.trim()){feedback.textContent='Choose or type an answer first.';feedback.dataset.status='error';return;}chapterState.answers[question.id]={response};save();feedback.textContent=(result.correct?'Correct: ':'Not quite: ')+result.feedback;feedback.dataset.status=result.correct?'success':'error';revisit.hidden=result.correct;attempts+=result.correct?0:1;reveal.hidden=result.correct||attempts<2;refresh();};
      check.onclick=submit;card.append(check,feedback,revisit,reveal);container.append(card);
      if(chapterState.answers[question.id]){const result=checkAnswer(question,chapterState.answers[question.id].response);feedback.textContent=(result.correct?'Correct: ':'Your saved answer: ')+result.feedback;feedback.dataset.status=result.correct?'success':'error';revisit.hidden=result.correct;}
    });
    refresh();container.append(summary);
    const navigation=element('nav',undefined,'section-actions');const back=element('button','← Previous checkpoint');back.onclick=()=>navigate(section.chapter===1?'C1.2':section.chapter===2?'C2.7':section.chapter===3?'C3.5':section.chapter===4?'C4.5':'C5.4');navigation.append(back);
    const next=element('button',section.chapter===5?'Finish course':`Continue to section ${section.chapter+1} →`,'primary');next.onclick=()=>section.chapter===5?(()=>{summary.textContent='✦ Course complete. You can revisit any section or checkpoint.';next.disabled=true;})():navigate(`intro:${section.chapter+1}`);navigation.append(next);container.append(navigation);
  }
  heading.focus();
}
