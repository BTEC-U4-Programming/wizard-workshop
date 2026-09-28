# Tome II complete solutions and review answers

Generated from the trusted EDP curriculum. All solutions are executed by the real QuickJS test suite.

## E1.1 — Listen for the bell

Add one line so `#wake-button` listens for `"click"` and runs `wakeWizard`.

Support: worked example. Starter: validButIncomplete.

```javascript
// spells.js — your wizard's event listeners live here.

// 1. Find the bell button in the page's HTML (see the stage.html tab).
const wakeButton = document.querySelector("#wake-button");

// 2. Say what should happen when the bell rings.
function wakeWizard() {
  wizard.wake();
  wizard.say("Hmm? Who rang the bell?");
}

// 3. Tell the button to listen for clicks. Write your line below:

wakeButton.addEventListener("click", wakeWizard);
```

Spell Trials: Your wizard stays asleep until someone clicks; Clicking the bell wakes your wizard; Three clicks run the handler three times.

Self-check: spells.js finished when you pressed Run. How can your wizard wake a minute later? Where is it waiting?

## E1.2 — The lantern that lit too soon

Fix the lantern so it lights only when `#lantern-button` is clicked.

Support: guided. Starter: validButIncomplete.

```javascript
// spells.js — your wizard's event listeners live here.

// 1. Find the bell button in the page's HTML (see the stage.html tab).
const wakeButton = document.querySelector("#wake-button");

// 2. Say what should happen when the bell rings.
function wakeWizard() {
  wizard.wake();
  wizard.say("Hmm? Who rang the bell?");
}

// 3. Tell the button to listen for clicks. Write your line below:

wakeButton.addEventListener("click", wakeWizard);

const lanternButton = document.querySelector("#lantern-button");

function lightLantern() {
  lantern.turnOn();
}

lanternButton.addEventListener("click", lightLantern);
```

Spell Trials: The lantern is dark until someone clicks; Clicking lights the lantern.

Self-check: The brackets ran lightLantern straight away and handed over undefined. Why did the click do nothing?

## E1.3 — Time for bed

Make `#sleep-button` run a function that puts your wizard to sleep and says goodnight.

Support: partial prompts. Starter: validButIncomplete.

```javascript
// spells.js — your wizard's event listeners live here.

// 1. Find the bell button in the page's HTML (see the stage.html tab).
const wakeButton = document.querySelector("#wake-button");

// 2. Say what should happen when the bell rings.
function wakeWizard() {
  wizard.wake();
  wizard.say("Hmm? Who rang the bell?");
}

// 3. Tell the button to listen for clicks. Write your line below:

wakeButton.addEventListener("click", wakeWizard);

const lanternButton = document.querySelector("#lantern-button");

function lightLantern() {
  lantern.turnOn();
}

lanternButton.addEventListener("click", lightLantern);

const sleepButton = document.querySelector("#sleep-button");

function goToSleep() {
  wizard.sleep();
  wizard.say("Goodnight!");
}

sleepButton.addEventListener("click", goToSleep);
```

Spell Trials: Sleep after waking; The player chooses the order; Sleeping while asleep causes no error.

Self-check: Who decides whether the wizard wakes or sleeps first now?

## E1.4 — A shorter way to write it

Use an arrow function so `#snuff-button` puts the lantern out.

Support: gaps. Starter: error.

```javascript
// spells.js — your wizard's event listeners live here.

// 1. Find the bell button in the page's HTML (see the stage.html tab).
const wakeButton = document.querySelector("#wake-button");

// 2. Say what should happen when the bell rings.
function wakeWizard() {
  wizard.wake();
  wizard.say("Hmm? Who rang the bell?");
}

// 3. Tell the button to listen for clicks. Write your line below:

wakeButton.addEventListener("click", wakeWizard);

const lanternButton = document.querySelector("#lantern-button");

function lightLantern() {
  lantern.turnOn();
}

lanternButton.addEventListener("click", lightLantern);

const sleepButton = document.querySelector("#sleep-button");

function goToSleep() {
  wizard.sleep();
  wizard.say("Goodnight!");
}

sleepButton.addEventListener("click", goToSleep);
const snuffButton = document.querySelector("#snuff-button");
snuffButton.addEventListener("click", () => lantern.turnOff());
```

Spell Trials: Snuffing puts the lantern out; The handler is an arrow function.

## E1.5 — Who decides the order?

Sort each program into mostly procedural or mostly event-driven, then explain one choice.

Support: independent. Starter: success.

```javascript
// spells.js — your wizard's event listeners live here.

// 1. Find the bell button in the page's HTML (see the stage.html tab).
const wakeButton = document.querySelector("#wake-button");

// 2. Say what should happen when the bell rings.
function wakeWizard() {
  wizard.wake();
  wizard.say("Hmm? Who rang the bell?");
}

// 3. Tell the button to listen for clicks. Write your line below:

wakeButton.addEventListener("click", wakeWizard);

const lanternButton = document.querySelector("#lantern-button");

function lightLantern() {
  lantern.turnOn();
}

lanternButton.addEventListener("click", lightLantern);

const sleepButton = document.querySelector("#sleep-button");

function goToSleep() {
  wizard.sleep();
  wizard.say("Goodnight!");
}

sleepButton.addEventListener("click", goToSleep);
const snuffButton = document.querySelector("#snuff-button");
snuffButton.addEventListener("click", () => lantern.turnOff());
```

Spell Trials: Wake, sleep and snuff listeners stay ready.

Self-check: Could a game fix every step in advance? What would it feel like to play?

## E2.1 — Cast on command

Make `#ice-button` cast ice with at least 3 mana, or say "Not enough mana!".

Support: gaps. Starter: validButIncomplete.

