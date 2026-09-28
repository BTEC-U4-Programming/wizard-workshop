export const curriculumVersion = 1;
export const choices = {
  cloakColour: ['grey', 'purple', 'gold', 'black', 'blue', 'green'],
  cloakPattern: ['plain', 'stars', 'stripes', 'runes'],
  wand: ['oak', 'crystal', 'ember'], beardType: ['none', 'short', 'long'],
  specialPower: ['fire', 'ice', 'electricity'], level: [1, 3, 20],
};
export const defaults = { cloakColour: 'grey', cloakPattern: 'plain', wand: 'oak', beardType: 'none', specialPower: 'fire', level: 1 };
export const shared = ['name', 'level', 'maxHealth', 'health'];
const recovery = `  recoverHealth() {
    this.health = this.health + 20;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }`;
const levelUp = `  levelUp() {
    if (this.level < 20) {
      this.level = this.level + 1;
    }
  }`;
const damage = `  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
  }`;
const conditional = `  castSpell() {
    if (this.specialPower === "fire") {
      return "fire";
    } else if (this.specialPower === "ice") {
      return "ice";
    } else {
      return "electricity";
    }
  }`;
const battleSpell = `  castSpell(target) {
    let damage = 0;
    if (this.specialPower === "fire") {
      damage = 12 + this.level * 2;
    } else if (this.specialPower === "ice") {
      damage = 10 + this.level * 2;
    } else {
      damage = 14 + this.level * 2;
    }
    target.takeDamage(damage);
    return this.specialPower;
  }`;
