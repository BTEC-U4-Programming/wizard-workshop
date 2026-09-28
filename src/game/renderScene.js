export const palettes={grey:'#a4adbc',purple:'#ae87e8',gold:'#e6bc60',black:'#41495f',blue:'#73a8e5',green:'#73bc91'};
const cloak=['00001110000','00011111000','00011111000','00111111100','00111111100','01111111110','01111111110','11111111111'];
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
    if(wizardDown) {rect(76,184,96,4,'#151a29');lying(94,181,-Math.PI/2,()=>drawWizard(0,0,false));rect(172,178,46,4,'#a68160');}
    else drawWizard(103,109,true);
  } else if(snapshot?.blueprint) drawBlueprint(103,109,snapshot.blueprint.properties);
  if(goblin) {
    if(goblinDown) {rect(228,184,54,4,'#121a29');lying(277,155,Math.PI/2,()=>drawGoblin(0,0));}
    else drawGoblin(240,139);
  } else {rect(245,154,3,28,'#6c7184');rect(236,138,22,20,'#404d66');rect(242,143,10,10,'#a99372');}
  function lying(tx,ty,angle,draw){c.save();c.translate(tx,ty);c.rotate(angle);draw();c.restore();}
  function drawWizard(x,y,standing) {
    const p=wizard.specialPower||'fire',colour=palettes[wizard.cloakColour]||palettes.grey;
    const aura={fire:'#d68e63',ice:'#80cee7',electricity:'#d8c66a'}[p];
    if(standing) {for(let i=0;i<6;i++) rect(x-17+i*14,y+39+(i%2)*8,2,3,aura);rect(x+2,y+68,34,5,'#151a29');}
    rect(x+5,y+50,28,20,'#2b2440');
    // Pixel mask clips all patterned pixels to the cloak silhouette.
    cloak.forEach((row,dy)=>[...row].forEach((bit,dx)=>{if(bit==='1') {
      rect(x-3+dx*4,y+32+dy*5,4,5,colour);
      if(wizard.cloakColour==='black'&&(row[dx-1]!=='1'||row[dx+1]!=='1'))rect(x-3+dx*4,y+32+dy*5,1,5,'#a2a9c3');
      const pattern=wizard.cloakPattern||'plain';
      if((pattern==='stars' && dx%3===1 && dy%3===1)||(pattern==='stripes'&&dy%3===0)||(pattern==='runes'&&(dx+dy)%4===0)) rect(x-2+dx*4,y+33+dy*5,pattern==='stripes'?4:2,pattern==='runes'?4:2,'#f9e3b0');
    }}));
    rect(x+6,y+21,24,18,'#eac39b');rect(x+7,y+23,5,8,'#b99480');rect(x+23,y+27,3,3,'#202336');
    if(wizard.beardType && wizard.beardType!=='none') {rect(x+10,y+34,21,7,'#e3e0d8');rect(x+14,y+41,13,wizard.beardType==='long'?15:5,'#d3d5db');if(wizard.beardType==='long')rect(x+18,y+56,5,5,'#d3d5db');}
    rect(x-5,y+17,46,6,colour);rect(x+4,y+9,28,8,colour);rect(x+9,y+1,19,8,colour);rect(x+13,y-8,11,9,colour);rect(x+16,y-14,7,6,colour);
    line(x-5,y+23,x+41,y+23,'#d1b3ef',1);
    if(standing) {
      const wx=x+50;rect(wx,y+24,4,46,'#a68160');
      if(wizard.wand==='crystal') {rect(wx-3,y+13,10,14,'#8de1eb');rect(wx,y+9,4,20,'#d3fbff');}
      else if(wizard.wand==='ember') {rect(wx-4,y+14,12,13,'#d97051');rect(wx-1,y+10,6,15,'#ffcf69');}
      else {rect(wx-2,y+16,8,11,'#bd9a70');rect(wx+4,y+13,4,6,'#81a376');}
    }
    rect(x+4,y+68,11,6,'#222539');rect(x+27,y+68,11,6,'#222539');
  }
  function drawGoblin(x,y) {
    rect(x+2,y+39,29,7,'#121a29');rect(x+3,y+15,23,25,'#789869');rect(x-5,y+1,36,8,'#7fac80');rect(x+2,y-3,24,23,'#8bb78a');rect(x+6,y+5,4,3,'#152437');rect(x+20,y+5,4,3,'#152437');rect(x+10,y+14,12,3,'#d2d2b1');rect(x+3,y+26,23,6,'#9d805e');rect(x+4,y+39,8,8,'#415a50');rect(x+20,y+39,8,8,'#415a50');
  }
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
  if(effect) {
    const p=effect.power,ex=effect.actor==='goblin'?155:213;
    if(effect.method==='castSpell'&&p==='fire'){rect(ex,139,17,8,'#ea794d');rect(ex+9,135,9,16,'#f7b963');rect(ex+17,141,8,5,'#fbe4aa');}
    if(effect.method==='castSpell'&&p==='ice'){line(ex-9,143,ex+20,143,'#9eeaff',4);line(ex+14,132,ex+14,153,'#d4faff');line(ex+5,135,ex+23,151,'#9eeaff');}
    if(effect.method==='castSpell'&&p==='electricity'){line(ex-20,130,ex,145,'#e8d477',3);line(ex,145,ex-4,137,'#c7a5f6',3);line(ex-4,137,ex+25,150,'#f5e390',3);}
    if(effect.method==='recoverHealth') for(let i=0;i<5;i++) rect(100+i*8,96+(i%2)*12,3,6,'#95e5ad');
    if(effect.method==='levelUp'){c.strokeStyle='#f3d589';c.lineWidth=3;c.beginPath();c.ellipse(120,166,33,12,0,0,Math.PI*2);c.stroke();}
    if(effect.method==='attack'){line(177,145,162,156,'#e1b69b',3);line(183,151,169,161,'#e1b69b',3);}
  }
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