```javascript
// spells.js — Section 2: the spell room
const fireButton = document.querySelector("#fire-button");

fireButton.addEventListener("click", function () {
  if (wizard.mana >= 4) {
    wizard.specialPower = "fire";
    wizard.castSpell(goblin);
  } else {
    wizard.say("Not enough mana!");
  }
});

// ✦ gap goes here
const iceButton = document.querySelector("#ice-button");
iceButton.addEventListener("click", function () {
  if (wizard.mana >= 3) {
    wizard.specialPower = "ice";
    wizard.castSpell(goblin);
  } else {
    wizard.say("Not enough mana!");
  }
});
```

Spell Trials: Fire works as before; Ice casts with plenty of mana; Exactly 3 mana is enough; 2 mana is not enough; Button mashing drains mana safely.

Self-check: Why test exactly 3 mana and 2 mana? What bug might a 20-mana test miss?

## E2.2 — Where did I click?

Walk your wizard to wherever the courtyard is clicked, using the event object.

Support: gaps. Starter: error.

```javascript
const courtyard = document.querySelector("#courtyard");

courtyard.addEventListener("click", function (event) {
  console.log("Click at", event.offsetX, event.offsetY);
  wizard.moveTo(event.offsetX, event.offsetY);
});
```

Spell Trials: Clicking chooses a position; The second click chooses a new position; The lawn edge stays safe.

Self-check: Why is the browser delivering an event object useful?

## E2.3 — One spellbook, many spells

Replace separate card listeners with one listener on `#spellbook` that casts the clicked card’s power.

Support: partial prompts. Starter: validButIncomplete.

```javascript
const spellbook = document.querySelector("#spellbook");

spellbook.addEventListener("click", function (event) {
  const power = event.target.dataset.power;

  if (power) {
    wizard.specialPower = power;
    wizard.castSpell(goblin);
  }
});
```

Spell Trials: Fire card casts fire; Ice card casts ice; Clicking the cover casts nothing; A newly learnt spell works straight away; One listener does the work.

Self-check: How did spotting repeated listeners help you generalise the code?

## E2.4 — The vanishing this

Fix the potion button so clicking it really heals your wizard.

Support: guided. Starter: validButIncomplete.

```javascript
// Grub's arrow grazed your wizard. The potion should heal them.
const potionButton = document.querySelector("#potion-button");

potionButton.addEventListener("click", () => wizard.recoverHealth());
```

Spell Trials: Clicking heals 50 to 70; No errors in the Crystal Ball.

Self-check: Which part is object-oriented and which part is event-driven?

## E3.1 — Potion labels

Show the blue potion’s label on `mouseover` and hide it on `mouseout`.

Support: gaps. Starter: error.

```javascript
const redPotion = document.querySelector("#red-potion");
const tooltip = document.querySelector("#tooltip");

redPotion.addEventListener("mouseover", function () {
  tooltip.textContent = "Healing draught: +20 health";
  tooltip.hidden = false;
});

redPotion.addEventListener("mouseout", function () {
  tooltip.hidden = true;
});

const bluePotion = document.querySelector("#blue-potion");

bluePotion.addEventListener("mouseover", function () {
  tooltip.textContent = "Mana tonic: +10 mana";
  tooltip.hidden = false;
});

bluePotion.addEventListener("mouseout", function () {
  tooltip.hidden = true;
});
```

Spell Trials: The label starts hidden; Hovering blue shows its label; Leaving hides the label; Red then blue shows blue text.

## E3.2 — Scrying Grub

When the pointer is over Grub, show his health and outline him. Remove both when it leaves.

Support: gaps. Starter: error.

```javascript
const goblinSprite = document.querySelector("#goblin");
const stats = document.querySelector("#stats");

function showGoblinStats() {
  stats.textContent = goblin.name + " — health " + goblin.health + "/" + goblin.maxHealth;
  goblinSprite.classList.add("outlined");
}

function hideGoblinStats() {
  stats.textContent = "";
  goblinSprite.classList.remove("outlined");
}

goblinSprite.addEventListener("mouseover", showGoblinStats);
goblinSprite.addEventListener("mouseout", hideGoblinStats);
```

Spell Trials: Hover shows live health and an outline; Leaving removes both; The reading is live.

## E3.3 — The glowing staff

Make the staff glow while the pointer is over your wizard.

Support: prompts only. Starter: validButIncomplete.

```javascript
const goblinSprite = document.querySelector("#goblin");
const stats = document.querySelector("#stats");

function showGoblinStats() {
  stats.textContent = goblin.name + " — health " + goblin.health + "/" + goblin.maxHealth;
  goblinSprite.classList.add("outlined");
}

function hideGoblinStats() {
  stats.textContent = "";
  goblinSprite.classList.remove("outlined");
}

goblinSprite.addEventListener("mouseover", showGoblinStats);
goblinSprite.addEventListener("mouseout", hideGoblinStats);
const wizardSprite = document.querySelector("#wizard");
wizardSprite.addEventListener("mouseover", () => wizardSprite.classList.add("glow"));
wizardSprite.addEventListener("mouseout", () => wizardSprite.classList.remove("glow"));
```

Spell Trials: Glow on arrival; No glow after leaving; Repeated hovers stay safe.

## E3.4 — The cursed chest

Make the trap spring only once, and make Disarm really remove it.

Support: guided. Starter: validButIncomplete.

```javascript
const chest = document.querySelector("#chest");
const disarmButton = document.querySelector("#disarm-button");

function springTrap() {
  wizard.say("Yikes! A spring-loaded frog!");
  wizard.takeDamage(5);
}

chest.addEventListener("mouseover", springTrap, { once: true });

disarmButton.addEventListener("click", function () {
  chest.removeEventListener("mouseover", springTrap);
  wizard.say("Trap disarmed. The frog looks disappointed.");
});
```

Spell Trials: The trap springs once; Disarming works; The handler is named and once.

Self-check: Why must removeEventListener receive the very same function?

## E3.5 — The apprentice who couldn’t hover

Show the red potion’s label on keyboard focus, and hide it on blur.

Support: partial prompts. Starter: validButIncomplete.

