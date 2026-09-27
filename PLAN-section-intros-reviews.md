# Implementation plan: section introductions, section review quizzes, and C3.1a/C3.1b clarity fixes

**Project:** Wizard Workshop (`wizard-workshop/`, Vite + vanilla JS ES modules)
**Audience of this document:** an AI coding agent that will review and then implement the changes
**Author context:** prepared 27 September 2026 from a read-through of the current source (`main` at commit `5b65eeb`). No code has been changed yet. Nothing below has been built or tested.

---

## 0. Read this first

### 0.1 What is being asked

| # | Request | Summary of the approach |
|---|---|---|
| 1 | Add an introductory screen at the start of each section | Add a new **section intro screen** before the first checkpoint of each chapter. It explains the new concepts and includes a complete worked example. |
| 2 | Add a quiz at the end of each section | Add a new **section review screen** after the last checkpoint of each chapter. It mixes multiple-choice questions with fill-in-the-blank code completion. |
| 3 | C3.1a: make it clearer where `castSpell()` goes | Rewrite the step instructions with a location walkthrough and a code snippet showing the method in context. Open the instructions by default, and replace the generic hints. |
| 4 | C3.1b: make it clear students are moving to a new file | Show a visible "new file" notice with a button to view `character.js`. Add a NEW badge to the tab, put a comment in the empty `actions.js` starter, and update the instructions. |

### 0.2 Mandatory reading before you start

1. `AGENTS.md`: especially **"Required learning-module structure"** (section introduction and worked example, section review rules) and **"Verification and completion"**. This plan follows those rules, and they are the acceptance criteria.
2. `DESIGN.md`: colour tokens, typography, components, reduced-motion rules. Reuse existing tokens. Do not introduce new accent colours.
3. `src/curriculum/checkpoints.js`, `src/main.js`, `src/state/store.js`, `scripts/lesson-highlighting.mjs`, `tests/*.js`.

### 0.3 Audience and tone (applies to every string you write)

- The students are 16–17 year olds on BTEC Level 3 IT who are new to programming. Many lack confidence.
- Use UK English (`colour`, `recognise`), short sentences and concrete examples. Be encouraging, and don't be childish.
- Define a term before you use it. Use "property (also called an attribute)" and "method — a function that belongs to a class".
- The course supports the Unit 4 assignment (*Programming Principles Investigation*, criterion **A.P2**). Students must *annotate classes, functions and selection and explain how they work together*. Where it fits naturally, intro screens can point out that the new vocabulary is what the assignment expects them to use.

### 0.4 Key facts about the current code (verified by reading it)

- **"Sections" = chapters.** There are 41 checkpoints across chapters 1–5. `chapter` is derived from the ID (`Number(id[1])`). There is currently **no chapter title or section metadata** anywhere.

  | Chapter | Checkpoints | Proposed section title |
  |---|---|---|
  | 1 | C1.1a, C1.1b, C1.1c, C1.2 | Classes and objects |
  | 2 | C2.1a … C2.6b, C2.7 | Properties: defaults and your own object |
  | 3 | C3.1a, C3.1b, C3.2a–c, C3.3a–c, C3.4a–b, C3.5 | Methods and decisions |
  | 4 | C4.1, C4.2a–b, C4.3a–c, C4.4, C4.5 | Inheritance: sharing code |
  | 5 | C5.1a, C5.1b, C5.2, C5.3, C5.4 | Objects working together |

- **Lesson prose is pre-rendered at build time.** `scripts/lesson-highlighting.mjs` is a Vite plugin. It turns curriculum strings into HTML with Expressive Code and exposes them as `virtual:lesson-content`. The prose convention: text between backticks is code, and a backtick segment containing `\n` becomes a highlighted code block. **New intro/review content must use the same pipeline**, because the browser has no highlighter.
- `main.js` renders one screen: `#lesson` (workbench) plus `#preview`. Navigation is `navigate(id, sequential)`. `initialise(id, sequential)` seeds a new checkpoint's draft from the **previous checkpoint's last successful source** when `sequential` is true.
- `#instructions` is a `<details>` element that is **forced closed** on every `showLesson()` (`$('#instructions').open=false`).
- The `actions.js` tab is visible from chapter 3 onwards (`$('#actions-tab').hidden=current.chapter<3`). The editor switches to `cp().activeFile` on navigation. At **C3.1b** `activeFile` is `actions.js` and its source is `''`, so **the learner lands on a blank editor**. This is the cause of request 4.
- For checkpoints with a `method`, hints are **overwritten** in the post-processing loop at the bottom of `checkpoints.js` (`else if(c.method)c.hints=[…]`). Any custom hints passed to `add()` for C3.1a are currently discarded.
- The "Find insertion point" button (`#locate`) puts the cursor at `cls.body.end-1` for method checkpoints. That is just inside the class's closing brace, after the constructor, which is the right place for `castSpell()`.
- Persistence: `STORAGE_KEY='wizard-workshop:progress:v1'`, and `parseImport()` rejects any save whose `curriculumVersion !== 1`. **Do not bump `curriculumVersion`**, or every existing student save becomes unreadable. Add the new state fields as optional and validated (see §4).
- Tests: `tests/curriculum.test.js` iterates `checkpoints` and requires every solution to pass the runner. Do **not** add intro/review screens to the `checkpoints` array. Keep them in a separate data structure.
- `tests/workshop.spec.js` (Playwright) assumes a fresh `page.goto('/')` lands directly on C1.1a's editor. A new intro screen as the first screen **will break these tests** unless they are updated (see §9.3).

---

## 1. Architecture decision

**Keep checkpoints unchanged. Add a parallel "sections" layer and a new screen type.**

```
Journey (derived, not stored):
  intro:1 → C1.1a → C1.1b → C1.1c → C1.2 → review:1
  intro:2 → C2.1a → … → C2.7 → review:2
  intro:3 → C3.1a → … → C3.5 → review:3
  intro:4 → C4.1  → … → C4.5 → review:4
  intro:5 → C5.1a → … → C5.4 → review:5
```

Why this design:
- The 41 checkpoint IDs, runner fixtures and saved drafts stay exactly as they are. Existing saves remain valid.
- Section content (intros, worked examples, questions) is teaching content, so it belongs in `src/curriculum/`. This matches the AGENTS.md separation rules.
- Intro and review screens don't execute learner code, so they never touch the runner.

