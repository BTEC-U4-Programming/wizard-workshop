import {ExpressiveCode,loadShikiTheme} from 'expressive-code';
import {toHtml} from 'hast-util-to-html';
import {checkpoints} from '../src/curriculum/checkpoints.js';

// Runs in Node through Vite. Only escaped, pre-rendered curriculum HTML reaches
// the browser; neither the highlighter nor student drafts enter this pipeline.
export async function renderLessons() {
  const engine=new ExpressiveCode({
    themes:[await loadShikiTheme('github-dark')],
    frames:{showCopyToClipboardButton:false},
    styleOverrides:{codeFontSize:'16px',codeFontFamily:'Consolas, monospace'},
    defaultProps:{wrap:true},
  });
  const styles=new Set([await engine.getBaseStyles(),await engine.getThemeStyles()]);
  const cache=new Map();
  async function highlight(code,inline=false,title='') {
    const key=JSON.stringify([code,inline,title]);
    if(cache.has(key))return cache.get(key);
    const result=await engine.render({code,language:'js',props:{title}});
    result.styles.forEach(s=>styles.add(s));
    let html;
    if(inline) {
      const findCode=n=>n.properties?.className?.includes('code')?n:n.children?.map(findCode).find(Boolean);
      const line=findCode(result.renderedGroupAst);
      if(!line)throw new Error('Expressive Code did not return inline tokens.');
      html='<code class="lesson-code">'+line.children.map(n=>toHtml(n)).join('')+'</code>';
    } else html=toHtml(result.renderedGroupAst);
    cache.set(key,html);
    return html;
  }
  const escape=value=>toHtml({type:'text',value});
  async function prose(value) {
    const parts=value.split('`');
    if(parts.length%2===0)throw new Error('Unclosed code delimiter: '+value);
    return (await Promise.all(parts.map((part,i)=>i%2?highlight(part,!part.includes('\n')):escape(part)))).join('');
  }
  const lessons={};
  for(const c of checkpoints) {
    lessons[c.id]={
      objective:await prose(c.objective),
      instructions:await Promise.all(c.instructions.map(prose)),
      checklist:await Promise.all(c.objectiveChecks.map(prose)),
      hints:await Promise.all(c.hints.map(prose)),
      reflection:await prose(c.reflection),
      solution:await Promise.all(Object.entries(c.solution).filter(([,s])=>s).map(([file,source])=>highlight(source,false,file==='characterSource'?'character.js':'actions.js'))),
    };
  }
  return {lessons,css:[...styles].join('\n')};
}

export function lessonHighlighting() {
  const ids=['virtual:lesson-content','virtual:lesson-styles.css'];
  let data;
  return {
    name:'workshop-lesson-highlighting',
    resolveId(id){if(ids.includes(id))return '\0'+id;},
    async load(id){
      if(!ids.some(v=>id==='\0'+v))return;
      data??=renderLessons();
      const result=await data;
      return id.endsWith('.css')?result.css:'export default '+JSON.stringify(result.lessons);
    },
    // The curriculum is imported by this config: Vite restarts on changes to it.
  };
}