```javascript
const redPotion = document.querySelector("#red-potion");
const tooltip = document.querySelector("#tooltip");

function showRedInfo() {
  tooltip.textContent = "Healing draught: +20 health";
  tooltip.hidden = false;
}

function hideTooltip() {
  tooltip.hidden = true;
}

redPotion.addEventListener("mouseover", showRedInfo);
redPotion.addEventListener("mouseout", hideTooltip);
// ✦ Add two more listeners so keyboard users can read the label too.
redPotion.addEventListener("focus", showRedInfo);
redPotion.addEventListener("blur", hideTooltip);
```

Spell Trials: Focus shows the label; Blur hides the label; Hover still works.

Self-check: Phones have no hover. How would you decide whether a hover-only design suits its users?

## E4.1 — Walk with the arrow keys

Add `ArrowUp` and `ArrowDown` cases so your wizard walks without scrolling the page.

Support: gaps. Starter: validButIncomplete.

```javascript
document.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "ArrowLeft":
      event.preventDefault();
      wizard.moveBy(-10, 0);
      break;
    case "ArrowRight":
      event.preventDefault();
      wizard.moveBy(10, 0);
      break;
    case "ArrowUp":
      event.preventDefault();
      wizard.moveBy(0, -10);
      break;
    case "ArrowDown":
      event.preventDefault();
      wizard.moveBy(0, 10);
      break;
  }
});
```

Spell Trials: Right three times moves across; Up moves ten pixels; Down moves ten pixels; Up and down do not scroll; Other keys do nothing.

## E4.2 — Speak to the door

Complete the door’s `input` handler so capital letters do not matter.

Support: gaps. Starter: error.

```javascript
document.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "ArrowLeft":
      event.preventDefault();
      wizard.moveBy(-10, 0);
      break;
    case "ArrowRight":
      event.preventDefault();
      wizard.moveBy(10, 0);
      break;
    case "ArrowUp":
      event.preventDefault();
      wizard.moveBy(0, -10);
      break;
    case "ArrowDown":
      event.preventDefault();
      wizard.moveBy(0, 10);
      break;
  }
});

const incantationBox = document.querySelector("#incantation");
const secretWord = "APERIO";   // Latin for "I open"

incantationBox.addEventListener("input", function () {
  const typed = incantationBox.value.trim().toUpperCase();

  if (typed === secretWord) {
    runeDoor.open();
    wizard.say("The door groans open!");
  } else if (secretWord.startsWith(typed)) {
    runeDoor.lightRunes(typed.length);
  } else {
    runeDoor.flashRed();
  }
});
```

Spell Trials: Lowercase aperio opens the door; A prefix lights three runes; Incorrect text flashes red; Spaces around the word are accepted.

## E4.3 — The spell buffer

Fix the buffer so Shift and the arrows are not added to it.

Support: guided. Starter: validButIncomplete.

```javascript
document.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "ArrowLeft":
      event.preventDefault();
      wizard.moveBy(-10, 0);
      break;
    case "ArrowRight":
      event.preventDefault();
      wizard.moveBy(10, 0);
      break;
    case "ArrowUp":
      event.preventDefault();
      wizard.moveBy(0, -10);
      break;
    case "ArrowDown":
      event.preventDefault();
      wizard.moveBy(0, 10);
      break;
  }
});

const incantationBox = document.querySelector("#incantation");
const secretWord = "APERIO";   // Latin for "I open"

incantationBox.addEventListener("input", function () {
  const typed = incantationBox.value.trim().toUpperCase();

  if (typed === secretWord) {
    runeDoor.open();
    wizard.say("The door groans open!");
  } else if (secretWord.startsWith(typed)) {
    runeDoor.lightRunes(typed.length);
  } else {
    runeDoor.flashRed();
  }
});

let spellBuffer = "";
const bufferDisplay = document.querySelector("#buffer-display");

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    wizard.speakIncantation(spellBuffer);
    spellBuffer = "";
  } else if (event.key === "Backspace") {
    spellBuffer = spellBuffer.slice(0, -1);
  } else if (event.key.length === 1) {
    spellBuffer = spellBuffer + event.key.toUpperCase();
  }
  bufferDisplay.textContent = "Spell buffer: " + spellBuffer;
});
```

Spell Trials: IGNIS then Enter speaks the spell; Lowercase works too; Long key names are ignored; Backspace repairs a typo; Empty Enter is safe.

## E4.4 — Twelve letters is plenty

Stop the buffer growing beyond 12 letters, then classify the test data.

Support: independent. Starter: validButIncomplete.

```javascript
document.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "ArrowLeft":
      event.preventDefault();
      wizard.moveBy(-10, 0);
      break;
    case "ArrowRight":
      event.preventDefault();
      wizard.moveBy(10, 0);
      break;
    case "ArrowUp":
      event.preventDefault();
      wizard.moveBy(0, -10);
      break;
    case "ArrowDown":
      event.preventDefault();
      wizard.moveBy(0, 10);
      break;
  }
});

const incantationBox = document.querySelector("#incantation");
const secretWord = "APERIO";   // Latin for "I open"

incantationBox.addEventListener("input", function () {
  const typed = incantationBox.value.trim().toUpperCase();

  if (typed === secretWord) {
    runeDoor.open();
    wizard.say("The door groans open!");
  } else if (secretWord.startsWith(typed)) {
    runeDoor.lightRunes(typed.length);
  } else {
    runeDoor.flashRed();
  }
});

let spellBuffer = "";
const bufferDisplay = document.querySelector("#buffer-display");

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    wizard.speakIncantation(spellBuffer);
    spellBuffer = "";
  } else if (event.key === "Backspace") {
    spellBuffer = spellBuffer.slice(0, -1);
  } else if (event.key.length === 1) {
    if (spellBuffer.length < 12) {
      spellBuffer = spellBuffer + event.key.toUpperCase();
    }
  }
  bufferDisplay.textContent = "Spell buffer: " + spellBuffer;
});
```

