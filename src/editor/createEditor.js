import {basicSetup} from 'codemirror';
import {EditorState,Compartment,Prec} from '@codemirror/state';
import {EditorView,keymap} from '@codemirror/view';
import {javascript} from '@codemirror/lang-javascript';
import {indentUnit,HighlightStyle,syntaxHighlighting} from '@codemirror/language';
import {indentMore,indentLess} from '@codemirror/commands';
import {setDiagnostics} from '@codemirror/lint';
import {autocompletion} from '@codemirror/autocomplete';
import {tags} from '@lezer/highlight';
import {choices} from '../curriculum/checkpoints.js';
const font=new Compartment();
const theme=EditorView.theme({
  '&':{height:'100%',backgroundColor:'#111827',color:'#e3eaf8',fontSize:'16px'},
  '.cm-scroller':{overflow:'auto',fontFamily:'Consolas, "Cascadia Code", monospace',lineHeight:'1.5'},
  '.cm-content':{padding:'12px 0',caretColor:'#f5d38c'},
  '.cm-gutters':{backgroundColor:'#111827',color:'#8f9eb7',borderRight:'1px solid #2c364b'},
  '.cm-activeLine,.cm-activeLineGutter':{backgroundColor:'#202a40'},
  '&.cm-focused .cm-selectionBackground,.cm-selectionBackground':{backgroundColor:'#3c4968 !important'},
  '.cm-cursor':{borderLeftColor:'#fff'},
  '.cm-tooltip':{backgroundColor:'#25314b',color:'#fff',border:'1px solid #8290b0'},
},{dark:true});
const highlight=HighlightStyle.define([{tag:tags.keyword,color:'#c7a6fa'},{tag:tags.string,color:'#c8df9a'},{tag:tags.number,color:'#f0c785'},{tag:tags.comment,color:'#98a9c0'},{tag:tags.function(tags.variableName),color:'#9ed7fa'},{tag:tags.propertyName,color:'#e5c694'}]);
export function createCodeEditor(parent,{onChange,onRun,fontSize,completionFields}) {
  const states=new Map();let key='',suppress=false;
  function makeState(doc,file) {return EditorState.create({doc,extensions:[basicSetup,javascript(),indentUnit.of('  '),theme,syntaxHighlighting(highlight),font.of(EditorView.theme({'&':{fontSize:`${fontSize()}px`}})),
    EditorView.contentAttributes.of({'aria-label':`${file} JavaScript editor`,'spellcheck':'false'}),
    autocompletion({activateOnTyping:false,override:[context=>{
      if(!context.explicit)return null;
      const word=context.matchBefore(/[\w"']*/);const line=context.state.doc.lineAt(context.pos);const preceding=context.state.sliceDoc(line.from,word?.from??context.pos);const assignment=preceding.match(/\.(\w+)\s*=\s*$/);
      const options=assignment&&choices[assignment[1]]?choices[assignment[1]].map(value=>({label:JSON.stringify(value),type:'text'})):completionFields().map(label=>({label,type:'property'}));
      return {from:word?.from??context.pos,options};
    }]}),
    Prec.highest(keymap.of([{key:'Mod-Enter',run:()=>{onRun();return true;}},{key:'Mod-]',run:indentMore},{key:'Mod-[',run:indentLess}])),
    EditorView.updateListener.of(update=>{if(update.docChanged&&!suppress) {states.set(key,update.state);onChange(update.state.doc.toString());}}),
  ]});}
  const view=new EditorView({state:makeState('','character.js'),parent});
  return {
    view,
    show(id,file,source,{replace=false}={}) {if(key) states.set(key,view.state);key=`${id}/${file}`;suppress=true;view.setState(!replace&&states.has(key)&&states.get(key).doc.toString()===source?states.get(key):makeState(source,file));suppress=false;},
    diagnostics(items,file) {view.dispatch(setDiagnostics(view.state,items.filter(d=>d.file===file).map(d=>({...d,from:Math.min(d.from,view.state.doc.length),to:Math.min(Math.max(d.from,d.to),view.state.doc.length)}))));},
    focus(from=0,to=from) {view.focus();view.dispatch({selection:{anchor:Math.min(from,view.state.doc.length),head:Math.min(to,view.state.doc.length)},scrollIntoView:true});},
    fontSize(){view.dispatch({effects:font.reconfigure(EditorView.theme({'&':{fontSize:`${fontSize()}px`}}))});},
    invalidate(id) {for(const k of states.keys()) if(k.startsWith(id+'/')) states.delete(k);},
  };
}
