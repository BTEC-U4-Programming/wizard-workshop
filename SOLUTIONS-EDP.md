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

Make every card in the Spellbook cast its spell — even new ones — using just **one** listener on `#spellbook`.

Support: gaps. Starter: validButIncomplete.

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

Spell Trials: Fire card casts fire; Ice card casts ice; Clicking the Spellbook box, not a card, casts nothing; A newly learnt spell works straight away; One listener does the work.

Self-check: Your two card listeners were almost identical. How did spotting that repetition lead to shorter code that also works for cards added later?

## E2.4 — The potion that did nothing

Fix the potion button so clicking it really heals your wizard, and find out why the first version failed.

Support: guided. Starter: validButIncomplete.

```javascript
// Grub's arrow left your wizard on 50 health.
// The Healing potion should heal 20, but at the moment nothing happens.
const potionButton = document.querySelector("#potion-button");

potionButton.addEventListener("click", () => wizard.recoverHealth());
```

Spell Trials: Clicking heals 50 to 70; No errors in the Crystal Ball.

Self-check: In your own words: why does `wizard.recoverHealth()` heal the wizard, but handing over `wizard.recoverHealth` on its own does not? Then: which part of this lesson was object-oriented (the wizard and its method) and which part was event-driven (the click)?

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

Self-check: Which line of your code talks to Grub’s object, and which talks to his picture? Why would the label be wrong after a fight if you had typed 60 instead of `goblin.health`?

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
// ✦ Add two more listeners so keyboard users can read the red potion information too.
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

Stop the buffer growing beyond 12 letters.

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

## E5.1 — Wire the spell bar

Use event delegation to connect the spell cards to `battle.cast(power)`.

Support: gaps. Starter: error.

```javascript
// ⚔️ spells.js — the Battle of Grubbledown Bridge

// E5.1 — the spell cards: one listener, using event delegation
const spellBar = document.querySelector("#spell-bar");

spellBar.addEventListener("click", function (event) {
  const power = event.target.dataset.power;

  if (power && battle.isWizardTurn()) {
    battle.cast(power);
  }
});


```

Spell Trials: Fire casts on your turn; A second quick click does nothing; Between cards, no spell casts; After Grub’s turn, ice works.

## E5.2 — Shield and potion

Make Shield and Healing potion work, only on your turn.

Support: prompts only. Starter: validButIncomplete.

```javascript
// ⚔️ spells.js — the Battle of Grubbledown Bridge

// E5.1 — the spell cards: one listener, using event delegation
const spellBar = document.querySelector("#spell-bar");

spellBar.addEventListener("click", function (event) {
  const power = event.target.dataset.power;

  if (power && battle.isWizardTurn()) {
    battle.cast(power);
  }
});

// E5.2 — shield and potion
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

## E5.3 — Scry Grub’s plan

Show Grub’s next move on hover or focus, and hide it afterwards.

Support: independent. Starter: validButIncomplete.

```javascript
// ⚔️ spells.js — the Battle of Grubbledown Bridge

// E5.1 — the spell cards: one listener, using event delegation
const spellBar = document.querySelector("#spell-bar");

spellBar.addEventListener("click", function (event) {
  const power = event.target.dataset.power;

  if (power && battle.isWizardTurn()) {
    battle.cast(power);
  }
});

// E5.2 — shield and potion
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

// E5.3 — scry Grub's plan, by hover AND by keyboard focus
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

## E5.4 — The Fireball incantation

Collect typed letters during the Fireball window, show them, and cast with Enter.

Support: independent. Starter: validButIncomplete.

```javascript
// ⚔️ spells.js — the Battle of Grubbledown Bridge

// E5.1 — the spell cards: one listener, using event delegation
const spellBar = document.querySelector("#spell-bar");

spellBar.addEventListener("click", function (event) {
  const power = event.target.dataset.power;

  if (power && battle.isWizardTurn()) {
    battle.cast(power);
  }
});

// E5.2 — shield and potion
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

// E5.3 — scry Grub's plan, by hover AND by keyboard focus
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

// E5.4 — the Fireball incantation
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

## E5.5 — Battle hotkeys

Connect keys 1–5 and f. Ignore hotkeys outside your turn and during incantations.

Support: independent. Starter: validButIncomplete.

```javascript
// ⚔️ spells.js — the Battle of Grubbledown Bridge

// E5.1 — the spell cards: one listener, using event delegation
const spellBar = document.querySelector("#spell-bar");

spellBar.addEventListener("click", function (event) {
  const power = event.target.dataset.power;

  if (power && battle.isWizardTurn()) {
    battle.cast(power);
  }
});

// E5.2 — shield and potion
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

// E5.3 — scry Grub's plan, by hover AND by keyboard focus
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