Spell Trials: Exactly 12 letters are kept; A thirteenth letter is ignored; IGNIS still works.

Self-check: Whose job is it to cope with unexpected keys? What does robustness mean here?

## E4.5 — Two listeners, one keyboard

Typing in the door’s box must not fill the spell buffer.

Support: prompts only. Starter: validButIncomplete.

```javascript
document.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "ArrowLeft":
      event.preventDefault();
      wizard.moveBy(-10, 0);
      break;
    case "ArrowRight":
      event.preventDefault();
      wizard.moveBy(10, 0);
      break;
    case "ArrowUp":
      event.preventDefault();
      wizard.moveBy(0, -10);
      break;
    case "ArrowDown":
      event.preventDefault();
      wizard.moveBy(0, 10);
      break;
  }
});

const incantationBox = document.querySelector("#incantation");
const secretWord = "APERIO";   // Latin for "I open"

incantationBox.addEventListener("input", function () {
  const typed = incantationBox.value.trim().toUpperCase();

  if (typed === secretWord) {
    runeDoor.open();
    wizard.say("The door groans open!");
  } else if (secretWord.startsWith(typed)) {
    runeDoor.lightRunes(typed.length);
  } else {
    runeDoor.flashRed();
  }
});

let spellBuffer = "";
const bufferDisplay = document.querySelector("#buffer-display");

document.addEventListener("keydown", function (event) {
  if (event.target.tagName === "INPUT") {
    return;
  }
  if (event.key === "Enter") {
    wizard.speakIncantation(spellBuffer);
    spellBuffer = "";
  } else if (event.key === "Backspace") {
    spellBuffer = spellBuffer.slice(0, -1);
  } else if (event.key.length === 1) {
    if (spellBuffer.length < 12) {
      spellBuffer = spellBuffer + event.key.toUpperCase();
    }
  }
  bufferDisplay.textContent = "Spell buffer: " + spellBuffer;
});
```

Spell Trials: Box typing opens the door without filling the buffer; Stage typing still lights the lantern.

Self-check: How do overlapping listeners affect maintainability? How would you keep track?

## E5.1 — Predict the order

Predict the order of the three messages, then run and explain the result.

Support: worked example. Starter: success.

```javascript
console.log("1: The wizard raises their staff");

setTimeout(function () {
  console.log("2: Grub sneezes");
}, 0);

console.log("3: The wizard shouts \"Halt!\"");
```

Spell Trials: The console shows 1, 3, 2.

Self-check: Why does the zero-delay timer run last? Think of Quill carrying one message at a time.

## E5.2 — The frozen tower

Change the count so the handler finishes quickly, and check the bell works afterwards.

Support: guided. Starter: stopped.

```javascript
const countButton = document.querySelector("#count-button");
const bellButton = document.querySelector("#bell-button");

countButton.addEventListener("click", function () {
  let count = 0;
  while (count < 10) {
    count = count + 1;
  }
  wizard.say("Done counting!");
});

bellButton.addEventListener("click", function () {
  tower.wakeUp(1);
});
```

Spell Trials: Counting finishes; The bell works after counting.

Self-check: Using the event loop, explain why an app might freeze after a button press.

## E5.3 — Whose turn is it?

Fix the duel so clicking Zap during Grub’s turn says "Wait your turn!".

Support: guided. Starter: validButIncomplete.

```javascript
let gameState = "wizardTurn";
const zapButton = document.querySelector("#zap-button");

function goblinTakesTurn() {
  goblin.attack(wizard);
  gameState = "wizardTurn";
}

zapButton.addEventListener("click", function () {
  const isWizardTurn = gameState === "wizardTurn";
  const hasEnoughMana = wizard.mana >= 4;

  if (isWizardTurn && hasEnoughMana) {
    wizard.castSpell(goblin);
    gameState = "goblinTurn";
    setTimeout(goblinTakesTurn, 1500);
  } else if (!isWizardTurn) {
    wizard.say("Wait your turn!");
  } else {
    wizard.say("Not enough mana!");
  }
});
```

Spell Trials: One click starts Grub’s turn; Button mashing casts only once; Grub replies after 1.5 seconds; Click, wait, click casts twice.

Self-check: The same click now does different things. Why do games need both events and state?

## E5.4 — Trace the turns

Complete the trace table for four events, then run to check it.

Support: prompts only. Starter: success.

```javascript
let gameState = "wizardTurn";
const zapButton = document.querySelector("#zap-button");

function goblinTakesTurn() {
  goblin.attack(wizard);
  gameState = "wizardTurn";
}

zapButton.addEventListener("click", function () {
  const isWizardTurn = gameState === "wizardTurn";
  const hasEnoughMana = wizard.mana >= 4;

  if (isWizardTurn && hasEnoughMana) {
    wizard.castSpell(goblin);
    gameState = "goblinTurn";
    setTimeout(goblinTakesTurn, 1500);
  } else if (!isWizardTurn) {
    wizard.say("Wait your turn!");
  } else {
    wizard.say("Not enough mana!");
  }
});
```

Spell Trials: The four-event trace matches.

## E5.5 — Grub shouts back

Announce `goblinDefeated` when Grub reaches 0 health, and listen for it.

Support: gaps. Starter: validButIncomplete.

```javascript
let gameState = "wizardTurn";
const zapButton = document.querySelector("#zap-button");

function goblinTakesTurn() {
  goblin.attack(wizard);
  gameState = "wizardTurn";
}

zapButton.addEventListener("click", function () {
  const isWizardTurn = gameState === "wizardTurn";
  const hasEnoughMana = wizard.mana >= 4;

  if (isWizardTurn && hasEnoughMana) {
    wizard.castSpell(goblin);
    if (goblin.health === 0) {
      document.dispatchEvent(new CustomEvent("goblinDefeated", { detail: { name: goblin.name } }));
    }
    gameState = "goblinTurn";
    setTimeout(goblinTakesTurn, 1500);
  } else if (!isWizardTurn) {
    wizard.say("Wait your turn!");
  } else {
    wizard.say("Not enough mana!");
  }
});

document.addEventListener("goblinDefeated", function (event) {
  wizard.say(event.detail.name + " is beaten!");
  tower.wakeUp(3);
});
```

