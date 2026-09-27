import {checkpoints} from './checkpoints.js';
import {sections} from './sections.js';
export const journey=sections.flatMap(section=>[`intro:${section.chapter}`,...checkpoints.filter(checkpoint=>checkpoint.chapter===section.chapter).map(checkpoint=>checkpoint.id),`review:${section.chapter}`]);
export const nextScreen=id=>journey[journey.indexOf(id)+1]??null;
export const previousScreen=id=>journey[journey.indexOf(id)-1]??null;
export const screenId=screen=>screen.type==='checkpoint'?screen.id:`${screen.type}:${screen.chapter}`;
export const parseScreen=id=>{if(id.startsWith('intro:')||id.startsWith('review:')){const [type,number]=id.split(':');return {type,chapter:Number(number)};}return {type:'checkpoint',id};};
