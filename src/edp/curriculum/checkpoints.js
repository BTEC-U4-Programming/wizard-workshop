import {battleRules} from '../runtime/rules.js';
import {sources, starters, gaps} from './sources.js';
const click = (target) => ({do: 'click', target: '#' + target});
const mouse = (target, eventType = 'mouseover') => ({
  do: eventType,
  target: '#' + target
});
const key = (key, target = 'document') => ({do: 'key', key, target});
const keys = (text) => [...text].map((letter) => key(letter));
const wait = (ms) => ({do: 'wait', ms});
const set = (path, value) => ({do: 'set', path, value});
const type = (target, text) => ({do: 'type', target: '#' + target, text});
const w = (s) => s.world.wizard,
  g = (s) => s.world.goblin,
  e = (s, id) => s.elements[id];
const castCount = (s) => s.log.filter((item) => item.type === 'spell').length;
const trial = (name, steps, check, message, category = 'typical', setup) => ({
  name,
  steps,
  expect: (s) => (check(s) ? null : message),
  category,
  setup
});
const bins = ['Mostly procedural', 'Mostly event-driven'];
const sort = (bins, cards) => ({
  type: 'sort',
  bins,
  cards: cards.map(([text, answer, feedback], i) => ({
    id: 'card' + i,
    text,
    answer: String(answer),
    feedback
  }))
});
export const battleBotSteps = [
  ...Array.from({length: 3}, () => [
    mouse('goblin'),
    key('f'),
    ...keys('IGNIS'),
    key('Enter'),
    wait(1200)
  ]).flat(),
  key('1'),
  wait(1200),
  key('1'),
  wait(1200),
  key('2'),
  wait(1200)
];
const records = [
  [
    'E1.1',
    'Listen for the bell',
    'Add one line so `#wake-button` listens for `"click"` and runs `wakeWizard`.',
    'tower-bedroom',
    'worked example',
    [
      trial(
        'Your wizard stays asleep until someone clicks',
        [],
        (s) => !w(s).awake,
        'Your wizard woke before anyone clicked. Hand over wakeWizard without brackets.'
      ),
      trial(
        'Clicking the bell wakes your wizard',
        [click('wake-button')],
        (s) => w(s).awake && w(s).lastSpeech.length > 0,
        'Nothing was listening on #wake-button. Add wakeButton.addEventListener("click", wakeWizard); under step 3.'
      ),
      trial(
        'Three clicks run the handler three times',
        Array(3).fill(click('wake-button')),
        (s) => s.log.filter((a) => a.handler === 'wakeWizard').length === 3,
        'Connect wakeWizard to click so each bell ring runs it.'
      )
    ]
  ],
  [
    'E1.2',
    'The lantern that lit too soon',
    'Fix the lantern so it lights only when `#lantern-button` is clicked.',
    'tower-bedroom',
    'guided',
    [
      trial(
        'The lantern is dark until someone clicks',
        [],
        (s) => !s.world.lantern.lit,
        'Remove the brackets after lightLantern. Hand over the function for later.'
      ),
      trial(
        'Clicking lights the lantern',
        [click('lantern-button')],
        (s) => s.world.lantern.lit,
        'Connect lightLantern to the lantern button.'
      )
    ]
  ],
  [
    'E1.3',
    'Time for bed',
    'Make `#sleep-button` run a function that puts your wizard to sleep and says goodnight.',
    'tower-bedroom',
    'partial prompts',
    [
      trial(
        'Sleep after waking',
        [click('wake-button'), click('sleep-button')],
        (s) => !w(s).awake && /goodnight/i.test(w(s).lastSpeech),
        'Find #sleep-button, write goToSleep and connect it to click.'
      ),
      trial(
        'The player chooses the order',
        [click('wake-button'), click('sleep-button'), click('wake-button')],
        (s) => w(s).awake,
        'Keep the bell listener as well as your sleep listener.'
      ),
      trial(
        'Sleeping while asleep causes no error',
        [click('sleep-button')],
        (s) => !w(s).awake && !s.errors.length,
        'Sleeping again should be safe. Call wizard.sleep() on wizard.',
        'erroneous'
      )
    ]
  ],
  [
    'E1.4',
    'A shorter way to write it',
    'Use an arrow function so `#snuff-button` puts the lantern out.',
    'tower-bedroom',
    'gaps',
    [
      trial(
        'Snuffing puts the lantern out',
        [click('lantern-button'), click('snuff-button')],
        (s) => !s.world.lantern.lit,
        'Connect #snuff-button to lantern.turnOff().'
      ),
      trial(
        'The handler is an arrow function',
        [],
        (s) =>
          s.registrations.some(
            (r) =>
              r.target === '#snuff-button' &&
              r.handler === '(arrow function)' &&
              r.accepted
          ),
        'This step practises arrow functions. Use () => lantern.turnOff().'
      )
    ]
  ],
  [
    'E1.5',
    'Who decides the order?',
    'Sort each program into mostly procedural or mostly event-driven, then explain one choice.',
    'tower-bedroom',
    'independent',
    [
      trial(
        'Wake, sleep and snuff listeners stay ready',
        [
          click('wake-button'),
          click('sleep-button'),
          click('lantern-button'),
          click('snuff-button')
        ],
        (s) => !w(s).awake && !s.world.lantern.lit,
        'Keep your working bell, sleep and lantern listeners.'
      )
    ]
  ],
  [
    'E2.1',
    'Cast on command',
    'Make `#ice-button` cast ice with at least 3 mana, or say "Not enough mana!".',
    'spell-room',
    'gaps',
    [
      trial(
        'Fire works as before',
        [click('fire-button')],
        (s) => g(s).health === 46 && w(s).mana === 16,
        'Keep the fire handler working.'
      ),
      trial(
        'Ice casts with plenty of mana',
        [click('ice-button')],
        (s) =>
          g(s).health === 48 && w(s).mana === 17 && w(s).lastSpell === 'ice',
        'Connect #ice-button to an ice handler.'
      ),
      trial(
        'Exactly 3 mana is enough',
        [set('wizard.mana', 3), click('ice-button')],
        (s) => g(s).health === 48 && w(s).mana === 0,
        'Use >= 3 so exactly 3 mana is enough.',
        'extreme'
      ),
      trial(
        '2 mana is not enough',
        [set('wizard.mana', 2), click('ice-button')],
        (s) =>
          g(s).health === 60 &&
          !s.log.some((a) => a.type === 'fizzle') &&
          /not enough mana/i.test(w(s).lastSpeech),
        'Check wizard.mana >= 3 and explain the refusal in else.',
        'extreme'
      ),
      trial(
        'Button mashing drains mana safely',
        [set('wizard.mana', 10), ...Array(5).fill(click('ice-button'))],
        (s) => g(s).health === 24 && w(s).mana === 1,
        'Check mana on every click, before casting.',
        'erroneous'
      )
    ]
  ],
  [
    'E2.2',
    'Where did I click?',
    'Walk your wizard to wherever the courtyard is clicked, using the event object.',
    'courtyard',
    'gaps',
    [
      trial(
        'Clicking chooses a position',
        [{...click('courtyard'), offsetX: 200, offsetY: 150}],
        (s) => w(s).x === 200 && w(s).y === 150,
        'Read both event.offsetX and event.offsetY.'
      ),
      trial(
        'The second click chooses a new position',
        [
          {...click('courtyard'), offsetX: 80, offsetY: 70},
          {...click('courtyard'), offsetX: 150, offsetY: 120}
        ],
        (s) => w(s).x === 150 && w(s).y === 120,
        'Move using the details from each new click.'
      ),
      trial(
        'The lawn edge stays safe',
        [{...click('courtyard'), offsetX: 319, offsetY: 239}],
        (s) => w(s).x === 280 && w(s).y === 190 && !s.errors.length,
        'Use wizard.moveTo; it keeps the wizard inside the lawn.',
        'extreme'
      )
    ]
  ],
  [
    'E2.3',
    'One spellbook, many spells',
    'Make every card in the Spellbook cast its spell — even new ones — using just **one** listener on `#spellbook`.',
    'spellbook-room',
    'gaps',
    [
      trial(
        'Fire card casts fire',
        [click('fire-card')],
        (s) => w(s).lastSpell === 'fire',
        'Save event.target.dataset.power in power, then set wizard.specialPower = power and cast.'
      ),
      trial(
        'Ice card casts ice',
        [click('ice-card')],
        (s) => w(s).lastSpell === 'ice',
        'Use the power from the clicked card, not a fixed word like "fire".'
      ),
      trial(
        'Clicking the Spellbook box, not a card, casts nothing',
        [click('spellbook')],
        (s) => castCount(s) === 0 && !s.errors.length,
        'The Spellbook box has no data-power, so power is undefined. Wrap the cast in if (power) { ... }.',
        'erroneous'
      ),
      trial(
        'A newly learnt spell works straight away',
        [click('learn-button'), click('storm-card')],
        (s) => w(s).lastSpell === 'electricity',
        'The Storm card is new. Put your listener on #spellbook so its clicks bubble up to it.'
      ),
      trial(
        'One listener does the work',
        [],
        (s) =>
          s.registrations.filter(
            (r) => r.accepted && r.type === 'click' && r.target === '#spellbook'
          ).length === 1 &&
          !s.registrations.some(
            (r) => r.accepted && /#(fire|ice|storm)-card/.test(r.target)
          ),
        'Delete the fireCard and iceCard listeners. Keep just one listener, on #spellbook.'
      )
    ]
  ],
  [
    'E2.4',
    'The potion that did nothing',
    'Fix the potion button so clicking it really heals your wizard, and find out why the first version failed.',
    'potion-room',
    'guided',
    [
      trial(
        'Clicking heals 50 to 70',
        [click('potion-button')],
        (s) => w(s).health === 70,
        'Call the method on wizard: () => wizard.recoverHealth().'
      ),
      trial(
        'No errors in the Crystal Ball',
        [click('potion-button')],
        (s) => !s.errors.length,
        'Keep this pointing at wizard by wrapping the method call.'
      )
    ]
  ],
  [
    'E3.1',
    'Potion labels',
    'Show the blue potion’s label on `mouseover` and hide it on `mouseout`.',
    'whispering-wood',
    'gaps',
    [
      trial(
        'The label starts hidden',
        [],
        (s) => e(s, 'tooltip').hidden,
        'Keep the tooltip hidden until someone hovers.'
      ),
      trial(
        'Hovering blue shows its label',
        [mouse('blue-potion')],
        (s) =>
          !e(s, 'tooltip').hidden &&
          e(s, 'tooltip').text === 'Mana tonic: +10 mana',
        'Use mouseover to set the blue text and hidden = false.'
      ),
      trial(
        'Leaving hides the label',
        [mouse('blue-potion'), mouse('blue-potion', 'mouseout')],
        (s) => e(s, 'tooltip').hidden,
        'Use mouseout and hidden = true.'
      ),
      trial(
        'Red then blue shows blue text',
        [mouse('red-potion'), mouse('blue-potion')],
        (s) => e(s, 'tooltip').text === 'Mana tonic: +10 mana',
        'Update the text whenever the pointer reaches a potion.'
      )
    ]
  ],
  [
    'E3.2',
    'Scrying Grub',
    'When the pointer is over Grub, show his health and outline him. Remove both when it leaves.',
    'whispering-wood',
    'gaps',
    [
      trial(
        'Hover shows live health and an outline',
        [mouse('goblin')],
        (s) =>
          e(s, 'stats').text === 'Grub — health 60/60' &&
          e(s, 'goblin').classes.includes('outlined'),
        'Read the goblin object’s health and add outlined to the element.'
      ),
      trial(
        'Leaving removes both',
        [mouse('goblin'), mouse('goblin', 'mouseout')],
        (s) =>
          e(s, 'stats').text === '' &&
          !e(s, 'goblin').classes.includes('outlined'),
        'Use classList.remove("outlined") when the pointer leaves.'
      ),
      trial(
        'The reading is live',
        [set('goblin.health', 35), mouse('goblin')],
        (s) => e(s, 'stats').text.includes('35/60'),
        'Read goblin.health inside the handler, each time.'
      )
    ]
  ],
  [
    'E3.3',
    'The glowing staff',
    'Make the staff glow while the pointer is over your wizard.',
    'whispering-wood',
    'prompts only',
    [
      trial(
        'Glow on arrival',
        [mouse('wizard')],
        (s) => e(s, 'wizard').classes.includes('glow'),
        'Add glow to #wizard on mouseover.'
      ),
      trial(
        'No glow after leaving',
        [mouse('wizard'), mouse('wizard', 'mouseout')],
        (s) => !e(s, 'wizard').classes.includes('glow'),
        'Remove glow on mouseout.'
      ),
      trial(
        'Repeated hovers stay safe',
        [mouse('wizard'), mouse('wizard'), mouse('wizard', 'mouseout')],
        (s) => !e(s, 'wizard').classes.includes('glow') && !s.errors.length,
        'Use classList.add and remove rather than stacking listeners.',
        'erroneous'
      )
    ]
  ],
  [
    'E3.4',
    'The cursed chest',
    'Make the trap spring only once, and make Disarm really remove it.',
    'whispering-wood',
    'guided',
    [
      trial(
        'The trap springs once',
        Array(3).fill(mouse('chest')),
        (s) => w(s).health === 95,
        'Add { once: true } so the trap removes itself.'
      ),
      trial(
        'Disarming works',
        [click('disarm-button'), mouse('chest')],
        (s) => w(s).health === 100,
        'Use the same springTrap function reference in add and remove.'
      ),
      trial(
        'The handler is named and once',
        [],
        (s) =>
          s.registrations.some(
            (r) =>
              r.target === '#chest' &&
              r.handler === 'springTrap' &&
              r.once &&
              r.accepted
          ),
        'Pass springTrap directly and add { once: true }.'
      )
    ]
  ],
  [
    'E3.5',
    'The apprentice who couldn’t hover',
    'Show the red potion’s label on keyboard focus, and hide it on blur.',
    'whispering-wood',
    'partial prompts',
    [
      trial(
        'Focus shows the label',
        [mouse('red-potion', 'focus')],
        (s) => !e(s, 'tooltip').hidden,
        'Connect focus to showRedInfo.'
      ),
      trial(
        'Blur hides the label',
        [mouse('red-potion', 'focus'), mouse('red-potion', 'blur')],
        (s) => e(s, 'tooltip').hidden,
        'Connect blur to hideTooltip.'
      ),
      trial(
        'Hover still works',
        [mouse('red-potion')],
        (s) => !e(s, 'tooltip').hidden,
        'Keep mouseover and mouseout alongside focus and blur.'
      )
    ]
  ],
  [
    'E4.1',
    'Walk with the arrow keys',
    'Add `ArrowUp` and `ArrowDown` cases so your wizard walks without scrolling the page.',
    'rune-door',
    'gaps',
    [
      trial(
        'Right three times moves across',
        Array(3).fill(key('ArrowRight')),
        (s) => w(s).x === 150,
        'Keep the ArrowRight case working.'
      ),
      trial(
        'Up moves ten pixels',
        [key('ArrowUp')],
        (s) => w(s).y === 140,
        'Add an ArrowUp case with moveBy(0, -10), then break.'
      ),
      trial(
        'Down moves ten pixels',
        [key('ArrowDown')],
        (s) => w(s).y === 160,
        'Add an ArrowDown case with moveBy(0, 10), then break.'
      ),
      trial(
        'Up and down do not scroll',
        [key('ArrowUp'), key('ArrowDown')],
        (s) => s.page.scrollNudges === 0,
        'Add event.preventDefault() to each new arrow case.'
      ),
      trial(
        'Other keys do nothing',
        [key('q')],
        (s) => w(s).x === 120 && w(s).y === 150 && !s.errors.length,
        'Change position only for the four arrow keys.',
        'erroneous'
      )
    ]
  ],
  [
    'E4.2',
    'Speak to the door',
    'Complete the door’s `input` handler so capital letters do not matter.',
    'rune-door',
    'gaps',
    [
      trial(
        'Lowercase aperio opens the door',
        [type('incantation', 'aperio')],
        (s) => s.world.runeDoor.isOpen,
        'Normalise the input with trim().toUpperCase().'
      ),
      trial(
        'A prefix lights three runes',
        [type('incantation', 'ape')],
        (s) => s.world.runeDoor.runesLit === 3,
        'Use secretWord.startsWith(typed) and typed.length.'
      ),
      trial(
        'Incorrect text flashes red',
        [type('incantation', 'apx')],
        (s) => s.world.runeDoor.redFlashes > 0,
        'Use the final else to flashRed().',
        'erroneous'
      ),
      trial(
        'Spaces around the word are accepted',
        [type('incantation', '  APERIO  ')],
        (s) => s.world.runeDoor.isOpen,
        'Use trim() before changing to capitals.',
        'extreme'
      )
    ]
  ],
  [
    'E4.3',
    'The spell buffer',
    'Fix the buffer so Shift and the arrows are not added to it.',
    'rune-door',
    'guided',
    [
      trial(
        'IGNIS then Enter speaks the spell',
        [...keys('IGNIS'), key('Enter')],
        (s) => w(s).lastIncantation === 'IGNIS',
        'Collect letters and pass the buffer on Enter.'
      ),
      trial(
        'Lowercase works too',
        [...keys('ignis'), key('Enter')],
        (s) => w(s).lastIncantation === 'IGNIS',
        'Use toUpperCase() when collecting letters.'
      ),
      trial(
        'Long key names are ignored',
        [key('Shift'), key('ArrowUp'), key('Control')],
        (s) => s.globals.spellBuffer === '',
        'Only add keys whose name is one character long: event.key.length === 1.',
        'erroneous'
      ),
      trial(
        'Backspace repairs a typo',
        [...keys('IGNIX'), key('Backspace'), key('S'), key('Enter')],
        (s) => w(s).lastIncantation === 'IGNIS',
        'Use slice(0, -1) to remove the last character.'
      ),
      trial(
        'Empty Enter is safe',
        [key('Enter')],
        (s) => /mumbles nothing/.test(w(s).lastSpeech) && !s.errors.length,
        'An empty buffer should pass safely to speakIncantation.',
        'erroneous'
      )
    ]
  ],
  [
    'E4.4',
    'Twelve letters is plenty',
    'Stop the buffer growing beyond 12 letters, then classify the test data.',
    'rune-door',
    'independent',
    [
      trial(
        'Exactly 12 letters are kept',
        keys('ABCDEFGHIJKL'),
        (s) => s.globals.spellBuffer === 'ABCDEFGHIJKL',
        'Allow characters while spellBuffer.length < 12.',
        'extreme'
      ),
      trial(
        'A thirteenth letter is ignored',
        keys('ABCDEFGHIJKLM'),
        (s) => s.globals.spellBuffer === 'ABCDEFGHIJKL',
        'Put the length check inside the single-character branch.',
        'extreme'
      ),
      trial(
        'IGNIS still works',
        [...keys('IGNIS'), key('Enter')],
        (s) => w(s).lastIncantation === 'IGNIS',
        'Keep Enter and Backspace working.'
      )
    ]
  ],
  [
    'E4.5',
    'Two listeners, one keyboard',
    'Typing in the door’s box must not fill the spell buffer.',
    'rune-door',
    'prompts only',
    [
      trial(
        'Box typing opens the door without filling the buffer',
        [type('incantation', 'aperio')],
        (s) => s.world.runeDoor.isOpen && s.globals.spellBuffer === '',
        'At the start of the buffer handler, return if event.target.tagName === "INPUT".'
      ),
      trial(
        'Stage typing still lights the lantern',
        [...keys('LUX'), key('Enter')],
        (s) => s.world.lantern.lit,
        'Ignore keys from INPUT elements, while keeping stage keys working.'
      )
    ]
  ],
  [
    'E5.1',
    'Predict the order',
    'Predict the order of the three messages, then run and explain the result.',
    'owl-loft',
    'worked example',
    [
      trial(
        'The console shows 1, 3, 2',
        [],
        (s) =>
          s.log
            .filter((a) => a.type === 'console')
            .map((a) => a.message[0])
            .join('') === '132',
        'A zero-delay timer waits until the current script finishes.'
      )
    ]
  ],
  [
    'E5.2',
    'The frozen tower',
    'Change the count so the handler finishes quickly, and check the bell works afterwards.',
    'owl-loft',
    'guided',
    [
      trial(
        'Counting finishes',
        [click('count-button')],
        (s) => w(s).lastSpeech === 'Done counting!',
        'Make the while loop much shorter; try count < 10.'
      ),
      trial(
        'The bell works after counting',
        [click('count-button'), click('bell-button')],
        (s) => s.world.tower.awake,
        'Let the count handler finish so the next event can run.'
      )
    ]
  ],
  [
    'E5.3',
    'Whose turn is it?',
    'Fix the duel so clicking Zap during Grub’s turn says "Wait your turn!".',
    'owl-loft',
    'guided',
    [
      trial(
        'One click starts Grub’s turn',
        [click('zap-button')],
        (s) => g(s).health === 46 && s.globals.gameState === 'goblinTurn',
        'After casting, set gameState = "goblinTurn"; so another click cannot cast.'
      ),
      trial(
        'Button mashing casts only once',
        [click('zap-button'), click('zap-button')],
        (s) => g(s).health === 46 && w(s).lastSpeech === 'Wait your turn!',
        'Check the state before casting; change it as soon as the first spell casts.',
        'erroneous'
      ),
      trial(
        'Grub replies after 1.5 seconds',
        [click('zap-button'), wait(1500)],
        (s) => w(s).health === 92 && s.globals.gameState === 'wizardTurn',
        'Schedule goblinTakesTurn for 1500ms and restore wizardTurn in it.'
      ),
      trial(
        'Click, wait, click casts twice',
        [click('zap-button'), wait(1500), click('zap-button')],
        (s) => g(s).health === 32,
        'Let the timer restore the wizard’s turn.'
      )
    ]
  ],
  [
    'E5.4',
    'Trace the turns',
    'Complete the trace table for four events, then run to check it.',
    'owl-loft',
    'prompts only',
    [
      trial(
        'The four-event trace matches',
        [
          click('zap-button'),
          wait(500),
          click('zap-button'),
          wait(1000),
          wait(500),
          click('zap-button')
        ],
        (s) =>
          g(s).health === 32 &&
          w(s).health === 92 &&
          s.globals.gameState === 'goblinTurn',
        'Keep the turn state and 1500ms timer from the previous step.'
      )
    ]
  ],
  [
    'E5.5',
    'Grub shouts back',
    'Announce `goblinDefeated` when Grub reaches 0 health, and listen for it.',
    'owl-loft',
    'gaps',
    [
      trial(
        'Defeat wakes the tower',
        [set('goblin.health', 10), click('zap-button')],
        (s) =>
          g(s).health === 0 &&
          w(s).lastSpeech === 'Grub is beaten!' &&
          s.world.tower.awake,
        'Dispatch goblinDefeated after casting, then use event.detail.name in a listener.'
      ),
      trial(
        'A surviving Grub does not wake the tower',
        [click('zap-button')],
        (s) => !s.world.tower.awake,
        'Dispatch only inside if (goblin.health === 0).'
      )
    ]
  ],
  [
    'E6.1',
    'Wire the spell bar',
    'Use event delegation to connect the spell cards to `battle.cast(power)`.',
    'grubbledown-bridge',
    'gaps',
    [
      trial(
        'Fire casts on your turn',
        [click('fire-card')],
        (s) => g(s).health === battleRules.goblinHealth - 14,
        'Read event.target.dataset.power and call battle.cast(power).'
      ),
      trial(
        'A second quick click does nothing',
        [click('fire-card'), click('ice-card')],
        (s) => g(s).health === battleRules.goblinHealth - 14,
        'Check battle.isWizardTurn() before casting.',
        'erroneous'
      ),
      trial(
        'Between cards, no spell casts',
        [click('spell-bar')],
        (s) => g(s).health === battleRules.goblinHealth,
        'Check power exists before casting.',
        'erroneous'
      ),
      trial(
        'After Grub’s turn, ice works',
        [click('fire-card'), wait(1200), click('ice-card')],
        (s) => g(s).health === battleRules.goblinHealth - 26,
        'Keep the delegated listener ready for later turns.'
      )
    ]
  ],
  [
    'E6.2',
    'Shield and potion',
    'Make Shield and Healing potion work, only on your turn.',
    'grubbledown-bridge',
    'prompts only',
    [
      trial(
        'Shield protects the next hit',
        [click('shield-button'), wait(1200)],
        (s) => w(s).health >= 90 && s.battle.stats.shields === 1,
        'Call battle.shield() on your turn.'
      ),
      trial(
        'Potion heals and uses one potion',
        [set('wizard.health', 50), click('potion-button')],
        (s) => w(s).health === 70 && w(s).potions === 1,
        'Call battle.drinkPotion() on your turn.'
      ),
      trial(
        'Potion during Grub’s turn does nothing',
        [click('fire-card'), click('potion-button')],
        (s) => w(s).potions === 2,
        'Check battle.isWizardTurn() in the potion handler.',
        'erroneous'
      ),
      trial(
        'No potions leaves your turn open',
        [set('wizard.potions', 0), click('potion-button')],
        (s) =>
          s.battle.state === 'wizardTurn' &&
          w(s).lastSpeech === 'No potions left!',
        'Let battle.drinkPotion() explain when no potions remain.',
        'erroneous'
      )
    ]
  ],
  [
    'E6.3',
    'Scry Grub’s plan',
    'Show Grub’s next move on hover or focus, and hide it afterwards.',
    'grubbledown-bridge',
    'independent',
    [
      trial(
        'Hover shows the plan',
        [mouse('goblin')],
        (s) =>
          !e(s, 'intent-bubble').hidden &&
          e(s, 'intent-bubble').text === s.battle.intent,
        'Set the bubble text to battle.revealIntent() and show it.'
      ),
      trial(
        'Leaving hides it',
        [mouse('goblin'), mouse('goblin', 'mouseout')],
        (s) => e(s, 'intent-bubble').hidden,
        'Connect mouseout to your hide handler.'
      ),
      trial(
        'Focus shows the plan',
        [mouse('goblin', 'focus')],
        (s) => !e(s, 'intent-bubble').hidden,
        'Connect focus to the same show handler.'
      ),
      trial(
        'Blur hides it',
        [mouse('goblin', 'focus'), mouse('goblin', 'blur')],
        (s) => e(s, 'intent-bubble').hidden,
        'Connect blur to the hide handler.'
      )
    ]
  ],
  [
    'E6.4',
    'The Fireball incantation',
    'Collect typed letters during the Fireball window, show them, and cast with Enter.',
    'grubbledown-bridge',
    'independent',
    [
      trial(
        'IGNIS casts a Fireball',
        [click('fireball-button'), ...keys('ignis'), key('Enter')],
        (s) =>
          g(s).health === battleRules.goblinHealth - 30 && w(s).mana === 12,
        'Start an incantation, collect letters, then pass the buffer on Enter.'
      ),
      trial(
        'Long key names are ignored',
        [click('fireball-button'), key('Shift'), key('ArrowUp')],
        (s) => s.globals.spellBuffer === '',
        'Only add keys with event.key.length === 1.',
        'erroneous'
      ),
      trial(
        'Backspace repairs the word',
        [
          click('fireball-button'),
          ...keys('IGNIX'),
          key('Backspace'),
          key('S'),
          key('Enter')
        ],
        (s) => g(s).health === battleRules.goblinHealth - 30,
        'Use slice(0, -1) on Backspace.'
      ),
      trial(
        'Typing outside the window does nothing',
        keys('IGNIS'),
        (s) => s.globals.spellBuffer === '',
        'Return when !battle.isIncantationOpen().',
        'erroneous'
      ),
      trial(
        'An expired window fizzles; a new one is empty',
        [
          click('fireball-button'),
          key('I'),
          wait(5000),
          wait(1200),
          click('fireball-button')
        ],
        (s) => s.battle.state === 'incantation' && s.globals.spellBuffer === '',
        'Clear the buffer each time startIncantation() succeeds.',
        'extreme'
      )
    ]
  ],
  [
    'E6.5',
    'Battle hotkeys',
    'Connect keys 1–5 and f. Ignore hotkeys outside your turn and during incantations.',
    'grubbledown-bridge',
    'independent',
    [
      trial(
        '1 casts fire',
        [key('1')],
        (s) => g(s).health === battleRules.goblinHealth - 14,
        'Listen for keydown on document; case "1" casts fire.'
      ),
      trial(
        'f opens an empty incantation',
        [key('f')],
        (s) => s.battle.state === 'incantation' && s.globals.spellBuffer === '',
        'Register the buffer handler before the hotkeys; f starts Fireball.'
      ),
      trial(
        '2 during an incantation is text',
        [key('f'), key('2')],
        (s) =>
          s.globals.spellBuffer === '2' &&
          g(s).health === battleRules.goblinHealth,
        'Stop hotkeys when it is not your turn: if (!battle.isWizardTurn()) { return; }.',
        'erroneous'
      ),
      trial(
        'Keys during Grub’s turn do nothing',
        [key('1'), key('2'), key('5')],
        (s) =>
          g(s).health === battleRules.goblinHealth - 14 && w(s).potions === 2,
        'Check the turn before the switch.',
        'erroneous'
      )
    ]
  ],
  [
    'E6.6',
    'When the dust settles',
    'Listen for `battleEnded` and show the right ending from `event.detail.winner`.',
    'grubbledown-bridge',
    'gaps',
    [
      trial(
        'Victory shows the Rune Bell message',
        [set('goblin.health', 14), click('fire-card')],
        (s) =>
          s.battle.state === 'victory' &&
          e(s, 'ending').text === 'The Rune Bell is yours!' &&
          !e(s, 'ending').hidden,
        'Listen on battle.events and compare winner with "wizard".'
      ),
      trial(
        'Defeat shows a retry message',
        [set('wizard.health', 5), click('fire-card'), wait(1200)],
        (s) =>
          s.battle.state === 'defeat' &&
          e(s, 'ending').text === 'Grub wins this time. Try again!' &&
          !e(s, 'ending').hidden,
        'Use else for Grub’s victory, and show the ending.'
      )
    ]
  ],
  [
    'E6.7',
    'Play the battle',
    'Every control is listening. Play the battle — win or lose — then reflect.',
    'grubbledown-bridge',
    'independent',
    [
      trial(
        'Every control is listening',
        [],
        (s) =>
          [
            ['#spell-bar', 'click'],
            ['#shield-button', 'click'],
            ['#potion-button', 'click'],
            ['#fireball-button', 'click'],
            ['#goblin', 'mouseover'],
            ['#goblin', 'focus'],
            ['document', 'keydown'],
            ['battle.events', 'battleEnded']
          ].every(([target, type]) =>
            s.registrations.some(
              (r) => r.accepted && r.target === target && r.type === type
            )
          ),
        'Connect spell bar, shield, potion, Fireball, hover and focus on Grub, keydown, and battleEnded.'
      ),
      trial(
        'A test player can win with your controls',
        battleBotSteps,
        (s) => s.battle.state === 'victory',
        'Keep every handler working together. Use scrying, Fireball and turn checks.'
      )
    ]
  ]
];
const instructions = {
  'E1.1': [
    'In Tome I, `actions.js` ran your calls in a fixed order. Now your code waits for events.',
    'Open `stage.html`. The bell is a button with the id `wake-button`.',
    'Open `spells.js`. Below step 3, type: `wakeButton.addEventListener("click", wakeWizard);`',
    'Run, then click Ring the bell. Watch the Crystal Ball.'
  ],
  'E1.2': [
    'Run the code before changing it. The lantern in the top right of the room lights straight away, and clicking does nothing.',
    '`lightLantern()` means run now. `lightLantern` means hand over the function for later. Remove the brackets on the last line.'
  ],
  'E1.3': [
    'Use the bell pattern: find #sleep-button, write a named function and connect it to click.',
    'The function should call `wizard.sleep();` and `wizard.say("Goodnight!");`.'
  ],
  'E1.4': [
    'An **arrow function** is a short way to write a small function with no name.',
    '`() => lantern.turnOff()` means the same as `function () { lantern.turnOff(); }`. At the end of the code, write a final event listener for "Put the lantern out" but this time use an arrow function.'
  ],
  'E1.5': [
    '**Procedural programming** runs steps in a fixed order. **Event-driven programming** waits for events and reacts to them.',
    'Sort the cards. Compare who decides when each action happens.'
  ],
  'E2.1': [
    '**Mana** is your wizard’s magic energy. Ice uses 3 mana; fire uses 4.',
    '`castSpell` now uses mana as well as dealing damage. It fizzles if there is not enough.',
    'Use `if (wizard.mana >= 3)` before casting ice. Use else to explain the refusal. Insert the gaps if you want a starting pattern.'
  ],
  'E2.2': [
    'The **event object** is a parcel of details delivered to a handler. `offsetX` is across; `offsetY` is down.',
    '`console.log` writes a message to the Crystal Ball. Use it to inspect each click.',
    '`wizard.moveTo` keeps the wizard inside the walkable area: x 20–280 and y 40–190.'
  ],
  'E2.3': [
    '**Step 1 — Spot the problem.** Run the code. Click the Fire and Ice cards inside the Spellbook: they work. Now click **Learn a new spell**, then the new Storm card. Nothing happens! Your listeners were added before the Storm card existed.',
    '**Step 2 — The big idea.** A click on a card also travels up to the Spellbook around it. This is called **bubbling**. So one listener on `#spellbook` hears clicks on every card, even new ones. Using one listener on a container like this is called **event delegation**.',
    '**Step 3 — Which card was clicked?** `event.target` is the exact element that was clicked. Each card has a label in its HTML, such as `data-power="fire"` (look in the stage.html tab). This is a **data attribute**. Add this listener and press Run:\n`const spellbook = document.querySelector("#spellbook");\n\nspellbook.addEventListener("click", function (event) {\n  console.log(event.target.dataset.power);\n});`\nNow click the Fire card, the Ice card, then the word **Spellbook** on the box around the cards. The Crystal Ball shows `fire`, `ice`, then `undefined`: the box itself has no `data-power`. (A learnt Storm card shows `electricity`, the power it casts.)',
    '**Step 4 — Cast the spell.** Inside that same listener, save the label: `const power = event.target.dataset.power;` Then wrap the casting code in `if (power) { ... }`: set `wizard.specialPower = power` and call `wizard.castSpell(goblin)`. The `if` means a click on the Spellbook box itself (no power) does nothing.',
    '**Step 5 — Tidy up.** Delete the old `fireCard` and `iceCard` declarations and event listeners above (around lines 3-14). One listener now does the work of all the cards. Stuck? Press **Insert exercise gaps** for a pattern to fill in.'
  ],
  'E2.4': [
    '**Step 1 — See what goes wrong.** Grub’s arrow has left your wizard on 50 health. The Healing potion should heal 20. Press **Run**, then click **Healing potion** on the stage. The health stays at 50, and the Crystal Ball shows an error message that starts \"This handler stopped\". This is a very common bug, and you are about to fix it.',
    '**Step 2 — Two ways to use a method.** Compare these two lines:\n`// Calling it: the dot says "wizard, YOU do this"\nwizard.recoverHealth();\n\n// Handing it over: just the instructions, without the wizard\nwizard.recoverHealth`\nInside `recoverHealth` the code says `this.health = ...`. The word **this** means "the object that is running me right now". When you call `wizard.recoverHealth()` with the dot, `this` is the wizard.',
    '**Step 3 — What your click did.** Look at the last line of the starter: `addEventListener("click", wizard.recoverHealth)`. It hands the browser the method on its own, like passing someone a note that says "give a dog a treat" without saying *whose* dog. When the click happens, the browser runs the method for the button, so `this` becomes the button. A button has no health to recover, so nothing heals.',
    '**Step 4 — The fix.** Give the browser a tiny function of your own instead: `() => wizard.recoverHealth()`. It is an arrow function, like the one you wrote in E1.4. The brackets after `recoverHealth` are correct this time, because they sit inside the arrow function. Nothing runs yet. On the click, the arrow function runs and asks the wizard, with a dot, to heal itself. Change the last line to:\n`potionButton.addEventListener("click", () => wizard.recoverHealth());`',
    '**Step 5 — Check it.** Press **Run** and click **Healing potion**. Health should go from 50 to 70. The Crystal Ball stays empty, because there is no error any more. Click again: 90, then 100. It stops at 100 because that is the wizard’s `maxHealth`. Your wizard (an object from Tome I) and your click listener (an event) are now working together.'
  ],
  'E3.1': [
    '`mouseover` fires on arrival; `mouseout` fires on leaving. Each event needs a listener.',
    'Set the blue label, show it with hidden = false, then hide it again on leaving.'
  ],
  'E3.2': [
    '`goblin` is Grub’s object. `goblinSprite` is the page element. They are different things.',
    'Read the object’s health inside the handler. Add and remove the element’s outlined class.'
  ],
  'E3.3': [
    'Find #wizard. Add the class glow on mouseover and remove it on mouseout.'
  ],
  'E3.4': [
    '`{ once: true }` removes a listener after it runs once.',
    '`removeEventListener` needs the same function reference that was added. Two identical arrows are still different functions. Use springTrap in both places.'
  ],
  'E3.5': [
    'A tablet user and a keyboard user cannot hover. **Accessibility** means designing so everyone can use a program.',
    '`focus` fires when Tab reaches the potion button; `blur` fires when focus leaves. Add both listeners.',
    'Did you know? `mouseover` also fires when the pointer enters a child. `mouseenter` does not bubble. Neither is a replacement for keyboard focus.'
  ],
  'E4.1': [
    '`switch` chooses a block by matching a value to a `case`. `break` stops it continuing into the next case.',
    'Compare it with `if … else if`. Add Up (0, -10) and Down (0, 10).',
    'A **default action** is the browser’s usual response. `preventDefault()` stops arrow keys scrolling. Click the stage first; Tab leaves it.'
  ],
  'E4.2': [
    'A **string method** is a function that works on text. `trim()` removes spaces at the ends; `toUpperCase()` makes capitals.',
    '`startsWith()` checks the beginning of text; `.length` counts its characters. Finish the capitals method.'
  ],
  'E4.3': [
    'A **buffer** collects input bit by bit. Run the code and press an arrow: look at the buffer.',
    'Shift has the five-character name "Shift". Only add keys with `event.key.length === 1`.',
    '`slice(0, -1)` keeps everything except the last character. Use it for Backspace.'
  ],
  'E4.4': [
    '**Validation** checks input is sensible before using it. Only append a letter while the buffer length is below 12.',
    '**Typical data** is normal input. **Extreme data** is at the allowed edge. **Erroneous data** should be rejected. Classify the cards.'
  ],
  'E4.5': [
    'Key events bubble from an input box to document. Two listeners can hear the same typing.',
    'At the start of the buffer handler, return if `event.target.tagName === "INPUT"`.',
    'Stretch: can you stop arrow keys in the box moving your wizard too?'
  ],
  'E5.1': [
    'A **queue** is a line of waiting events. The **event loop** delivers them one at a time.',
    'Choose a prediction and lock it in. Run, then compare the messages. A 0ms timer waits until the current script finishes.'
  ],
  'E5.2': [
    'A **while loop** repeats its block while its condition is true.',
    'Run the billion-count example. It is stopped after the execution budget. In a real page the handler would freeze all other interaction until it finished.',
    'Change the limit to 10. Run again and check the bell works after the count.'
  ],
  'E5.3': [
    '**State** is information about what is happening now, such as whose turn it is.',
    '`&&` means and: both conditions must be true. `!` means not: it reverses true and false.',
    'Change gameState to goblinTurn immediately after casting. The timer gives the turn back. Complete the truth table.'
  ],
  'E5.4': [
    'Trace click at 0s, click at 0.5s, timer at 1.5s, then click at 2s.',
    'Fill the cells, check them, then compare with the trial log. An attempt is enough to continue.'
  ],
  'E5.5': [
    'A **custom event** is one your code creates and announces. Use `new CustomEvent` with detail, then `dispatchEvent`.',
    'Inside the zap handler, after casting, dispatch goblinDefeated only when health is 0. Add a document listener for it.',
    '**Loosely coupled** parts work together without depending on each other’s details. This is the observer pattern: the tower can listen without the zap code knowing about it.'
  ],
  'E6.1': [
    'The battle **API** is its set of functions. **Abstraction** means using them without needing their internal details.',
    'Read data-power, check it exists and check battle.isWizardTurn(), then call battle.cast(power).'
  ],
  'E6.2': [
    'Connect Shield and Potion with named or anonymous handlers. Each must check the turn.',
    'Use battle.shield() and battle.drinkPotion(); the engine handles damage and stock.'
  ],
  'E6.3': [
    'Use battle.revealIntent() to fill #intent-bubble. Show on mouseover and focus; hide on mouseout and blur.',
    'Your Section 3 potion example has the same accessible pattern.'
  ],
  'E6.4': [
    'Clicking Fireball opens a 5-second window. Collect letters only while battle.isIncantationOpen().',
    'Use a buffer, Backspace, Enter and a 12-letter cap from Section 4. Show it in #incantation-display.',
    'A correct IGNIS costs 8 mana and deals 30 damage. A wrong or expired word fizzles for 4 mana. Clear the buffer when a new window opens.'
  ],
  'E6.5': [
    'Keys: 1 fire, 2 ice, 3 storm, 4 shield, 5 potion, f Fireball.',
    'Return before the switch unless battle.isWizardTurn(). Otherwise hotkeys clash with the incantation letters.',
    'Keep the buffer listener before the hotkey listener. It sees f while the window is still closed.'
  ],
  'E6.6': [
    'Listen on battle.events for battleEnded. The event’s detail names the winner.',
    'Compare winner with "wizard", choose the ending text and set hidden = false.'
  ],
  'E6.7': [
    'Run your listeners, then play a battle. Winning is optional; attempting it is required.',
    'Scry Grub before choosing. Fireball, shields and potions help. Apprentice mode gives a longer window and gentler hits.',
    'After a victory, Ring the Rune Bell. Retry after either ending. Use your code and stats as evidence for your report.'
  ]
};
// Optional per-step hints, used when the first and last instructions
// would not make useful hints on their own.
const customHints = {
  'E2.3': [
    'Put your listener on `#spellbook`, not on each card. Inside it, `event.target.dataset.power` tells you which card was clicked.',
    'Wrap the cast in `if (power) { ... }` so clicking the Spellbook box itself does nothing, then delete the old `fireCard` and `iceCard` listeners.'
  ],
  'E2.4': [
    'Handing over `wizard.recoverHealth` gives the browser the method without the wizard. When the click happens it runs for the button, so `this` is the button, not your wizard.',
    'Give addEventListener a small arrow function instead: `() => wizard.recoverHealth()`. The dot in `wizard.recoverHealth()` tells the method which wizard to heal.'
  ]
};
// Crystal Ball categories ticked when a step opens. Steps not listed show
// everything. Students can still tick the other boxes themselves.
const crystalFilters = {
  'E2.3': ['console.log'],
  'E2.4': ['Errors']
};
const reflections = {
  'E1.1':
    'spells.js finished when you pressed Run. How can your wizard wake a minute later? Where is it waiting?',
  'E1.2':
    'The brackets ran lightLantern straight away and handed over undefined. Why did the click do nothing?',
  'E1.3': 'Who decides whether the wizard wakes or sleeps first now?',
  'E1.5':
    'Could a game fix every step in advance? What would it feel like to play?',
  'E2.1':
    'Why test exactly 3 mana and 2 mana? What bug might a 20-mana test miss?',
  'E2.2': 'Why is the browser delivering an event object useful?',
  'E2.3':
    'Your two card listeners were almost identical. How did spotting that repetition lead to shorter code that also works for cards added later?',
  'E2.4':
    'In your own words: why does `wizard.recoverHealth()` heal the wizard, but handing over `wizard.recoverHealth` on its own does not? Then: which part of this lesson was object-oriented (the wizard and its method) and which part was event-driven (the click)?',
  'E3.4': 'Why must removeEventListener receive the very same function?',
  'E3.5':
    'Phones have no hover. How would you decide whether a hover-only design suits its users?',
  'E4.4':
    'Whose job is it to cope with unexpected keys? What does robustness mean here?',
  'E4.5':
    'How do overlapping listeners affect maintainability? How would you keep track?',
  'E5.1':
    'Why does the zero-delay timer run last? Think of Quill carrying one message at a time.',
  'E5.2':
    'Using the event loop, explain why an app might freeze after a button press.',
  'E5.3':
    'The same click now does different things. Why do games need both events and state?',
  'E5.5':
    'Why can the zap code announce a defeat without knowing which parts react?',
  'E6.7':
    'Decomposition: list every event, its source, handler and state change. Paradigms: what do objects and events each contribute? Could the battle be procedural? Compare JavaScript with Visual Basic’s Handles btnFire.Click. Evaluate usability, robustness and maintainability with evidence from your own code.'
};
const activities = {
  'E1.5': sort(bins, [
    [
      'An overnight job that calculates everyone’s pay',
      0,
      'It runs start to finish without user input.'
    ],
    ['A calculator app', 1, 'It waits for button presses.'],
    ['A script renaming 1,000 photos', 0, 'The programmer fixes the steps.'],
    ['A video game', 1, 'It reacts to the player and the world.'],
    ['A vending machine', 1, 'It waits for coins and button presses.'],
    [
      'A report printing last month’s sales',
      0,
      'It processes data in a set sequence.'
    ],
    ['A smart doorbell', 1, 'It reacts to a visitor.']
  ]),
  'E4.4': sort(
    ['Typical', 'Extreme', 'Erroneous'],
    [
      ['IGNIS then Enter', 0, 'Normal input.'],
      ['ignis then Enter', 0, 'Lowercase is supported.'],
      ['12 letters', 1, 'Exactly at the limit.'],
      ['13 letters', 1, 'One beyond the limit.'],
      ['Shift, Ctrl, ArrowUp', 2, 'These are not letters to append.'],
      ['Enter with nothing typed', 2, 'No incantation was supplied.'],
      ['%%%123 then Enter', 2, 'It is not a known spell.']
    ]
  ),
  'E5.1': {
    type: 'predict',
    options: ['1, 2, 3', '1, 3, 2', '2, 1, 3'],
    answer: '1',
    explanation:
      'The current script finishes before the zero-delay timer runs: 1, 3, 2.'
  },
  'E5.3': {
    type: 'truth-table',
    columns: ['isWizardTurn', 'hasEnoughMana', 'Both true?', 'What happens?'],
    rows: [
      ['true', 'true'],
      ['true', 'false'],
      ['false', 'true'],
      ['false', 'false']
    ],
    cells: [
      {
        id: 'r0-both',
        row: 0,
        column: 2,
        accept: ['true'],
        options: ['true', 'false']
      },
      {
        id: 'r0-action',
        row: 0,
        column: 3,
        accept: ['casts'],
        options: ['casts', 'Wait your turn!', 'Not enough mana!']
      },
      {
        id: 'r1-both',
        row: 1,
        column: 2,
        accept: ['false'],
        options: ['true', 'false']
      },
      {
        id: 'r1-action',
        row: 1,
        column: 3,
        accept: ['Not enough mana!'],
        options: ['casts', 'Wait your turn!', 'Not enough mana!']
      },
      {
        id: 'r2-both',
        row: 2,
        column: 2,
        accept: ['false'],
        options: ['true', 'false']
      },
      {
        id: 'r2-action',
        row: 2,
        column: 3,
        accept: ['Wait your turn!'],
        options: ['casts', 'Wait your turn!', 'Not enough mana!']
      },
      {
        id: 'r3-both',
        row: 3,
        column: 2,
        accept: ['false'],
        options: ['true', 'false']
      },
      {
        id: 'r3-action',
        row: 3,
        column: 3,
        accept: ['Wait your turn!'],
        options: ['casts', 'Wait your turn!', 'Not enough mana!'],
        feedback: 'The !isWizardTurn branch is checked before the mana refusal.'
      }
    ]
  },
  'E5.4': {
    type: 'trace-table',
    columns: [
      'Event',
      'Handler',
      'gameState after',
      'Grub’s health',
      'What the player sees'
    ],
    rows: [
      [
        'click at 0s',
        '(anonymous function)',
        'goblinTurn',
        '46',
        'A fire spell'
      ],
      ['click at 0.5s', '(anonymous function)', '', '46', ''],
      ['timer at 1.5s', '', '', '46', 'Wizard 92 health'],
      ['click at 2s', '(anonymous function)', 'goblinTurn', '', 'A fire spell']
    ],
    cells: [
      {id: 'state2', row: 1, column: 2, accept: ['goblinTurn', '"goblinTurn"']},
      {
        id: 'speech2',
        row: 1,
        column: 4,
        accept: ['Wait your turn!', '"Wait your turn!"'],
        caseSensitive: false
      },
      {
        id: 'handler3',
        row: 2,
        column: 1,
        accept: ['goblinTakesTurn', 'goblinTakesTurn()']
      },
      {id: 'state3', row: 2, column: 2, accept: ['wizardTurn', '"wizardTurn"']},
      {id: 'health4', row: 3, column: 3, accept: ['32']}
    ]
  }
};
const carry = new Set([
  'E1.3',
  'E1.4',
  'E1.5',
  'E3.3',
  'E4.4',
  'E4.5',
  'E5.4',
  'E5.5',
  'E6.2',
  'E6.3',
  'E6.4',
  'E6.5',
  'E6.6',
  'E6.7'
]);
const starterStatus = (id) =>
  ['E1.4', 'E2.2', 'E3.1', 'E3.2', 'E4.2', 'E6.1', 'E6.6'].includes(id)
    ? 'error'
    : id === 'E5.2'
      ? 'stopped'
      : ['E1.5', 'E5.1', 'E5.4', 'E6.7'].includes(id)
        ? 'success'
        : 'validButIncomplete';
