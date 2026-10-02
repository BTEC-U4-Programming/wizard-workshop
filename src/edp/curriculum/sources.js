// Finished solutions, prepared starters and optional gap inserts.
// These are learner documents, not host application code. Keep them readable
// and execute every changed example through the curriculum tests.
export const sources = {
  'E1.1': `// spells.js — your wizard's event listeners live here.

// 1. Find the bell button in the page's HTML (see the stage.html tab).
const wakeButton = document.querySelector("#wake-button");

// 2. Say what should happen when the bell rings.
function wakeWizard() {
  wizard.wake();
  wizard.say("Hmm? Who rang the bell?");
}

// 3. Tell the button to listen for clicks. Write your line below:

wakeButton.addEventListener("click", wakeWizard);`,
  'E1.2': `// spells.js — your wizard's event listeners live here.

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

lanternButton.addEventListener("click", lightLantern);`,
  'E1.3': `// spells.js — your wizard's event listeners live here.

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

sleepButton.addEventListener("click", goToSleep);`,
  'E1.4': `// spells.js — your wizard's event listeners live here.

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
snuffButton.addEventListener("click", () => lantern.turnOff());`,
  'E1.5': `// spells.js — your wizard's event listeners live here.

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
snuffButton.addEventListener("click", () => lantern.turnOff());`,
  'E2.1': `// spells.js — Section 2: the spell room
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
});`,
  'E2.2': `const courtyard = document.querySelector("#courtyard");

courtyard.addEventListener("click", function (event) {
  console.log("Click at", event.offsetX, event.offsetY);
  wizard.moveTo(event.offsetX, event.offsetY);
});`,
  'E2.3': `const spellbook = document.querySelector("#spellbook");

spellbook.addEventListener("click", function (event) {
  const power = event.target.dataset.power;

  if (power) {
    wizard.specialPower = power;
    wizard.castSpell(goblin);
  }
});`,
  'E2.4': `// Grub's arrow left your wizard on 50 health.
// The Healing potion should heal 20, but at the moment nothing happens.
const potionButton = document.querySelector("#potion-button");

potionButton.addEventListener("click", () => wizard.recoverHealth());`,
  'E3.1': `const redPotion = document.querySelector("#red-potion");
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
});`,
  'E3.2': `const goblinSprite = document.querySelector("#goblin");
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
goblinSprite.addEventListener("mouseout", hideGoblinStats);`,
  'E3.3': `const goblinSprite = document.querySelector("#goblin");
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
wizardSprite.addEventListener("mouseout", () => wizardSprite.classList.remove("glow"));`,
  'E3.4': `const chest = document.querySelector("#chest");
const disarmButton = document.querySelector("#disarm-button");

function springTrap() {
  wizard.say("Yikes! A spring-loaded frog!");
  wizard.takeDamage(5);
}

chest.addEventListener("mouseover", springTrap, { once: true });

disarmButton.addEventListener("click", function () {
  chest.removeEventListener("mouseover", springTrap);
  wizard.say("Trap disarmed. The frog looks disappointed.");
});`,
  'E3.5': `const redPotion = document.querySelector("#red-potion");
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
redPotion.addEventListener("blur", hideTooltip);`,
  'E4.1': `document.addEventListener("keydown", function (event) {
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
});`,
  'E4.2': `document.addEventListener("keydown", function (event) {
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
});`,
  'E4.3': `document.addEventListener("keydown", function (event) {
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
});`,
  'E4.4': `document.addEventListener("keydown", function (event) {
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
});`,
  'E5.1': `// ⚔️ spells.js — the Battle of Grubbledown Bridge

// E5.1 — the spell cards: one listener, using event delegation
const spellBar = document.querySelector("#spell-bar");

spellBar.addEventListener("click", function (event) {
  const power = event.target.dataset.power;

  if (power && battle.isWizardTurn()) {
    battle.cast(power);
  }
});

`,
  'E5.2': `// ⚔️ spells.js — the Battle of Grubbledown Bridge

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

`,
  'E5.3': `// ⚔️ spells.js — the Battle of Grubbledown Bridge

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

`,
  'E5.4': `// ⚔️ spells.js — the Battle of Grubbledown Bridge

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

`,
  'E5.5': `// ⚔️ spells.js — the Battle of Grubbledown Bridge

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

`,
  'E5.6': `// ⚔️ spells.js — the Battle of Grubbledown Bridge

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
});`,
  'E5.7': `// ⚔️ spells.js — the Battle of Grubbledown Bridge

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
});`
};

