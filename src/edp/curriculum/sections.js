// The first authored choice is correct; display order is stable and shuffled.
const choice = (id, prompt, answers, revisit) => ({
  id,
  type: 'choice',
  prompt,
  options: answers.map(([text, feedback], i) => ({
    id: String(i),
    text,
    feedback,
    correct: i === 0
  })),
  revisit
});
const blank = (id, prompt, code, accept, explanation, hint, revisit) => ({
  id,
  type: 'blank',
  prompt,
  code,
  accept,
  explanation,
  hint,
  revisit
});
export const sections = [
  {
    id: 'ES1',
    chapter: 1,
    title: 'The Listening Stones',
    intro: {
      hook: 'Your wizard is built but frozen. Teach it to listen.',
      build:
        'A wizard that wakes, sleeps and lights a lantern when buttons on the stage are clicked.',
      summary:
        'An event is something that happens, such as a click. `addEventListener` tells an element which event to listen for and which function, the handler, to run when it happens.',
      prerequisites:
        'From Tome I: a method only runs when it is called, and `actions.js` ran your calls from top to bottom.',
      assignmentLink:
        'Assignment 1 asks you to explain event-driven programming. Use the words event, listener and handler, and say who decides the order in which the code runs.',
      objectives: [
        'explain what an event, a listener and a handler are',
        'use `addEventListener` to connect a click to a function',
        'compare event-driven code with the fixed order of `actions.js`'
      ],
      concepts: [
        [
          'event',
          'Something that happens that a program can notice, such as a click or a key press.'
        ],
        [
          'event listener',
          'An instruction to wait for one kind of event on one element.'
        ],
        ['event handler', 'The function that runs when the event happens.'],
        ['callback', 'A function handed over to be called back later.'],
        [
          'event-driven programming',
          'A style where the program waits for events and reacts to them.'
        ],
        [
          'procedural programming',
          'A style where the program runs steps in a fixed order, like `actions.js`.'
        ]
      ],
      example: {
        code: 'const lanternButton = document.querySelector("#lantern-button");\n\nfunction lightLantern() {\n  lantern.turnOn();\n}\n\nlanternButton.addEventListener("click", lightLantern);',
        stage: 'example-lantern',
        steps: [{do: 'click', target: '#lantern-button'}],
        check: 'lantern.lit === true',
        walkthrough: [
          '`document.querySelector("#lantern-button")` finds the button in the page\'s HTML. `#` means "the element with this id".',
          '`lightLantern` describes what should happen. Writing it does not run it.',
          '`addEventListener("click", lightLantern)` hands the function over. There are no brackets after `lightLantern`, so it waits for a click.'
        ],
        result:
          'Nothing happens when the code runs. Each click on the button lights the lantern.'
      },
      predict: [
        'The code has run, but nobody has clicked. Is the lantern lit?',
        'No. `lightLantern` was only handed over. It runs when a click happens.'
      ]
    },
    review: {
      questions: [
        choice(
          'ES1-Q1',
          'In an event-driven program, what mainly decides the order in which handlers run?',
          [
            [
              'The events that happen, such as the player clicking.',
              'Correct. The player and the world decide.'
            ],
            [
              'The order the lines are written in.',
              'That describes procedural code, like `actions.js` in Tome I.'
            ],
            [
              'The alphabetical order of the function names.',
              'Names do not affect when handlers run.'
            ]
          ],
          'E1.3'
        ),
        choice(
          'ES1-Q2',
          'What is an event handler?',
          [
            [
              'A function that runs when a particular event happens.',
              'Correct.'
            ],
            ['The element that was clicked.', 'That is the event target.'],
            [
              'A list of every event on the page.',
              'A handler is one function connected to one event.'
            ]
          ],
          'E1.1'
        ),
        choice(
          'ES1-Q3',
          '`lanternButton.addEventListener("click", lightLantern());` What goes wrong?',
          [
            [
              '`lightLantern` runs straight away, and nothing useful is left listening.',
              'Correct. Brackets run the function now.'
            ],
            [
              'The lantern lights twice on every click.',
              'The click handler never runs at all.'
            ],
            [
              'Nothing. This is correct.',
              'Look at the brackets after `lightLantern`.'
            ]
          ],
          'E1.2'
        ),
        choice(
          'ES1-Q4',
          '`spells.js` has finished running and nobody has clicked. What is the program doing?',
          [
            [
              'Waiting for the next event.',
              'Correct. The listeners stay ready.'
            ],
            [
              'Running every handler in a loop.',
              'Handlers run only when their event happens.'
            ],
            ['It has closed.', 'The listeners are still there, waiting.']
          ],
          'intro:1'
        ),
        blank(
          'ES1-Q5',
          'Listen for clicks.',
          'bell.addEventListener("____", ringBell);',
          ['click'],
          'Correct. Event names are lower-case strings.',
          'Which event happens when a button is pressed? Use lower case.',
          'E1.1'
        ),
        blank(
          'ES1-Q6',
          'Hand over the handler for later.',
          'bell.addEventListener("click", ____);',
          ['ringBell'],
          'Correct. The name on its own hands over the function without running it.',
          'Write the function name with no brackets.',
          'E1.2'
        ),
        blank(
          'ES1-Q7',
          'Find the element whose id is `wake-button`.',
          'const wakeButton = document.querySelector("____");',
          ['#wake-button'],
          'Correct. `#` means "the element with this id".',
          'IDs need a symbol in front.',
          'E1.1'
        ),
        blank(
          'ES1-Q8',
          'Start an arrow function.',
          'snuffButton.addEventListener("click", ____ => lantern.turnOff());',
          ['()'],
          'Correct. Empty brackets, then the arrow.',
          'An arrow function with no inputs starts with empty brackets.',
          'E1.4'
        )
      ]
    }
  },
  {
    id: 'ES2',
    chapter: 2,
    title: 'The Click of Command',
    intro: {
      hook: 'Grub has the Rune Bell and he is getting away. Your wizard needs to follow orders, fast.',
      build:
        'Spell buttons that check mana, a courtyard your wizard walks across, and one spellbook listener for every spell.',
      summary:
        'Every handler receives an event object with details such as `event.target`, the element that was clicked. Handlers are ordinary functions, so they can use `if` and your Tome I methods.',
      prerequisites:
        'From Tome I: `wizard.castSpell(goblin)` damages its target, and `specialPower` chooses fire, ice or electricity.',
      assignmentLink:
        'For your report, annotate a handler: label the event, the event object, the selection and the method call, then explain how they work together.',
      objectives: [
        'use `if` inside a handler to decide what happens',
        'read details from the event object',
        'handle clicks on many buttons with one listener'
      ],
      concepts: [
        ['mana', "Your wizard's magic energy. Each spell uses some up."],
        [
          'event object',
          'The parcel of details the browser hands to every handler.'
        ],
        ['`event.target`', 'The element the event happened to.'],
        [
          '`offsetX` and `offsetY`',
          'Where a click happened inside an element.'
        ],
        [
          '`data-` attribute',
          'Extra information written into HTML, read with `dataset`.'
        ],
        [
          'bubbling',
          'A click on a button also travels up to the elements around it.'
        ],
        [
          'event delegation',
          'One listener on a container handling events from everything inside it.'
        ]
      ],
      example: {
        code: 'const map = document.querySelector("#map");\nconst pin = document.querySelector("#pin");\n\nmap.addEventListener("click", function (event) {\n  pin.textContent = "X marks " + event.offsetX + ", " + event.offsetY;\n});',
        stage: 'example-map',
        steps: [{do: 'click', target: '#map', offsetX: 40, offsetY: 25}],
        check:
          'document.querySelector("#pin").textContent === "X marks 40, 25"',
        walkthrough: [
          'The handler now has a parameter, `event`. The browser fills it in on every click.',
          '`event.offsetX` and `event.offsetY` say where the click happened inside the map.',
          '`+` joins text and numbers into one string, as in Tome I.',
          'TypeScript lens: In TypeScript you could write `function (event: MouseEvent)`. The type tells the editor which details a click event carries.'
        ],
        result:
          'Clicking the map at (40, 25) makes the pin read "X marks 40, 25".'
      },
      predict: [
        'What does the pin say after a click at (100, 60)?',
        '"X marks 100, 60". The event object carries the new position on every click.'
      ]
    },
    review: {
      questions: [
        choice(
          'ES2-Q1',
          'Inside a click handler, what is `event.target`?',
          [
            ['The element that was clicked.', 'Correct.'],
            ['The function handling the event.', 'That is the handler.'],
            [
              'The next event waiting in line.',
              'The target is where this event happened.'
            ]
          ],
          'E2.3'
        ),
        choice(
          'ES2-Q2',
          'Mana is 2 and ice costs 3. The handler checks `if (wizard.mana >= 3)`. What happens when Ice is clicked?',
          [
            [
              'The wizard says "Not enough mana!" and no spell is cast.',
              'Correct. The `else` branch runs.'
            ],
            ['Ice is cast and mana becomes -1.', 'The `if` stops that.'],
            ['An error appears.', 'An `if` choosing `else` is not an error.']
          ],
          'E2.1'
        ),
        choice(
          'ES2-Q3',
          'Why use one listener on `#spellbook` instead of one on every card?',
          [
            [
              'Less repeated code, and cards added later work too.',
              'Correct. Bubbling brings every card click to the book.'
            ],
            ['Clicks on a book are faster.', 'Speed is not the reason.'],
            [
              'Buttons cannot have listeners.',
              'They can; one shared listener is just easier to maintain.'
            ]
          ],
          'E2.3'
        ),
        choice(
          'ES2-Q4',
          '`potionButton.addEventListener("click", wizard.recoverHealth)` fails. Why?',
          [
            [
              'The method is handed over without `wizard`, so when the click runs it, `this` is the button.',
              'Correct. A button has no health. Wrap the call so the wizard does it: `() => wizard.recoverHealth()`.'
            ],
            [
              '`recoverHealth` only works in Tome I.',
              'It works when called on `wizard`.'
            ],
            [
              'Buttons cannot run methods.',
              'They can run any function you hand them.'
            ]
          ],
          'E2.4'
        ),
        blank(
          'ES2-Q5',
          'Read where the click happened.',
          'wizard.moveTo(event.offsetX, event.____);',
          ['offsetY'],
          'Correct. `offsetY` is the vertical position.',
          'X is across; which letter is up and down?',
          'E2.2'
        ),
        blank(
          'ES2-Q6',
          'Allow ice when the wizard has enough mana.',
          'if (wizard.mana ____ 3) {',
          ['>='],
          'Correct. `>=` includes 3 itself: the boundary.',
          'Which comparison means "at least"?',
          'E2.1'
        ),
        blank(
          'ES2-Q7',
          'Read the `data-power` attribute.',
          'const power = event.target.____.power;',
          ['dataset'],
          'Correct. `dataset` holds every `data-` attribute.',
          'Which property holds `data-` values?',
          'E2.3'
        ),
        blank(
          'ES2-Q8',
          'Recover health, keeping `this` pointing at the wizard.',
          'potionButton.addEventListener("click", () => wizard.____());',
          ['recoverHealth'],
          'Correct. The method is called on `wizard`, so `this` is the wizard.',
          'Which Tome I method adds 20 health?',
          'E2.4'
        )
      ]
    }
  },
  {
    id: 'ES3',
    chapter: 3,
    title: 'The Hover Charm',
    intro: {
      hook: 'Grub fled into the Whispering Wood. Move your pointer over things and they reveal their secrets.',
      build:
        "Potion labels, a way to read Grub's health, a glowing staff and a trap that only springs once.",
      summary:
        '`click` is not the only event. `mouseover` fires when the pointer moves onto an element and `mouseout` when it leaves. Some people cannot hover, so good designs also use `focus` and `blur`.',
      prerequisites:
        'From Section 1: `addEventListener` connects an element, an event name and a handler.',
      assignmentLink:
        'Hover-only features affect usability and portability. Use your potion example to evaluate who a design helps and who it leaves out.',
      objectives: [
        'use `mouseover` and `mouseout` as a pair',
        'stop listening with `once` or `removeEventListener`',
        'make hover information work for keyboard users'
      ],
      concepts: [
        ['`mouseover`', 'Fires when the pointer moves onto an element.'],
        ['`mouseout`', 'Fires when the pointer leaves it.'],
        [
          '`focus` and `blur`',
          'Fire when keyboard focus (for example, from the Tab key) arrives at or leaves an element.'
        ],
        [
          '`classList`',
          'Adds or removes CSS classes that change how an element looks.'
        ],
        [
          '`removeEventListener`',
          'Stops a listener. It needs the very same function that was added.'
        ],
        [
          'accessibility',
          'Designing so that everyone can use a program, whatever device or ability they have.'
        ]
      ],
      example: {
        code: 'const owl = document.querySelector("#owl");\nconst bubble = document.querySelector("#bubble");\n\nowl.addEventListener("mouseover", function () {\n  bubble.textContent = "Hoo! I deliver messages.";\n  bubble.hidden = false;\n});\n\nowl.addEventListener("mouseout", function () {\n  bubble.hidden = true;\n});',
        stage: 'example-owl',
        steps: [
          {do: 'mouseover', target: '#owl'},
          {do: 'mouseout', target: '#owl'}
        ],
        check:
          'document.querySelector("#bubble").hidden === true && document.querySelector("#bubble").textContent === "Hoo! I deliver messages."',
        walkthrough: [
          '`owl` and `bubble` refer to the page elements found by their IDs.',
          'The `mouseover` handler writes the message into `bubble.textContent`. Setting `hidden` to `false` shows the bubble.',
          'The `mouseout` handler sets `hidden` to `true`, hiding the bubble when the pointer leaves.'
        ],
        result:
          'Hovering over Quill shows the bubble. Moving away hides it again.'
      },
      predict: [
        'What happens if you delete the `mouseout` listener?',
        'The bubble appears but never hides. Each event needs its own listener.'
      ]
    },
    review: {
      questions: [
        choice(
          'ES3-Q1',
          'Which event fires when the pointer leaves an element?',
          [
            ['`mouseout`', 'Correct.'],
            ['`mouseover`', 'That fires when the pointer arrives.'],
            ['`mouseleft`', 'There is no event with that name.']
          ],
          'E3.1'
        ),
        choice(
          'ES3-Q2',
          'Why is information that only appears on hover a problem?',
          [
            [
              'People using a touchscreen or only a keyboard cannot hover.',
              'Correct. That is a usability and portability issue.'
            ],
            ['Hover events are slow.', 'Speed is not the problem.'],
            [
              'Browsers no longer support hover.',
              'They do, but not every user has a mouse.'
            ]
          ],
          'E3.5'
        ),
        choice(
          'ES3-Q3',
          '`chest.removeEventListener("mouseover", () => springTrap());` leaves the trap in place. Why?',
          [
            [
              'It creates a new function, not the one that was added.',
              'Correct. Use the name `springTrap` both times.'
            ],
            [
              'Only click listeners can be removed.',
              'Any listener can be removed with the same function.'
            ],
            [
              '`removeEventListener` works only once.',
              'It works whenever it gets the same function.'
            ]
          ],
          'E3.4'
        ),
        choice(
          'ES3-Q4',
          'Which pair of events lets keyboard users see the potion label when tabbing through with their keyboard?',
          [
            ['`focus` and `blur`', 'Correct.'],
            [
              '`keydown` and `keyup`',
              'Those report key presses, not where focus is.'
            ],
            ['`click` and `mouseout`', '`mouseout` still needs a pointer.']
          ],
          'E3.5'
        ),
        blank(
          'ES3-Q5',
          'Spring the trap only once.',
          'chest.addEventListener("mouseover", springTrap, { ____: true });',
          ['once'],
          'Correct. The listener removes itself after one run.',
          'Which option means "just one time"?',
          'E3.4'
        ),
        blank(
          'ES3-Q6',
          'Remove the outline when the pointer leaves.',
          'goblinSprite.classList.____("outlined");',
          ['remove'],
          'Correct.',
          'The opposite of `add`.',
          'E3.2'
        ),
        blank(
          'ES3-Q7',
          'Show the label.',
          'tooltip.hidden = ____;',
          ['false'],
          'Correct. Not hidden means visible.',
          'Should `hidden` be true or false to show it?',
          'E3.1'
        )
      ]
    }
  },
  {
    id: 'ES4',
    chapter: 4,
    title: 'The Rune Keys',
    intro: {
      hook: 'A Rune Door blocks the path to the bridge. It opens only to words typed on the keyboard.',
      build:
        'Arrow-key walking, a door that reads your typing, and a spell buffer that copes with unexpected keys.',
      summary:
        '`keydown` fires when a key is pressed, and `event.key` says which one, such as `"a"` or `"ArrowUp"`. The `input` event fires whenever the text in a box changes.',
      prerequisites:
        'From Tome I: `if … else if` chooses between options, and `===` compares two values.',
      assignmentLink:
        'Your report must evaluate robustness. Use your typical, extreme and erroneous keyboard tests as evidence.',
      objectives: [
        'respond to `keydown` using `event.key`',
        'handle typed text with `trim`, `toUpperCase`, `startsWith` and `slice`',
        'test with typical, extreme and erroneous input'
      ],
      concepts: [
        ['`keydown`', 'Fires when a key is pressed down.'],
        [
          '`event.key`',
          'The name of the key, such as `"a"`, `"A"`, `"Enter"` or `"ArrowUp"`.'
        ],
        ['`input` event', 'Fires whenever the text in a text box changes.'],
        [
          'default action',
          'What the browser normally does for an event, such as scrolling on arrow keys. `preventDefault()` stops it.'
        ],
        [
          '`switch`',
          'Chooses a block of code by matching a value against several `case`s.'
        ],
        ['buffer', 'A variable that collects input bit by bit.'],
        ['validation', 'Checking input is sensible before using it.'],
        [
          'typical, extreme and erroneous data',
          'Normal input, input at the edge of what is allowed, and input that should be rejected.'
        ],
        [
          'robustness',
          'How well a program copes with unexpected input without breaking.'
        ]
      ],
      example: {
        code: 'document.addEventListener("keydown", function (event) {\n  if (event.key === "l") {\n    lantern.turnOn();\n  } else if (event.key === "d") {\n    lantern.turnOff();\n  }\n});',
        stage: 'example-keys',
        steps: [
          {do: 'key', key: 'l', target: 'document'},
          {do: 'key', key: 'x', target: 'document'}
        ],
        check: 'lantern.lit === true',
        walkthrough: [
          '`document.addEventListener("keydown", ...)` listens for keys. The browser passes the key details into `event`.',
          '`event.key` is compared with the exact lower-case strings `"l"` and `"d"`. Each matching branch calls its lantern method; other keys match neither branch.'
        ],
        result:
          'Pressing L lights the lantern and D puts it out. Other keys do nothing.'
      },
      predict: [
        'Caps Lock is on and you press L. What happens?',
        '`event.key` is `"L"`, which is not `"l"`, so nothing happens. This section shows you how to fix that.'
      ]
    },
    review: {
      questions: [
        choice(
          'ES4-Q1',
          'A player holds Shift and presses A. What is `event.key`?',
          [
            ['`"A"`', 'Correct. Shift makes it a capital.'],
            ['`"a"`', 'Shift changes the key name to a capital.'],
            ['`"Shift+a"`', '`event.key` holds one key name.']
          ],
          'E4.3'
        ),
        choice(
          'ES4-Q2',
          'Why check `event.key.length === 1` before adding a key to the buffer?',
          [
            [
              'To ignore keys like `"Shift"` and `"ArrowUp"`, whose names are longer.',
              'Correct.'
            ],
            [
              'To allow only the key 1.',
              'It checks the length of the name, not the key itself.'
            ],
            [
              'To limit the buffer to one letter.',
              'The buffer can hold up to 12.'
            ]
          ],
          'E4.3'
        ),
        choice(
          'ES4-Q3',
          'What does `event.preventDefault()` do for an arrow key?',
          [
            [
              "Stops the browser's usual action, such as scrolling.",
              'Correct.'
            ],
            ['Stops your handler running.', 'Your handler still runs.'],
            ['Deletes the event.', 'The event still happens.']
          ],
          'E4.1'
        ),
        choice(
          'ES4-Q4',
          'The buffer allows up to 12 letters. Which test uses extreme data?',
          [
            [
              'Typing exactly 12 letters, then a 13th.',
              'Correct. It tests the edge of what is allowed.'
            ],
            ['Typing `IGNIS`.', 'That is typical data.'],
            ['Typing `%%%123`.', 'That is erroneous data.']
          ],
          'E4.4'
        ),
        choice(
          'ES4-Q5',
          'The door code uses `incantationBox.value.trim()`. What does `trim()` do?',
          [
            [
              'It removes spaces from the start and end of the text.',
              'Correct. A stray space will not stop the door opening.'
            ],
            ['It makes every letter a capital.', 'That is `toUpperCase()`.'],
            [
              'It cuts the text down to 12 letters.',
              '`trim()` removes spaces, not letters.'
            ]
          ],
          'E4.2'
        ),
        blank(
          'ES4-Q6',
          'Choose what to do by key name.',
          'switch (event.____) {',
          ['key'],
          'Correct.',
          "Which property holds the key's name?",
          'E4.1'
        ),
        blank(
          'ES4-Q7',
          'Remove the last letter.',
          'spellBuffer = spellBuffer.____(0, -1);',
          ['slice'],
          'Correct. `slice(0, -1)` keeps everything except the last character.',
          'Which string method cuts out part of a string?',
          'E4.3'
        ),
        blank(
          'ES4-Q8',
          'Make capitals irrelevant when comparing with `"APERIO"`.',
          'const typed = incantationBox.value.trim().____();',
          ['toUpperCase'],
          'Correct.',
          'The secret word is in capitals.',
          'E4.2'
        )
      ]
    }
  },
  {
    id: 'ES5',
    chapter: 5,
    title: 'Battle of Grubbledown Bridge',
    intro: {
      hook: 'Grub is on the bridge with the Rune Bell. The battle is ready, but none of its controls are listening yet.',
      build:
        'The controls for a real battle against Grub, wired up by you and then played by you.',
      summary:
        "The battle engine handles turns, damage and Grub's plans. You write the listeners that connect the player to it. A control that nothing listens to does nothing.",
      prerequisites:
        'Everything from Sections 1–4: listeners, the event object, hover pairs and keyboard buffers.',
      assignmentLink:
        "Your report asks you to evaluate quality. Judge your battle's usability, robustness and maintainability, using your own code as evidence.",
      objectives: [
        'combine click, hover and key events in one program',
        "use state so that controls don't clash",
        'evaluate how well your event-driven program works'
      ],
      concepts: [
        [
          'API',
          'The set of functions some code offers for others to use, such as `battle.cast(power)`.'
        ],
        [
          'abstraction',
          'Using something by knowing what it does, without needing to know how it works inside.'
        ],
        ['integration', 'Making separate parts work together as one program.'],
        ['usability', 'How easy a program is to use.']
      ],
      example: {
        code: 'let isMyTurn = true;\nconst hitButton = document.querySelector("#hit-button");\n\nhitButton.addEventListener("click", function () {\n  if (isMyTurn) {\n    dummy.takeDamage(5);\n    isMyTurn = false;\n    setTimeout(function () {\n      isMyTurn = true;\n    }, 1000);\n  }\n});',
        stage: 'example-duel',
        steps: [
          {do: 'click', target: '#hit-button'},
          {do: 'click', target: '#hit-button'},
          {do: 'wait', ms: 1000},
          {do: 'click', target: '#hit-button'}
        ],
        check: 'dummy.health === 90',
        walkthrough: [
          '`isMyTurn` starts as `true`. The click handler checks it before dealing five damage.',
          'Setting `isMyTurn` to `false` immediately blocks more hits. The timer sets it back to `true` after one second.',
          'Grub has been eating Rune Bell cake. His battle object has `maxHealth` and `health` set to 110 after balance testing: one object customised, as in Tome I.'
        ],
        result:
          'Three clicks, but only two hits: the second click arrived during the one-second wait.'
      },
      predict: [
        "What would the dummy's health be after five very quick clicks?",
        '95. Only the first click lands; the others arrive while `isMyTurn` is `false`.'
      ]
    },
    review: {
      questions: [
        choice(
          'ES5-Q1',
          'Which best describes event-driven programming?',
          [
            [
              'The program waits for events and runs handlers in response.',
              'Correct.'
            ],
            ['Code runs once from top to bottom.', 'That is procedural.'],
            [
              'Everything must be written as classes.',
              'That describes object-oriented programming, which can be combined with events.'
            ]
          ],
          'intro:1'
        ),
        choice(
          'ES5-Q2',
          'Which of these is markup rather than programming logic?',
          [
            [
              '`<button id="shield-button">Shield</button>`',
              'Correct. HTML describes what is on the page.'
            ],
            [
              '`shieldButton.addEventListener("click", raiseShield);`',
              'That is JavaScript logic.'
            ],
            ['`if (battle.isWizardTurn()) {`', 'That is a JavaScript decision.']
          ],
          'E5.2'
        ),
        choice(
          'ES5-Q3',
          "Why can you use `battle.revealIntent()` without reading the battle engine's code?",
          [
            [
              'Abstraction: you only need to know what it does, not how.',
              'Correct.'
            ],
            ['The code is secret.', 'It is about not needing the details.'],
            [
              'Hover events cannot read variables.',
              'They can; abstraction is the reason.'
            ]
          ],
          'E5.3'
        ),
        choice(
          'ES5-Q4',
          'Visual Basic connects a handler with `Handles btnFire.Click`. What does the same job in JavaScript?',
          [
            ['`fireButton.addEventListener("click", …)`', 'Correct.'],
            ['`function btnFire()`', 'That only defines a function.'],
            ['`event.preventDefault()`', 'That stops a default action.']
          ],
          'E5.7'
        ),
        choice(
          'ES5-Q5',
          'Pressing 2 during a Fireball incantation cast Ice. What kind of problem is that?',
          [
            [
              'A logic error: two listeners respond to the same key.',
              'Correct. A state check fixes it.'
            ],
            ['A syntax error.', 'The code runs, so the syntax is fine.'],
            ['A hardware fault.', 'The keyboard is fine.']
          ],
          'E5.5'
        ),
        choice(
          'ES5-Q6',
          'Which is a genuine weakness of event-driven programs?',
          [
            [
              'With many listeners and states, the order of events can be hard to follow and debug.',
              'Correct. Tools like the Crystal Ball help.'
            ],
            [
              'They cannot respond to users.',
              'Responding to users is their strength.'
            ],
            ['They cannot use objects.', 'Your battle uses both.']
          ],
          'E5.7'
        ),
        blank(
          'ES5-Q7',
          "Read the card's power.",
          'const power = event.target.dataset.____;',
          ['power'],
          'Correct. It reads `data-power`.',
          'Look at the `data-` attribute name in `stage.html`.',
          'E5.1'
        ),
        blank(
          'ES5-Q8',
          'Let keyboard players scry Grub too.',
          'goblinSprite.addEventListener("____", showPlan);',
          ['focus'],
          'Correct.',
          'Which event fires when Tab reaches an element?',
          'E5.3'
        ),
        blank(
          'ES5-Q9',
          'Check who won.',
          'if (event.detail.winner === "____") {',
          ['wizard'],
          'Correct.',
          'Who should the Rune Bell go to?',
          'E5.6'
        )
      ]
    }
  }
];
const dictionary = (pairs) =>
  Object.assign(Object.create(null), Object.fromEntries(pairs));
export const sectionByChapter = dictionary(
  sections.map((section) => [section.chapter, section])
);
export const questionById = dictionary(
  sections
    .flatMap((section) => section.review.questions)
    .map((question) => [question.id, question])
);
export function optionOrder(question) {
  const hash = (value) =>
    [...value].reduce(
      (n, c) => Math.imul(n ^ c.charCodeAt(0), 16777619) >>> 0,
      2166136261
    );
  return [...question.options].sort(
    (a, b) => hash(question.id + a.id) - hash(question.id + b.id)
  );
}
