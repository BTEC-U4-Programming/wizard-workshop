import {chromium} from '@playwright/test';
import {mkdirSync} from 'node:fs';
mkdirSync('verification',{recursive:true});
const browser=await chromium.launch();
try {
  const page=await browser.newPage({viewport:{width:1300,height:1000}});
  await page.goto('http://127.0.0.1:5173');
  const report=await page.evaluate(async()=>{
    const {renderScene}=await import('/src/game/renderScene.js');
    const {choices}=await import('/src/curriculum/checkpoints.js');
    const base={name:'Aster',cloakColour:'purple',cloakPattern:'plain',wand:'oak',beardType:'none',specialPower:'fire',level:1,maxHealth:100,health:100};
    const off=document.createElement('canvas');off.width=320;off.height=240;let combinations=0;
    for(const cloakColour of choices.cloakColour)for(const cloakPattern of choices.cloakPattern)for(const wand of choices.wand)for(const beardType of choices.beardType)for(const specialPower of choices.specialPower){renderScene(off,{wizard:{...base,cloakColour,cloakPattern,wand,beardType,specialPower}});combinations++;}
    document.body.replaceChildren();document.body.style.cssText='margin:0;padding:20px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px;background:#111a2a;color:#fff;font:16px system-ui';
    const hashes={};
    for(const [key,values] of Object.entries(choices).filter(([key])=>key!=='level'))for(const value of values){
      const card=document.createElement('section'),label=document.createElement('p'),canvas=document.createElement('canvas');label.textContent=key+' = '+JSON.stringify(value);canvas.width=320;canvas.height=240;canvas.style.width='100%';renderScene(canvas,{wizard:{...base,[key]:value}});card.append(label,canvas);document.body.append(card);hashes[key+':'+value]=canvas.toDataURL();
    }
    for(const [method,power] of [['castSpell','fire'],['castSpell','ice'],['castSpell','electricity'],['recoverHealth',null],['levelUp',null],['attack',null]]){const card=document.createElement('section'),label=document.createElement('p'),canvas=document.createElement('canvas');label.textContent=method+' '+(power||'');canvas.width=320;canvas.height=240;canvas.style.width='100%';renderScene(canvas,{wizard:base,goblin:{name:'Grub',health:60,level:1,maxHealth:60}},{actor:method==='attack'?'goblin':'wizard',method,power});card.append(label,canvas);document.body.append(card);}
    const distinct=Object.entries(choices).filter(([key])=>key!=='level').every(([key,values])=>new Set(values.map(value=>hashes[key+':'+value])).size===values.length);
    return {combinations,distinct};
  });
  await page.screenshot({path:'verification/sprite-options.png',fullPage:true});
  console.log(JSON.stringify(report));if(!report.distinct)throw new Error('At least two choices look identical.');
} finally {await browser.close();}
