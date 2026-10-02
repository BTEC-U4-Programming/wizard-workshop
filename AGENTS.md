# Guidance for AI agents

## Scope and project context

This file applies to this project directory and its descendants. Preserve unrelated teaching materials when working on the application.

The project is an interactive programming learning application for BTEC students aged 16–17. The Wizard Warrior Object-Oriented Programming module is the reference teaching experience: students create and customise JavaScript wizard objects, add methods, introduce inheritance and script interactions with a goblin.

Read [WIZARD_OOP_IMPLEMENTATION_BRIEF.md](WIZARD_OOP_IMPLEMENTATION_BRIEF.md) before changing the OOP module. It contains detailed learning checkpoints, domain rules, worked code, execution requirements and acceptance criteria. The brief uses the earlier working title **Wizard Workshop**; do not rename existing application labels or identifiers merely to reconcile the two names.

**Workspace verification, 27 September 2026:** this directory is the application root and contains `package.json`, `vite.config.js`, `src/`, tests and a README. The implementation brief is not present in this checkout; obtain the referenced brief before work that requires it. Inspect the actual source, README, package scripts and any more specific `AGENTS.md` before editing. This source inspection does not establish that build or browser checks have passed.

Read [DESIGN.md](DESIGN.md) before changing application styling. It documents the current colours, typography, layout, components, responsive behaviour and motion, with links to their source files. Any PowerPoint design guidance or numbered course-resource folders outside this application remain separate teaching resources; do not reorganise or overwrite them as part of routine application work.

## Audience and instructional language

- Write for BTEC students aged 16–17 who are new to programming and may lack confidence.
- Make instructions and explanations beginner-friendly, engaging and thought-provoking. Use UK English, short sentences and concrete examples without sounding childish.
- Define unfamiliar terms before relying on them. Introduce “property (also called an attribute)” and “method — a function that belongs to a class”.
- Explain what code does and why it is useful. Ask learners to predict outcomes, compare examples and explain small changes.
- Teach one main idea at a time. Avoid unexplained syntax, large code dumps and tasks requiring concepts not yet introduced.
- Progress from a worked example to fill-in-the-gap work, then partial prompts and independent application. Repeat this progression when introducing a new concept.
- Give supportive, actionable feedback. Errors are opportunities to debug, not reasons to shame learners or remove progress. Hints and retries carry no penalty.
- Keep explanations technically accurate. For example, supported cloak colours are application rules, not restrictions imposed by JavaScript itself.

## Required learning-module structure

Here, a **learning module** is a unit of teaching content; a **JavaScript module** is an implementation file. Keep these meanings distinct in documentation.

Every learning module must be divided into clearly named sections, following the section-based approach of the Wizard Warrior OOP module. Apply these requirements to new modules and to existing sections being revised.

### Module introduction

Every module must begin with a dedicated introductory screen before its first activity. Include:

- A short, engaging explanation of the topic and what students will create or investigate.
- Clear learning objectives phrased as “By the end, you will be able to …”.
- Any prerequisite knowledge, with brief reminders or links where appropriate.
- A simple overview of the sections and an obvious Start/Continue control.

Do not treat a title banner or an unexplained list of activities as the introductory screen. Make the introduction available to revisit.

Keep the first view brief. State what students will make, show a small set of clear objectives and a short route through the sections. Put extended course notes behind labelled disclosures so learners can start without reading a wall of text.

### Section introduction and worked example

Every section must begin with an introduction to the principle being taught, followed by a simple, **finished and correct code example**. Present this before asking students to complete or write code.

- Explain the principle's purpose in plain language.
- Show the complete example with syntax highlighting and readable formatting.
- Explain the important lines and show or describe the expected result.
- Include a brief prediction or reflection prompt where useful.
- Keep the worked example separate from the editable starter so students can refer back to it without losing their work.

**Introduction screen text budget:** Make the default view quick to scan. Use one short opening sentence, one short statement of what students will make, no more than three objectives, one compact key-idea explanation, the complete example and its expected result. Define essential terms in the key idea before they appear in the example. Keep the full line-by-line explanation, prerequisite reminder, glossary, prediction and assignment link available in clearly labelled disclosures. Do not repeat the same explanation across the opening, objectives, glossary and walkthrough. Review the screen at classroom laptop and phone widths before adding more visible text. Apply this pattern to future modules and sections.

For example, a section introducing class constructors should explain that the constructor runs when `new` creates an object and sets its starting properties, accompanied by a complete example:

```javascript
class Wizard {
  constructor(name) {
    this.name = name;
  }
}

const wizard = new Wizard("Aster");
```