### 1.1 New and changed files

| File | Change |
|---|---|
| `src/curriculum/sections.js` | **New.** Section metadata: titles, intro content, worked examples, review questions. |
| `src/curriculum/journey.js` | **New.** Builds the ordered journey from `sections` and `checkpoints`. Provides `next(screen)` / `previous(screen)` helpers and `sectionForCheckpoint(id)`. |
| `src/review/checkAnswer.js` | **New.** A pure function that marks a question response. It never evaluates learner text. |
| `src/review/renderSection.js` | **New.** DOM rendering for the intro and review screens. Keeps `main.js` from growing further. |
| `scripts/lesson-highlighting.mjs` | Extend to also pre-render section content into a new virtual module, `virtual:section-content`. |
| `src/main.js` | Screen switching, navigation changes, course-bar optgroups, C3.1b file notice, instructions auto-open. |
| `src/state/store.js` | New optional state fields, validation in `parseImport`, defaults in `emptyState`. |
| `src/curriculum/checkpoints.js` | C3.1a and C3.1b content changes, a `customHints` escape hatch, and new optional checkpoint flags. |
| `src/styles.css` | Styles for the section screen, question cards, inline blank inputs, file notice and tab badge. |
| `tests/sections.test.js`, `tests/review.test.js` | **New** unit tests. |
| `tests/progress.test.js`, `tests/workshop.spec.js` | Updated and extended. |
| `README.md`, `TEACHER_GUIDE.md`, `scripts/generate-docs.mjs` → `SOLUTIONS.md` | Document the new flow and publish quiz answers for teachers. |

---

## 2. Data model: `src/curriculum/sections.js`

All prose fields follow the existing backtick convention. Code blocks are backtick segments that contain newlines. Use stable IDs throughout, because saved review answers are keyed by them.

```js
// Shape (illustrative, not final code)
export const sections = [
  {
    id: 'S1',                 // stable, never renumber
    chapter: 1,
    title: 'Classes and objects',
    intro: {
      hook: '…one or two engaging sentences…',
      build: '…what you will create in this section…',
      objectives: ['…', '…'],          // rendered after "By the end, you will be able to:"
      concepts: [{term: 'class', definition: '…'}, …],
      example: {
        filename: 'example.js',        // caption in the highlighted frame
        code: `…complete, correct code…`,
        walkthrough: ['…line-by-line explanation…', …],
        result: '…what the code produces…',
      },
      predict: {question: '…', answer: '…'},   // reveal-on-demand
      assignmentLink: '…optional one-liner linking to Unit 4 A.P2…',
    },
    review: {
      questions: [ /* see §2.2 */ ],
    },
  },
  …
];
```

### 2.1 Worked example rule

AGENTS.md requires the intro worked example to be **finished and correct**, and **separate from the editable starter**. This plan uses a *parallel* example (a `Potion`, `Item` or `Healer` class) rather than the exact `Wizard` code. Students see the complete principle, but they still have to transfer it themselves in the activities. Every example must parse and execute (tested in §9.1).

### 2.2 Question schema

```js
// Multiple choice
{
  id: 'S1-Q1', type: 'choice',
  prompt: '…',                    // prose, may include code
  options: [
    {id: 'a', text: '…', feedback: '…why this is wrong, as a hint…'},
    {id: 'b', text: '…', correct: true, feedback: '…why this is right…'},
    …
  ],
  revisit: 'C1.1c',               // checkpoint (or 'intro:1') to go back to
}

// Fill in the blank (one blank only; AGENTS.md: "one identifier, value, keyword or short expression")
{
  id: 'S1-Q4', type: 'blank',
  prompt: '…',
  code: `const wizard = ____ Wizard("Aster");`,   // exactly one ____ marker
  accept: ['new'],                // exact strings after trimming surrounding whitespace
  caseSensitive: true,            // default true: JavaScript is case-sensitive
  explanation: '…shown when correct…',
  hint: '…shown when incorrect…',
  revisit: 'C1.1c',
}
```

Validation rules, enforced by the tests in §9.1:
- Every section has **≥ 2 `choice` and ≥ 2 `blank`** questions.
- Every `choice` has exactly one `correct: true`, 3–4 options, and feedback on every option.
- Every `blank` `code` contains exactly one `____`, and `accept` is non-empty.
- Every `revisit` resolves to an existing checkpoint ID or `intro:N`.
- Question IDs are unique across all sections.

---

## 3. Content: section intros and review questions

The content below is a **draft ready to drop in**. The implementing agent should keep the substance and may polish wording. It must re-check each worked example by running it (§9.1). All questions assess only material that has been explained and practised in that section.

### 3.1 Section 1: Classes and objects (before C1.1a)

**Hook:** Every game character, every online shop product and every message in a chat app is an *object*: a bundle of data your program can work with. In this section you'll write the blueprint for a wizard and bring your first one to life.

**Build:** A `Wizard` class and your own named wizard object, plus a second object that proves each object keeps its own data.

**By the end, you will be able to:**
- explain the difference between a class and an object
- write a class with a `constructor` that sets a property
- use `new` to create objects from a class
- predict what happens when you change one object but not another.

**New ideas:**
- **class**: a reusable description (a blueprint or recipe) for making objects.
- **object**: one particular thing created from a class.
- **`constructor`**: a special function inside a class that runs automatically when `new` creates an object.
- **parameter**: an input a function receives, e.g. `name` in `constructor(name)`.
- **`this`**: inside the class, the particular object being created or used.
- **property (also called an attribute)**: a named piece of data stored on an object, e.g. `name`.

**Worked example:**
```js
class Potion {
  constructor(colour) {
    this.colour = colour;
  }
}

const redPotion = new Potion("red");
const bluePotion = new Potion("blue");
```
Walkthrough:
1. `class Potion { … }` describes what every potion has. No potion exists yet.
2. `new Potion("red")` creates one potion. The constructor runs, and `colour` receives `"red"`.
3. `this.colour = colour;` stores that value on *this particular* new potion.
4. The second `new` creates a separate object with its own `colour`.

Result: `redPotion.colour` is `"red"` and `bluePotion.colour` is `"blue"`. One class, two independent objects.

**Predict (reveal):** If you add `bluePotion.colour = "green";`, what is `redPotion.colour`? *Answer: still `"red"`. Changing one object doesn't change another.*