let fields = ['    this.name = name;'], methods = [], overrides = [], actions = '';
let base = '', goblin = '', parent = '', superLine = '', apprentice = false;
const source = () => `${base}${base ? '\n\n' : ''}class Wizard${parent} {\n  constructor(name) {\n${[superLine, ...fields].filter(Boolean).join('\n')}\n  }\n${methods.length ? '\n' + methods.join('\n\n') + '\n' : ''}}\n${goblin ? '\n' + goblin + '\n' : ''}\nconst wizard = new Wizard("Aster");\n${overrides.join('\n')}${apprentice ? '\nconst apprentice = new Wizard("Moss");\napprentice.name = "Rowan";' : ''}${goblin ? '\nconst goblin = new Goblin("Grub");' : ''}\n`;
export const checkpoints = [];
let previous = { characterSource: '// Your class will go here. Braces { } hold its code.\n', actionsSource: '' };
function add(id, title, objective, config = {}) {
  const solution = config.solution || { characterSource: source(), actionsSource: actions };
  const chapter = Number(id[1]);
  const record = {
    id, chapter, title, objective, prerequisite: checkpoints.at(-1)?.id ?? null,
    scaffold: config.scaffold || 'guided', activeFile: config.activeFile || 'character.js',
    instructions: config.instructions || [objective, 'Make the change in `character.js`, then choose Run code.', 'Compare What a `new` `Wizard` starts with and Your object.'],
    expectedVisibleResult: config.effect || title,
    starterStrategy: config.prepared ? 'prepared' : 'previous-success',
    starter: config.starter || structuredClone(previous), solution,
    requiredFields: ['name', ...Object.keys(defaults).filter(k => fields.some(f => f.includes(`this.${k} =`)) || (k === 'level' && !!parent)), ...(fields.some(f => f.includes('this.health')) || parent ? ['maxHealth', 'health'] : [])],
    structuralChecks: [], behaviouralProbes: [], objectiveChecks: [objective],
    hints: config.hints || ['A class describes what its objects can do. `this` means the particular object using the method or `constructor`.', config.location || 'Look inside the class for a default or method; put object customisation below `new Wizard(...)`.', 'The worked example below is a complete passing example. Compare the relevant lines with yours.'],
    commonMistakes: ['Check case-sensitive names and closing braces.'],
    reflection: config.reflection || '', ...config,
  };
  checkpoints.push(record); previous = structuredClone(solution);
}
add('C1.1a', 'The class is the recipe', 'Declare an empty class called `Wizard`.', {requiredFields: [], solution: {characterSource: 'class Wizard {\n}\n', actionsSource: ''}, effect: 'A dotted outline appears in The Conjuring Room: the recipe exists, but no wizard has been made yet.', instructions: ['A class is a reusable description for creating objects.', 'In `character.js`, type the following. The braces hold the class body: `class Wizard {\n}`', '`Wizard` starts with a capital W. Our workshop uses this exact class name.', 'Run it and watch The Conjuring Room. The hollow, dotted outline is your recipe. It stays hollow because a class alone does not create a wizard.']});
add('C1.1b', 'Give the recipe a constructor', 'Add `constructor(name)` and assign `this.name = name`.', {requiredFields: [], solution: {characterSource: 'class Wizard {\n  constructor(name) {\n    this.name = name;\n  }\n}\n', actionsSource: ''}, instructions: ['A `constructor` runs when you create an object. `name` is its input parameter.', 'Inside the class braces, add: `constructor(name) {\n  this.name = name;\n}`', '`name` is a property (also called an attribute). `this` means the particular object being created.', 'Run it. A `name` label appears above the outline: every future wizard will carry a name. The outline is still hollow because you have not created an object yet.'], effect: 'A name label appears above the dotted outline. Every wizard made from this recipe will have a name.'});
add('C1.1c', 'Create your first object', 'Create `const wizard = new Wizard("Aster")` below the class.', {instructions: ['`new` creates a particular object from a class.', 'Below the class closing brace, type `const wizard = new Wizard("Aster");`.', 'Choose your own fictional name, 1–20 trimmed characters. `wizard` is our case-sensitive object binding.'], effect: 'Your named wizard appears on the platform.'});
apprentice = true;
add('C1.2', 'Two objects, one class', 'Create `apprentice` with `new Wizard("Moss")`, then change `apprentice.name` to `"Rowan"`.', {reflection: 'Predict: will changing `apprentice.name` change `wizard.name`? Run and compare the two objects.', effect: 'The apprentice is Rowan; your wizard keeps its own name.'});
apprentice = false;
const labels = ['Cloak colour', 'Cloak pattern', 'Wand', 'Beard', 'Power', 'Level'];
Object.entries(defaults).forEach(([field, value], i) => {
  const starter = {characterSource: source(), actionsSource: ''};
  fields.push(`    this.${field} = ${JSON.stringify(value)};`);
  add(`C2.${i + 1}a`, `${labels[i]}: class default`, `Add \`${field}\` with default \`${JSON.stringify(value)}\` inside the \`constructor\`.`, {
    field, defaultValue: value, kind: 'default', prepared: i === 0, starter: i === 0 ? starter : previous,
    scaffold: ['worked example', 'gaps', 'partial prompts', 'prompts only', 'independent', 'independent'][i],
    instructions: [i === 0 ? 'This prepared copy removes the temporary `apprentice`. Its earlier draft remains saved.' : `Add a \`${field}\` property to the \`constructor\`.`, `Every new wizard should start with \`${JSON.stringify(value)}\`. ${i === 5 ? 'Numbers do not need quotes.' : 'The workshop rules accept the choices shown in the reference.'}`, i === 0 ? 'Inside `constructor`, after `this.name = name;`, add `this.cloakColour = "grey";`' : i === 1 ? 'Fill the fragment `this.____ = "plain";` inside the `constructor`.' : i === 2 ? 'Partial prompt: `this.wand = ...;`' : 'Use the property cards and optional hints.'],
    gap: i === 1 ? 'this.____ = "plain";' : null,
    effect: `The class-default inspector now includes ${field}.`,
  });
  const selected = choices[field][1]; overrides.push(`wizard.${field} = ${JSON.stringify(selected)};`);
  add(`C2.${i + 1}b`, `${labels[i]}: your object`, `After creating \`wizard\`, assign \`wizard.${field}\` a ${i === 5 ? 'value of 3' : 'different supported value'}.`, {field, defaultValue: value, kind: 'override', gap: i === 1 ? 'wizard.cloakPattern = "____";' : null,
    instructions: [`Keep the \`constructor\` default \`${JSON.stringify(value)}\`.`, `Change only your object using dot notation: \`wizard.${field}\`. ${i === 5 ? 'Set it to 3, without quotes.' : 'Choose a value other than the default.'}`, i === 1 ? 'Fill the fragment `wizard.cloakPattern = "____";` below object creation.' : 'Run and compare the fresh object default with your customised object.'],
    effect: `Your ${field} changes; the constructor default stays ${JSON.stringify(value)}.`});
});
add('C2.7', 'Your design', 'Choose a valid combination of all six customisation properties.', {scaffold: 'independent', instructions:['You may now choose any supported `constructor` defaults for the six customisation properties.','Use object assignments for your personal design; compare it with a fresh `wizard`.','These choices can carry forward into the methods lessons.'],reflection: 'Which lines define what every new wizard starts with, and which customise only your `wizard`?'});
methods = ['  castSpell() {\n    return this.specialPower;\n  }'];
add('C3.1a', 'A method belongs to a class', 'Define `castSpell()` inside `Wizard` and `return` `this.specialPower`.', {method: 'castSpell', openInstructions:true, customHints:true, instructions: ['A method — a function that belongs to a class — describes something your wizard can do. It belongs inside the `Wizard` class.', 'Find the last `this.… = …;` line in the `constructor`. The next `}` closes the constructor.', 'Add a blank line after that `}` but before the final `}` that closes the class.', 'On that line, add: `castSpell() {\n  return this.specialPower;\n}`', 'Your code should have this shape; keep your existing properties and customisation lines: `class Wizard {\n  constructor(name) {\n    this.name = name;\n    // Your other properties stay here.\n  }\n\n  castSpell() {\n    return this.specialPower;\n  }\n}\n\nconst wizard = new Wizard("Aster");`', 'The method is after the constructor but before the class ends. Choose Find insertion point if you need help placing it.'], hints:['A method is a function that belongs to a class. Write it between the class opening and closing braces.','The constructor ends at its own `}`. Put `castSpell()` after that brace and before the class’s final `}`. Try Find insertion point.','Compare your file with the complete worked example below. Notice the space between constructor and method.'], effect: 'The method is ready. Defining it alone does not cast a spell.'});
actions = 'wizard.castSpell();';
add('C3.1b', 'Call the method', 'In `actions.js`, write `wizard.castSpell();`', {method: 'castSpell', call: 'castSpell', activeFile: 'actions.js', openInstructions:true, starter:{...previous,actionsSource:'// actions.js: this file is for CALLING methods.\n// Your Wizard class is safe in character.js (click its tab to check).\n// character.js runs first, then this file runs from top to bottom.\n// Write your method call on the line below:\n\n'}, fileNotice:{title:'New file: actions.js',body:'You are now working in a second file, `actions.js`. It starts with comments to guide you. Your `Wizard` class and earlier work are safe in `character.js`. `character.js` describes your wizard; `actions.js` tells it what to do.'}, instructions: ['You have moved to a new file: `actions.js`. Your class is safe in `character.js`; click its tab to see it.','`character.js` runs first and sets up objects. Then `actions.js` calls their methods.','Below the comments in `actions.js`, type: `wizard.castSpell();`','The brackets `()` mean “run this method now”. The workshop draws the spell from the value your method returns.'], effect: 'A spell travels towards a harmless practice marker.'});
for (let i = 0; i < 3; i++) {
  methods[0] = i === 0 ? '  castSpell() {\n    if (this.specialPower === "fire") { return "fire"; }\n  }' : i === 1 ? '  castSpell() {\n    if (this.specialPower === "fire") { return "fire"; }\n    else if (this.specialPower === "ice") { return "ice"; }\n  }' : conditional;
  overrides = overrides.filter(s => !s.includes('specialPower')); overrides.push(`wizard.specialPower = "${['fire','ice','electricity'][i]}";`);
  add(`C3.2${'abc'[i]}`, ['Decide: fire', 'Decide: ice', 'Decide: electricity'][i], `Use a conditional reading \`this.specialPower\`; \`return\` the matching power for ${['fire', 'fire and ice', 'all three powers'][i]}.`, {branches: i + 1, method: 'castSpell', scaffold: ['worked example', 'gaps', 'independent'][i], prepared: i === 0,
    starter: i === 0 ? {...previous, characterSource: previous.characterSource.replace('wizard.specialPower = "ice";', 'wizard.specialPower = "fire";')} : previous,
    instructions: ['`===` compares two values; `=` assigns a value.', i === 0 ? 'Replace the `return` with: `if (this.specialPower === "fire") {\n  return "fire";\n}`' : i === 1 ? 'Add another branch: `else if (this.specialPower === "____") {\n  return "ice";\n}`' : 'Add a final else returning electricity. The workshop guarantees one of these three powers.', `For your demonstration, set \`wizard.specialPower\` to \`"${['fire','ice','electricity'][i]}"\`. Only the branches introduced so far are required.`]});
}
fields.push('    this.maxHealth = 100;', '    this.health = this.maxHealth;'); overrides.push('wizard.health = 50;');
add('C3.3a', 'Add health state', 'Add `maxHealth = 100` and `health = this.maxHealth` in the `constructor`; set `wizard.health = 50` below object creation.', {effect: 'Your object has 50/100 health. A new wizard starts at 100.'});
methods.push('  recoverHealth() {\n    this.health = this.health + 20;\n  }'); actions = 'wizard.recoverHealth();';
add('C3.3b', 'Recover twenty health', 'Add `recoverHealth()` using `this.health = this.health + 20`; call it in `actions.js`.', {method: 'recoverHealth', call: 'recoverHealth', effect: 'Health changes from 50 to 70.', instructions: ['Inside `Wizard`, after the other method, add `recoverHealth()`.', 'Complete `this.health = this.health + ____;` with 20.', 'In `actions.js` call `wizard.recoverHealth();`. A function call uses brackets, even with no arguments.']});
methods[1] = recovery;
add('C3.3c', 'Cap recovery', 'Add a cap: `health` must never exceed `maxHealth`.', {method: 'recoverHealth', call: 'recoverHealth', instructions: ['After adding 20, compare `health` with `maxHealth`.', 'Use this cap: `if (this.health > this.maxHealth) {\n  this.health = this.maxHealth;\n}`', 'Probes check 50 → 70, 95 → 100 and 100 → 100. A cap may mean recovering less than 20.'], effect: 'The practice wizard recovers 20; a probe at 95 recovers only 5.'});
methods.push(levelUp);
add('C3.4a', 'Level up', 'Define `levelUp()`: add one to `level`, stopping at 20.', {method: 'levelUp', scaffold: 'independent', effect: 'Probe checks: 1 → 2 and 20 → 20.'});
actions = 'wizard.levelUp();';
add('C3.4b', 'Use your new level', 'Call `wizard.levelUp()` in `actions.js`.', {method: 'levelUp', call: 'levelUp', activeFile: 'actions.js', effect: 'Your level badge increases by one.'});
actions = 'wizard.recoverHealth();\nwizard.levelUp();\nwizard.castSpell();';
add('C3.5', 'Choose your actions', 'Write exactly three action lines in your chosen order.', {scaffold: 'independent', activeFile: 'actions.js', reflection: 'Why does defining a method do nothing until you call it? Run twice: does the result accumulate?', effect: 'The log shows your three actions in order.'});
goblin = `class Goblin {\n  constructor(name) {\n    this.name = name;\n    this.level = 1;\n    this.maxHealth = 60;\n    this.health = this.maxHealth;\n  }\n\n${recovery}\n\n${levelUp}\n}`;
add('C4.1', 'Spot the shared code', 'Compare `Wizard` and `Goblin`. Identify their shared properties and methods.', {prepared: true, starter: {characterSource: source(), actionsSource: actions}, reflection: 'Shared: `name`, `level`, `maxHealth`, `health`, `recoverHealth` and `levelUp`. Cloak, `wand`, beard and magic belong only to `Wizard`.', instructions: ['This starting example adds an independent `Goblin` with duplicated code.', 'Compare both constructors and methods. Select the shared members below for explanatory feedback.', 'Run the comparison. Duplication is temporary: next you will move shared code into `Character`.']});
base = 'class Character {\n  constructor(name, maxHealth) {\n    this.name = name;\n    this.level = 1;\n    this.maxHealth = maxHealth;\n    this.health = maxHealth;\n  }\n}';
add('C4.2a', 'Extract the shared constructor', 'Above `Wizard`, create `Character` with `constructor(name, maxHealth)` and the four shared properties.', {effect: 'A fresh Character probe receives its own name and maxHealth.', instructions: ['`Character` is the reusable description for shared state.', 'Assign `this.name = name`, `this.level = 1`, `this.maxHealth = maxHealth` and `this.health = maxHealth`.', 'Keep both existing classes working. Temporary duplication is allowed at this checkpoint.']});
base = base.slice(0, -1) + `\n${recovery}\n\n${levelUp}\n}`;
add('C4.2b', 'Extract shared methods', 'Add `recoverHealth()` and `levelUp()` to `Character`.', {effect: 'Character probes recover and level up correctly. Temporary subclass copies are allowed.'});
parent = ' extends Character'; superLine = '    super(name, 100);';
add('C4.3a', 'Connect Wizard to Character', 'Change `Wizard` to `extends Character` and call `super(name, 100)` first in its `constructor`.', {instructions: ['`extends` means `Wizard` inherits from `Character`.', '`super(name, 100)` calls the parent `constructor`. Put it before using `this`.', 'Make both edits before Run. Duplicated shared code may remain for this step.']});
fields = fields.filter(f => !shared.some(k => f.includes(`this.${k} =`)));
add('C4.3b', 'Remove duplicated state', 'Remove `name`, `level`, `maxHealth` and `health` assignments from the `Wizard` `constructor`.', {effect: 'The parent supplies shared state; wizard customisations remain.'});
methods = [conditional];
add('C4.3c', 'Inherit shared actions', 'Remove `recoverHealth()` and `levelUp()` from `Wizard`; keep `castSpell()`.', {effect: 'Wizard uses Character’s methods through inheritance.'});
goblin = 'class Goblin extends Character {\n  constructor(name) {\n    super(name, 60);\n  }\n}';
add('C4.4', 'Refactor Goblin', 'Make `Goblin` extend `Character`, call `super(name, 60)`, remove shared duplicates and create `goblin`.', {scaffold: 'independent', effect: 'Both characters inherit shared methods. Goblin has 60 maxHealth.'});
base = base.slice(0,-1) + `\n${damage}\n}`; actions = 'goblin.takeDamage(14);';
add('C4.5', 'Share damage behaviour', 'Add `takeDamage(amount)` to `Character` using `Math.max()` and call `goblin.takeDamage(14)` in `actions.js`.', {method: 'takeDamage', call: 'takeDamage', instructions: ['`Math.max(a, b)` is a built-in function that returns whichever of the two values is bigger. `Math.max(0, this.health - amount)` compares zero with the reduced health, so the result can never fall below zero — a one-line way to stop health going negative.', 'Your solution must call this specific method: write `this.health = Math.max(0, this.health - amount);` inside `takeDamage(amount)`.', 'Both subclasses inherit the method. Use `goblin.takeDamage(14);` to observe 60 → 46.'], effect: 'Goblin health is 46; a probe at 5 stops at zero.'});
// Section 5 builds the targeted spell in small, separately checked steps:
// a flat hit, the call, a named variable, power-based damage, then the level bonus.
const powerBranches = (fire, ice, electricity) => `    if (this.specialPower === "fire") {\n      ${fire}\n    } else if (this.specialPower === "ice") {\n      ${ice}\n    } else {\n      ${electricity}\n    }`;
const returnBranches = powerBranches('return "fire";', 'return "ice";', 'return "electricity";');
const flatSpell = `  castSpell(target) {\n    target.takeDamage(10);\n${returnBranches}\n  }`;
const variableSpell = `  castSpell(target) {\n    let damage = 10;\n    target.takeDamage(damage);\n${returnBranches}\n  }`;
const powerSpell = `  castSpell(target) {\n    let damage = 0;\n${powerBranches('damage = 12;', 'damage = 10;', 'damage = 14;')}\n    target.takeDamage(damage);\n    return this.specialPower;\n  }`;
methods = [flatSpell]; actions = ''; overrides = overrides.filter(s => !s.includes('wizard.health'));
add('C5.1a', 'A spell needs a target', 'Add a `target` parameter to `castSpell`, then make the spell hit it with `target.takeDamage(10);`.', {method: 'castSpell', prepared: true, openInstructions: true, customHints: true, spellDamage: 'any',
  starter: {characterSource: previous.characterSource.replace('wizard.health = 50;', ''), actionsSource: '// actions.js runs after character.js.\n// In the next step you will aim your spell at the goblin here.\n'},
  instructions: [
    'Right now `castSpell()` has empty brackets, so the spell has no idea who to hit. A parameter is a named slot inside a method’s brackets. It receives a value each time the method is called.',
    'In `character.js`, find `castSpell() {` inside `Wizard`. Type `target` between the brackets so the line reads `castSpell(target) {`',
    '`target` will hold whichever object the spell is aimed at. You met this idea in the section example: `heal(target)` received the patient object.',
    'Add a new first line inside `castSpell`, before the `if`: `target.takeDamage(10);` This asks the target to run its own `takeDamage` method, which every `Character` inherited in Section 4.',
    'Leave the `if` and its `return` lines exactly as they are. The start of your method should now look like this: `castSpell(target) {\n  target.takeDamage(10);\n  if (this.specialPower === "fire") {\n    return "fire";\n  }`',
    'Choose Run code. The workshop fires your spell at hidden practice goblins to test it. You will aim it at your own goblin in the next step.',
  ],
  hints: ['A parameter is a name inside a method’s brackets. It receives whatever value is passed in when the method is called.', 'Change `castSpell() {` to `castSpell(target) {`, then add `target.takeDamage(10);` as the first line inside the method, above the `if`.', 'Compare with the complete worked example below: only two lines are different from your previous code.'],
  reflection: 'Predict: what would happen if `target.takeDamage(10);` were placed after the whole `if … else`? Each branch ends with `return`, and `return` stops the method straight away, so that line would never run.',
  effect: 'Hidden practice goblins lose 10 health when your spell is cast.'});