Explain that `name` receives `"Aster"`, `this.name` belongs to the new object, and `wizard.name` is now `"Aster"`. A blank constructor or a fragment containing gaps does not satisfy the introductory worked-example requirement.

### Section activities

After the introduction, provide progressively supported practice. Each activity needs a clear task, the relevant allowed choices or constraints, optional hints and an observable success condition. Preserve draft code and allow students to revisit explanations. A finished introductory example complements the exercise; it does not replace the learner's own practice.

### Section review

Every section must finish with a series of review questions containing **both multiple-choice and fill-in-the-blank questions**. A single reflection prompt or a success badge does not replace this review.

- Default to at least two questions of each type, adjusting the length where the section warrants it while retaining both types.
- Assess only material already explained and practised in that section. Cover understanding as well as recognising syntax.
- Give multiple-choice questions one unambiguous correct answer unless explicitly labelled as multiple-select. Use plausible alternatives based on common misconceptions; avoid trick wording.
- Keep blanks focused on one identifier, value, keyword or short expression. Define accepted answers explicitly and tolerate irrelevant surrounding whitespace. Preserve case sensitivity where JavaScript requires it.
- Explain why an answer is correct and give a useful hint for an incorrect answer. Allow retry and a return to the relevant explanation.
- Do not execute arbitrary text entered in a review blank. Use explicit answer rules or the existing isolated code-validation path when evaluating code is genuinely necessary.
- Support keyboard use, labelled inputs and feedback that does not rely on colour alone.
- Store review progress separately from code drafts. Do not silently introduce punitive scoring or a perfect-score progression gate.

The normal flow is: **module introduction → section introduction and worked example → supported practice → independent application → section review → next section → module recap**.

These module introductions and section reviews extend the earlier implementation brief. Do not omit them because the brief focuses on coding checkpoints.

## General application architecture

The implemented stack is semantic HTML, CSS and vanilla JavaScript ES modules served by Vite. Avoid introducing a framework, backend, account system or external AI dependency without a concrete requirement. Preserve its established architecture unless the requested change warrants a migration.

Keep responsibilities separate:

| Area | Responsibility |
|---|---|
| Application entry and UI | Route the library and tomes in `src/main.js`; render and navigate each tome in `src/oop/app.js` and `src/edp/app.js`, with accessible feedback. |
| Curriculum/content | Tome I in `src/curriculum/`, Tome II in `src/edp/curriculum/`: introductions, objectives, worked examples, activities, reviews, hints and solutions with stable identifiers. |
| Editor | CodeMirror 6 setup, per-document editor state, highlighting, diagnostics and keyboard behaviour. |
| Validation | Acorn-based parsing and structural checks, allowed values, checkpoint objectives and behavioural tests. |
| Runner | Execute learner code inside QuickJS in a Web Worker, with bounded execution and mapped errors. Tome II supplies a simulated DOM, virtual timers and seeded PRNG inside the guest, never the real host DOM or timers. |
| Game/preview | Render pixel-art characters and animations from validated state and action traces. |
| State/persistence | Independent tome saves: navigation, drafts, successful results, completion, reviews, activities, preferences and save/export/import. Shared links use `src/shared/moduleShell.js`. |
| Tests | Curriculum fixtures, validation and runner behaviour, progress persistence and browser journeys. |

The implementation has `src/editor/`, `src/curriculum/` (including `sections.js`), `src/review/`, `src/validation/`, `src/runner/`, `src/game/` and `src/state/`. The router lives in `src/main.js`; Tome I UI markup and navigation live in `src/oop/app.js`, and Tome II in `src/edp/app.js`. Tome II curriculum, state, runtime and stage boundaries are inside `src/edp/`. Shared review rendering uses module descriptors. Styling lives in `src/theme.css` and `src/styles.css`; there is no `src/ui/` directory. Prefer these actual boundaries when extending the application.

Keep teaching content out of rendering and execution logic. Add module/section metadata and reusable review rendering rather than duplicating whole screens for each subject. Preserve stable content IDs so edits do not break saved progress; version or migrate saved data when schemas change.

For the OOP module, keep class defaults distinct from properties on an individual object. Learner classes and methods must actually execute; do not infer success or animations from matching keywords in source. Student-facing `character.js` and `actions.js` are virtual editor documents, distinct from application source files.

## Build and development commands

Run commands from this **application directory containing `package.json`**. Check the actual scripts with `npm run` first. The following scripts are configured; see `README.md` for the workstation npm-launcher workaround and `VERIFICATION.md` for run records:

