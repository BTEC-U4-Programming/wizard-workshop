import {drawWizard,drawGoblin,drawEffect} from './sprites.js';
export {palettes} from './sprites.js';
export const battleOutcome=snapshot=>{const w=snapshot?.wizard,g=snapshot?.goblin;if(!w||!g)return null;return w.health===0?'Goblin Wins':g.health===0?'Wizard Wins':null;};
export function renderScene(canvas,snapshot={},effect=null) {
  const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
  const rect=(x,y,w,h,colour)=>{c.fillStyle=colour;c.fillRect(Math.round(x),Math.round(y),w,h);};
  const line=(x1,y1,x2,y2,colour,width=2)=>{c.strokeStyle=colour;c.lineWidth=width;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();};
  rect(0,0,320,240,'#121b30');
  // Original integer-coordinate stonework and a still, warm pool of light.
  for(let y=12;y<165;y+=24) for(let x=(y%48?0:-25);x<320;x+=52) {rect(x,y,50,22,'#1b253a');rect(x+2,y+2,46,1,'#253149');}
  rect(123,0,74,164,'#202a3d');rect(137,0,46,164,'#2c3041');
  for(const x of [36,270]) {rect(x,82,9,18,'#73544a');rect(x+2,70,5,14,'#e7a45d');rect(x+3,74,3,7,'#ffe2a0');}
  rect(0,175,320,65,'#192236');
  for(let y=181;y<240;y+=18) line(0,y,320,y,'#273249',1);
  rect(47,189,147,14,'#0d1424');rect(44,183,151,12,'#566078');rect(50,181,139,3,'#9291a0');rect(53,195,131,5,'#313c53');
  rect(221,187,70,8,'#3b4d5e');
  const wizard=snapshot?.wizard,goblin=snapshot?.goblin;
  // A battle ends when either character reaches zero health. The defeated
  // sprite is drawn lying on the floor; the banner waits for the final frame.
  const battle=!!(wizard&&goblin);
  const wizardDown=battle&&wizard.health===0,goblinDown=battle&&goblin.health===0;
  if(wizard) {
    if(wizardDown) {rect(76,184,96,4,'#151a29');lying(94,181,-Math.PI/2,()=>drawWizard(c,0,0,wizard,false));rect(172,178,46,4,'#a68160');}
    else drawWizard(c,103,109,wizard,true);
  } else if(snapshot?.blueprint) drawBlueprint(103,109,snapshot.blueprint.properties);
  if(goblin) {
    if(goblinDown) {rect(228,184,54,4,'#121a29');lying(277,155,Math.PI/2,()=>drawGoblin(c,0,0));}
    else drawGoblin(c,240,139);
  } else {rect(245,154,3,28,'#6c7184');rect(236,138,22,20,'#404d66');rect(242,143,10,10,'#a99372');}
  function lying(tx,ty,angle,draw){c.save();c.translate(tx,ty);c.rotate(angle);draw();c.restore();}
  // A class is a recipe, not a wizard: show a hollow, dotted outline until
  // new Wizard(...) creates an object. Constructor properties appear as labels.
  function drawBlueprint(x,y,properties=[]) {
    const outline=[[16,-14],[23,-14],[24,-8],[28,1],[32,9],[41,17],[41,23],[30,23],[30,36],[33,42],[37,52],[41,62],[41,74],[-3,74],[-3,62],[1,52],[5,42],[6,36],[6,23],[-5,23],[-5,17],[4,9],[9,1],[13,-8]];
    c.save();c.setLineDash([4,4]);c.strokeStyle='#b9c6e6';c.lineWidth=2;c.beginPath();
    outline.forEach(([dx,dy],i)=>i?c.lineTo(x+dx,y+dy):c.moveTo(x+dx,y+dy));c.closePath();c.stroke();c.restore();
    c.save();c.textAlign='center';c.textBaseline='middle';
    c.font='10px Consolas, monospace';c.fillStyle='#8f9bb8';c.fillText('class Wizard',x+18,y+101);
    if(properties.length) {
      const label=properties.slice(0,3).join(' · ');c.font='bold 11px Consolas, monospace';
      const w=Math.ceil(c.measureText(label).width)+16,lx=Math.round(x+19-w/2),ly=y-40;
      rect(lx,ly,w,17,'#2c3654');rect(lx,ly,w,1,'#e6bc60');rect(lx,ly+16,w,1,'#e6bc60');rect(lx,ly,1,17,'#e6bc60');rect(lx+w-1,ly,1,17,'#e6bc60');
      line(x+19,ly+17,x+19,y-18,'#e6bc60',1);
      c.fillStyle='#f5e7c4';c.fillText(label,x+19,ly+9);
    }
    c.restore();
  }
  drawEffect(c,effect);
  if((wizardDown||goblinDown)&&!effect) {
    rect(0,22,320,62,'rgba(6,10,22,0.85)');rect(0,22,320,2,'#e6bc60');rect(0,82,320,2,'#e6bc60');
    c.save();c.textAlign='center';c.textBaseline='middle';
    c.font='bold 26px Consolas, monospace';c.fillStyle='#f3d589';c.fillText('Game Over',160,45);
    c.font='bold 14px Consolas, monospace';c.fillStyle='#ffffff';c.fillText(wizardDown?'Goblin Wins':'Wizard Wins',160,69);
    c.restore();
  }
}
export class TracePlayer {
  constructor(draw){this.draw=draw;this.timer=null;this.final=null;this.playing=false;}
  stop(){clearTimeout(this.timer);this.playing=false;}
  skip(){this.stop();if(this.final)this.draw(this.final,null);}
  play(result,reduced){this.stop();this.final=result.snapshot;if(reduced||!result.trace.length){this.draw(result.snapshot,null);return;}let i=0;this.playing=true;const tick=()=>{const a=result.trace[i++];if(!a){this.playing=false;this.draw(result.snapshot,null);return;}this.draw(a.after,a);this.timer=setTimeout(tick,550);};this.draw(result.snapshot.setup,null);this.timer=setTimeout(tick,200);}
}