Spell Trials: Defeat wakes the tower; A surviving Grub does not wake the tower.

Self-check: Why can the zap code announce a defeat without knowing which parts react?

## E6.1 — Wire the spell bar

Use event delegation to connect the spell cards to `battle.cast(power)`.

Support: gaps. Starter: error.

```javascript
// ⚔️ spells.js — the Battle of Grubbledown Bridge

// E6.1 — the spell cards: one listener, using event delegation
const spellBar = document.querySelector("#spell-bar");

spellBar.addEventListener("click", function (event) {
  const power = event.target.dataset.power;

  if (power && battle.isWizardTurn()) {
    battle.cast(power);
  }
});


```

Spell Trials: Fire casts on your turn; A second quick click does nothing; Between cards, no spell casts; After Grub’s turn, ice works.

## E6.2 — Shield and potion

Make Shield and Healing potion work, only on your turn.

Support: prompts only. Starter: validButIncomplete.

```javascript
// ⚔️ spells.js — the Battle of Grubbledown Bridge

// E6.1 — the spell cards: one listener, using event delegation
const spellBar = document.querySelector("#spell-bar");

spellBar.addEventListener("click", function (event) {
  const power = event.target.dataset.power;

  if (power && battle.isWizardTurn()) {
    battle.cast(power);
  }
});

// E6.2 — shield and potion
const shieldButton = document.querySelector("#shield-button");
const potionButton = document.querySelector("#potion-button");

shieldButton.addEventListener("click", function () {
  if (battle.isWizardTurn()) {
    battle.shield();
  }
});

potionButton.addEventListener("click", function () {
  if (battle.isWizardTurn()) {
    battle.drinkPotion();
  }
});


```

Spell Trials: Shield protects the next hit; Potion heals and uses one potion; Potion during Grub’s turn does nothing; No potions leaves your turn open.

## E6.3 — Scry Grub’s plan

Show Grub’s next move on hover or focus, and hide it afterwards.

Support: independent. Starter: validButIncomplete.

```javascript
// ⚔️ spells.js — the Battle of Grubbledown Bridge

// E6.1 — the spell cards: one listener, using event delegation
const spellBar = document.querySelector("#spell-bar");

spellBar.addEventListener("click", function (event) {
  const power = event.target.dataset.power;

  if (power && battle.isWizardTurn()) {
    battle.cast(power);
  }
});

// E6.2 — shield and potion
const shieldButton = document.querySelector("#shield-button");
const potionButton = document.querySelector("#potion-button");

shieldButton.addEventListener("click", function () {
  if (battle.isWizardTurn()) {
    battle.shield();
  }
});

potionButton.addEventListener("click", function () {
  if (battle.isWizardTurn()) {
    battle.drinkPotion();
  }
});

// E6.3 — scry Grub's plan, by hover AND by keyboard focus
const goblinSprite = document.querySelector("#goblin");
const intentBubble = document.querySelector("#intent-bubble");

function showPlan() {
  intentBubble.textContent = battle.revealIntent();
  intentBubble.hidden = false;
}

function hidePlan() {
  intentBubble.hidden = true;
}

goblinSprite.addEventListener("mouseover", showPlan);
goblinSprite.addEventListener("focus", showPlan);
goblinSprite.addEventListener("mouseout", hidePlan);
goblinSprite.addEventListener("blur", hidePlan);


```

Spell Trials: Hover shows the plan; Leaving hides it; Focus shows the plan; Blur hides it.

## E6.4 — The Fireball incantation

Collect typed letters during the Fireball window, show them, and cast with Enter.

Support: independent. Starter: validButIncomplete.

```javascript
// ⚔️ spells.js — the Battle of Grubbledown Bridge

// E6.1 — the spell cards: one listener, using event delegation
const spellBar = document.querySelector("#spell-bar");

spellBar.addEventListener("click", function (event) {
  const power = event.target.dataset.power;

  if (power && battle.isWizardTurn()) {
    battle.cast(power);
  }
});

// E6.2 — shield and potion
const shieldButton = document.querySelector("#shield-button");
const potionButton = document.querySelector("#potion-button");

shieldButton.addEventListener("click", function () {
  if (battle.isWizardTurn()) {
    battle.shield();
  }
});

potionButton.addEventListener("click", function () {
  if (battle.isWizardTurn()) {
    battle.drinkPotion();
  }
});

// E6.3 — scry Grub's plan, by hover AND by keyboard focus
const goblinSprite = document.querySelector("#goblin");
const intentBubble = document.querySelector("#intent-bubble");

function showPlan() {
  intentBubble.textContent = battle.revealIntent();
  intentBubble.hidden = false;
}

function hidePlan() {
  intentBubble.hidden = true;
}

goblinSprite.addEventListener("mouseover", showPlan);
goblinSprite.addEventListener("focus", showPlan);
goblinSprite.addEventListener("mouseout", hidePlan);
goblinSprite.addEventListener("blur", hidePlan);

// E6.4 — the Fireball incantation
const fireballButton = document.querySelector("#fireball-button");
const incantationDisplay = document.querySelector("#incantation-display");
let spellBuffer = "";

function startFireball() {
  if (battle.startIncantation()) {
    spellBuffer = "";
    incantationDisplay.textContent = "";
  }
}

fireballButton.addEventListener("click", startFireball);

document.addEventListener("keydown", function (event) {
  if (!battle.isIncantationOpen()) {
    return;
  }
  if (event.key === "Enter") {
    battle.speakIncantation(spellBuffer);
    spellBuffer = "";
  } else if (event.key === "Backspace") {
    spellBuffer = spellBuffer.slice(0, -1);
  } else if (event.key.length === 1) {
    if (spellBuffer.length < 12) {
      spellBuffer = spellBuffer + event.key.toUpperCase();
    }
  }
  incantationDisplay.textContent = spellBuffer;
});


```