| Command | Purpose |
|---|---|
| `npm ci` | Install the versions recorded in `package-lock.json`. Requires an existing, matching lockfile. |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Generate the production build. |
| `npm run preview` | Serve the production build locally after building. |
| `npm run test` | Run Vitest once (`vitest run`). |
| `npm run test:e2e` | Run the configured browser workflow tests. |

Use the Node version declared by the implementation's `.nvmrc`/`package.json` and document prerequisites in its README. If creating the application for the first time, use `npm install` to establish the lockfile before relying on `npm ci`. Do not claim a lint command exists unless one is configured.

Keep npm dependencies reproducible and install only packages used by the project. Update the lockfile with dependency changes. Verify Vite development **and** production preview when changing worker or WASM loading. Pushes to `main` deploy automatically to GitHub Pages, so keep `main` releasable. `vite.config.js` reads `PAGES_BASE_PATH` for the Pages build; do not hard-code `base`. Verify sub-path builds when changing worker, WASM or asset loading.

## Coding standards

- Follow existing formatting and tooling. For new vanilla JavaScript files, default to two-space indentation, semicolons, `const` where possible and `let` where reassignment is needed.
- Use descriptive `camelCase` names for variables/functions and `PascalCase` for classes. Preserve the teaching API's spelling and case, including `cloakColour`, `castSpell`, `Wizard` and `wizard`.
- Keep functions and modules focused. Prefer straightforward control flow to clever abstractions, especially in examples students read.
- Separate application infrastructure from learner-facing code. Explain the purpose of non-obvious implementation choices in comments; avoid comments that merely repeat each line.
- Store shared allowed values and domain rules centrally rather than duplicating them across instructions, validators and visuals.
- Use semantic HTML, associated labels, visible focus states and readable contrast. Keep code areas keyboard accessible and ensure focus can leave the editor.
- Make layouts responsive; respect reduced-motion preferences. Provide accessible text equivalents for canvas state.
- Render learner-controlled names, errors and logs as text, never unsanitised HTML.
- Never run learner code in the application's native global scope using `eval`, `new Function` or injected script elements. Preserve interpreter isolation, timeouts and memory limits.
- Keep typed drafts separate from validated results. Syntax errors block execution; runtime or validation failures must leave the last successful preview intact.
- Use fresh execution state for each Run. Ignore stale responses after edits/navigation and cancel obsolete animations. Probe tests must not mutate the candidate game state.
- Preserve local drafts through navigation and recoverable reset/import flows. Do not execute saved code automatically when restoring it.
- Do not make broad unrelated changes to teaching resources or generated outputs.

## Verification and completion

For code changes, run the relevant configured checks and production build. For content changes, check the worked example, accepted review answers, hints and checkpoint conditions together. Never report tests as passed unless they were actually run.

Before completing a module or section change, verify:

1. The module opens with a clear objectives screen.
2. Every affected section begins with an explanation and a correct, complete code example.
3. Activities follow a gradual reduction in support and do not require untaught concepts.
4. Every affected section ends with both multiple-choice and fill-in-the-blank review questions, with explanatory feedback.
5. Correct examples and solutions pass; representative misconceptions receive useful feedback; equivalent valid code is accepted where appropriate.
6. Navigation, drafts, review answers and progress survive the expected save/reload flow.
7. Errors preserve the last working preview, and the editor remains usable after stopped execution.
8. The affected screens work with keyboard navigation, a classroom laptop viewport, browser zoom and reduced motion where applicable.

Summarise what changed, what was verified and any material limitation. Keep this file, the README and teacher guidance aligned with the implementation as it evolves.

## Event-driven programming module

Tome II implements `PLAN-event-driven-programming.md`, including a dedicated welcome screen before its first section introduction. Preserve the independent `wizard-workshop:edp:v1` save and the Tome I save unchanged. `spells.js` and `stage.html` are virtual documents. Learner code runs in QuickJS with a simulated DOM and virtual timers; never forward host objects or callbacks into the guest. Keep checkpoint IDs stable. Section 5 is E5.1–E5.4: on 2 October 2026 the old E5.4–E5.6 were removed and the old E5.7 battle was renumbered E5.4 (now the complete battle to play and explain). Saves carry `saveLayout`; `upgradeEdpSave` in `src/edp/state/store.js` converts older saves. Bump the layout and extend that upgrade if IDs ever change again. Battle numbers are centralised in `src/edp/runtime/rules.js`; run the 1,000-seed balance test when changing them. `scripts/benchmark-edp.mjs` records 25 real runs per checkpoint. `scripts/generate-docs.mjs` regenerates `SOLUTIONS-EDP.md` alongside the original Tome I solutions.