export const checkpoints = records.map(
  ([id, title, objective, stage, scaffold, trials], index) => ({
    id,
    index,
    chapter: Number(id[1]),
    title,
    objective,
    stage,
    scaffold,
    starter: {spellsSource: starters[id]},
    solution: {spellsSource: sources[id]},
    gap: gaps[id],
    starterStrategy: carry.has(id) ? 'previous-success' : 'prepared',
    appendComment:
      carry.has(id) && starters[id].includes('// ✦')
        ? starters[id].slice(starters[id].lastIndexOf('// ✦'))
        : '',
    instructions: instructions[id],
    hints: [
      ...(customHints[id] ?? [instructions[id][0], instructions[id].at(-1)]),
      'Compare your draft with the complete worked example below.'
    ],
    reflection: reflections[id] ?? '',
    crystalFilters: crystalFilters[id] ?? null,
    effect: title + ' — your listeners pass the Spell Trials.',
    trials: trials.map((t, i) => ({...t, id: 't' + (i + 1)})),
    setup: {
      wizard: {
        level: 1,
        specialPower: 'fire',
        mana: 20,
        health: id === 'E2.4' ? 50 : 100,
        awake: stage !== 'tower-bedroom'
      }
    },
    reads: ['E4.3', 'E4.4', 'E4.5', 'E6.4', 'E6.5', 'E6.6', 'E6.7'].includes(id)
      ? ['spellBuffer']
      : ['E5.3', 'E5.4', 'E5.5'].includes(id)
        ? ['gameState']
        : [],
    starterExpected: {
      status: starterStatus(id),
      reason:
        'The prepared code models the change or misconception described in the instructions.'
    },
    activity: activities[id] ?? null
  })
);
// Imported IDs must never resolve to inherited object properties.
export const byId = Object.assign(
  Object.create(null),
  Object.fromEntries(checkpoints.map((cp) => [cp.id, cp]))
);
export const edpCurriculumVersion = 1;