export const starters = {
  'E1.1': `// spells.js — your wizard's event listeners live here.

// 1. Find the bell button in the page's HTML (see the stage.html tab).
const wakeButton = document.querySelector("#wake-button");

// 2. Say what should happen when the bell rings.
function wakeWizard() {
  wizard.wake();
  wizard.say("Hmm? Who rang the bell?");
}

// 3. Tell the button to listen for clicks. Write your line below:
`,
  'E1.2': `// spells.js — your wizard's event listeners live here.

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

lanternButton.addEventListener("click", lightLantern());`,
  'E1.3': `// spells.js — your wizard's event listeners live here.

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

// ✦ Make #sleep-button put your wizard to sleep and say goodnight.
`,
  'E1.4': `// spells.js — your wizard's event listeners live here.

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

// ✦ Fill in the gap below to make the 'Put the lantern out'
// button work 
const snuffButton = document.querySelector("#snuff-button");
snuffButton.addEventListener("click", ____ => lantern.turnOff());
`,
  'E1.5': `// spells.js — your wizard's event listeners live here.

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
snuffButton.addEventListener("click", () => lantern.turnOff());`,
  'E2.1': `// spells.js — Section 2: the spell room
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
const iceButton = document.querySelector("#ice-button");`,
  'E2.2': `const courtyard = document.querySelector("#courtyard");

courtyard.addEventListener("click", function (event) {
  console.log("Click at", event.offsetX, event.offsetY);
  wizard.moveTo(event.offsetX, event.____);
});`,
  'E2.3': `// spells.js — the Spellbook
// These two listeners work... but look how similar they are!
const fireCard = document.querySelector("#fire-card");
const iceCard = document.querySelector("#ice-card");

fireCard.addEventListener("click", function () {
  wizard.specialPower = "fire";
  wizard.castSpell(goblin);
});

iceCard.addEventListener("click", function () {
  wizard.specialPower = "ice";
  wizard.castSpell(goblin);
});

// Problem: the Storm card only appears after "Learn a new spell",
// so nothing above is listening to it.

// ✦ Your goal: delete both listeners above and use ONE listener
//   on #spellbook instead. Open "Step instructions" for 5 small steps.
`,
  'E2.4': `// Grub's arrow left your wizard on 50 health.
// The Healing potion should heal 20, but at the moment nothing happens.
const potionButton = document.querySelector("#potion-button");

potionButton.addEventListener("click", wizard.recoverHealth);`,
  'E3.1': `const redPotion = document.querySelector("#red-potion");
const tooltip = document.querySelector("#tooltip");

redPotion.addEventListener("mouseover", function () {
  tooltip.textContent = "Healing draught: +20 health";
  tooltip.hidden = false;
});

redPotion.addEventListener("mouseout", function () {
  tooltip.hidden = true;
});

const bluePotion = document.querySelector("#blue-potion");

bluePotion.addEventListener("____", function () {
  tooltip.textContent = "Mana tonic: +10 mana";
  tooltip.hidden = false;
});

bluePotion.addEventListener("____", function () {
  tooltip.hidden = ____;
});`,
  'E3.2': `// ✦ Fill the three ____ gaps. Open "Step instructions" for 5 small steps.

const goblinSprite = document.querySelector("#goblin");
const stats = document.querySelector("#stats");

function showGoblinStats() {
  stats.textContent = goblin.name + " — health " + ____ + "/" + goblin.maxHealth;
  goblinSprite.classList.____("outlined");
}

function hideGoblinStats() {
  stats.textContent = "";
  goblinSprite.classList.____("outlined");
}

goblinSprite.addEventListener("mouseover", showGoblinStats);
goblinSprite.addEventListener("mouseout", hideGoblinStats);`,
  'E3.3': `const goblinSprite = document.querySelector("#goblin");
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

// ✦ #wizard should get the class "glow" on mouseover and lose
//   it on mouseout.
//   Declare a new 'wizardSprite' variable, then add your event 
//   listeners to it
`,
  'E3.4': `const chest = document.querySelector("#chest");
const disarmButton = document.querySelector("#disarm-button");

function springTrap() {
  wizard.say("Yikes! A spring-loaded frog!");
  wizard.takeDamage(5);
}

chest.addEventListener("mouseover", () => springTrap());

disarmButton.addEventListener("click", function () {
  chest.removeEventListener("mouseover", () => springTrap());
  wizard.say("Trap disarmed. The frog looks disappointed.");
});`,
  'E3.5': `const redPotion = document.querySelector("#red-potion");
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
// ✦ Add two more listeners so keyboard users can read the red potion information too.`,
  'E4.1': `document.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "ArrowLeft":
      event.preventDefault();
      wizard.moveBy(-10, 0);
      break;
    case "ArrowRight":
      event.preventDefault();
      wizard.moveBy(10, 0);
      break;
    // ✦ Add ArrowUp (move 0, -10) and ArrowDown (move 0, 10) here.
  }
});`,
  'E4.2': `document.addEventListener("keydown", function (event) {
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
  const typed = incantationBox.value.trim().____();

  if (typed === secretWord) {
    runeDoor.open();
    wizard.say("The door groans open!");
  } else if (secretWord.startsWith(typed)) {
    runeDoor.lightRunes(typed.length);
  } else {
    runeDoor.flashRed();
  }
});`,
  'E4.3': `document.addEventListener("keydown", function (event) {
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
  } else {
    spellBuffer = spellBuffer + event.key.toUpperCase();
  }
  bufferDisplay.textContent = "Spell buffer: " + spellBuffer;
});`,
  'E4.4': `document.addEventListener("keydown", function (event) {
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
});`,
  'E5.1': `// ⚔️ spells.js — the Battle of Grubbledown Bridge

// E5.1 — the spell cards: one listener, using event delegation
const spellBar = document.querySelector("#spell-bar");

spellBar.addEventListener("click", function (event) {
  const power = event.target.dataset.____;

  if (power && battle.isWizardTurn()) {
    battle.cast(power);
  }
});

`,
  'E5.2': `// ⚔️ spells.js — the Battle of Grubbledown Bridge

// E5.1 — the spell cards: one listener, using event delegation
const spellBar = document.querySelector("#spell-bar");

spellBar.addEventListener("click", function (event) {
  const power = event.target.dataset.power;

  if (power && battle.isWizardTurn()) {
    battle.cast(power);
  }
});


// ✦ Make shield and potion work, only on your turn.
`,
  'E5.3': `// ⚔️ spells.js — the Battle of Grubbledown Bridge

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


// ✦ Show Grub’s plan on hover and focus. Hide it afterwards.
`,
  'E5.4': `// ⚔️ spells.js — the Battle of Grubbledown Bridge

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


// ✦ Collect the Fireball incantation while its window is open.
`,
  'E5.5': `// ⚔️ spells.js — the Battle of Grubbledown Bridge

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


// ✦ Add hotkeys 1–5 and f. Ignore them outside your turn.
`,
  'E5.6': `// ⚔️ spells.js — the Battle of Grubbledown Bridge

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
  if (event.detail.winner === "____") {
    ending.textContent = "The Rune Bell is yours!";
  } else {
    ending.textContent = "Grub wins this time. Try again!";
  }
  ending.hidden = false;
});`,
  'E5.7': `// ⚔️ spells.js — the Battle of Grubbledown Bridge

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
});`
};