**Assignment link:** Your Unit 4 report asks you to explain *classes*. "A class is a blueprint; an object is an instance created with `new`" is exactly that kind of explanation.

**Review questions:**

| ID | Type | Prompt | Answer | Distractors / feedback notes | Revisit |
|---|---|---|---|---|---|
| S1-Q1 | choice | Which statement best describes the difference between a class and an object? | A class is a reusable description; an object is one particular thing created from it. | "They're the same thing" (no: one class can make many objects); "An object describes a class" (reversed); "A class is a variable that stores a name" (confuses class with a property). | C1.1a |
| S1-Q2 | choice | Inside `constructor(name) { this.name = name; }`, what does `this` refer to? | The new object being created. | "The `Wizard` class itself" (the class is the recipe, not the object); "The `name` parameter"; "Every wizard that has ever been created". | C1.1b |
| S1-Q3 | choice | `const wizard = new Wizard("Aster");` `const apprentice = new Wizard("Moss");` `apprentice.name = "Rowan";` What is `wizard.name` now? | `"Aster"` | `"Rowan"` (objects are independent); `"Moss"`; `undefined`. | C1.2 |
| S1-Q4 | blank | Create an object from the class: `const wizard = ____ Wizard("Aster");` | `new` | Hint: which keyword builds a fresh object from a class? | C1.1c |
| S1-Q5 | blank | `class Wizard {\n  ____(name) {\n    this.name = name;\n  }\n}` | `constructor` | Hint: this special method runs automatically when an object is created. | C1.1b |
| S1-Q6 | blank | `____ Wizard {\n}` | `class` | Case-sensitive: `Class` is wrong, and the explanation should say so. | C1.1a |

### 3.2 Section 2: Properties: defaults and your own object (before C2.1a)

**Hook:** Every wizard should start the same, in a grey cloak with an oak wand. But *your* wizard deserves to stand out. This section shows the two places a property can be set, and why the difference matters.

**Build:** Six properties (cloak colour, pattern, wand, beard, power and level), each with a class default *and* your own customisation.

**By the end, you will be able to:**
- add default properties inside a `constructor`
- customise a single object using dot notation
- explain why changing your object does not change the class default
- tell the difference between text values (strings, in quotes) and numbers (no quotes).

**New ideas:**
- **default value**: the starting value every new object gets, set with `this.` inside the constructor.
- **dot notation**: `object.property` reads or changes one property on one object.
- **assignment (`=`)**: stores a value.
- **string**: text in quotes, e.g. `"grey"`. **number**: a value like `3`, with no quotes.

**Worked example:**
```js
class Potion {
  constructor(colour) {
    this.colour = colour;
    this.size = "small";
    this.strength = 1;
  }
}

const potion = new Potion("red");
potion.size = "large";
potion.strength = 3;
```
Walkthrough:
1. Every new potion starts `"small"` with strength `1`. These are class defaults.
2. `potion.size = "large";` changes only this object.
3. `3` has no quotes because it is a number. `"large"` has quotes because it is text.

Result: `potion` is large with strength 3. A brand-new `new Potion("blue")` is still small with strength 1.

**Predict (reveal):** After these lines, what size is `new Potion("gold")`? *Answer: `"small"`. Object changes never rewrite the constructor.*

**Assignment link:** In your report, "variables, types and data" can be illustrated with exactly this: string vs number properties.

**Review questions:**

| ID | Type | Prompt | Answer | Distractors / feedback notes | Revisit |
|---|---|---|---|---|---|
| S2-Q1 | choice | You want **every new wizard** to start with an oak wand. Where does `this.wand = "oak";` go? | Inside the `constructor`. | "Below `const wizard = …`" (that customises one object, and `this` isn't the object there); "In `actions.js`"; "In the property reference panel". | C2.3a |
| S2-Q2 | choice | The constructor sets `this.wand = "oak";`. Below it you write `wizard.wand = "crystal";`. What wand does a fresh `new Wizard("Test")` get? | `"oak"` | `"crystal"` (explain: the override only changed `wizard`); `undefined`; "An error". | C2.3b |
| S2-Q3 | choice | Which line sets your wizard's level to the **number** 3? | `wizard.level = 3;` | `wizard.level = "3";` (a string, not a number); `wizard.level == 3;` (compares, doesn't assign); `this.level = 3;` below object creation (`this` is not your wizard there). | C2.6b |
| S2-Q4 | blank | Every new wizard starts with a grey cloak: `this.cloakColour = "____";` | `grey` | Accept only `grey`. Hint: the workshop uses UK spelling, so check the property reference. Explanation should note this is a workshop rule, not a JavaScript rule. | C2.1a |
| S2-Q5 | blank | Customise only your object: `wizard____cloakPattern = "stars";` | `.` | Hint: which symbol connects an object to one of its properties? | C2.2b |
| S2-Q6 | blank | Every new wizard starts at level 1: `this.____ = 1;` | `level` | Case-sensitive. | C2.6a |

### 3.3 Section 3: Methods and decisions (before C3.1a)

**Hook:** So far your wizard *has* things. Now it will *do* things: cast spells, recover health and level up. You'll also teach it to make decisions.

**Build:** `castSpell()`, `recoverHealth()` and `levelUp()` methods, with `if … else` decisions and a health cap.

**Important heads-up (supports request 4):** In this section you'll get a **second file, `actions.js`**. `character.js` is where you *describe* your wizard. `actions.js` is where you *tell it what to do*. When you switch files, your class stays safe in `character.js`, and you can click its tab at any time.

**By the end, you will be able to:**
- write a method inside a class and explain what `return` does
- call a method on an object, e.g. `wizard.castSpell();`
- use `if`, `else if` and `else` to choose what happens
- explain the difference between `=` (assign) and `===` (compare)
- update a property from its current value, e.g. `this.health = this.health + 20;`.

**New ideas:**
- **method**: a function that belongs to a class. It describes something objects of that class can do.
- **calling a method**: running it with brackets, e.g. `potion.drink();`. Defining a method does nothing until you call it.
- **`return`**: sends a result back from a method.
- **conditional (`if` / `else if` / `else`)**: runs different code depending on a true/false test.
- **`===`**: checks whether two values are equal. **`=`** stores a value. They are easy to mix up.