Spell Trials: IGNIS casts a Fireball; Long key names are ignored; Backspace repairs the word; Typing outside the window does nothing; An expired window fizzles; a new one is empty.

## E6.5 — Battle hotkeys

Connect keys 1–5 and f. Ignore hotkeys outside your turn and during incantations.

Support: independent. Starter: validButIncomplete.

```javascript
// ⚔️ spells.js — the Battle of Grubbledown Bridge

// E6.1 — the spell cards: one listener, using event delegation
const spellBar = document.querySelector("#spell-bar");

spellBar.addEventListener("click", function (event) {
  const power = event.target.dataset.power;

  if (power && battle.isWizardTurn()) {
    battle.cast(power);
  }
});

// E6.2 — shield and potion
const shieldButton = document.querySelector("#shield-button");
const potionButton = document.querySelector("#potion-button");

shieldButton.addEventListener("click", function () {
  if (battle.isWizardTurn()) {
    battle.shield();
  }
});

potionButton.addEventListener("click", function () {
  if (battle.isWizardTurn()) {
    battle.drinkPotion();
  }
});

// E6.3 — scry Grub's plan, by hover AND by keyboard focus
const goblinSprite = document.querySelector("#goblin");
const intentBubble = document.querySelector("#intent-bubble");

function showPlan() {
  intentBubble.textContent = battle.revealIntent();
  intentBubble.hidden = false;
}

function hidePlan() {
  intentBubble.hidden = true;
}

goblinSprite.addEventListener("mouseover", showPlan);
goblinSprite.addEventListener("focus", showPlan);
goblinSprite.addEventListener("mouseout", hidePlan);
goblinSprite.addEventListener("blur", hidePlan);

// E6.4 — the Fireball incantation
const fireballButton = document.querySelector("#fireball-button");
const incantationDisplay = document.querySelector("#incantation-display");
let spellBuffer = "";

function startFireball() {
  if (battle.startIncantation()) {
    spellBuffer = "";
    incantationDisplay.textContent = "";
  }
}

fireballButton.addEventListener("click", startFireball);

document.addEventListener("keydown", function (event) {
  if (!battle.isIncantationOpen()) {
    return;
  }
  if (event.key === "Enter") {
    battle.speakIncantation(spellBuffer);
    spellBuffer = "";
  } else if (event.key === "Backspace") {
    spellBuffer = spellBuffer.slice(0, -1);
  } else if (event.key.length === 1) {
    if (spellBuffer.length < 12) {
      spellBuffer = spellBuffer + event.key.toUpperCase();
    }
  }
  incantationDisplay.textContent = spellBuffer;
});

// E6.5 — hotkeys (during an incantation, isWizardTurn() is false, so they are ignored)
document.addEventListener("keydown", function (event) {
  if (!battle.isWizardTurn()) {
    return;
  }
  switch (event.key) {
    case "1":
      battle.cast("fire");
      break;
    case "2":
      battle.cast("ice");
      break;
    case "3":
      battle.cast("electricity");
      break;
    case "4":
      battle.shield();
      break;
    case "5":
      battle.drinkPotion();
      break;
    case "f":
      startFireball();
      break;
  }
});


```

Spell Trials: 1 casts fire; f opens an empty incantation; 2 during an incantation is text; Keys during Grub’s turn do nothing.

## E6.6 — When the dust settles

Listen for `battleEnded` and show the right ending from `event.detail.winner`.

Support: gaps. Starter: error.

```javascript
// ⚔️ spells.js — the Battle of Grubbledown Bridge

// E6.1 — the spell cards: one listener, using event delegation
const spellBar = document.querySelector("#spell-bar");

spellBar.addEventListener("click", function (event) {
  const power = event.target.dataset.power;

  if (power && battle.isWizardTurn()) {
    battle.cast(power);
  }
});

// E6.2 — shield and potion
const shieldButton = document.querySelector("#shield-button");
const potionButton = document.querySelector("#potion-button");

shieldButton.addEventListener("click", function () {
  if (battle.isWizardTurn()) {
    battle.shield();
  }
});

potionButton.addEventListener("click", function () {
  if (battle.isWizardTurn()) {
    battle.drinkPotion();
  }
});

// E6.3 — scry Grub's plan, by hover AND by keyboard focus
const goblinSprite = document.querySelector("#goblin");
const intentBubble = document.querySelector("#intent-bubble");

function showPlan() {
  intentBubble.textContent = battle.revealIntent();
  intentBubble.hidden = false;
}

function hidePlan() {
  intentBubble.hidden = true;
}

goblinSprite.addEventListener("mouseover", showPlan);
goblinSprite.addEventListener("focus", showPlan);
goblinSprite.addEventListener("mouseout", hidePlan);
goblinSprite.addEventListener("blur", hidePlan);

// E6.4 — the Fireball incantation
const fireballButton = document.querySelector("#fireball-button");
const incantationDisplay = document.querySelector("#incantation-display");
let spellBuffer = "";

function startFireball() {
  if (battle.startIncantation()) {
    spellBuffer = "";
    incantationDisplay.textContent = "";
  }
}

fireballButton.addEventListener("click", startFireball);

document.addEventListener("keydown", function (event) {
  if (!battle.isIncantationOpen()) {
    return;
  }
  if (event.key === "Enter") {
    battle.speakIncantation(spellBuffer);
    spellBuffer = "";
  } else if (event.key === "Backspace") {
    spellBuffer = spellBuffer.slice(0, -1);
  } else if (event.key.length === 1) {
    if (spellBuffer.length < 12) {
      spellBuffer = spellBuffer + event.key.toUpperCase();
    }
  }
  incantationDisplay.textContent = spellBuffer;
});

// E6.5 — hotkeys (during an incantation, isWizardTurn() is false, so they are ignored)
document.addEventListener("keydown", function (event) {
  if (!battle.isWizardTurn()) {
    return;
  }
  switch (event.key) {
    case "1":
      battle.cast("fire");
      break;
    case "2":
      battle.cast("ice");
      break;
    case "3":
      battle.cast("electricity");
      break;
    case "4":
      battle.shield();
      break;
    case "5":
      battle.drinkPotion();
      break;
    case "f":
      startFireball();
      break;
  }
});

// E6.6 — the ending
const ending = document.querySelector("#ending");

battle.events.addEventListener("battleEnded", function (event) {
  if (event.detail.winner === "wizard") {
    ending.textContent = "The Rune Bell is yours!";
  } else {
    ending.textContent = "Grub wins this time. Try again!";
  }
  ending.hidden = false;
});
```

