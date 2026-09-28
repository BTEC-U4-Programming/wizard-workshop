import {getQuickJS} from 'quickjs-emscripten';
import {EdpContext} from '../src/edp/engine.js';
import {byId} from '../src/edp/curriculum/checkpoints.js';

// Drive the same listeners students write; never call battle methods directly.
export function simulateBalance(QuickJS, count = 1000) {
  const results = {};
  for (const strategy of ['fireOnly', 'fullControls']) {
    let wins = 0,
      turns = 0;
    for (let seed = 1; seed <= count; seed++) {
      const vm = new EdpContext(
        QuickJS,
        {
          stage: 'grubbledown-bridge',
          source: byId['E6.7'].solution.spellsSource,
          seed
        },
        Date.now() + 1000
      );
      try {
        const result = vm.evaluate(`(() => {
          const click=id=>__ww.step({do:'click',target:'#'+id});
          for(let i=0;i<200&&!['victory','defeat'].includes(battle.state);i++) {
            if (${JSON.stringify(strategy)} === 'fireOnly') click('fire-card');
            else {
              __ww.step({do:'mouseover',target:'#goblin'});
              const plan=document.querySelector('#intent-bubble').textContent;
              if(wizard.health<30&&wizard.potions>0) click('potion-button');
              else if(plan.startsWith('Big Bonk')) click('shield-button');
              else if(wizard.mana>=8) {
                click('fireball-button');
                for(const key of 'IGNIS') __ww.step({do:'key',key,target:'document'});
                __ww.step({do:'key',key:'Enter',target:'document'});
              } else click('ice-card');
            }
            __ww.step({do:'wait',ms:1200});
          }
          const data=JSON.parse(__ww.read());
          return {win:battle.state==='victory',turns:data.battle.stats.turns};
        })()`);
        wins += Number(result.win);
        turns += result.turns;
      } finally {
        vm.dispose();
      }
    }
    results[strategy] = {
      battles: count,
      wins,
      winRate: wins / count,
      meanTurns: turns / count
    };
  }
  return results;
}
if (process.argv[1]?.endsWith('balance-edp.mjs')) {
  console.log(JSON.stringify(simulateBalance(await getQuickJS()), null, 2));
}