**Worked example:**
```js
class Potion {
  constructor(colour) {
    this.colour = colour;
    this.sips = 3;
  }

  drink() {
    if (this.sips > 0) {
      this.sips = this.sips - 1;
    }
    return this.sips;
  }
}

const potion = new Potion("red");
potion.drink();
potion.drink();
```
Walkthrough:
1. `drink()` sits **inside the class braces, after the constructor's closing brace**. That's what makes it a method of `Potion`.
2. `this.sips` means *this* potion's sips.
3. The `if` stops sips going below zero.
4. `return this.sips;` gives back how many sips are left.
5. The method only runs because of the two `potion.drink();` calls.

Result: after two calls, `potion.sips` is `1`.

**Predict (reveal):** What would `potion.sips` be after **five** calls? *Answer: `0`. The `if` stops it going negative.*

**Assignment link:** Methods and selection (`if`) are two of the constructs your report must annotate. Being able to say "this method uses selection to…" is exactly the goal.

**Review questions:**

| ID | Type | Prompt | Answer | Distractors / feedback notes | Revisit |
|---|---|---|---|---|---|
| S3-Q1 | choice | What is a method? | A function that belongs to a class and describes something its objects can do. | "A property that stores a number"; "Another name for the constructor"; "A file where you write actions". | C3.1a |
| S3-Q2 | choice | Where should `castSpell() { … }` be written in `character.js`? | Inside the `Wizard` class braces, after the constructor's closing brace. | "Inside the constructor, after `this.name = name;`" (common mistake); "After the class's final `}`"; "Below `const wizard = new Wizard(…)`". | C3.1a |
| S3-Q3 | choice | You defined `castSpell()` but pressing Run shows no spell. Why? | A method only runs when it is called, e.g. `wizard.castSpell();` in `actions.js`. | "Methods run automatically"; "`return` is missing a semicolon"; "The class needs renaming". | C3.1b |
| S3-Q4 | choice | Which condition correctly checks whether the power is ice? | `if (this.specialPower === "ice")` | `if (this.specialPower = "ice")` (assigns); `if (specialPower === "ice")` (missing `this.`); `if (this.specialPower === ice)` (no quotes, so JavaScript looks for a variable called `ice`). | C3.2b |
| S3-Q5 | choice | With the cap in place, a wizard at health 95 (max 100) calls `recoverHealth()`. What is its health now? | `100` | `115` (ignores cap); `95`; `120`. | C3.3c |
| S3-Q6 | blank | `castSpell() {\n  ____ this.specialPower;\n}` | `return` | Hint: which keyword sends a result back from a method? | C3.1a |
| S3-Q7 | blank | In `actions.js`, call the spell method: `wizard.____();` | `castSpell` | Case-sensitive. Explanation: `castspell` would not match. | C3.1b |
| S3-Q8 | blank | Recover 20 health: `this.health = this.health ____ 20;` | `+` | | C3.3b |
| S3-Q9 | blank | Only level up below 20: `if (this.level ____ 20) {\n  this.level = this.level + 1;\n}` | `<` (also accept `!==`) | Explanation: `<` is clearest. `!==` also works because levels only ever go up by 1. This shows students that equivalent answers are valid. | C3.4a |

### 3.4 Section 4: Inheritance: sharing code (before C4.1)

**Hook:** A goblin arrives and needs a name, health and levels, just like your wizard. Copying and pasting would work… until you find a bug and have to fix it in two places. Inheritance lets classes *share* code.

**Build:** A `Character` parent class that `Wizard` and `Goblin` both extend, plus a shared `takeDamage()` method.

**By the end, you will be able to:**
- spot duplicated properties and methods in two classes
- create a parent class and use `extends` to inherit from it
- call the parent constructor with `super(…)`
- explain why removing duplication makes code easier to maintain.

**New ideas:**
- **duplication**: the same code copied in more than one place.
- **parent class (superclass)** and **child class (subclass)**.
- **`extends`**: makes one class inherit the properties and methods of another.
- **`super(…)`**: calls the parent's constructor. It must come before `this` in the child's constructor.
- **inheritance**: a child class automatically gets the parent's methods.

**Worked example:**
```js
class Item {
  constructor(name, weight) {
    this.name = name;
    this.weight = weight;
  }

  describe() {
    return this.name + " weighs " + this.weight;
  }
}

class Potion extends Item {
  constructor(name) {
    super(name, 1);
    this.colour = "red";
  }
}

const potion = new Potion("Healing draught");
potion.describe();
```
Walkthrough:
1. `Item` holds what every item shares.
2. `Potion extends Item` means a potion *is an* item.
3. `super(name, 1)` runs `Item`'s constructor and sets `name` and `weight`.
4. `Potion` has no `describe()` of its own, but it inherits one.

Result: `potion.describe()` returns `"Healing draught weighs 1"`.

**Predict (reveal):** Does `Potion` need its own copy of `describe()`? *Answer: no. It inherits it from `Item`.*

**Assignment link:** Your report asks you to evaluate *maintainability*. Inheritance, which lets you fix a bug once instead of twice, is a concrete example you can use.

**Review questions:**

| ID | Type | Prompt | Answer | Distractors / feedback notes | Revisit |
|---|---|---|---|---|---|
| S4-Q1 | choice | Why did we create a `Character` class? | To write shared properties and methods once, so `Wizard` and `Goblin` can both reuse them. | "To make the program run faster"; "Because JavaScript requires every class to have a parent"; "To replace the `Wizard` class". | C4.1 |
| S4-Q2 | choice | What does `super(name, 100)` do inside `Wizard`'s constructor? | It calls `Character`'s constructor, passing `name` and `100` for `maxHealth`. | "Creates a second wizard"; "Sets health to super strength"; "Copies every method into `Wizard`". | C4.3a |
| S4-Q3 | choice | You removed `recoverHealth()` from `Wizard`, yet `wizard.recoverHealth()` still works. Why? | `Wizard` extends `Character`, so it inherits the method. | "The browser remembered the old code"; "`actions.js` defines it"; "It doesn't work, so it must be an error". | C4.3c |
| S4-Q4 | choice | Which member belongs **only** in `Wizard`, not in `Character`? | `castSpell()` | `takeDamage()`, `levelUp()`, `health` (all shared). | C4.3c |
| S4-Q5 | blank | `class Goblin ____ Character {` | `extends` | | C4.4 |
| S4-Q6 | blank | Inside Goblin's constructor: `____(name, 60);` | `super` | Hint: this keyword calls the parent class's constructor. | C4.4 |
| S4-Q7 | blank | Stop health going below zero: `this.health = Math.max(____, this.health - amount);` | `0` | | C4.5 |

