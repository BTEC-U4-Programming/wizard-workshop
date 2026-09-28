// Course summary shown after the final review. Each concept pairs a short
// explanation with a complete, runnable example and a Unit 4 report link.
// Text uses the same `code` convention as the rest of the curriculum.
export const recap = {
  title: 'Your Wizard Workshop spellbook',
  intro: 'You did it! Here is everything you learned, one idea at a time, with a small example of each. Download it to keep for revision and for your Unit 4 report.',
  sections: [
    {chapter: 1, title: 'Classes and objects', concepts: [
      {term: 'Class', explanation: 'A class is a reusable description, like a recipe. On its own it creates nothing: that is why your first class appeared as a dotted outline.',
        code: 'class Wizard {\n}', report: 'Classes are the heart of object-oriented programming. Use one as an example when you compare programming approaches.'},
      {term: 'Constructor and `this`', explanation: 'The `constructor` runs automatically when an object is created. Its parameter receives a value, and `this` means the particular object being built.',
        code: 'class Wizard {\n  constructor(name) {\n    this.name = name;\n  }\n}', report: 'Annotate how the parameter `name` passes data into the new object.'},
      {term: 'Objects and `new`', explanation: '`new` creates an object from a class. Each object keeps its own properties, so changing one does not change another.',
        code: 'const wizard = new Wizard("Aster");\nconst apprentice = new Wizard("Moss");\napprentice.name = "Rowan"; // wizard.name is still "Aster"', report: 'Explain the difference between a class (the description) and an object (one instance).'},
    ]},
    {chapter: 2, title: 'Properties: defaults and your own object', concepts: [
      {term: 'Default properties', explanation: 'Properties (also called attributes) set in the `constructor` give every new object the same starting values.',
        code: 'class Wizard {\n  constructor(name) {\n    this.name = name;\n    this.cloakColour = "grey";\n    this.level = 1;\n  }\n}', report: 'Properties are variables that belong to an object. Use them when you explain variables and data.'},
      {term: 'Dot notation', explanation: '`object.property` reads or changes one property on one object. The class defaults stay the same for every new object.',
        code: 'const wizard = new Wizard("Aster");\nwizard.cloakColour = "purple"; // only this wizard changes', report: 'Show how assignment (`=`) stores a new value.'},
      {term: 'Strings and numbers', explanation: 'A string is text inside quotes. A number has no quotes. `"3"` and `3` are different types of data.',
        code: 'wizard.wand = "crystal"; // string\nwizard.level = 3;        // number', report: 'Data types (string, integer, real, Boolean) are named in the Unit 4 specification. Give examples of each.'},
    ]},
    {chapter: 3, title: 'Methods and decisions', concepts: [
      {term: 'Methods', explanation: 'A method — a function that belongs to a class — describes something an object can do. It only runs when you call it with brackets.',
        code: 'class Wizard {\n  constructor(name) {\n    this.name = name;\n    this.specialPower = "fire";\n  }\n\n  castSpell() {\n    return this.specialPower;\n  }\n}\n\nconst wizard = new Wizard("Aster");\nwizard.castSpell(); // "fire"', report: 'Methods are subroutines. Explain how they make code reusable and easier to test.'},
      {term: 'Selection with `if`', explanation: '`if`, `else if` and `else` choose which code runs using a true-or-false test. `===` compares values; a single `=` stores a value.',
        code: 'if (this.specialPower === "fire") {\n  return "fire";\n} else if (this.specialPower === "ice") {\n  return "ice";\n} else {\n  return "electricity";\n}', report: 'Selection is a key programming construct. A trace table can show which branch runs for each value.'},
      {term: 'Updating a value safely', explanation: 'A property can be updated from its current value. An `if` can then stop it passing a limit.',
        code: 'recoverHealth() {\n  this.health = this.health + 20;\n  if (this.health > this.maxHealth) {\n    this.health = this.maxHealth;\n  }\n}', report: 'Limits like this make a program more robust: extreme values cannot break it.'},
    ]},
    {chapter: 4, title: 'Inheritance: sharing code', concepts: [
      {term: '`extends` and `super`', explanation: 'A child class inherits from a parent class with `extends`. `super(...)` runs the parent constructor before the child uses `this`.',
        code: 'class Character {\n  constructor(name, maxHealth) {\n    this.name = name;\n    this.level = 1;\n    this.maxHealth = maxHealth;\n    this.health = maxHealth;\n  }\n}\n\nclass Wizard extends Character {\n  constructor(name) {\n    super(name, 100);\n    this.specialPower = "fire";\n  }\n}', report: 'Inheritance improves maintainability: shared code is written and fixed in one place.'},
      {term: 'Inherited methods', explanation: 'Methods written once in the parent can be called on every child object. `Math.max` picks the larger of two values, so health never drops below zero.',
        code: 'class Character {\n  constructor(name, maxHealth) {\n    this.name = name;\n    this.health = maxHealth;\n  }\n\n  takeDamage(amount) {\n    this.health = Math.max(0, this.health - amount);\n  }\n}\n\nclass Goblin extends Character {\n  constructor(name) {\n    super(name, 60);\n  }\n}\n\nconst goblin = new Goblin("Grub");\ngoblin.takeDamage(14); // 60 → 46', report: 'Use this when you explain how removing duplication affects quality.'},
    ]},
    {chapter: 5, title: 'Objects working together', concepts: [
      {term: 'Parameters and arguments', explanation: 'A parameter is a named slot in a method’s brackets. The argument you pass when you call the method fills it. Pass objects without quotes.',
        code: 'class Wizard {\n  castSpell(target) {\n    target.takeDamage(10);\n  }\n}\n\nwizard.castSpell(goblin); // target means goblin', report: 'Explain how objects interact by sending messages (method calls) to each other.'},
      {term: 'Variables and `return`', explanation: '`let` creates a variable whose value can change. `return` sends a value back and stops the method straight away, so put it last.',
        code: 'castSpell(target) {\n  let damage = 0;\n  if (this.specialPower === "fire") {\n    damage = 12 + this.level * 2;\n  } else if (this.specialPower === "ice") {\n    damage = 10 + this.level * 2;\n  } else {\n    damage = 14 + this.level * 2;\n  }\n  target.takeDamage(damage);\n  return this.specialPower;\n}', report: 'Variables, selection and calculation working together make a good annotated code extract.'},
      {term: 'Calculations', explanation: 'JavaScript multiplies before it adds, just like maths. At level 3, `12 + 3 * 2` is `12 + 6`.',
        code: 'const level = 3;\nconst damage = 12 + level * 2; // 18', report: 'Show a worked calculation to explain the mathematical logic in a program.'},
      {term: 'Sequence', explanation: 'Statements run from top to bottom, in order. Changing the order can change the result.',
        code: 'wizard.castSpell(goblin);\ngoblin.attack(wizard);\nwizard.recoverHealth();\nwizard.levelUp();', report: 'Sequence, selection and iteration are the basic control structures. Trace a battle step by step.'},
    ]},
  ],
};

// Markdown for the download. Code keeps its exact spelling inside fenced blocks.
export function recapMarkdown(finalCode = null) {
  const lines = [`# ${recap.title}`, '', recap.intro, ''];
  for (const section of recap.sections) {
    lines.push(`## Section ${section.chapter}: ${section.title}`, '');
    for (const concept of section.concepts) {
      lines.push(`### ${concept.term}`, '', concept.explanation, '', '```javascript', concept.code, '```', '', `> **Unit 4 link:** ${concept.report}`, '');
    }
  }
  if (finalCode && (finalCode.characterSource?.trim() || finalCode.actionsSource?.trim())) {
    lines.push('## Your own final code', '', 'This is the last code you ran successfully in the workshop.', '');
    if (finalCode.characterSource?.trim()) lines.push('### character.js', '', '```javascript', finalCode.characterSource.trimEnd(), '```', '');
    if (finalCode.actionsSource?.trim()) lines.push('### actions.js', '', '```javascript', finalCode.actionsSource.trimEnd(), '```', '');
  }
  return lines.join('\n');
}