export const gaps = {
  'E1.1': null,
  'E1.2': null,
  'E1.3': null,
  'E1.4': `const snuffButton = document.querySelector("#snuff-button");
snuffButton.addEventListener("click", ____ => lantern.turnOff());`,
  'E1.5': null,
  'E2.1': `iceButton.addEventListener("____", function () {
  if (wizard.mana >= ____) {
    wizard.specialPower = "ice";
    wizard.castSpell(goblin);
  } else {
    wizard.say("Not enough mana!");
  }
});`,
  'E2.2': `const courtyard = document.querySelector("#courtyard");

courtyard.addEventListener("click", function (event) {
  console.log("Click at", event.offsetX, event.offsetY);
  wizard.moveTo(event.offsetX, event.____);
});`,
  'E2.3': `const spellbook = document.querySelector("#spellbook");

spellbook.addEventListener("click", function (event) {
  // Which card was clicked? Read its data-power label.
  const power = event.target.____.power;

  // The Spellbook box itself has no data-power, so only cast when
  // power has a value.
  if (____) {
    wizard.specialPower = power;
    wizard.castSpell(goblin);
  }
});`,
  'E2.4': null,
  'E3.1': `const redPotion = document.querySelector("#red-potion");
const tooltip = document.querySelector("#tooltip");

redPotion.addEventListener("mouseover", function () {
  tooltip.textContent = "Healing draught: +20 health";
  tooltip.hidden = false;
});

redPotion.addEventListener("mouseout", function () {
  tooltip.hidden = true;
});

const bluePotion = document.querySelector("#blue-potion");

bluePotion.addEventListener("____", function () {
  tooltip.textContent = "Mana tonic: +10 mana";
  tooltip.hidden = false;
});

bluePotion.addEventListener("____", function () {
  tooltip.hidden = ____;
});`,
  'E3.2': `const goblinSprite = document.querySelector("#goblin");
const stats = document.querySelector("#stats");

function showGoblinStats() {
  stats.textContent = goblin.name + " — health " + ____ + "/" + goblin.maxHealth;
  goblinSprite.classList.____("outlined");
}

function hideGoblinStats() {
  stats.textContent = "";
  goblinSprite.classList.____("outlined");
}

goblinSprite.addEventListener("mouseover", showGoblinStats);
goblinSprite.addEventListener("mouseout", hideGoblinStats);`,
  'E3.3': null,
  'E3.4': null,
  'E3.5': null,
  'E4.1': `case "ArrowUp":
  event.preventDefault();
  wizard.moveBy(0, ____);
  break;
case "ArrowDown":
  event.preventDefault();
  wizard.moveBy(0, ____);
  break;`,
  'E4.2': `
const incantationBox = document.querySelector("#incantation");
const secretWord = "APERIO";   // Latin for "I open"

incantationBox.addEventListener("input", function () {
  const typed = incantationBox.value.trim().____();

  if (typed === secretWord) {
    runeDoor.open();
    wizard.say("The door groans open!");
  } else if (secretWord.startsWith(typed)) {
    runeDoor.lightRunes(typed.length);
  } else {
    runeDoor.flashRed();
  }
});`,
  'E4.3': null,
  'E4.4': null,
  'E5.1': `// ⚔️ spells.js — the Battle of Grubbledown Bridge

// E5.1 — the spell cards: one listener, using event delegation
const spellBar = document.querySelector("#spell-bar");

spellBar.addEventListener("click", function (event) {
  const power = event.target.dataset.____;

  if (power && battle.isWizardTurn()) {
    battle.cast(power);
  }
});

`,
  'E5.2': null,
  'E5.3': null,
  'E5.4': null,
  'E5.5': null,
  'E5.6': `if (event.detail.winner === "____") {`,
  'E5.7': null
};