### 3.5 Section 5: Objects working together (before C5.1a)

**Hook:** Real programs are full of objects talking to each other: a basket updating a price, a player hitting an enemy. Now your wizard's spell will actually *reach* the goblin.

**Build:** A `castSpell(target)` method that damages another object, a goblin that fights back, and a battle script you design.

**By the end, you will be able to:**
- pass an object into a method as an argument
- call a method on that object from inside another method
- calculate and predict the result of a sequence of actions
- explain the difference between passing an object (`goblin`) and passing text (`"goblin"`).

**New ideas:**
- **argument**: the value you pass into a method call, e.g. `goblin` in `wizard.castSpell(goblin)`.
- **target parameter**: the name the method uses for the object it receives.
- **sequence**: actions run one after another, top to bottom.

**Worked example:**
```js
class Patient {
  constructor(name) {
    this.name = name;
    this.health = 40;
  }

  receiveHealing(amount) {
    this.health = this.health + amount;
  }
}

class Healer {
  constructor(name) {
    this.name = name;
    this.power = 15;
  }

  heal(target) {
    target.receiveHealing(this.power);
  }
}

const healer = new Healer("Wren");
const patient = new Patient("Pip");
healer.heal(patient);
```
Walkthrough:
1. `heal(target)` receives an object. Here, `target` *is* `patient`.
2. `target.receiveHealing(this.power)` asks that object to change its own health.
3. `patient` has no quotes because we pass the object itself, not the word "patient".

Result: `patient.health` goes from 40 to 55.

**Predict (reveal):** What is `patient.health` after calling `healer.heal(patient);` twice? *Answer: `70`.*

**Assignment link:** This is object *interaction*, a key feature of the object-oriented paradigm you'll compare with procedural code in your report.

**Review questions:**

| ID | Type | Prompt | Answer | Distractors / feedback notes | Revisit |
|---|---|---|---|---|---|
| S5-Q1 | choice | When you run `wizard.castSpell(goblin);`, what is `target` inside `castSpell`? | The `goblin` object. | "The text `"goblin"`"; "The wizard"; "The `Goblin` class". | C5.1b |
| S5-Q2 | choice | Why is `wizard.castSpell("goblin");` wrong? | It passes text, not the goblin object. Text has no `takeDamage` method. | "It needs single quotes"; "Nothing is wrong"; "`castSpell` can't take arguments". | C5.1b |
| S5-Q3 | choice | A level-3 fire wizard hits a full-health goblin (60). Fire damage is `12 + level × 2`. What is the goblin's health afterwards? | `42` | `48` (level ignored); `54` (level added once, not ×2); `18` (the damage itself, not remaining health). | C5.1a |
| S5-Q4 | choice | You press Run twice without editing. Does the goblin's health keep falling? | No. Each Run rebuilds fresh objects from your code. | "Yes, damage adds up across runs"; "Only if you refresh the page"; "Only for the goblin". | C5.3 |
| S5-Q5 | blank | Inside `castSpell(target)`: `target.____(damage);` | `takeDamage` | | C5.1a |
| S5-Q6 | blank | The goblin hits back: `goblin.attack(____);` | `wizard` | Hint: pass the object being attacked, with no quotes. | C5.2 |
| S5-Q7 | blank | Ice damage: `damage = 10 + this.____ * 2;` | `level` | | C5.1a |

> Before implementing, the implementer should double-check S5-Q3 against the real `battleSpell` in `checkpoints.js`: `12 + 3 × 2 = 18`, and `60 − 18 = 42`. The C5.3 reference ("goblin 42 health") agrees.

---

## 4. State and persistence changes (`src/state/store.js`)

Add optional fields. **Do not change `STORAGE_KEY` or `curriculumVersion`.**

```js
// emptyState() additions
currentScreen: {type: 'intro', chapter: 1},   // 'intro' | 'checkpoint' | 'review'
seenIntroChapters: [],                         // e.g. [1, 2]
reviewByChapter: {},                           // { '1': { answers: { 'S1-Q1': {response: 'b'} }, submitted: ['S1-Q1'] } }
```

Rules:
1. **Brand-new learners** start on `intro:1`.
2. **Existing v1 saves** with no `currentScreen` load as `{type: 'checkpoint'}`, so returning students are not thrown back to an intro.
3. In `parseImport`:
   - `currentScreen` is accepted only if `type` is one of the three values, and `chapter` is 1–5 for intro/review. Otherwise fall back to `{type:'checkpoint'}`.
   - `reviewByChapter` keeps only known chapters and **known question IDs** (look them up from `sections`). Each `response` must be a string of **≤ 200 characters**, or a known option ID for choice questions.
   - **Do not trust stored correctness.** Store only responses. Recompute correctness with `checkAnswer()` when rendering. This matches the existing principle that "imported achievements are untrusted".
4. Review answers are stored separately from code drafts (AGENTS.md requirement).
5. Size: review data is tiny, but the existing 2 MB and 10 MB caps already bound it.

---

## 5. Answer checking (`src/review/checkAnswer.js`)

A pure, synchronous function with no DOM and no evaluation:

```js
export function checkAnswer(question, response) {
  if (question.type === 'choice') {
    const option = question.options.find(o => o.id === response);
    return {correct: !!option?.correct, feedback: option?.feedback ?? 'Choose an answer first.'};
  }
  // blank
  const given = String(response ?? '').trim();          // tolerate surrounding whitespace
  const norm = s => question.caseSensitive === false ? s.toLowerCase() : s;
  const correct = question.accept.some(a => norm(a) === norm(given));
  return {correct, feedback: correct ? question.explanation : question.hint};
}
```

- **Never** pass the learner's blank text to `eval`, `Function`, the runner or `innerHTML`.
- Keep internal whitespace significant (`this.level` ≠ `this . level`). `accept` lists handle intentional alternatives explicitly.

---

## 6. UI changes (`src/main.js`, `src/review/renderSection.js`, `src/styles.css`)

### 6.1 Screen switching

