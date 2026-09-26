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
add('C1.1a', 'The class is the recipe', 'Declare an empty class called `Wizard`.', {requiredFields: [], solution: {characterSource: 'class Wizard {\n}\n', actionsSource: ''}, effect: 'Class ready — no object yet', instructions: ['A class is a reusable description for creating objects.', 'In `character.js`, type the following. The braces hold the class body: `class Wizard {\n}`', '`Wizard` starts with a capital W. Our workshop uses this exact class name.']});
add('C1.1b', 'Give the recipe a constructor', 'Add `constructor(name)` and assign `this.name = name`.', {requiredFields: [], solution: {characterSource: 'class Wizard {\n  constructor(name) {\n    this.name = name;\n  }\n}\n', actionsSource: ''}, instructions: ['A `constructor` runs when you create an object. `name` is its input parameter.', 'Inside the class braces, add: `constructor(name) {\n  this.name = name;\n}`', '`name` is a property (also called an attribute). `this` means the particular object being created.'], effect: 'A new Wizard receives its name; the platform stays empty.'});
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
add('C3.1a', 'A method belongs to a class', 'Define `castSpell()` inside `Wizard` and `return` `this.specialPower`.', {method: 'castSpell', instructions: ['A method — a function that belongs to a class — describes an action.', 'Inside `Wizard`, after the `constructor` closing brace, add: `castSpell() {\n  return this.specialPower;\n}`', '`return` gives a result back. `actions.js` is now available: `character.js` sets up objects; `actions.js` calls their methods.'], effect: 'The method is ready. Defining it alone does not cast a spell.'});
actions = 'wizard.castSpell();';
add('C3.1b', 'Call the method', 'In `actions.js`, write `wizard.castSpell();`', {method: 'castSpell', call: 'castSpell', activeFile: 'actions.js', instructions: ['`character.js` runs first, then `actions.js` runs from top to bottom.', 'Call `wizard.castSpell();` in `actions.js`.', 'The workshop draws an effect from your method’s `return` value. You do not need drawing code.'], effect: 'A spell travels towards a harmless practice marker.'});
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
add('C4.5', 'Share damage behaviour', 'Add `takeDamage(amount)` to `Character` and call `goblin.takeDamage(14)` in `actions.js`.', {method: 'takeDamage', call: 'takeDamage', instructions: ['Subtract amount from `this.health`.', 'If `health` falls below zero, set it to zero. `Math.max(0, this.health - amount)` is also valid.', 'Both subclasses inherit the method. Use `goblin.takeDamage(14);` to observe 60 → 46.'], effect: 'Goblin health is 46; a probe at 5 stops at zero.'});
methods = [battleSpell]; actions = ''; overrides = overrides.filter(s => !s.includes('wizard.health'));
add('C5.1a', 'Give the spell a target', 'Refactor `castSpell(target)`: calculate power damage, call `target.takeDamage(damage)`, then `return` `this.specialPower`.', {method: 'castSpell', prepared: true, starter: {characterSource: previous.characterSource.replace('wizard.health = 50;', ''), actionsSource: '// The spell now needs a target. Update its method before calling it.\n'}, instructions: ['`target` receives another object. Fire damage: 12 + `level` × 2; ice: 10 + `level` × 2; electricity: 14 + `level` × 2.', 'Use the power conditional to calculate damage; call `target.takeDamage(damage)` once afterwards.', 'Return `this.specialPower`. The next call must supply `goblin`. Old no-target spell calls need updating.'], effect: 'Independent probes verify each power at levels 1, 3 and 20.'});
actions = 'wizard.castSpell(goblin);';
add('C5.1b', 'Pass the goblin object', 'In `actions.js`, call `wizard.castSpell(goblin);` without quotes around `goblin`.', {method: 'castSpell', call: 'castSpell', activeFile: 'actions.js', effect: 'The goblin loses health according to your spell and level.'});
goblin = goblin.slice(0,-1) + '\n  attack(target) {\n    target.takeDamage(8);\n  }\n}'; actions += '\ngoblin.attack(wizard);';
add('C5.2', 'Write the goblin response', 'Add `attack(target)` to `Goblin` with `target.takeDamage(8);` then call `goblin.attack(wizard)`.', {method: 'attack', call: 'attack', instructions: ['Fill the method fragment: `target.____(8);`.', 'Write `goblin.attack(wizard);` yourself in `actions.js`.', 'There is no automatic enemy response. Every turn comes from a line you write.'], effect: 'Wizard health falls by eight.'});
overrides = overrides.filter(s => !s.includes('wizard.level')); overrides.push('wizard.level = 2;'); actions = 'wizard.castSpell(goblin);\ngoblin.attack(wizard);\nwizard.recoverHealth();\nwizard.levelUp();';
add('C5.3', 'Script a battle', 'Start both characters at full `health`; write a spell, `goblin` response and recovery in a valid sequence.', {scaffold: 'independent', activeFile: 'actions.js', effect: 'The reference ends at wizard 100 health / level 3 and goblin 42 health.', instructions: ['Each Run rebuilds fresh objects. Attacks must target the other living character.', 'A defeated character cannot act. Once either `health` reaches zero, remove all later action lines.', 'Use at least one spell, `goblin` attack and recovery. Extend the script towards victory if you wish.']});
add('C5.4', 'Explain and experiment', 'Change a power or `level`, predict the damage, then run your valid battle.', {scaffold: 'independent', activeFile: 'actions.js', reflection: 'How is a class different from an object? Why do shared methods belong in `Character`? What does `target` refer to in `castSpell`?', effect: 'Compare your prediction with the actual health change. Self-check answers are not machine assessed.'});
// Teaching metadata is explicit and inspectable without reading the runner.
for (const [index,c] of checkpoints.entries()) {
  const reached = id => index >= checkpoints.findIndex(item=>item.id===id);
  c.defaultExpectations = {...(!reached('C2.7') ? Object.fromEntries(Object.entries(defaults).filter(([key])=>c.requiredFields.includes(key))) : {}),...(reached('C3.3a')?{maxHealth:100,health:100}:{}),...(reached('C4.3a')?{level:1}:{})};
  c.structuralChecks = ['Actual class Wizard declaration',...(reached('C1.1b')?['Constructor assigns the supplied name using this']:[]),...(reached('C1.1c')?['wizard is created using new Wizard']:[]),...(c.field?[`Constructor assignment for ${c.field}`, ...(c.kind==='override'?[`Explicit wizard.${c.field} assignment`]:[])]:[]),...(c.method?[`${c.method} is declared inside its owning class`]:[]),...(c.call?[`Explicit ${c.call} call in actions.js`]:[]),...(reached('C3.2a')?['Conditional reads this.specialPower']:[]),...(reached('C4.3a')?['Wizard extends Character and super is first']:[]),...(reached('C4.4')?['Both subclasses inherit shared methods without copies']:[])];
  c.behaviouralProbes = [...(reached('C1.1b')?['Fresh constructors receive Probe and Other names']:[]),...(reached('C3.1a')?[`castSpell returns matching powers (${c.branches||3} branches)`]:[]),...(reached('C3.3b')?[c.id==='C3.3b'?'Recovery 50 → 70':'Recovery 50 → 70, max−5 → max, max → max; actor health only']:[]),...(reached('C3.4a')?['Level 1 → 2, 19 → 20, 20 → 20; actor level only']:[]),...(reached('C4.5')?['Damage 60 − 14 → 46 and 5 − 14 → 0 on both subclasses']:[]),...(reached('C5.1a')?['All three spell powers at levels 1, 3 and 20; target health only']:[])];
  c.starterExpected = ['C3.2b','C3.2c','C3.3c','C5.1a'].includes(c.id) ? {status:'error',code:'behaviour',reason:'The previous implementation is runnable but does not yet satisfy the newly taught behavioural contract.'} : ['C2.7','C4.1','C5.4'].includes(c.id) ? {status:'success',reason:'This is a prepared comparison or self-check consolidation; discussion is not machine graded.'} : {status:'validButIncomplete',reason:'The previous successful source is valid; the new objective is still missing.'};
  if(c.field)c.hints=[`The \`constructor\` sets a property on every fresh object. An assignment to \`wizard\` changes only that particular object.`,c.kind==='default'?`Inside \`constructor\`, after \`this.name\`, add \`this.${c.field} = ${JSON.stringify(c.defaultValue)};\``:`Below \`const wizard = new Wizard(...)\`, assign \`wizard.${c.field}\`. Keep the \`constructor\` default \`${JSON.stringify(c.defaultValue)}\`.`, 'Compare the `constructor` and object assignment in this complete worked example.'];
  else if(c.method)c.hints=[`A method is a function belonging to a class. \`this\` means the object that receives the method call.`,c.activeFile==='actions.js'?`In \`actions.js\`, call \`${c.method==='attack'?'goblin':'wizard'}.${c.method}(${c.chapter>=5?(c.method==='attack'?'wizard':c.method==='castSpell'?'goblin':''):''});\``:`Put \`${c.method}\` inside ${c.method==='attack'?'\`Goblin\`':c.method==='takeDamage'?'\`Character\`':'\`Wizard\`'}, after the \`constructor\`’s closing brace. Check its before/after examples.`, 'Compare the method and its separate action calls in this complete worked example.'];
}
export const byId = Object.fromEntries(checkpoints.map((c, index) => [c.id, {...c, index}]));
export const finalSolution = checkpoints.at(-1).solution;