actions = 'wizard.castSpell(goblin);';
add('C5.1b', 'Pass the goblin object', 'In `actions.js`, call `wizard.castSpell(goblin);` without quotes around `goblin`.', {method: 'castSpell', call: 'castSpell', activeFile: 'actions.js', openInstructions: true, customHints: true, spellDamage: 'any',
  instructions: [
    'Switch to `actions.js`. The parameter `target` is an empty slot. The value you write in the brackets when you call the method fills that slot. This value is called an argument.',
    'Below the comments, type `wizard.castSpell(goblin);`',
    'No quotes: `goblin` is the goblin object you created in `character.js`. `"goblin"` in quotes would just be text, and text has no `takeDamage` method.',
    'Run and watch the goblin’s health bar fall from 60 to 50. Inside the method, `target` now means your goblin.',
  ],
  hints: ['An argument is the value you pass into a method call. It fills the method’s parameter.', 'In `actions.js`, write `wizard.castSpell(goblin);` — the object name, with no quotes.', 'Compare your `actions.js` with the complete worked example below.'],
  effect: 'Your goblin loses 10 health: 60 → 50.'});
methods = [variableSpell];
add('C5.1c', 'Keep the damage in a variable', 'Store the damage in a variable with `let damage = 10;`, then use `target.takeDamage(damage);`.', {method: 'castSpell', call: 'castSpell', openInstructions: true, customHints: true, spellDamage: 'any',
  instructions: [
    'A variable is a named box that holds a value. `let` creates a variable whose value can change later. You will change it in the next step.',
    'Inside `castSpell(target)`, add a new first line: `let damage = 10;`',
    'On the next line, change `target.takeDamage(10);` to `target.takeDamage(damage);`. The method now reads the number from the box called `damage`.',
    'The start of your method should look like this: `castSpell(target) {\n  let damage = 10;\n  target.takeDamage(damage);`',
    'Run. The goblin still falls from 60 to 50. The result is the same, but the number now has a name you can change.',
  ],
  hints: ['`let damage = 10;` creates a variable called `damage` that holds the number 10.', 'Put `let damage = 10;` above the `takeDamage` line, then swap the `10` inside `takeDamage(...)` for `damage`.', 'Compare with the complete worked example below.'],
  reflection: 'Why bother with a variable if the result is the same? In the next step each power needs a different number. The variable gives that changing number one name.',
  effect: 'The goblin still drops from 60 to 50: same result, clearer code.'});