- Add a sibling to `<main>`: `<section id="section-screen" class="section-screen" tabindex="-1" hidden aria-labelledby="section-title">`.
- `showScreen()` chooses between:
  - `checkpoint` → current behaviour (`main` visible, `#section-screen` hidden)
  - `intro` / `review` → hide `main`, render into `#section-screen`, and move focus to its `<h1>`.
- Leaving a checkpoint must call the existing `invalidate()` so runs, animations and confetti are cancelled.
- Hide `#view-switch` (the mobile preview toggle) and `.jump` while a section screen is shown.

### 6.2 Intro screen layout (render order)

1. Eyebrow: `SECTION 3 OF 5`, followed by an `<h1>` with the section title.
2. Hook paragraph, then "What you'll build".
3. "By the end, you will be able to:" as a `<ul>`.
4. "New ideas": a `<dl>` of term/definition pairs.
5. "See it working": the pre-rendered, highlighted example (Expressive Code frame captioned `example.js`), an ordered walkthrough list, and a "Result" line.
6. "Predict": a `<details><summary>Make your prediction, then reveal the answer</summary>…`.
7. Optional "Assignment link" note, styled like `#starter-note` (muted).
8. Controls: `[← Back]` and a primary `[Start section 3 →]` (or `Continue section 3 →` if any checkpoint in the chapter is completed).
9. Mark the chapter in `seenIntroChapters` when the screen is shown. Intros must stay revisitable.

### 6.3 Review screen layout

1. Eyebrow `SECTION 3 REVIEW`, then an `<h1>` such as "Check your understanding: Methods and decisions".
2. An intro line: *"No time limit and no penalties. Try each question, read the feedback and have another go if you need to."*
3. One card per question (`<section class="question">`):
   - **Choice:** `<fieldset><legend>{prompt}</legend>` with radio inputs, each with a `<label>`, then a `[Check answer]` button.
   - **Blank:** prompt text, then the highlighted code block with an inline `<input type="text" class="blank-input" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Fill in the blank: {code with ____}">`, then `[Check answer]`. Pressing Enter in the input checks the answer (use `preventDefault`, not a form submit).
   - Feedback area, `role="status"`, which **starts with a word, not just a colour or icon**: "✓ Correct: …" or "Not quite: …". Use the existing success and error tokens (`success-surface`/`success-border`, `error-surface`/`error-border`).
   - When incorrect, show a `[Revisit {checkpoint id · title}]` button that navigates to that checkpoint (`navigate(id, false)`). The learner's draft is preserved as usual.
   - After 2 incorrect attempts, offer `[Show answer]`. It is non-punitive and not scored differently.
4. A summary at the bottom, e.g. "You've answered 7 of 9 correctly. Nice work." Do **not** gate progress on a perfect score. `[Continue to section 4 →]` is always enabled. On the last section, `[Finish course]` shows the existing "✦ Course complete" state.

### 6.4 Rendering an inline blank inside highlighted code

Expressive Code renders `____` as ordinary text inside a token span. At runtime:
1. Insert the pre-rendered HTML (trusted, built at build time, like existing lesson HTML).
2. Walk its text nodes with a `TreeWalker` and find the one containing `____`.
3. Split that text node and insert the `<input>` element via the DOM, **not** by string concatenation into `innerHTML`.
4. Throw in development if the count of `____` is not exactly 1. The unit tests also check this.

### 6.5 Build-time rendering (`scripts/lesson-highlighting.mjs`)

- Add `virtual:section-content` to the `ids` list. Its export is keyed by section ID, containing pre-rendered HTML for every prose field. Use `prose()` for text, and `highlight(code, false, 'example.js')` for the example code and for each blank's `code` (render blank code without a filename caption).
- Choice option text goes through `prose()`, because options contain inline code.
- Import `sections` from `../src/curriculum/sections.js`. Vite restarts when the config's imports change, as it already does for `checkpoints.js`. Verify this in dev mode.

### 6.6 Course bar navigation (`#checkpoint` select)

- Rebuild the options from the journey, grouped by `<optgroup label="Section 3 · Methods and decisions">`:
  - `Section 3 · Introduction` (value `intro:3`)
  - each checkpoint (value = checkpoint ID, **unchanged**, because tests select by ID)
  - `Section 3 · Review quiz` (value `review:3`)
- Keep the existing `aria-label`.
- `#progress` keeps reading `N / 41 completed` for checkpoints. Optionally append ` · Reviews 2/5`.
- The lesson card eyebrow changes from `CHAPTER 3 / C3.1a` to `SECTION 3 · METHODS AND DECISIONS / C3.1a`.

### 6.7 Next and Previous behaviour

| From | Next goes to | Previous goes to |
|---|---|---|
| Intro N | first checkpoint of N (`navigate(id, true)`, so sequential starters still carry forward) | Review N−1 (nothing for N=1) |
| Checkpoint (not last in chapter) | next checkpoint (unchanged) | previous checkpoint, or Intro N for the first checkpoint |
| Last checkpoint of chapter N | Review N | previous checkpoint |
| Review N | Intro N+1, or course-complete for N=5 | last checkpoint of N |

- Next on a checkpoint still requires a verified run (`verifiedRevision===draft().revision`). Keep this.
- **C5.4 is currently the last index**, so `#next` is disabled there. Change this so a verified C5.4 run enables Next to Review 5.
- **Sequential starter carry-over:** `initialise()` looks at `checkpoints[current.index-1]`. Because intros are not checkpoints, `navigate(firstIdOfChapter, true)` still finds the previous chapter's last checkpoint. No change is needed, but add an e2e assertion (§9.3).

---

## 7. Request 3: C3.1a, "A method belongs to a class"

### 7.0 Problem

The current step instruction is one sentence plus a bare snippet with no surrounding context: *"Inside `Wizard`, after the `constructor` closing brace, add: …"*. At this point the constructor contains around nine lines, and the file has two closing braces close together plus several override lines below the class. Beginners commonly:
- put the method **inside** the constructor (after the last `this.… = …;`)
- put it **after the class's final `}`**
- put it **below `const wizard = …`** with the other object lines.

The instructions `<details>` also starts collapsed, and the custom hints are overwritten by the generic method hints.

### 7.1 Changes in `src/curriculum/checkpoints.js`