Spell Trials: Victory shows the Rune Bell message; Defeat shows a retry message.

## E6.7 — Play the battle

Every control is listening. Play the battle — win or lose — then reflect.

Support: independent. Starter: success.

```javascript
// ⚔️ spells.js — the Battle of Grubbledown Bridge

// E6.1 — the spell cards: one listener, using event delegation
const spellBar = document.querySelector("#spell-bar");

spellBar.addEventListener("click", function (event) {
  const power = event.target.dataset.power;

  if (power && battle.isWizardTurn()) {
    battle.cast(power);
  }
});

// E6.2 — shield and potion
const shieldButton = document.querySelector("#shield-button");
const potionButton = document.querySelector("#potion-button");

shieldButton.addEventListener("click", function () {
  if (battle.isWizardTurn()) {
    battle.shield();
  }
});

potionButton.addEventListener("click", function () {
  if (battle.isWizardTurn()) {
    battle.drinkPotion();
  }
});

// E6.3 — scry Grub's plan, by hover AND by keyboard focus
const goblinSprite = document.querySelector("#goblin");
const intentBubble = document.querySelector("#intent-bubble");

function showPlan() {
  intentBubble.textContent = battle.revealIntent();
  intentBubble.hidden = false;
}

function hidePlan() {
  intentBubble.hidden = true;
}

goblinSprite.addEventListener("mouseover", showPlan);
goblinSprite.addEventListener("focus", showPlan);
goblinSprite.addEventListener("mouseout", hidePlan);
goblinSprite.addEventListener("blur", hidePlan);

// E6.4 — the Fireball incantation
const fireballButton = document.querySelector("#fireball-button");
const incantationDisplay = document.querySelector("#incantation-display");
let spellBuffer = "";

function startFireball() {
  if (battle.startIncantation()) {
    spellBuffer = "";
    incantationDisplay.textContent = "";
  }
}

fireballButton.addEventListener("click", startFireball);

document.addEventListener("keydown", function (event) {
  if (!battle.isIncantationOpen()) {
    return;
  }
  if (event.key === "Enter") {
    battle.speakIncantation(spellBuffer);
    spellBuffer = "";
  } else if (event.key === "Backspace") {
    spellBuffer = spellBuffer.slice(0, -1);
  } else if (event.key.length === 1) {
    if (spellBuffer.length < 12) {
      spellBuffer = spellBuffer + event.key.toUpperCase();
    }
  }
  incantationDisplay.textContent = spellBuffer;
});

// E6.5 — hotkeys (during an incantation, isWizardTurn() is false, so they are ignored)
document.addEventListener("keydown", function (event) {
  if (!battle.isWizardTurn()) {
    return;
  }
  switch (event.key) {
    case "1":
      battle.cast("fire");
      break;
    case "2":
      battle.cast("ice");
      break;
    case "3":
      battle.cast("electricity");
      break;
    case "4":
      battle.shield();
      break;
    case "5":
      battle.drinkPotion();
      break;
    case "f":
      startFireball();
      break;
  }
});

// E6.6 — the ending
const ending = document.querySelector("#ending");

battle.events.addEventListener("battleEnded", function (event) {
  if (event.detail.winner === "wizard") {
    ending.textContent = "The Rune Bell is yours!";
  } else {
    ending.textContent = "Grub wins this time. Try again!";
  }
  ending.hidden = false;
});
```

Spell Trials: Every control is listening; A test player can win with your controls.

Self-check: Decomposition: list every event, its source, handler and state change. Paradigms: what do objects and events each contribute? Could the battle be procedural? Compare JavaScript with Visual Basic’s Handles btnFire.Click. Evaluate usability, robustness and maintainability with evidence from your own code.

## Section 1 review

### ES1-Q1 — In an event-driven program, what mainly decides the order in which handlers run?

Answer: The events that happen, such as the player clicking.

Correct. The player and the world decide.

### ES1-Q2 — What is an event handler?

Answer: A function that runs when a particular event happens.

Correct.

### ES1-Q3 — `lanternButton.addEventListener("click", lightLantern());` What goes wrong?

Answer: `lightLantern` runs straight away, and nothing useful is left listening.

Correct. Brackets run the function now.

### ES1-Q4 — `spells.js` has finished running and nobody has clicked. What is the program doing?

Answer: Waiting for the next event.

Correct. The listeners stay ready.

### ES1-Q5 — Listen for clicks.

Answer: `click`

Correct. Event names are lower-case strings.

### ES1-Q6 — Hand over the handler for later.

Answer: `ringBell`

Correct. The name on its own hands over the function without running it.

### ES1-Q7 — Find the element whose id is `wake-button`.

Answer: `#wake-button`

Correct. `#` means "the element with this id".

### ES1-Q8 — Start an arrow function.

Answer: `()`

Correct. Empty brackets, then the arrow.

## Section 2 review

### ES2-Q1 — Inside a click handler, what is `event.target`?

Answer: The element that was clicked.

Correct.