methods = [powerSpell];
add('C5.1d', 'Let the power choose the damage', 'Make each branch set `damage` (fire 12, ice 10, electricity 14). Then hit the target once and `return this.specialPower;`.', {method: 'castSpell', call: 'castSpell', openInstructions: true, customHints: true, spellDamage: 'power',
  instructions: [
    'Each power should hit differently: fire 12, ice 10, electricity 14. Your `if` already works out which power the wizard has, so it can also choose the damage.',
    'One problem: every branch ends with `return`. `return` sends a value back and stops the method immediately, so nothing after it runs. You will swap each `return` for a damage value.',
    'Step 1. Change `let damage = 10;` to `let damage = 0;`. Then delete the line `target.takeDamage(damage);` for now.',
    'Step 2. In the fire branch, replace `return "fire";` with `damage = 12;`. In the ice branch, replace `return "ice";` with `damage = 10;`. In the `else` branch, replace `return "electricity";` with `damage = 14;`.',
    'Step 3. Find the `}` that closes the `else`. Below it, but still inside `castSpell`, add `target.takeDamage(damage);` and then `return this.specialPower;`',
    'Your finished method: `castSpell(target) {\n  let damage = 0;\n  if (this.specialPower === "fire") {\n    damage = 12;\n  } else if (this.specialPower === "ice") {\n    damage = 10;\n  } else {\n    damage = 14;\n  }\n  target.takeDamage(damage);\n  return this.specialPower;\n}`',
    'Trace it for an ice wizard: the fire test is false, the ice test is true, so `damage` becomes 10. After the `if`, the target takes 10 damage once.',
  ],
  hints: ['`damage = 12;` stores a new value in the variable (one `=`). The `===` in each test compares values instead.', 'Only the `damage = …;` lines go inside the branches. `target.takeDamage(damage);` and `return this.specialPower;` go after the whole `if … else`, so they run once for every power.', 'Compare your method with the complete worked example below, line by line.'],
  reflection: 'Make a quick trace table: for each power, which test is true and what is `damage`? Why does `target.takeDamage(damage);` now appear once instead of three times?',
  effect: 'Fire hits for 12, ice for 10, electricity for 14.'});