1. Replace the `instructions` for C3.1a with a stepped location walkthrough (keep the backtick prose convention):

   ```js
   instructions: [
     'A method — a function that belongs to a class — describes something your wizard can do. It must live **inside** the `Wizard` class.',
     'Find the end of the `constructor`: scroll to your last `this.… = …;` line. The very next line is a lone `}` indented by two spaces. That brace closes the `constructor`.',
     'Put your cursor at the end of that `}` line and press Enter to make a new blank line. You are now after the `constructor`, but still inside the class.',
     'Type the method on the new line: `castSpell() {\n  return this.specialPower;\n}`',
     'When you have finished, your code should have this shape. The `...` stands for your existing properties, which you should not change: `class Wizard {\n  constructor(name) {\n    this.name = name;\n    // ... your other this.… lines stay here ...\n  }\n\n  castSpell() {\n    return this.specialPower;\n  }\n}\n\nconst wizard = new Wizard("Aster");\n// ... your wizard.… customisation lines stay here ...`',
     'Check: `castSpell` is NOT inside the `constructor` braces, NOT after the class’s final `}`, and NOT below `const wizard = …`.',
     'Stuck? Choose **Find insertion point** below. The cursor jumps to exactly the right place.',
   ],
   ```
   *Note:* the prose renderer does not support `**bold**`. Either drop the asterisks, or add minimal `<strong>` support in `prose()`, applied to the escaped (non-code) parts only.

2. Move the sentence "`actions.js` is now available…" **out of** C3.1a. It belongs in the section 3 intro and in C3.1b (request 4). Mixing it in here distracts from the placement task.

3. Add a per-checkpoint flag `openInstructions: true` to C3.1a (and C3.1b). In `showLesson()`, set `$('#instructions').open = !!current.openInstructions;` instead of always `false`.

4. **Custom hints:** add `customHints: true` support. In the post-processing loop, skip the `if(c.field)…else if(c.method)…` overwrite when `c.customHints` is set. Then give C3.1a:
   ```js
   hints: [
     'A method is a function that belongs to a class, so it must be written between the class’s opening `{` and its final `}`. `this` means the object the method is called on.',
     'The `constructor` ends with a `}` indented by two spaces. Add `castSpell() { … }` on a new line after it and before the class’s last `}`. Try Find insertion point.',
     'Compare your file with this complete worked example. Notice the blank line between the constructor and the method.',
   ],
   customHints: true,
   ```
   `tests/curriculum.test.js` requires `hints` length 3. Keep exactly three.

5. **Optional, recommended:** add a clearer diagnostic for the most common mistake. When `character.js` fails to parse **and** the text `castSpell()` appears after the constructor's `this.` lines, but before the constructor's `}`, append the hint *"It looks like `castSpell` might be inside the `constructor`. Move it below the constructor’s closing `}`."* Implement this as a hint string in `parse.js`'s syntax diagnostic path, only for C3.1a. It must not affect other checkpoints' messages. If this proves fiddly, skip it and record it in the summary.

6. Check that the "Find insertion point" button still lands on the correct line for the current starter. It uses `cls.body.end-1`, just before the class's closing brace. Add an e2e assertion (§9.3).

---

## 8. Request 4: C3.1b, "Call the method" (new file)

### 8.0 Problem

On Next from C3.1a, `navigate()` sets `activeFile = 'actions.js'`. That file is empty (`actionsSource: ''`), so the student sees a blank editor and may think their work is gone. The only cue is a small tab change and an instruction hidden inside a collapsed `<details>`.

### 8.1 Changes

1. **Visible file-switch notice** (not inside the collapsed instructions). Add a checkpoint field `fileNotice` to C3.1b:
   ```js
   fileNotice: {
     title: 'New file: actions.js',
     body: 'You are now working in a second file, `actions.js`. It starts empty on purpose. Your `Wizard` class and all your earlier work are safe in `character.js`, so nothing has been lost. `character.js` describes your wizard; `actions.js` tells it what to do.',
     button: 'Show my character.js',
   },
   ```
   Render it in `.lesson-card`, directly below `#objective`, as `<aside class="file-notice" role="note">`. Give it a heading and body (via `prose()`, so it gets inline code highlighting) and a button that calls `showFile('character.js')`.
   - When `character.js` is showing, the button changes to **"Back to actions.js"**. This is optional, but it helps.
   - Style it with the existing `info`/`info-border` tokens (or `hint`/`hint-border`). No new colours.
   - Show it on C3.1b only.

2. **Tab badge.** On C3.1b, add a visible `NEW` label inside the `actions.js` tab button, e.g. `<span class="tab-badge">NEW</span>`. The tab's accessible name must still contain `actions.js`, because tests use `getByRole('tab',{name:'actions.js',exact:true})`. Two ways to handle this:
   - (a) add the badge with `aria-hidden="true"` and keep the name exact, or
   - (b) update the tests to non-exact matching.
   **Prefer (a).**
   - Optional: a one-off gentle pulse on the tab, disabled when `state.preferences.reduceMotion` or `prefers-reduced-motion` is set.

3. **Starter comment in `actions.js`.** The empty file is the scary part. `initialise()` seeds C3.1b from **C3.1a's last successful source**, whose `actionsSource` is `''`, so changing `starter` alone will **not** work for learners arriving sequentially. Do both:
   - set C3.1b's `starter.actionsSource` to the comment below, and
   - in `initialise()`, add `if (id === 'C3.1b' && !source.actionsSource.trim()) source.actionsSource = ACTIONS_WELCOME;`.

   ```js
   // actions.js: this file is for CALLING methods.
   // Your Wizard class is safe in character.js (click its tab to check).
   // character.js runs first, then this file runs from top to bottom.
   // Write your method call on the line below:

   ```
   Check that `parse.js` accepts a comment-only `actions.js` (comments are not AST nodes, so it should). Also check that C3.1b's `starterExpected` (`validButIncomplete`) still holds. The starter test in `curriculum.test.js` covers this.

4. **Rewrite C3.1b instructions:**
   ```js
   instructions: [
     'You have moved to a new file: `actions.js`. Your class has not gone anywhere. Click the `character.js` tab any time to see it.',
     '`character.js` runs first and sets up your objects. Then `actions.js` runs from top to bottom and calls their methods.',
     'Below the comments in `actions.js`, type: `wizard.castSpell();`',
     'The brackets `()` mean "run this method now". The workshop draws the spell from your method’s `return` value, so you don’t need any drawing code.',
   ],
   openInstructions: true,
   ```