### ES2-Q2 — Mana is 2 and ice costs 3. The handler checks `if (wizard.mana >= 3)`. What happens when Ice is clicked?

Answer: The wizard says "Not enough mana!" and no spell is cast.

Correct. The `else` branch runs.

### ES2-Q3 — Why use one listener on `#spellbook` instead of one on every card?

Answer: Less repeated code, and cards added later work too.

Correct. Bubbling brings every card click to the book.

### ES2-Q4 — `potionButton.addEventListener("click", wizard.recoverHealth)` fails. Why?

Answer: Handed over on its own, the method runs with `this` as the button.

Correct. Wrap it: `() => wizard.recoverHealth()`.

### ES2-Q5 — Read where the click happened.

Answer: `offsetY`

Correct. `offsetY` is the vertical position.

### ES2-Q6 — Allow ice when there is exactly enough mana.

Answer: `>=`

Correct. `>=` includes 3 itself: the boundary.

### ES2-Q7 — Read the `data-power` attribute.

Answer: `dataset`

Correct. `dataset` holds every `data-` attribute.

### ES2-Q8 — Keep `this` pointing at the wizard.

Answer: `recoverHealth`

Correct. The method is called on `wizard`, so `this` is the wizard.

## Section 3 review

### ES3-Q1 — Which event fires when the pointer leaves an element?

Answer: `mouseout`

Correct.

### ES3-Q2 — Why is information that only appears on hover a problem?

Answer: People using a touchscreen or only a keyboard cannot hover.

Correct. That is a usability and portability issue.

### ES3-Q3 — `chest.removeEventListener("mouseover", () => springTrap());` leaves the trap in place. Why?

Answer: It creates a new function, not the one that was added.

Correct. Use the name `springTrap` both times.

### ES3-Q4 — Which pair of events lets keyboard users see the potion label?

Answer: `focus` and `blur`

Correct.

### ES3-Q5 — Spring the trap only once.

Answer: `once`

Correct. The listener removes itself after one run.

### ES3-Q6 — Remove the outline when the pointer leaves.

Answer: `remove`

Correct.

### ES3-Q7 — Show the label.

Answer: `false`

Correct. Not hidden means visible.

## Section 4 review

### ES4-Q1 — A player holds Shift and presses A. What is `event.key`?

Answer: `"A"`

Correct. Shift makes it a capital.

### ES4-Q2 — Why check `event.key.length === 1` before adding a key to the buffer?

Answer: To ignore keys like `"Shift"` and `"ArrowUp"`, whose names are longer.

Correct.

### ES4-Q3 — What does `event.preventDefault()` do for an arrow key?

Answer: Stops the browser's usual action, such as scrolling.

Correct.

### ES4-Q4 — The buffer allows up to 12 letters. Which test uses extreme data?

Answer: Typing exactly 12 letters, then a 13th.

Correct. It tests the edge of what is allowed.

### ES4-Q5 — Typing in the door's box also fills the spell buffer. Why?

Answer: Two listeners respond to the same key presses.

Correct. The event bubbles from the box to `document`.

### ES4-Q6 — Choose what to do by key name.

Answer: `key`

Correct.

### ES4-Q7 — Remove the last letter.

Answer: `slice`

Correct. `slice(0, -1)` keeps everything except the last character.

### ES4-Q8 — Make capitals irrelevant when comparing with `"APERIO"`.

Answer: `toUpperCase`

Correct.

## Section 5 review

### ES5-Q1 — What order are the letters logged in? `console.log("A"); setTimeout(() => console.log("B"), 0); console.log("C");`

Answer: A, C, B

Correct. The timer's message waits in the queue until the current code finishes.

### ES5-Q2 — `isWizardTurn` is true and `hasEnoughMana` is false. What is `isWizardTurn && hasEnoughMana`?

Answer: `false`

Correct. `&&` needs both to be true.

### ES5-Q3 — Why does the duel need `gameState`?

Answer: So the same click can do different things depending on whose turn it is.

Correct.

### ES5-Q4 — A click handler loops for 5 seconds. Meanwhile, the player hovers over Grub. What happens?

Answer: The hover waits in the queue until the click handler finishes.

Correct. One message at a time.

### ES5-Q5 — Why are custom events like `goblinDefeated` useful?

Answer: The code that notices the defeat does not need to know which parts react to it.

Correct. The parts stay loosely coupled.

### ES5-Q6 — Schedule Grub's turn for later.

Answer: `setTimeout`

Correct.

### ES5-Q7 — Announce the event.

Answer: `dispatchEvent`

Correct.

### ES5-Q8 — Require both conditions.

Answer: `&&`

Correct. `&&` means "and".

## Section 6 review

### ES6-Q1 — Which best describes event-driven programming?

Answer: The program waits for events and runs handlers in response.

Correct.

### ES6-Q2 — Which of these is markup rather than programming logic?

Answer: `<button id="shield-button">Shield</button>`

Correct. HTML describes what is on the page.

### ES6-Q3 — Why can you use `battle.revealIntent()` without reading the battle engine's code?

Answer: Abstraction: you only need to know what it does, not how.

Correct.

### ES6-Q4 — Visual Basic connects a handler with `Handles btnFire.Click`. What does the same job in JavaScript?

Answer: `fireButton.addEventListener("click", …)`

Correct.

### ES6-Q5 — Pressing 2 during a Fireball incantation cast Ice. What kind of problem is that?

Answer: A logic error: two listeners respond to the same key.

Correct. A state check fixes it.

### ES6-Q6 — Which is a genuine weakness of event-driven programs?

Answer: With many listeners and states, the order of events can be hard to follow and debug.

Correct. Tools like the Crystal Ball help.

### ES6-Q7 — Read the card's power.

Answer: `power`

Correct. It reads `data-power`.

### ES6-Q8 — Let keyboard players scry Grub too.

Answer: `focus`

Correct.

### ES6-Q9 — Check who won.

Answer: `wizard`

Correct.
