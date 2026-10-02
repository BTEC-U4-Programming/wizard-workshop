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
        'Fill the first gap with `goblin.health`, and use `classList.add("outlined")` on mouseover.'
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
        'Use `goblin.health`, not a typed number such as 60, so the label shows Grub’s health at the moment you hover.'
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
    'Stop the buffer growing beyond 12 letters.',
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
    'E5.1',
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
    'E5.2',
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
    'E5.3',
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
    'E5.4',
    'Play the battle',
    'Every control is already wired up. Press Run, play the battle, then work out with your pair programmer how the code makes it work.',
    'grubbledown-bridge',
    'read and explain',
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
        'A listener is missing. Did a change to the code remove one? Press Reset step to get the full, working battle back.'
      ),
      trial(
        'A test player can win with your controls',
        battleBotSteps,
        (s) => s.battle.state === 'victory',
        'The handlers no longer work together. Press Reset step to get the full, working battle back.'
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
    '**Step 1 — Two Grubs.** `goblin` is Grub’s **object**. It stores his data, such as `goblin.health` and `goblin.maxHealth`. `goblinSprite` is Grub’s **element**: his picture on the page. Your code reads numbers from the object and changes how the element looks.',
    '**Step 2 — Meet `classList`.** A **class** is a label on an element. The stylesheet decides what each label looks like. `classList` is the element’s list of labels: `add` puts a label on and `remove` takes it off. Imagine a lantern whose stylesheet makes it glow when it has the class `lit`:\n`const lantern = document.querySelector("#lantern");\n\nlantern.classList.add("lit");    // label on: the lantern glows\nlantern.classList.remove("lit"); // label off: back to normal`\nJavaScript never draws the glow. It only swaps the label, and the stylesheet does the drawing. On this stage, any element with the class `outlined` gets a purple outline.',
    '**Step 3 — Show Grub’s live health.** In `showGoblinStats`, replace the first `____` with `goblin.health`. Do not type a number such as `60`. This line runs inside the handler, so it reads Grub’s health at the moment of each hover. If Grub gets hurt, the label shows his new health.',
    '**Step 4 — Outline on, outline off.** Fill the `classList` gap in `showGoblinStats` so it **adds** `"outlined"`. Fill the gap in `hideGoblinStats` so it **removes** it again.',
    '**Step 5 — Check it.** Press **Run** and move your pointer onto Grub. You should see “Grub — health 60/60” and a purple outline. Move away: both disappear. The Spell Trials also hurt Grub to 35 health, to check your label reads the live value.'
  ],
  'E3.3': [
    'Find #wizard. Add the class glow on mouseover and remove it on mouseout.'
  ],
  'E3.4': [
    'Adding `{ once: true }` as the third argument to `addEventListener` removes a listener after it runs once.',
    '`removeEventListener` needs the same function reference that was added. Two identical arrows are still different functions. Use springTrap in both places.'
  ],
  'E3.5': [
    'A tablet user and a keyboard user cannot hover. **Accessibility** means designing so everyone can use a program.',
    '`focus` fires when Tab reaches the potion button; `blur` fires when focus leaves.',
    '`focus` and `blur` are both events, just like `click`, `mouseover` and `mouseout`.',
    'Add two more listeners under the last code comment below so keyboard users can read the red potion information too.'
  ],
  'E4.1': [
    '**Step 1 — Meet `switch`.** `switch` looks at one value and runs the block of the `case` that matches it. `break` stops the code carrying on into the next case. Here is a full example that turns the lantern on or off depending on which key was pressed:\n`document.addEventListener("keydown", function (event) {\n  switch (event.key) {\n    case "l":\n      lantern.turnOn();\n      break;\n    case "d":\n      lantern.turnOff();\n      break;\n  }\n});`\nRead it as: “look at `event.key`. If it is `"l"`, turn the lantern on. If it is `"d"`, turn it off.” Any other key matches no case, so nothing happens.',
    '**Step 2 — Compare it with `if … else if`, then add two cases.** The lantern example above can also be written with `if … else if`. Both versions do exactly the same job:\n`// switch version\nswitch (event.key) {\n  case "l":\n    lantern.turnOn();\n    break;\n  case "d":\n    lantern.turnOff();\n    break;\n}\n\n// if … else if version\nif (event.key === "l") {\n  lantern.turnOn();\n} else if (event.key === "d") {\n  lantern.turnOff();\n}`\nEach `case` is one `else if` test, and `break` marks where its block ends. Which do you find easier to read? Now look at the code below. It already has a `case` for `"ArrowLeft"` and one for `"ArrowRight"`. Your job is to add two more `case` blocks in the same shape: one for `"ArrowUp"` that calls `wizard.moveBy(0, -10)`, and one for `"ArrowDown"` that calls `wizard.moveBy(0, 10)`. The two numbers are how far to move across and then down, so `-10` moves the wizard up the screen and `10` moves it down. Copy the `ArrowRight` case and change the key name and the numbers.',
    'A **default action** is the browser’s usual response. `preventDefault()` stops arrow keys scrolling. Click the stage first; Tab leaves it.'
  ],
  'E4.2': [
    'A **string method** is a function that works on text. `trim()` removes spaces at the ends; `toUpperCase()` makes capitals.',
    '`startsWith()` checks the beginning of text; `.length` counts its characters.',
    'Your job below is to finish the line of code declaring the `typed` variable (around line 26) so that converts the value typed in by the user to uppercase.',
    'Test your solution by running the code and then typing the secret word into the box below the game screen. Can you find the secret word in the code?'
  ],
  'E4.3': [
    '**Step 1 — What is a buffer?** A **buffer** collects input bit by bit. Here, `spellBuffer` (line 38 of the code) starts as empty text (`""`). Each key you press is added to the end of it, and Enter speaks the whole buffer.',
    '**Step 2 — See the problem.** Run the code, click into the input box below the game screen and then press an arrow: look at the buffer.',
    '**Step 3 — Why it happens.** Every key has a name in `event.key`. Letter keys have one-character names, such as `"a"`. Other keys have longer names: the right arrow is `"ArrowRight"` and Shift is `"Shift"`. The final `else` in the last listener adds every name to the buffer in capitals, so you see ARROWRIGHT and SHIFT.',
    '**Step 4 — ** `.length` counts the characters in some text:\n`"a".length           // 1\n"Shift".length       // 5\n"ArrowRight".length  // 10`\nSo `event.key.length === 1` is only true for single characters, such as letters and numbers.',
    '**Step 5 - Fix it.** In the last `keydown` listener (around line 41 in the code), change the final `} else {` to `} else if (event.key.length === 1) {`. Now only single characters are added.\'',
    '**Step 6 — Test it, including Backspace.** Backspace is already handled for you by `slice(0, -1)`, which keeps everything except the last character: `"IGNIX".slice(0, -1)` gives `"IGNI"`. Press **Run**, click the game screen, type IGNIX, press Backspace, type S and press Enter. The wizard should say “IGNIS!”. Shift and the arrows should no longer appear in the buffer.'
  ],
  'E4.4': [
    '**Step 1 — What is validation?** **Validation** means checking input is sensible before using it. No spell needs more than 12 letters, so the buffer should stop growing at 12.',
    '**Step 2 — Add the check.** `spellBuffer.length` is the number of letters in the buffer. In the last listener, find the line that adds a letter: `spellBuffer = spellBuffer + event.key.toUpperCase();` Wrap it in an `if`, so it only runs while `spellBuffer.length` is less than 12. The pattern looks like this:\n`if (spellBuffer.length < 12) {\n  spellBuffer = spellBuffer + event.key.toUpperCase();   // only runs while spellBuffer has fewer than 12 letters\n}`',
    '**Step 3 — Test it.** Press **Run**, click the game screen and type 13 letters. Only the first 12 should appear in the buffer. Check that IGNIS then Enter still works.'
  ],
  'E5.1': [
    '**Step 1 — The battle API.** An **API** is the set of functions some code offers you. The battle engine offers functions such as `battle.cast(power)` and `battle.isWizardTurn()`. **Abstraction** means you can use them without knowing how they work inside.',
    '**Step 2 — State: whose turn is it?** **State** is what is true in a program right now. The battle engine remembers whose turn it is as part of its state. `battle.isWizardTurn()` reads that state: it gives back `true` on your turn and `false` during Grub’s. It does the same job as `isMyTurn` in this section’s worked example.',
    '**Step 3 — Read the listener.** This is **event delegation** again (E2.3): one listener on `#spell-bar` hears clicks on every card. Each card has a data attribute, such as `data-power="fire"` (look in the stage.html tab). The `if` uses `&&`, which means “and”: the code inside only runs when **both** sides are true.\n`if (power && battle.isWizardTurn()) {\n  battle.cast(power);\n}`\nRead it as: “if a card was clicked (`power` has a value) **and** it is my turn, cast the spell.”',
    '**Step 4 — Fill the gap.** In `const power = event.target.dataset.____;`, replace `____` with the name of the data attribute. Remember: `data-power` in HTML is read as `dataset.power` in JavaScript.',
    '**Step 5 — Timers.** When you cast, the engine changes its state to Grub’s turn. It then uses `setTimeout` to start his attack a little later. Inside the engine (you do not need to write this), it looks like this:\n`battleState = "goblinTurn";\nsetTimeout(goblinTakesTurn, 1200);`\n`setTimeout` hands over a function to run **later**. The second value is the delay in milliseconds: 1200 ms is 1.2 seconds. Like `addEventListener`, there are no brackets after `goblinTakesTurn`, so it does not run straight away. While the timer waits, your page still responds to clicks. When it runs, Grub attacks and the state goes back to your turn.',
    '**Step 6 — Check.** Press **Run** and click **Fire**. Grub loses 14 health. Click again straight away: nothing happens, because the state says it is Grub’s turn. Wait for his attack, then click **Ice**: it works.'
  ],
  'E5.2': [
    '**Step 1 — The task.** Make the **Shield** and **Healing potion** buttons work, but only on your turn. Write your code below the `✦` comment.',
    '**Step 2 — Find the buttons.** Use `document.querySelector` with `#shield-button` and `#potion-button`, just like `spellBar` above.',
    '**Step 3 — Add a click listener to each.** Inside each handler, check `battle.isWizardTurn()` first, as the spell-bar listener does. If it is your turn, call `battle.shield()` in one handler and `battle.drinkPotion()` in the other. Named or anonymous functions both work.',
    '**Step 4 — Let the API do the rest.** You do not need to work out damage or count potions. The battle engine does that, and says “No potions left!” when they run out.',
    '**Step 5 — Check.** Press **Run**. Click **Shield**: Grub’s next hit does less damage. Click **Healing potion**: one potion is used.'
  ],
  'E5.3': [
    '**Step 1 — The task.** Hovering over Grub, or reaching him with Tab, should show his next move in `#intent-bubble`. Moving away should hide it again. Write your code below the `✦` comment.',
    '**Step 2 — Reading Grub’s plan.** `battle.revealIntent()` gives back Grub’s next move as text, such as `"Club Smash — 8 damage"`. Put that text in the bubble with `textContent`.',
    '**Step 3a — Reuse the Section 3 pattern.** In E3.5 you showed a tooltip to mouse and keyboard users with two named functions and four listeners:\n`function showRedInfo() {\n  tooltip.textContent = "Healing draught: +20 health";\n  tooltip.hidden = false;\n}\n\nredPotion.addEventListener("mouseover", showRedInfo);\nredPotion.addEventListener("focus", showRedInfo);`\nDo the same here. Find `#goblin` and `#intent-bubble` using `querySelector` and store these elements in variables called `goblinSprite` and `intentBubble`.',
    '**Step 3b — Add event** - Write two new functions: one called `showIntent` and the other called `hideIntent`. Connect `mouseover` and `focus` to show with `battle.revealIntent()`, and `mouseout` and `blur` to hide.',
    '**Step 4 — Check.** Press **Run** and move your pointer over Grub: his plan appears. Move away: it hides. Try reaching him with Tab too.'
  ],
  'E5.4': [
    '**Step 1 — Start the battle.** Everything is already wired up for you: you do not need to change any code. Press **Run code**. All the listeners switch on and the battle begins on the stage.',
    '**Step 2 — Take turns.** It is your turn when the banner says **Your turn**. Choose **one** action, then Grub takes his turn. To use the keyboard keys below, click the game screen first.',
    '**Step 3 — Cast a spell.** Click the **Fire**, **Ice** or **Storm** card, or press **1**, **2** or **3**. Each spell uses some mana.',
    '**Step 4 — Defend and heal.** Click **Shield** or press **4**: Grub’s next hit does less damage. Click **Healing potion** or press **5**: you gain 20 health. You only have two potions.',
    '**Step 5 — Fireball.** Click **Fireball** or press **f**. Then type **IGNIS** and press **Enter** within 5 seconds. It costs 8 mana and deals 30 damage. A wrong or late word fizzles: it still costs 4 mana, and Grub takes his turn.',
    '**Step 6 — Scry Grub.** Hover over Grub, or press **Tab** until he is selected, to see his next move in a speech bubble. Scrying is free, so check his plan before you choose!',
    '**Step 7 — Finish a battle.** Play at least one battle to the end; winning is optional. After a victory, press **Ring the Rune Bell**. After either ending, you can press **Retry battle**. Finding it hard? Tick **Apprentice mode** in **Workspace tools** (top right) for a longer Fireball window and gentler hits.',
    '**Step 8 — Become code detectives.** Now read `spells.js` with your pair programmer. It has six parts, each labelled with a comment. For each part, work out together: which **event** does it listen for, on which **element**, and what does its **handler** do? Look for ideas you already know: event delegation, `dataset`, `focus` and `blur`, a keyboard buffer, `switch`, `&&` and `!`. Do not change the code: play again and watch the stage and the Crystal Ball to test your ideas.',
    '**Step 9 — Get ready to feed back.** Be ready to explain to the class, out loud, **how you think the code works**. Use the words event, listener, handler and state. Then prepare **one question** about a part of the code you do not understand yet. A good question points at a line or part, such as: “Why does Part 4 `return` when the Fireball window is closed?”'
  ]
};
// Optional per-step hints, used when the first and last instructions
// would not make useful hints on their own.
const customHints = {
  'E3.2': [
    'The first gap needs the number stored inside Grub’s object: `goblin.health`. A typed number would never change when Grub is hurt.',
    '`goblinSprite.classList.add("outlined")` puts the outline on. `goblinSprite.classList.remove("outlined")` takes it off.'
  ],
  'E2.3': [
    'Put your listener on `#spellbook`, not on each card. Inside it, `event.target.dataset.power` tells you which card was clicked.',
    'Wrap the cast in `if (power) { ... }` so clicking the Spellbook box itself does nothing, then delete the old `fireCard` and `iceCard` listeners.'
  ],
  'E2.4': [
    'Handing over `wizard.recoverHealth` gives the browser the method without the wizard. When the click happens it runs for the button, so `this` is the button, not your wizard.',
    'Give addEventListener a small arrow function instead: `() => wizard.recoverHealth()`. The dot in `wizard.recoverHealth()` tells the method which wizard to heal.'
  ],
  'E4.3': [
    'Only keys with a one-character name, such as `"a"`, belong in the buffer. `event.key.length === 1` checks this.',
    'In the last listener, change the final `} else {` to `} else if (event.key.length === 1) {`.'
  ],
  'E4.4': [
    '`spellBuffer.length` counts the letters already collected. Only add a new letter while it is below 12.',
    'Inside the `else if (event.key.length === 1)` branch, put `if (spellBuffer.length < 12) { … }` around the line that adds the letter.'
  ],
  'E5.1': [
    'Each card’s HTML has `data-power="…"`. `event.target.dataset.power` reads it.',
    'Replace `____` with `power`.'
  ],
  'E5.2': [
    'Follow the spell-bar pattern: find each button, add a `"click"` listener, and check `battle.isWizardTurn()` inside.',
    'Inside the turn checks, call `battle.shield();` in one handler and `battle.drinkPotion();` in the other.'
  ],
  'E5.3': [
    'In a show function, set the bubble’s `textContent` to `battle.revealIntent()` and its `hidden` to `false`.',
    'Connect `mouseover` and `focus` to the show function. Connect `mouseout` and `blur` to a hide function that sets `hidden` to `true`.'
  ],
  'E5.4': [
    'Playing: scry Grub before choosing. Shield before his big hits, drink a potion when your health is low, and use Fireball (f, then IGNIS and Enter) when you have 8 mana.',
    'Reading the code: take one comment-labelled part at a time. Find the `addEventListener` line first: it tells you the element and the event. Then read the handler to see what happens when that event fires.'
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
  'E3.2':
    'Which line of your code talks to Grub’s object, and which talks to his picture? Why would the label be wrong after a fight if you had typed 60 instead of `goblin.health`?',
  'E2.3':
    'Your two card listeners were almost identical. How did spotting that repetition lead to shorter code that also works for cards added later?',
  'E2.4':
    'In your own words: why does `wizard.recoverHealth()` heal the wizard, but handing over `wizard.recoverHealth` on its own does not? Then: which part of this lesson was object-oriented (the wizard and its method) and which part was event-driven (the click)?',
  'E3.4': 'Why must removeEventListener receive the very same function?',
  'E3.5':
    'Phones have no hover. How would you decide whether a hover-only design suits its users?',
  'E4.4':
    'Whose job is it to cope with unexpected keys? What does robustness mean here?',
  'E5.4':
    'With your pair programmer: pick one control, such as the Fireball button. Trace what happens from the event to the change you see on the stage: which listener hears it, which handler runs, and which state is checked or changed? Why do the hotkeys do nothing during Grub’s turn? What would go wrong if a handler did not check `battle.isWizardTurn()`? Then evaluate usability, robustness and maintainability with evidence from the code.'
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
};
const carry = new Set([
  'E1.3',
  'E1.4',
  'E1.5',
  'E3.3',
  'E4.4',
  'E5.2',
  'E5.3'
]);
const starterStatus = (id) =>
  ['E1.4', 'E2.2', 'E3.1', 'E3.2', 'E4.2', 'E5.1'].includes(id)
    ? 'error'
    : ['E1.5', 'E5.4'].includes(id)
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
    reads: ['E4.3', 'E4.4', 'E5.4'].includes(id)
      ? ['spellBuffer']
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