// E5.4 — the Fireball incantation
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

// E5.5 — hotkeys (during an incantation, isWizardTurn() is false, so they are ignored)
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

## E5.6 — When the dust settles

Listen for `battleEnded` and show the right ending from `event.detail.winner`.

Support: gaps. Starter: error.

```javascript
// ⚔️ spells.js — the Battle of Grubbledown Bridge

// E5.1 — the spell cards: one listener, using event delegation
const spellBar = document.querySelector("#spell-bar");

spellBar.addEventListener("click", function (event) {
  const power = event.target.dataset.power;

  if (power && battle.isWizardTurn()) {
    battle.cast(power);
  }
});

// E5.2 — shield and potion
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

// E5.3 — scry Grub's plan, by hover AND by keyboard focus
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

// E5.4 — the Fireball incantation
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

// E5.5 — hotkeys (during an incantation, isWizardTurn() is false, so they are ignored)
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

// E5.6 — the ending
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

## E5.7 — Play the battle

Every control is listening. Play the battle — win or lose — then reflect.

Support: independent. Starter: success.

```javascript
// ⚔️ spells.js — the Battle of Grubbledown Bridge

// E5.1 — the spell cards: one listener, using event delegation
const spellBar = document.querySelector("#spell-bar");

spellBar.addEventListener("click", function (event) {
  const power = event.target.dataset.power;

  if (power && battle.isWizardTurn()) {
    battle.cast(power);
  }
});

// E5.2 — shield and potion
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

// E5.3 — scry Grub's plan, by hover AND by keyboard focus
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

// E5.4 — the Fireball incantation
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

// E5.5 — hotkeys (during an incantation, isWizardTurn() is false, so they are ignored)
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

// E5.6 — the ending
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

Answer: The method is handed over without `wizard`, so when the click runs it, `this` is the button.

Correct. A button has no health. Wrap the call so the wizard does it: `() => wizard.recoverHealth()`.

### ES2-Q5 — Read where the click happened.

Answer: `offsetY`

Correct. `offsetY` is the vertical position.

### ES2-Q6 — Allow ice when the wizard has enough mana.

Answer: `>=`

Correct. `>=` includes 3 itself: the boundary.

### ES2-Q7 — Read the `data-power` attribute.

Answer: `dataset`

Correct. `dataset` holds every `data-` attribute.

### ES2-Q8 — Recover health, keeping `this` pointing at the wizard.

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

### ES3-Q4 — Which pair of events lets keyboard users see the potion label when tabbing through with their keyboard?

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

### ES4-Q5 — The door code uses `incantationBox.value.trim()`. What does `trim()` do?

Answer: It removes spaces from the start and end of the text.

Correct. A stray space will not stop the door opening.

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

### ES5-Q1 — Which best describes event-driven programming?

Answer: The program waits for events and runs handlers in response.

Correct.

### ES5-Q2 — Which of these is markup rather than programming logic?

Answer: `<button id="shield-button">Shield</button>`

Correct. HTML describes what is on the page.

### ES5-Q3 — Why can you use `battle.revealIntent()` without reading the battle engine's code?

Answer: Abstraction: you only need to know what it does, not how.

Correct.

### ES5-Q4 — Visual Basic connects a handler with `Handles btnFire.Click`. What does the same job in JavaScript?

Answer: `fireButton.addEventListener("click", …)`

Correct.

### ES5-Q5 — Pressing 2 during a Fireball incantation cast Ice. What kind of problem is that?

Answer: A logic error: two listeners respond to the same key.

Correct. A state check fixes it.

### ES5-Q6 — Which is a genuine weakness of event-driven programs?

Answer: With many listeners and states, the order of events can be hard to follow and debug.

Correct. Tools like the Crystal Ball help.

### ES5-Q7 — Read the card's power.

Answer: `power`

Correct. It reads `data-power`.

### ES5-Q8 — Let keyboard players scry Grub too.

Answer: `focus`

Correct.

### ES5-Q9 — Check who won.

Answer: `wizard`

Correct.

### ES5-Q10 — `setTimeout(goblinTakesTurn, 1200);` has just run. What happens next?

Answer: The rest of the code carries on now; `goblinTakesTurn` runs 1.2 seconds later.

Correct. `setTimeout` schedules the function and lets the program carry on.

### ES5-Q11 — The engine announces a `battleEnded` custom event instead of running your ending code itself. Why is that useful?

Answer: The engine does not need to know what your code does with the news.

Correct. The parts stay loosely coupled, so either can change without breaking the other.

### ES5-Q12 — Run `startGoblinTurn` after two seconds.

Answer: `setTimeout`

Correct. 2000 milliseconds is two seconds.