methods = [battleSpell];
add('C5.1e', 'Stronger with every level', 'Add a level bonus to every branch, for example `damage = 12 + this.level * 2;`.', {method: 'castSpell', call: 'castSpell', openInstructions: true, customHints: true, spellDamage: 'level',
  instructions: [
    'Experienced wizards should hit harder. Each level adds 2 damage.',
    'In each branch, add `+ this.level * 2` after the number: `damage = 12 + this.level * 2;`, `damage = 10 + this.level * 2;` and `damage = 14 + this.level * 2;`',
    '`*` means multiply. JavaScript multiplies before it adds, just like in maths. At level 3, `12 + 3 * 2` is `12 + 6`, which is 18.',
    'Predict before you Run: how much damage will your wizard deal at its current level and power? Then compare with the goblin’s health.',
  ],
  hints: ['`this.level` reads the level of the wizard casting the spell.', 'Change only the three `damage = …;` lines. Keep the single `target.takeDamage(damage);` after the `if`.', 'Compare with the complete worked example below.'],
  effect: 'Damage now grows with level: a level-3 fire spell deals 18.'});
goblin = goblin.slice(0,-1) + '\n  attack(target) {\n    target.takeDamage(8);\n  }\n}'; actions += '\ngoblin.attack(wizard);';
add('C5.2', 'Write the goblin response', 'Add `attack(target)` to `Goblin` with `target.takeDamage(8);` then call `goblin.attack(wizard)`.', {method: 'attack', call: 'attack', instructions: ['Fill the method fragment: `target.____(8);`.', 'Write `goblin.attack(wizard);` yourself in `actions.js`.', 'There is no automatic enemy response. Every turn comes from a line you write.'], effect: 'Wizard health falls by eight.'});
overrides = overrides.filter(s => !s.includes('wizard.level')); overrides.push('wizard.level = 2;'); actions = 'wizard.castSpell(goblin);\ngoblin.attack(wizard);\nwizard.recoverHealth();\nwizard.levelUp();';
add('C5.3', 'Script a battle', 'Start both characters at full `health`; write a spell, `goblin` response and recovery in a valid sequence.', {scaffold: 'independent', activeFile: 'actions.js', effect: 'The reference ends at wizard 100 health / level 3 and goblin 42 health.', instructions: ['Each Run rebuilds fresh objects. Attacks must target the other living character.', 'A defeated character cannot act. Once either `health` reaches zero, remove all later action lines.', 'Use at least one spell, `goblin` attack and recovery. Extend the script towards victory if you wish.']});
add('C5.4', 'Explain and experiment', 'Change a power or `level`, predict the damage, then run your valid battle.', {scaffold: 'independent', activeFile: 'actions.js', reflection: 'How is a class different from an object? Why do shared methods belong in `Character`? What does `target` refer to in `castSpell`?', effect: 'Compare your prediction with the actual health change. Self-check answers are not machine assessed.'});
// Teaching metadata is explicit and inspectable without reading the runner.
for (const [index,c] of checkpoints.entries()) {
  const reached = id => index >= checkpoints.findIndex(item=>item.id===id);
  c.defaultExpectations = {...(!reached('C2.7') ? Object.fromEntries(Object.entries(defaults).filter(([key])=>c.requiredFields.includes(key))) : {}),...(reached('C3.3a')?{maxHealth:100,health:100}:{}),...(reached('C4.3a')?{level:1}:{})};
  c.structuralChecks = ['Actual class Wizard declaration',...(reached('C1.1b')?['Constructor assigns the supplied name using this']:[]),...(reached('C1.1c')?['wizard is created using new Wizard']:[]),...(c.field?[`Constructor assignment for ${c.field}`, ...(c.kind==='override'?[`Explicit wizard.${c.field} assignment`]:[])]:[]),...(c.method?[`${c.method} is declared inside its owning class`]:[]),...(c.call?[`Explicit ${c.call} call in actions.js`]:[]),...(reached('C3.2a')?['Conditional reads this.specialPower']:[]),...(reached('C4.3a')?['Wizard extends Character and super is first']:[]),...(reached('C4.4')?['Both subclasses inherit shared methods without copies']:[]),...(reached('C5.1a')?['castSpell declares a target parameter']:[]),...(reached('C5.1c')?['castSpell passes a damage variable to takeDamage']:[])];
  c.behaviouralProbes = [...(reached('C1.1b')?['Fresh constructors receive Probe and Other names']:[]),...(reached('C3.1a')?[`castSpell returns matching powers (${c.branches||3} branches)`]:[]),...(reached('C3.3b')?[c.id==='C3.3b'?'Recovery 50 → 70':'Recovery 50 → 70, max−5 → max, max → max; actor health only']:[]),...(reached('C3.4a')?['Level 1 → 2, 19 → 20, 20 → 20; actor level only']:[]),...(reached('C4.5')?['Damage 60 − 14 → 46 and 5 − 14 → 0 on both subclasses']:[]),...(reached('C5.1a')?[reached('C5.1e')?'All three spell powers at levels 1, 3 and 20; target health only':reached('C5.1d')?'Fire 12, ice 10, electricity 14 damage; target health only':'castSpell(target) damages only its target']:[])];
  c.starterExpected = ['C3.2b','C3.2c','C3.3c','C5.1a','C5.1d','C5.1e'].includes(c.id) ? {status:'error',code:'behaviour',reason:'The previous implementation is runnable but does not yet satisfy the newly taught behavioural contract.'} : ['C2.7','C4.1','C5.4'].includes(c.id) ? {status:'success',reason:'This is a prepared comparison or self-check consolidation; discussion is not machine graded.'} : {status:'validButIncomplete',reason:'The previous successful source is valid; the new objective is still missing.'};
  if(c.customHints)continue;
  if(c.field)c.hints=[`The \`constructor\` sets a property on every fresh object. An assignment to \`wizard\` changes only that particular object.`,c.kind==='default'?`Inside \`constructor\`, after \`this.name\`, add \`this.${c.field} = ${JSON.stringify(c.defaultValue)};\``:`Below \`const wizard = new Wizard(...)\`, assign \`wizard.${c.field}\`. Keep the \`constructor\` default \`${JSON.stringify(c.defaultValue)}\`.`, 'Compare the `constructor` and object assignment in this complete worked example.'];
  else if(c.method)c.hints=[`A method is a function belonging to a class. \`this\` means the object that receives the method call.`,c.activeFile==='actions.js'?`In \`actions.js\`, call \`${c.method==='attack'?'goblin':'wizard'}.${c.method}(${c.chapter>=5?(c.method==='attack'?'wizard':c.method==='castSpell'?'goblin':''):''});\``:`Put \`${c.method}\` inside ${c.method==='attack'?'\`Goblin\`':c.method==='takeDamage'?'\`Character\`':'\`Wizard\`'}, after the \`constructor\`’s closing brace. Check its before/after examples.`, 'Compare the method and its separate action calls in this complete worked example.'];
}
export const byId = Object.fromEntries(checkpoints.map((c, index) => [c.id, {...c, index}]));
export const finalSolution = checkpoints.at(-1).solution;
