import {oopModule} from '../oop/moduleDescriptor.js';

const element=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
// HTML is generated at build time solely from the trusted curriculum.
const rich=(tag,html,className)=>{const node=element(tag,undefined,className);node.innerHTML=html;return node;};

// The course summary: every major concept with a finished example, plus a
// Markdown download. The learner's own code is added only as plain text.
export function renderRecap(container,content,{navigate,download,finalCode,module=oopModule,extras}={}){
  const {recap,recapMarkdown}=module;
  const html=content.recap;
  container.replaceChildren();
  container.append(element('p','COURSE COMPLETE','eyebrow'));
  const heading=element('h1',recap.title);heading.id='section-title';heading.tabIndex=-1;container.append(heading);
  container.append(rich('p',html.intro,'intro-hook'));
  const save=()=>download(module.recapFilename,recapMarkdown(finalCode,extras),'text/markdown');
  const top=element('nav',undefined,'section-actions recap-actions');const downloadTop=element('button','Download summary (.md)','primary');downloadTop.onclick=save;top.append(downloadTop);container.append(top);
  const contents=element('nav',undefined,'recap-contents');contents.setAttribute('aria-label','Summary sections');const list=element('ol');
  recap.sections.forEach(section=>{const item=element('li');const link=element('a',section.title);link.href=`#recap-section-${section.chapter}`;item.append(link);list.append(item);});
  contents.append(list);container.append(contents);
  recap.sections.forEach((section,sectionIndex)=>{
    const block=element('section',undefined,'recap-section');block.id=`recap-section-${section.chapter}`;block.setAttribute('aria-labelledby',`recap-heading-${section.chapter}`);
    const title=element('h2',`Section ${section.chapter}: ${section.title}`);title.id=`recap-heading-${section.chapter}`;block.append(title);
    section.concepts.forEach((concept,conceptIndex)=>{
      const rendered=html.sections[sectionIndex].concepts[conceptIndex];
      const card=element('article',undefined,'recap-concept');
      card.append(rich('h3',rendered.term),rich('p',rendered.explanation),rich('div',rendered.code,'worked-example'),rich('p','<strong>Unit 4 link:</strong> '+rendered.report,'recap-report'));
      block.append(card);
    });
    const revisit=element('button',`Revisit section ${section.chapter} introduction`);revisit.onclick=()=>navigate(`intro:${section.chapter}`);block.append(revisit);
    container.append(block);
  });
  if(finalCode)container.append(element('p','Your download also includes the last code you ran successfully, so you can annotate your own work.','muted'));
  const bottom=element('nav',undefined,'section-actions');const back=element('button','← Back to the final quiz');back.onclick=()=>navigate(module.backToReviewId);const downloadBottom=element('button','Download summary (.md)','primary');downloadBottom.onclick=save;bottom.append(back,downloadBottom);container.append(bottom);
  heading.focus();
}
