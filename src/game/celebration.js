import confetti from 'canvas-confetti';

export function createCelebration(button,reducedMotion) {
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const canvas=document.createElement('canvas');
  canvas.className='celebration';
  canvas.setAttribute('aria-hidden','true');
  canvas.hidden=true;
  document.body.append(canvas);
  const burst=confetti.create(canvas,{resize:true,disableForReducedMotion:true});
  let generation=0;
  function stop(){generation++;burst.reset();canvas.hidden=true;}
  media.addEventListener('change',()=>{if(media.matches)stop();});
  return {
    stop,
    // Bursts from the given element, or from the Run code button by default.
    play(origin=button){
      stop();
      if(reducedMotion()||media.matches)return;
      const rect=origin.getBoundingClientRect();
      if(!rect.width||rect.bottom<0||rect.top>innerHeight)return;
      const current=generation;
      canvas.hidden=false;
      Promise.resolve(burst({
        origin:{x:(rect.left+rect.width/2)/innerWidth,y:(rect.top+rect.height/2)/innerHeight},
        particleCount:75,spread:75,startVelocity:28,ticks:100,gravity:1.15,
        colors:['#e9c578','#c7a0e8','#91c69e','#78b8e8'],
      })).finally(()=>{if(current===generation)canvas.hidden=true;});
    },
  };
}