5. **Result message reassurance.** On a successful C3.1b run, the result currently shows `expectedVisibleResult`. Keep it, and optionally append " Both files work together: `character.js` defined the method, `actions.js` called it."

6. **Section 3 intro** already foreshadows the second file (§3.3), which is the first line of defence.

7. **Other `actions.js` checkpoints** (C3.4b, C3.5, C5.1b, C5.3, C5.4) also open on `actions.js`, but by then the pattern is familiar. Optionally show a one-line muted reminder in the editor tab bar, where `#dirty` currently sits: "Your class is in character.js". Low priority.

---

## 9. Testing plan

Run everything. Never report a check as passed unless it was actually run (AGENTS.md).

### 9.1 New unit tests (`tests/sections.test.js`)

- There are 5 sections, with chapters 1–5 in order and unique IDs.
- Each section has a non-empty title, objectives, concepts, example code, walkthrough and predict fields.
- **Every worked example is correct:** parse it with Acorn (ES2022), then execute it in a *plain* QuickJS context (`getQuickJS().newContext()`, **not** `runProgram`, because the workshop validator rejects non-Wizard classes). Assert the documented result, e.g. `potion.sips === 1`, `patient.health === 55` and `potion.describe() === "Healing draught weighs 1"`. Store the expected-result expression alongside each example (e.g. `example.check: 'potion.sips === 1'`), used by tests only.
- Question rules from §2.2: counts per type, exactly one correct option, exactly one `____`, non-empty `accept`, valid `revisit`, and globally unique IDs.
- Every prose string has balanced backticks. The build already throws on this, but a test gives a clearer failure.

### 9.2 Unit tests for checking and state

- `tests/review.test.js`: `checkAnswer` trims whitespace, is case-sensitive by default, accepts alternatives (`<` and `!==`), rejects an empty response, and returns feedback for choice questions.
- `tests/progress.test.js`, added cases:
  - a v1 save **without** new fields loads, with `currentScreen.type === 'checkpoint'`
  - a fresh `emptyState()` starts on `intro:1`
  - `reviewByChapter` round-trips through save and load
  - `parseImport` drops unknown question IDs, oversized responses and invalid screens
  - stored `correct` flags (if present) are ignored.
- `tests/curriculum.test.js` must still pass unchanged. It covers C3.1a/C3.1b hint counts and starter states after the edits.

### 9.3 Playwright (`tests/workshop.spec.js`)

- **Update existing tests** that assume a fresh load lands on C1.1a. Either add a helper `startCourse(page)` that clicks "Start section 1", or have them select `C1.1a` in the course bar first (`putSolution` already selects by ID, so tests using it are fine). Check the confetti, keyboard-only and journey tests.
- New journey test: fresh load → intro 1 visible, focus on the heading → Start → C1.1a. Complete C1.2 → Next → Review 1. Answer one wrong (feedback text begins "Not quite", Revisit button present) and one right ("✓ Correct"). Continue → intro 2. Reload → the same screen and review answers are restored.
- Keyboard-only review: Tab to a radio group, use the arrow keys, press Enter on Check, and type in a blank then press Enter to check.
- **C3.1a:** the instructions are open by default and contain the context snippet. "Find insertion point" places the cursor on a line inside the class after the constructor. Assert that the editor's line text at the cursor is inside the class, e.g. the next non-empty line is `}` at column 0.
- **C3.1b:** after navigating from C3.1a with Next, the `.file-notice` is visible and contains "actions.js" and "safe". The `actions.js` editor contains the welcome comment. Clicking "Show my character.js" shows the tab with the learner's `castSpell` code intact. The tab accessible name is still exactly `actions.js`.
- Sequential carry-over across a section boundary: complete C1.2 → review → intro 2 → Start. C2.1a's starter derives from C1.2's success (existing apprentice-removal logic).
- Layout: the intro and review screens at 1366, 768 and 390 widths have no horizontal scroll (reuse the existing `scrollWidth<=innerWidth` check), plus a 200% zoom check.

### 9.4 Manual checks (AGENTS.md "Verification and completion" items 1–8)

Walk every intro and review with a keyboard only and with reduced motion on. Also do a quick screen-reader pass (VoiceOver or NVDA) on one review screen to confirm that feedback is announced. Record what was *actually* checked in `VERIFICATION.md`.

### 9.5 Commands

```sh
npm test
npm run build && npm run preview     # verify virtual:section-content in production too
npm run test:e2e
WORKSHOP_PREVIEW=1 npm run test:e2e
```

---

## 10. Documentation updates

- `README.md`: mention section intros and reviews in "Use it". Also mention the new saved fields in "Saving and privacy".
- `TEACHER_GUIDE.md`: add a short "Section introductions and reviews" section: how to jump to them via the course bar, that quizzes are formative and ungated, and where to edit questions (`src/curriculum/sections.js`).
- `scripts/generate-docs.mjs`: append a "Section review answers" part to `SOLUTIONS.md`, listing each question, its accepted answers and explanations. Teachers need an answer key. Regenerate the file.
- `AGENTS.md`: update the structure table to mention `src/review/` and `sections.js`.

---

## 11. Suggested implementation order (small, testable commits)

1. `sections.js` data + `tests/sections.test.js` (content and example correctness first).
2. `checkAnswer.js` + `tests/review.test.js`.
3. Store changes + progress tests.
4. Vite plugin: `virtual:section-content`.
5. `journey.js` + navigation and course bar changes in `main.js`.
6. Intro screen rendering and styles.
7. Review screen rendering, inline blanks and styles.
8. C3.1a changes (request 3).
9. C3.1b changes (request 4).
10. Playwright updates and new journeys. Run the full suite plus build/preview.
11. Docs, `SOLUTIONS.md` regeneration, `VERIFICATION.md` record.

---

## 12. Out of scope / flagged for the teacher

- **Module introduction screen:** AGENTS.md also asks for a whole-module intro before section 1, and a module recap at the end. Neither was requested here. The Section 1 intro could double as the module intro, or a separate screen can be added later using the same renderer. **Ask the teacher before adding it.**
- **Scoring/gating:** reviews are deliberately ungated and unscored beyond a friendly tally, per AGENTS.md. If the teacher wants a minimum score before continuing, that is a separate decision.
- **Content wording:** the intro and question text in §3 is a first draft. The teacher may want to review it for their class before it ships.
