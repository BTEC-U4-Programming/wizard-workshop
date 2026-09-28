# Implementation plan: Tome II — Event-Driven Programming, and the Wizard Workshop landing page

**Project:** Wizard Workshop (`wizard-workshop/`, Vite 8 + vanilla JavaScript ES modules, QuickJS-in-a-worker runner)
**Audience of this document:** an AI coding agent that will review and then implement the changes
**Author context:** prepared 28 September 2026 from a read-through of the current source on branch `feat/event-driven-programming` (the repository's `HEAD`). I read `AGENTS.md`, `DESIGN.md`, `README.md`, `TEACHER_GUIDE.md`, `VERIFICATION.md`, `PLAN-section-intros-reviews.md`, every file in `src/`, `scripts/`, `tests/`, `vite.config.js`, `playwright.config.js` and the Pages workflow. I have not changed any code, and nothing below has been built or tested.
**Supersedes:** the earlier draft `wizard-workshop-edp-module-plan.md`, which was written without seeing the code. Discard it.

---

## 0. Read this first

### 0.1 What is being asked

| # | Request | Summary of the approach |
|---|---|---|
| 1 | A new **landing page** with retro pixel-art styling and two large buttons: one to the existing Object-Oriented Programming module, one to a new Event-Driven Programming module | Add a landing screen at the site root, drawn with the existing code-drawn pixel-art technique. It links to `?tome=oop` and `?tome=edp`. The OOP app moves behind `?tome=oop` with its behaviour unchanged (§2, §3). |
| 2 | A new, independent **Event-Driven Programming (EDP) module** with the same structure as the OOP module: sections, section introductions with a worked example, supported practice, and mixed multiple-choice / fill-in-the-blank reviews | Add a parallel "Tome II" curriculum, state store, app screen and runner engine. Reuse the OOP module's section, review, recap, editor, highlighting and celebration code by generalising it, not by copying it (§1, §3–§6). |
| 3 | Gentle, fully guided code first, then growing independence | Use the existing scaffold labels (`worked example` → `gaps` → `partial prompts` → `prompts only` → `independent`) and 3-tier hints. The mix of labels per section is specified in §8. |
| 4 | Teach EDP principles well enough for students to write about them in **Assignment 1** (Unit 4, Learning Aim A) | Every section's `assignmentLink`, the reflections, the Tome II recap and its Markdown download target A.P1–A.D1. See §10 and Appendix B. |
| 5 | Cover **click**, **mouseover** and **keyboard typing** events attached to wizard behaviours, ending in a **playable wizard vs goblin battle** driven by the learner's own event handlers, continuing the Tome I story | Six sections. The last one wires a battle engine to the learner's handlers, so only the controls they coded work. The goblin is **Grub** from Tome I, and the wizard keeps its Tome I look (§7–§9). |

### 0.2 Mandatory reading before you start

1. `AGENTS.md` — especially **"Required learning-module structure"**, **"General application architecture"**, **"Coding standards"** and **"Verification and completion"**. These are the acceptance criteria for this work.
2. `DESIGN.md` — tokens, typography (system fonts only), motion rules (no looping ambient motion, reduced motion respected), pixel-art rules (code-drawn, integer coordinates, `image-rendering: pixelated`).
3. `PLAN-section-intros-reviews.md` — the previous handoff. It explains why sections, journeys and reviews look the way they do. This plan follows the same conventions.
4. Source: `src/main.js`, `src/curriculum/*.js`, `src/review/*.js`, `src/runner/*.js`, `src/validation/parse.js`, `src/state/*.js`, `src/game/*.js`, `scripts/lesson-highlighting.mjs`, `tests/*`.

`AGENTS.md` also points to `WIZARD_OOP_IMPLEMENTATION_BRIEF.md`. It is **not in this checkout** (confirmed in `VERIFICATION.md`). This plan changes OOP files only through mechanical refactors that keep behaviour identical and every existing test passing, so the missing brief should not block the work. Stop and ask Ged if any change would alter OOP learner-facing behaviour beyond what §3 lists.

### 0.3 Audience and tone (applies to every string you write)

- Students are 16–17 year old BTEC Level 3 IT learners, new to programming, and often low in confidence. They have just finished (or nearly finished) Tome I.
- UK English (`colour`, `behaviour`, `recognise`), short sentences, concrete examples, supportive and a bit playful, never childish. Never "simply" or "just".
- Define a term before relying on it. The first time each term appears, **bold** it and give a one-sentence definition. Also add it to the section's `concepts`.
- Feedback describes a repair the learner can try. It never shames. Hints and retries carry no penalty.
- Keep the Tome I teaching API spelling exactly: `Wizard`, `wizard`, `Goblin`, `goblin`, `Character`, `castSpell`, `recoverHealth`, `levelUp`, `takeDamage`, `attack`, `specialPower`, `cloakColour`.

### 0.4 Key facts about the current code (verified by reading it)

**Stack and structure**
- Vanilla JS ES modules, Vite 8.3.1, CodeMirror 6, Acorn, QuickJS (`quickjs-emscripten` 0.32 + `@jitl/quickjs-wasmfile-release-sync`), Expressive Code (build time only), canvas-confetti. Node 22.19.0 (`.nvmrc`). **No framework and no router.** `index.html` mounts `/src/main.js` into `#app`.
- `src/main.js` (213 lines) builds the whole OOP UI with `innerHTML` **at import time** and wires everything with module-level `const`s and `$()` document queries. It is not written to be mounted twice or unmounted.
- Hash links are already in use for in-page jumps (`href="#lesson"`, `href="#preview"`, `#recap-section-N`). **Hash-based routing would collide with them.**
- GitHub Pages serves the site from a sub-path (`vite.config.js` reads `PAGES_BASE_PATH`). There is no SPA fallback on Pages, so **path-based routes (`/edp`) would 404 on reload**.

**Curriculum and journey**
- `src/curriculum/checkpoints.js`: 41 OOP checkpoints built by `add()`. `chapter = Number(id[1])`. `curriculumVersion = 1`.
- `src/curriculum/sections.js`: 5 sections. Question helpers: `choice(id, prompt, [[text, feedback], …], revisit)` (**the first option is always the correct one**) and `blank(id, prompt, code, accept, explanation, hint, revisit)` (**exactly one `____` per question**).
- `src/curriculum/journey.js`: `intro:N → checkpoints → review:N`, plus `RECAP='recap'`. Tests assert **5 sections** and a **journey length of 54**.
- `src/review/renderSection.js` hard-codes OOP facts: `SECTION ${n} OF 5`, the first checkpoint per chapter (`'C1.1a'`, `'C2.1a'`, …), the last checkpoint per chapter (`'C1.2'`, `'C2.7'`, …), "Finish course" on chapter 5, and a Section 1-only "Course goals and section map" disclosure.
- `src/review/renderRecap.js` and `src/curriculum/recap.js` are OOP-specific (title, filename `wizard-workshop-summary.md`).
- `scripts/lesson-highlighting.mjs` pre-renders all curriculum prose into `virtual:lesson-content`, `virtual:section-content` and `virtual:lesson-styles.css`. Backticks mark code, and a backtick segment containing `\n` becomes a highlighted block. It only highlights `js`. **The browser has no highlighter**, so all new prose must go through this plugin.

**Runner (the most important constraint for EDP)**
- Learner code runs in **QuickJS inside a Web Worker** (`src/runner/runner.worker.js` → `engine.js#runProgram`). There is **no DOM, no timers, no console, no `Date`, no `Math.random`** in the guest (`engine.js` deletes `Date` and `Math.random`). Limits (`parse.js` `LIMITS`): 30KB source, 500ms total guest budget, 2s main-thread watchdog, 10s load timeout, 16MiB heap, 256KiB stack, 128KB result.
- `validation/parse.js` **rejects** `window`, `document`, `setTimeout`, `setInterval`, `console`, `Date` and others as "outside the workshop". It also enforces OOP-only file rules (`character.js` may only contain classes/objects/assignments; `actions.js` is a list of at most 30 method calls).
- `runner/client.js#validResult` only accepts OOP-shaped results (wizard/goblin snapshots and a trace of `castSpell|attack|recoverHealth|levelUp|takeDamage`).
- `AGENTS.md`: *"Never run learner code in the application's native global scope using `eval`, `new Function` or injected script elements. Preserve interpreter isolation, timeouts and memory limits."*
- Consequence: **EDP learner code cannot touch the real DOM.** Section 4 of this plan specifies a **simulated DOM and a virtual event loop implemented inside QuickJS** (trusted "stage prelude" code). Learner code is still real JavaScript and uses real names (`document.querySelector`, `addEventListener`, `event.key`, `setTimeout`, `CustomEvent`). The host forwards real browser events from the rendered stage into the worker as plain data. No host object is ever exposed to the guest.

**State**
- `src/state/store.js`: key `wizard-workshop:progress:v1`. `parseImport()` **throws** on any draft whose checkpoint ID is unknown. So Tome II drafts **must not** be written into the OOP save, or every OOP save becomes unloadable.

**Game art**
- `src/game/renderScene.js` draws everything with `fillRect` on a 320×240 canvas: stone wall, candles, platform, wizard (cloak mask, six palettes, patterns, wands, beards, power aura), goblin, dotted blueprint, spell effects, Game Over banner. `TracePlayer` plays 550ms steps after a 200ms pause. **Reuse these sprites** in Tome II rather than drawing new wizards or goblins.

**Story continuity already in the code**
- The wizard defaults to **"Aster"** (learners may rename). The apprentice is Moss/Rowan. The goblin is **`new Goblin("Grub")`**, with `maxHealth` 60, `attack(target)` dealing 8. `Character` provides `takeDamage`, `recoverHealth` (+20, capped) and `levelUp` (capped at 20). `castSpell(target)` deals fire `12 + level*2`, ice `10 + level*2`, electricity `14 + level*2`. Tome I ends with a scripted battle and a "Game Over" banner. **There was no automatic enemy response in Tome I** (README). Tome II deliberately introduces one, driven by events and timers. Call this out as new in the teacher guide.
- "Pip" is already used as the patient's name in Section 5's worked example. **Don't** reuse "Pip" for a new character.

**Tests**
- `npm test` = Vitest over `tests/**/*.test.js`. `npm run test:e2e` = Playwright over `tests/**/*.spec.js`, Chromium + Firefox, with a dev server on 5173 (or preview on 4173 with `WORKSHOP_PREVIEW=1`).
- `tests/workshop.spec.js` starts every test with `page.goto('/')` and expects the OOP app (for example `#section-title` = "Classes and objects"). **The landing page breaks these tests** unless they are updated (§12).

### 0.5 Decisions that need Ged's sign-off (defaults are what this plan implements)

| # | Question | Default in this plan |
|---|---|---|
| D1 | EDP learner code uses a **simulated** `document`, `setTimeout`, `console` and `CustomEvent` implemented inside QuickJS. This is an exception to the literal README/AGENTS wording ("no DOM, timers… exposed to learner code"), but there is still no bridge to the real page. | Proceed. Update README/AGENTS wording (§13). |
| D2 | Routing uses a query parameter: `/` = landing, `/?tome=oop`, `/?tome=edp`. Returning OOP learners who open the root URL now see the landing page first (one extra click). | Proceed. |
| D3 | Tome II is **open** from the start, with a "Best after Tome I" note, not locked. | Open. |
| D4 | Completing Tome II needs the battle **wired up and attempted**, not won. | Attempt only. |
| D5 | The mentor is **Quill**, a messenger owl (a new character). The goblin stays **Grub**. | As stated. |
| D6 | Tome II reads the learner's Tome I save (read-only) to reuse their wizard's **name and look**. It never runs saved code. | Proceed. Fall back to "Aster" with defaults. |
| D7 | In both modules, multiple-choice options are currently shown with the correct answer **always first** (the `choice()` helper convention). | Tome II shows options in a fixed, **seeded shuffled order** (stable per question ID). Ask Ged whether to apply the same change to Tome I. It is not applied to Tome I by default. |
| D8 | TypeScript: the project description mentions TS, but the app is plain JS. | Tome II is plain JS. There is one optional "TypeScript lens" disclosure in §8 S2. |

---

## 1. Architecture decision

**Keep Tome I byte-for-byte equivalent in behaviour. Add a module shell, a Tome II app with its own curriculum, state and runner engine, and generalise the few shared components that are currently hard-coded to Tome I.**

```
index.html → src/main.js (new: tiny router)
              ├── no ?tome           → src/landing/landing.js           (new)
              ├── ?tome=oop          → src/oop/app.js  (moved from src/main.js, wrapped in mountOopApp())
              └── ?tome=edp          → src/edp/app.js                    (new)

Worker: src/runner/runner.worker.js
              ├── {type:'run'}                   → engine.js#runProgram           (unchanged Tome I)
              ├── {type:'edp-run'}               → edp/engine.js#runEdpProgram     (new)
              └── {type:'edp-session-*'}         → edp/engine.js#EdpSession        (new, live play)
```

Why this design:
- **One app per page load.** `src/main.js` dynamically imports only the app it needs, so Tome I's module-level code runs exactly as it does today, and nothing has to be unmounted. Switching tomes is an ordinary link (full page load). That is simple, robust, and safe for local saves.
- **Query-string routing** works on GitHub Pages sub-paths, survives reload, and leaves the existing `#lesson`/`#preview` hash anchors alone.
- **Separate storage key** (`wizard-workshop:edp:v1`) means Tome I's `parseImport` never sees Tome II IDs, and no Tome I save needs migrating.
- **A separate engine** keeps Tome I's strict OOP validator untouched. It also gives EDP its own parser rules, where `document`, `setTimeout` and `console` are allowed but only as simulations.
- **Shared components are generalised with a small "module descriptor"** (§3.2), so Tome I passes values that reproduce today's hard-coded behaviour exactly.

### 1.1 New and changed files

| File | Change |
|---|---|
| `src/main.js` | **Rewritten** as a ~30-line router: read `new URLSearchParams(location.search).get('tome')`, then `await import()` the matching app. Unknown values show the landing page. |
| `src/oop/app.js` | **New location** of today's `src/main.js` body, wrapped in `export function mountOopApp()`. The only behaviour change is the brand link (§3.1). |
| `src/shared/moduleShell.js` | **New.** `baseUrl()` (from `import.meta.env.BASE_URL`), `tomeUrl('oop'\|'edp'\|null)`, and a header "Back to the library" link. |
| `src/landing/landing.js`, `src/landing/drawLibrary.js` | **New.** Landing markup and code-drawn pixel art (§2). |
| `src/game/sprites.js` | **New.** Extracts `drawWizard`/`drawGoblin`/palettes/cloak mask out of `renderScene.js` as exported pure functions taking `(ctx, x, y, model)`. `renderScene.js` imports them. **Tome I output must stay pixel-identical** (§12.4). |
| `src/review/renderSection.js` | **Generalised** with a `module` descriptor parameter (§3.2). Tome I passes a descriptor that reproduces current text and navigation. |
| `src/review/renderRecap.js` | **Generalised**: recap data, markdown function, filename, back-target and labels come from the descriptor. |
| `src/review/checkAnswer.js` | Unchanged. It is reused as-is. |
| `src/editor/createEditor.js` | Add an optional `choices` option (default: Tome I `choices`) so completion lists aren't hard-wired to Tome I. |
| `src/runner/runner.worker.js` | Dispatch on `data.type` to the Tome I or Tome II engine. Load the WASM module once for both. |
| `src/runner/client.js` | `Runner` accepts `{validate}` in its constructor (default: today's `validResult`). Add an `EdpRunner` subclass with `session*` methods (§4.9). |
| `scripts/lesson-highlighting.mjs` | Also pre-render Tome II content into `virtual:edp-lesson-content` and `virtual:edp-section-content`. Add an optional `language` argument to `highlight()` so the read-only `stage.html` panel is highlighted as HTML (Expressive Code/Shiki already supports it, so no new dependency). |
| `src/edp/curriculum/checkpoints.js` | **New.** Tome II checkpoints (IDs `E1.1` … `E6.7`), starters, solutions, trials, hints, reflections (§6.1, §8). |
| `src/edp/curriculum/sections.js` | **New.** Six sections: intros, worked examples, reviews (IDs `ES1-Q1` …) (§8). Same helpers as Tome I. |
| `src/edp/curriculum/stages.js` | **New.** The stage definitions: element trees, the `stage.html` text shown to learners, and world objects per scene (§4.3, §5.3). |
| `src/edp/curriculum/journey.js` | **New.** `welcome → intro:1 → E1.x → review:1 → … → review:6 → recap`. |
| `src/edp/curriculum/recap.js` | **New.** "Your Tome II spellbook" (§10). |
| `src/edp/curriculum/story.js` | **New.** All story strings (welcome, Quill's lines, battle barks, endings), kept apart from mechanics. |
| `src/edp/runtime/prelude.js` | **New.** The trusted guest-side stage library, exported as a **string** of JavaScript evaluated inside QuickJS before learner code: simulated DOM, event dispatch, virtual timers, console, `CustomEvent`, `BattleWizard`, `Goblin`, world objects and the battle engine (§4). |
| `src/edp/engine.js` | **New.** `runEdpProgram(QuickJS, request)` (Run + Spell Trials) and `EdpSession` (live play) (§4). |
| `src/edp/validation/parse.js` | **New.** Acorn-based parsing and EDP rules (§4.8). Reuses `diagnostic()` and `LIMITS` from Tome I's `parse.js`. |
| `src/edp/validation/result.js` | **New.** `validEdpResult()` schema check, which the client uses (§4.7). |
| `src/edp/state/store.js`, `src/edp/state/journeyProgress.js`, `src/edp/state/look.js` | **New.** Tome II save/load/import, progress and the read-only Tome I wizard look, mirroring the Tome I API (§11). |
| `src/edp/app.js` | **New.** Tome II UI: workbench, stage, Crystal Ball, Spell Trials, activities, battle screen (§5). |
| `src/edp/stage/renderStage.js`, `src/edp/stage/drawScenes.js` | **New.** Host-side stage DOM + canvas rendering from plain snapshots (§5.3). |
| `src/edp/activities/*.js` | **New.** Sort cards, predict-then-run, trace table, truth table (§5.6). |
| `src/styles.css` | Append landing, stage, Crystal Ball, trials and battle styles. Reuse existing tokens (§2.3, §5.8). |
| `tests/…` | New unit and e2e tests. Update `workshop.spec.js` to `goto('/?tome=oop')` (§12). |
| `scripts/generate-docs.mjs` | Also generate `SOLUTIONS-EDP.md` (Tome II solutions and review answers). |
| `README.md`, `TEACHER_GUIDE.md`, `AGENTS.md`, `DESIGN.md`, `VERIFICATION.md` | Documentation updates (§13). |

---

## 2. Landing page — "The Grand Library"

### 2.1 Routing and URLs

- `src/shared/moduleShell.js`:
  ```js
  export const baseUrl = () => import.meta.env.BASE_URL;            // '/' locally, '/wizard-workshop/' on Pages
  export const tomeUrl = tome => tome ? `${baseUrl()}?tome=${tome}` : baseUrl();
  ```
- `src/main.js`:
  ```js
  import './styles.css';
  const tome = new URLSearchParams(location.search).get('tome');
  if (tome === 'oop') (await import('./oop/app.js')).mountOopApp();
  else if (tome === 'edp') (await import('./edp/app.js')).mountEdpApp();
  else (await import('./landing/landing.js')).mountLanding();
  ```
  (Top-level `await` is fine in Vite's ES module output. If the build target rejects it, wrap the calls in an async IIFE.)
- `virtual:lesson-styles.css` must be imported by both apps, **not** by the landing page, so the landing page stays light.
- Keep `<title>Wizard Workshop</title>`. Each app sets `document.title` to `Wizard Workshop · Tome I` / `· Tome II`.

### 2.2 Content and layout

The first view, with no scrolling at 1366×768:

```
┌───────────────────────────────────────────────────────────────┐
│ ✦ WIZARD WORKSHOP  Small steps. Real JavaScript. Your creation.│   ← existing .app-header brand, no tools
├───────────────────────────────────────────────────────────────┤
│                 THE GRAND LIBRARY   (eyebrow)                 │
│            Choose your tome, apprentice.   (h1)               │
│   (one sentence) Each tome is a set of lessons. Your progress │
│   in each one is saved separately in this browser.            │
│                                                               │
│  ┌────────── canvas: pixel library, 2 lecterns ───────────┐   │
│  │   [ TOME I book ]                  [ TOME II book ]    │   │  ← decorative canvas (aria-hidden)
│  └────────────────────────────────────────────────────────┘   │
│  ┌──────── <a class="tome"> ───────┐ ┌──────── <a class="tome"> ───────┐
│  │ TOME I                          │ │ TOME II                         │
│  │ Object-Oriented Programming     │ │ Event-Driven Programming        │
│  │ Forge your wizard: classes,     │ │ Awaken your wizard: clicks,     │
│  │ objects, methods, inheritance.  │ │ hovers, keys, timers, battle.   │
│  │ ▓▓▓▓▓▓░░░ 32 of 54 steps done   │ │ ░░░░░░░░ Not started            │
│  │ [ Continue Tome I → ]           │ │ Best after Tome I               │
│  └─────────────────────────────────┘ │ [ Start Tome II → ]             │
│                                      └─────────────────────────────────┘
│  ▸ What's the difference between the tomes?  (details, closed)│
└───────────────────────────────────────────────────────────────┘
```

- **The two large buttons are the two `<a class="tome">` cards.** Each is a single link: the whole card is clickable and focusable. It holds a heading, a one-line description, a progress meter and a visible call to action. Minimum 300×220px on desktop; full width and stacked below 700px. Use `surface` `#1b2538`, border `#344058`, 12px radius, 24px padding. Hover/focus lifts the card: border changes to the tome accent, and `transform: translateY(-2px)` is only applied without reduced motion. The focus ring uses the existing 3px gold outline.
- **Tome accents** (both from the existing palette; no new accent families): Tome I = lavender `#c4a5f2` (secondary). Tome II = gold `#d9b777` (primary). The cover art on the canvas uses the cloak swatches (purple `#ae87e8` for Tome I, gold `#e6bc60` for Tome II), which `DESIGN.md` treats as game-art colours.
- **Progress text** is computed read-only:
  - Tome I: `loadState(localStorage)` from `src/state/store.js`, then `sectionProgress(chapter, state)` summed over the chapters. Show `N of 54 steps done`. **Never call `saveState` from the landing page.** If loading errors, show "Progress unavailable in this browser".
  - Tome II: the equivalent from `src/edp/state/*`.
  - The CTA label is `Start Tome I →` / `Continue Tome I →` (or `Revisit Tome I →` when complete). The same pattern applies to Tome II.
  - Tome II badge: "Recommended next" when Tome I is complete, otherwise "Best after Tome I". It is text, not colour-only (D3).
  - Use a `<meter>` with an `aria-label`, plus the text. Use the existing `meter` styling.
- **Disclosure "What's the difference between the tomes?"** (closed by default): two short paragraphs. Tome I teaches you to describe things with classes and objects. Tome II teaches you to make those objects react when something happens. Link both to Unit 4: both paradigms are named in the specification.
- Footer: reuse the existing footer text.
- **Easter egg (no gating):** Quill the owl is drawn perched on the top shelf of the canvas. A small real `<button class="owl-hotspot" aria-label="Quill the owl">` sits over it. Hover, focus or click shows a speech bubble (a DOM element with `role="status"`): *"Hoo! These books only light up because someone wrote an event listener. Tome II shows you how."* This foreshadows the module and is itself an event demo.

### 2.3 Pixel art (`src/landing/drawLibrary.js`)

- A 320×180 canvas, drawn once with `fillRect` at integer coordinates, `imageSmoothingEnabled = false`, and CSS `image-rendering: pixelated`. Scale it with CSS to at most 960px wide. It is decorative, so set `aria-hidden="true"`.
- Scene: the existing stone-wall pattern and palette from `renderScene.js` (`#121b30`, `#1b253a`, `#253149`). Two tall bookshelves (spines in muted cloak swatches), two still candles (reuse the candle drawing), two lecterns, and a book on each lectern: Tome I purple with brass corners `#a68160` and a pixel anvil; Tome II gold with a pixel lightning bolt. Quill (a new 12×14 owl sprite: `#8a7a6a` body, `#e3c185` eyes) sits on the top shelf.
- **Motion rules (DESIGN.md):** no looping ambient animation. The only motion allowed is a single redraw on hover/focus of a card: the matching book's cover "glows" as a one-frame highlight outline, then reverts on blur/mouseout. This is a redraw, not an animation loop. Under reduced motion (OS or the saved `preferences.reduceMotion` of either tome) there is no transform on the card, and the canvas highlight still changes because it is a static state, not motion.
- Put the sprite functions in `drawLibrary.js`. Import the owl sprite from `src/game/sprites.js` (add `drawOwl` there, because Tome II needs it too).

### 2.4 Changes inside the tomes

- The Tome I and Tome II header brand becomes a link back to the landing page: `href = tomeUrl(null)`. Add `aria-label="Wizard Workshop — back to the library"`. Today it is `href="#lesson"`. Tome I keeps its `Jump to preview` anchor.
- Add a small "Tome I · Object-Oriented Programming" / "Tome II · Event-Driven Programming" eyebrow inside `.course-bar`, before `YOUR JOURNEY`. Hide it at ≤600px.

### 2.5 Definition of done (landing)

Renders at 1366, 768 and 390px widths with no horizontal scroll. Both cards work by mouse, touch, Enter and Space (`<a>` supports Enter natively; add no Space handler, because links don't use Space). Progress reflects real saves. Reloading `/?tome=oop` returns to the OOP app. Pages sub-path builds work (§12.5). All existing OOP e2e tests pass after being pointed at `/?tome=oop`.

---

## 3. Shared refactors (Tome I behaviour must not change)

### 3.1 Move `src/main.js` → `src/oop/app.js`

- Wrap the entire current body in `export function mountOopApp() { … }`. Relative imports gain one `../` (for example `'./curriculum/checkpoints.js'` → `'../curriculum/checkpoints.js'`). Keep `import 'virtual:lesson-styles.css'` and the two `virtual:` content imports inside this file.
- Change only these two things: the brand `href` (§2.4), and `document.title`.
- `git mv` the file so history follows.

### 3.2 Module descriptor for `renderSection` and `renderRecap`

Add a parameter object. Tome I builds it in `src/oop/app.js`:

```js
// src/oop/moduleDescriptor.js (new, Tome I)
import {sections,sectionByChapter} from '../curriculum/sections.js';
import {checkpoints,byId} from '../curriculum/checkpoints.js';
export const oopModule = {
  id:'oop', sectionCount:5, sectionByChapter, byId,
  firstScreenOfChapter: chapter => checkpoints.find(c=>c.chapter===chapter).id,  // C1.1a, C2.1a, C3.1a, C4.1, C5.1a
  lastScreenOfChapter:  chapter => checkpoints.filter(c=>c.chapter===chapter).at(-1).id, // C1.2, C2.7, C3.5, C4.5, C5.4
  showCourseMapInChapter: 1,                     // keeps today's Section-1-only disclosure
  courseMapText: [/* today's two sentences, verbatim */],
  finishLabel:'Finish course: see your summary →', finishTarget:'recap',
};
```

- Add a test that derives the same first/last IDs as the current hard-coded arrays (`['C1.1a','C2.1a','C3.1a','C4.1','C5.1a']` and `['C1.2','C2.7','C3.5','C4.5','C5.4']`).
- `renderSection(container, screen, content, state, navigate, save, {celebrate, module})`: replace `OF 5` with `OF ${module.sectionCount}`, the start/back target arrays with the descriptor functions, `section.chapter===5` with `chapter===module.sectionCount`, and the course-map condition with `module.showCourseMapInChapter`.
- Add `module.optionOrder(question)` (default: identity). Tome II supplies a seeded shuffle (D7). Implement the shuffle as a pure function of `question.id` (for example, sort options by a string hash of `question.id + option.id`). Tests must confirm that the correct option is not always first across Tome II questions, and that order is stable across renders.
- `renderRecap(container, content, {navigate, download, finalCode, module})`: take `module.recap`, `module.recapMarkdown`, `module.recapFilename`, `module.backToReviewId` and `module.finalCodeLabel` from the descriptor.

### 3.3 Editor

`createCodeEditor(parent, {…, choices = oopChoices})`. Use `options.choices` in the explicit-completion override. Tome II passes `{}`, and completion then offers `completionFields()` only. Tome II's `completionFields()` returns the stage's element IDs as `"#id"` strings plus the event names taught so far.

The editor's `aria-label` stays `${file} JavaScript editor`, so Tome II's label is `spells.js JavaScript editor`.

### 3.4 Worker and client

- `runner.worker.js`:
  ```js
  self.onmessage = ({data}) => {
    if (!runtime) return;
    if (data.type === 'run') { /* unchanged */ }
    else if (data.type === 'edp-run') self.postMessage({type:'result', …, result: runEdpProgram(runtime, data)});
    else if (data.type?.startsWith('edp-session-')) handleSession(runtime, data);   // §4.9
  };
  ```
- `client.js`: `new Runner(onStatus, {validate = validResult} = {})`. `EdpRunner extends Runner` passes `validEdpResult`, sets `run()` to post `edp-run`, and adds `startSession / sendEvent / tick / endSession` (§4.9). `stop()` must also end any session (terminating the worker does this).

### 3.5 Highlighting plugin

- Add `highlight(code, inline, title, language='js')`. `stage.html` blocks use `'html'`.
- Build `edpLessons` and `edpSectionContent` with the same `prose()` rules. Export them as `virtual:edp-lesson-content` and `virtual:edp-section-content`. Keep the CSS in the single shared `virtual:lesson-styles.css`.
- Import `src/edp/curriculum/*.js` in the plugin. Vite already restarts the dev server when a config import changes, so verify this for the new files too.

---

## 4. The Tome II runtime: a simulated stage inside QuickJS

This is the heart of the work, so build and test it first (§14).

### 4.1 Principles

1. **Real JavaScript, simulated world.** Learners write the same code they would write for a real web page. The *stage prelude* (trusted code in `src/edp/runtime/prelude.js`, evaluated in the same QuickJS context immediately before learner code) implements a small, faithful subset of the DOM event model.
2. **No host bridges.** The guest never receives a host function or object. The host sends plain JSON messages that describe events ("click on `#fire-button`"). The guest returns plain JSON snapshots. This keeps the Tome I isolation guarantees.
3. **Deterministic.** Keep Tome I's `delete globalThis.Date; delete Math.random;`. Time is a **virtual clock** in the prelude. Randomness (goblin intents) comes from a **seeded PRNG** in the prelude (mulberry32), with the seed supplied by the host. Trials use fixed seeds. Live play uses a seed from `crypto.getRandomValues` on the host.
4. **Accurate semantics where they are taught.** Handler `this` = `currentTarget` for non-arrow functions. Registering the same function twice is ignored. `removeEventListener` requires the same function reference. `{once:true}`. Bubbling for `click`, `mouseover`, `mouseout`, `keydown`, `input` and custom events created with `bubbles:true`. No bubbling for `mouseenter`, `mouseleave`, `focus`, `blur`. `event.preventDefault()` sets `defaultPrevented`. Handler exceptions are reported and do **not** stop other handlers (as in browsers). Class bodies are strict mode, so a detached method's `this` behaves exactly as in a browser.
5. **Trusted objects cannot be corrupted into false success.** Keep battle and world internals in closures. Expose frozen APIs (`Object.freeze`). Validate every snapshot on the host side.

### 4.2 What learner code can use (the whole API surface)

Teach and document only these. Anything else is simply undefined in the guest.

| Name | Behaviour |
|---|---|
| `document.querySelector(selector)` | Supports `#id` only. Returns the element stub or `null`, as in a real page. |
| `document.addEventListener / removeEventListener / dispatchEvent` | `document` is the root of every bubbling path. Keyboard events are dispatched to the focused stage element, else to `document`. |
| Element stubs | `id`, `tagName` (upper case), `textContent` (string, ≤200 chars, coerced with `String()`), `hidden` (boolean), `value` (inputs only, ≤40 chars), `dataset` (read-only copy of `data-*`), `classList.add/remove/toggle/contains` (class names ≤30 chars, ≤8 per element), `disabled` (buttons), `addEventListener(type, fn, options)`, `removeEventListener(type, fn)`, `dispatchEvent(event)`, `focus()`, `parentElement` (read-only). No `innerHTML`, no `style`, no element creation. |
| Event objects | `type`, `target`, `currentTarget`, `timeStamp` (virtual ms), `key` (keyboard), `offsetX` / `offsetY` (clicks on a `data-coords` element, in 320×240 stage pixels), `detail` (custom), `defaultPrevented`, `preventDefault()`, `stopPropagation()`. |
| `new CustomEvent(type, {detail, bubbles})` | For custom events. |
| `setTimeout(fn, ms)` / `clearTimeout(id)` | Virtual timers. `ms` is clamped to 0–60000. At most 50 pending. `setInterval` is **not** provided; the parser explains that Tome II uses `setTimeout` only. |
| `console.log(...values)` | Appends a line to the Crystal Ball (§5.4). Values are formatted with a safe `String()`/JSON preview of at most 200 chars. At most 100 lines per run. |
| `wizard` | A `BattleWizard` (§4.4): the learner's Tome I wizard, with a few new tricks. |
| `goblin` | `Goblin` **Grub** (§4.4). |
| World objects, per stage | `lantern`, `runeDoor`, `tower`, `dummy`, `battle` — present only in the stages that list them (§4.3). |

### 4.3 Stages (`src/edp/curriculum/stages.js`)

A stage is trusted data describing one scene. It drives three things: the element stubs the prelude creates, the `stage.html` text the learner reads, and the host-side DOM/canvas rendering.

```js
export const stages = {
  'tower-bedroom': {
    title: 'The Tower Bedroom',
    scene: 'bedroom',                 // canvas background drawer in drawScenes.js
    world: ['wizard', 'lantern'],     // objects the prelude creates for this stage
    elements: [                       // flat list; parent refers to another id or 'document'
      {id:'stage',        tag:'DIV',    parent:'document'},
      {id:'wake-button',  tag:'BUTTON', parent:'stage', text:'Ring the bell'},
      {id:'sleep-button', tag:'BUTTON', parent:'stage', text:'Snuff the candle'},
      {id:'lantern-button', tag:'BUTTON', parent:'stage', text:'Light the lantern'},
    ],
  },
  // …
};
export const stageHtml = stageId => /* generated, indented HTML string from elements, e.g.
<div id="stage">
  <button id="wake-button">Ring the bell</button>
  …
</div> */;
```

- `stageHtml()` is the single source for the read-only **`stage.html` tab** (§5.2). It is pre-rendered at build time with HTML highlighting.
- Hotspots over sprites (wizard, goblin, chest, owl) are elements with `tag:'BUTTON'` and `hotspot:{x,y,w,h}` in canvas pixels. They are real focusable buttons on the host, so hover **and** keyboard focus work.
- Inputs: `{id:'incantation', tag:'INPUT', label:'Incantation'}`.
- `data-*`: `{id:'fire-card', tag:'BUTTON', parent:'spellbook', text:'Fire', data:{power:'fire'}}`.
- Coordinates: `{id:'courtyard', tag:'DIV', coords:true}` makes clicks report `offsetX` and `offsetY` in stage pixels.

Stage list (details in §8): `tower-bedroom`, `courtyard`, `spell-room`, `whispering-wood`, `rune-door`, `owl-loft`, `grubbledown-bridge`. Plus small ones used only by section worked examples: `example-lantern`, `example-map`, `example-owl`, `example-keys`, `example-night`, `example-duel`.

### 4.4 Guest classes (in the prelude)

Re-declare the Tome I classes in trusted form, using the **exact final Tome I rules**, so that Tome II builds on them visibly:

```js
class Character { constructor(name, maxHealth) { … level 1, health = maxHealth }
  recoverHealth() { +20 capped at maxHealth }  levelUp() { +1 capped at 20 }
  takeDamage(amount) { this.health = Math.max(0, this.health - amount); } }
class Wizard extends Character { constructor(name) { super(name, 100); cloakColour…specialPower defaults }
  castSpell(target) { fire 12 / ice 10 / electricity 14, + level * 2; target.takeDamage(damage); return this.specialPower; } }
class Goblin extends Character { constructor(name) { super(name, 60); } attack(target) { target.takeDamage(8); } }

// Tome II: "your wizard has learnt a few new tricks" — inheritance, shown to learners in the S1 intro disclosure.
class BattleWizard extends Wizard {
  constructor(name) { super(name); this.mana = 20; this.maxMana = 20; this.awake = false;
    this.x = 120; this.y = 150; this.shielded = false; this.potions = 2;
    this.lastSpeech = ''; this.lastSpell = null; this.lastIncantation = null; }
  say(text)      { this.lastSpeech = String(text).slice(0, 120); __log('say', this.lastSpeech); }
  wake()         { this.awake = true; }
  sleep()        { this.awake = false; }
  moveTo(x, y)   { clamp to the walkable area of the current stage; integers only }
  moveBy(dx, dy) { this.moveTo(this.x + dx, this.y + dy); }
  castSpell(target) {                              // same damage rule as Tome I, plus mana
    const cost = {fire: 4, ice: 3, electricity: 6}[this.specialPower];
    if (this.mana < cost) { this.lastSpell = 'fizzle'; __log('fizzle', this.specialPower); return null; }
    this.mana = this.mana - cost; this.lastSpell = this.specialPower;
    return super.castSpell(target);
  }
  raiseShield()  { this.shielded = true; }
  speakIncantation(words) { /* §8 S4: IGNIS, LUX, fizzle, empty; sets this.lastIncantation */ }
  drinkPotion()  { if (this.potions > 0) { this.potions = this.potions - 1; this.recoverHealth(); } }
}
```

- `wizard = new BattleWizard(<name>)`, with the cosmetic properties copied from the Tome I save (D6, §11.3). `goblin = new Goblin("Grub")`.
- For the battle stage only, Grub has had a snack: `goblin.maxHealth = 120; goblin.health = 120;`. The story says *"Grub has been eating Rune Bell cake."* Show this line in the E6 intro, because it is a nice callback to Tome I's per-object customisation.
- Keep these class declarations out of learner files. Learners use the objects. The `wizard.castSpell` detached-`this` lesson (E2.5) works because the classes are real.
- World objects are plain trusted objects with methods: `lantern {lit, turnOn(), turnOff()}`, `runeDoor {isOpen, runesLit, redFlashes, open(), lightRunes(n), flashRed(), reset()}`, `tower {awake, wakeUp(loudness)}`, `dummy {health:100, takeDamage(n)}`. Each method logs to the Crystal Ball.

### 4.5 Event dispatch algorithm (prelude)

```
dispatch(eventInit):                         // called by the engine for host events and by element.dispatchEvent
  path = [target, …ancestors…, document]      // capture phase not supported (not taught)
  event = makeEvent(eventInit)                 // plain object with the fields in §4.2
  for node in (bubbles ? path : [target]):
     event.currentTarget = node
     for listener in snapshot(node.listeners[event.type]):   // snapshot so removal during dispatch is safe
        if listener.removed: continue
        if listener.once: remove it first
        try { listener.fn.call(node, event) } catch (e) { record handler error with stack line }
        record log entry {t, type, target:'#'+target.id, handler:nameOf(listener.fn), ok}
     if event.propagationStopped: break
  if nobody handled anything: record log entry {…, handler:null}          // "nobody is listening 💤"
  return event
drainTimers(untilMs):                        // virtual clock
  while next timer due ≤ untilMs: advance clock, run callback (errors recorded), log {type:'timer'}
```

- `nameOf(fn)`: `fn.name` if present, else `'(arrow function)'` for arrow functions (the prelude can tell because arrow functions have no `prototype`), else `'(anonymous function)'`.
- **Registration log.** Every `addEventListener`/`removeEventListener` call is recorded: `{phase:'setup'|'event', target, type, handler, once, accepted, reason}`. Record `accepted:false` with a reason for a non-function listener (the classic `fn()` bug passes `undefined`) and for a duplicate registration. The registration log drives the structural checks and diagnostics (§4.6).
- **Default actions (simulated).** For `keydown` with `ArrowUp/Down/Left/Right` or `" "` whose target is `document`/stage, if `defaultPrevented` is false, increment `world.page.scrollNudges`. The host shows a brief, non-animated notice: *"In a real web page, that key would also have scrolled the page."* (§8, E4.1).
- **Budget.** The QuickJS interrupt handler enforces the run deadline (§4.10). An infinite loop in a handler returns `status:'stopped'` with Tome I's `timeoutMessage`, plus E5.2's extra explanation (§8).

### 4.6 Spell Trials (automated checks)

Each checkpoint lists trials (§6.1). A trial = **fresh QuickJS context** → stage prelude with the trial's `seed` and `setup` → learner source (`spells.js`) → a scripted list of steps → a **plain snapshot** → a **host-side pure `expect(snapshot)`** returning `null` (pass) or a learner-friendly message.

```js
// Step kinds (JSON, sent into the guest as data)
{do:'click',     target:'#fire-button'}
{do:'click',     target:'#courtyard', offsetX:40, offsetY:25}
{do:'mouseover', target:'#goblin'} / {do:'mouseout', …} / {do:'focus', …} / {do:'blur', …}
{do:'key',       key:'ArrowUp', target:'document'}       // keydown only (keyup not taught)
{do:'type',      target:'#incantation', text:'aperio'}    // one keydown + value update + input event per character
{do:'wait',      ms:1500}                                 // advance the virtual clock, running due timers
{do:'set',       path:'wizard.mana', value:2}             // trusted setup mid-trial (e.g. drain mana)
```

- The **setup phase** (running `spells.js` itself) is always step 0. Many bugs show up there. For example, after E1.2's starter, `lantern.lit === true` before any click.
- Snapshot shape (validated on the host, §4.7):
  ```js
  {elements:{[id]:{text,hidden,classes,value,disabled}}, world:{wizard:{…}, goblin:{…}, lantern:{…}, …},
   page:{scrollNudges}, battle:{state, turn, intent, log[]}|null, globals:{[name]:value},   // selected learner globals, e.g. gameState, spellBuffer
   registrations:[…], log:[…], errors:[{message, line}]}
  ```
- `globals` lets a trial read named learner variables such as `gameState` or `spellBuffer`. The trial lists the names it needs (`reads:['spellBuffer']`). The engine evaluates `typeof name === 'undefined' ? undefined : name` for each name and passes the result through JSON.
- Trial categories are `'typical' | 'extreme' | 'erroneous' | null`. The UI shows them as **Typical / Extreme / Erroneous** tags (Unit 4 B2/C2 vocabulary).
- **Run status mapping** (same statuses as Tome I, so the existing UI states still apply):
  - Syntax/parse error → `error` (no stage update).
  - Setup-phase exception or timeout → `error` / `stopped`, mapped to a `spells.js` line.
  - All trials pass → `success` (Next enabled, confetti).
  - Code runs but ≥1 trial fails → `validButIncomplete`. The first failing trial's message becomes the result line: *"○ Your spells ran. Next: <message>"*. The stage still goes live so the learner can experiment.
- **Common-mistake diagnostics.** These are checked in this order, and each produces the *first* failing trial's message:
  1. `querySelector` returned `null` and a `TypeError` followed (*"cannot read properties of null"*) → *"`document.querySelector("wake-button")` found nothing. IDs need a `#` in front: `"#wake-button"`."* (Detect by comparing the selector with the stage IDs.)
  2. Registration with `accepted:false` because the listener is `undefined` → *"The second thing you gave `addEventListener` wasn't a function, so nothing is listening. Did you write `wakeWizard()` with brackets? Brackets run the function straight away. Hand over the name on its own: `wakeWizard`."*
  3. Unknown event type in the registration log (also a parse-time warning, §4.8) → *"Nothing will ever fire an event called `"Click"`. Event names are lower case: `"click"`."* Include a suggestion table: `onclick→click`, `Click→click`, `mouseOver→mouseover`, `hover→mouseover`, `keypress→keydown`, `keyDown→keydown`, `onkeydown→keydown`, `mouseenter` accepted.
  4. The listener is on the wrong element (a registration exists for the right event type, but on another target) → *"You're listening for clicks on `#stage`, but the trial clicked `#fire-button`."*
  5. Duplicate/stacked registrations (the same handler registered on each event) → *"Every click adds another listener, so the spell runs more and more times. Move `addEventListener` outside the handler."*
  6. A detached method: a handler error or `NaN` value appeared on an element stub (for example `#potion-button.health`) → E2.5's message.
- Trials never mutate each other: each has its own context. The live session (§4.9) is separate again.

### 4.7 Result schema and validation (`src/edp/validation/result.js`)

`validEdpResult(result, checkpointId)` must reject anything unexpected, as Tome I does:
- `status ∈ {success, validButIncomplete, error, stopped}`. `diagnostics` uses Tome I's diagnostic shape, with `file ∈ {'spells.js','workshop-checks.js'}`.
- For `success`/`validButIncomplete`: `trials` is an array of ≤12 `{id, name, category, passed:boolean, message:string≤300}`. `snapshot` matches §4.6, and its element IDs ⊆ the stage's element IDs. Strings are bounded (text ≤200, class names ≤30, log entries ≤200 chars, log ≤100 entries, registrations ≤60). World numbers are finite integers within their documented ranges (health 0..maxHealth, mana 0..maxMana, x/y within stage bounds).
- Total JSON ≤ `LIMITS.result` (128KB).
- Snapshots are rendered only via `textContent` and canvas drawing, never `innerHTML` (AGENTS.md).

### 4.8 Parser rules (`src/edp/validation/parse.js`)

`parseEdpSource(source, cp)` → `{diagnostics, warnings, tree}`. **Diagnostics block Run. Warnings show in the editor (CodeMirror `severity:'warning'`) but do not block Run.** Tome I only has blocking diagnostics, so the Tome II app must call `editor.diagnostics([...diagnostics, ...warnings])` and pass only `diagnostics` to the Run gate.

Blocking diagnostics (codes in brackets):
- 30KB source limit [`source-limit`]. Acorn ES2022 `sourceType:'script'` syntax errors, with Tome I's wording [`syntax`].
- `____` exercise gaps (reuse Tome I's detection) [`gap`]. Reserved `__ww*` names [`reserved`].
- Not available in Tome II: `window`, `globalThis`, `self`, `fetch`, `XMLHttpRequest`, `localStorage`, `sessionStorage`, `indexedDB`, `postMessage`, `importScripts`, `Worker`, `eval`, `Function`, `Date`, `Math.random`, `setInterval`, `requestAnimationFrame`, `alert`, `prompt`, `confirm` → *"`X` isn't part of the Tome II stage. Use the stage's `document`, `setTimeout` and `console.log` instead."* (`setInterval` gets its own wording: *"Tome II uses `setTimeout` for timers."*) [`unsupported`].
- `import`, `export`, `async`, `await`, generators → Tome I's "synchronous JavaScript" wording [`unsupported`].
- `class` declarations named `Wizard`, `Goblin`, `Character` or `BattleWizard` → *"Your wizard and Grub already exist in Tome II. Use `wizard` and `goblin` directly."* [`redeclare`]. Also a `let`/`const`/`var`/function named `wizard`, `goblin`, `battle`, `lantern`, `runeDoor`, `tower`, `document`, `console`, `setTimeout` or `CustomEvent` [`redeclare`].

Warnings (non-blocking):
- `addEventListener(<string literal>, …)` whose event name is not in the known set → the suggestion from §4.6.3 [`event-name`].
- `addEventListener(…, <CallExpression>)` → *"This calls the function now. Did you mean to hand it over without brackets?"* [`called-handler`]. It is a warning, not an error, because E1.2 deliberately lets learners run it and see what happens.
- `querySelector("<string without #>")` where `"#"+value` is a stage ID → the §4.6.1 message [`selector`].
- A second argument on `removeEventListener` that is an inline function expression → *"This creates a brand-new function, so it can't remove the one you added. Use the function's name."* [`remove-inline`].
- `addEventListener` call nested inside another event handler function → the §4.6.5 message [`nested-listener`]. (Legitimately nesting is not taught, so a warning is fine.)

### 4.9 Live play sessions

After any Run that returns `success` or `validButIncomplete`, the stage becomes **live**. The learner can click, hover, focus and type on the rendered stage and watch their handlers run.

Protocol (worker messages, all plain JSON):

| Host → worker | Worker → host |
|---|---|
| `{type:'edp-session-start', sessionId, checkpointId, source, seed, apprentice:boolean, look}` | `{type:'edp-session-state', sessionId, seq, snapshot, nextTimerInMs}` |
| `{type:'edp-session-event', sessionId, seq, step}` (a step from §4.6) | same |
| `{type:'edp-session-tick', sessionId, seq, elapsedMs}` | same |
| `{type:'edp-session-end', sessionId}` | — |

- The worker keeps **one** session context alive (dispose the previous one on start/end). Each message runs under its own **per-event budget of 100ms** (the interrupt deadline is reset per message). Budget exhaustion → `{status:'stopped'}` for that event. The host shows Tome I's timeout message, ends the session, and shows *"Run again to restart the stage."*
- Timers: the host schedules a real `setTimeout(nextTimerInMs)` and then sends `tick` with the real elapsed time. It caps each tick at 2000ms (so a sleeping laptop doesn't flush minutes of timers) and pauses ticks while `document.hidden`.
- The host ignores results whose `sessionId`/`seq` are stale. The existing stale-run protection pattern (`canCommit`) applies. Editing the source, navigating or pressing Stop ends the session.
- Session snapshots are validated with `validEdpResult`'s snapshot rules before rendering.
- Session logs append to the Crystal Ball, capped at 100 visible entries (drop the oldest). There's a **Pause** toggle for screen-reader users (§5.4).

### 4.10 Limits

Add `EDP_LIMITS` in `src/edp/validation/parse.js`, re-using Tome I values where they fit:

| Limit | Value | Notes |
|---|---|---|
| Source | 30KB | Same as Tome I. |
| Run budget (setup + all trials) | **800ms** | Tome I's 500ms is for one context plus probes. Tome II runs up to 12 fresh contexts. **Benchmark first** (§12.3). If the median full run is under 150ms, reduce to 500ms. Keep the 2s host watchdog. |
| Per live event | 100ms | |
| Trials per checkpoint | ≤12 | |
| Steps per trial | ≤60 | |
| Virtual time per trial | ≤60,000ms | |
| Pending timers | ≤50 | |
| Log entries | ≤100 per run/session view; 200 chars each | |
| Memory / stack | 16MiB / 256KiB | Same as Tome I. |

---

## 5. The Tome II app (`src/edp/app.js`)

### 5.1 Screens and journey

`welcome → intro:1 → E1.1 … E1.5 → review:1 → intro:2 → … → review:6 → recap`.

- **`welcome`** — a module introduction screen (AGENTS.md requires one before the first activity). It is rendered by a small new function in `src/edp/app.js` using the section-screen styles. Content:
  - The story prologue (§7.2), at most 60 words visible.
  - "You will make: a wizard that reacts to clicks, hovers and keys, then a real battle against Grub that runs on your code."
  - Three objectives: *explain what an event, a listener and a handler are*; *write handlers for clicks, mouse movement and keys*; *judge when event-driven programming is a good choice*.
  - Prerequisite: "Tome I: objects, methods and `this`", linking to `?tome=oop`.
  - A section map: an `<ol>` of the six section titles.
  - A primary **Start Tome II →** button (or **Continue** if any progress exists).
  - Disclosures: "What's new in Tome II" (no `actions.js`, stage, Crystal Ball, Spell Trials) and "Unit 4 connection".
  - The screen is recorded as seen in `state.seenWelcome`, and it counts as a journey step for progress.
- Section intros and reviews use `renderSection` with the Tome II descriptor.
- The recap uses `renderRecap` with the Tome II descriptor (§10).
- Checkpoint screens use the layout below.

### 5.2 Checkpoint layout (reuse Tome I structure and classes)

The left workbench mirrors Tome I: eyebrow (`SECTION 2 · THE CLICK OF COMMAND / E2.3`), scaffold label, title, objective, the `Step instructions & success checklist` disclosure, the editor shell, the run bar (`Run code`, `Stop`, `Hint 1`, `Reset step`, `Insert exercise gaps`), the result live region, `Go to problem`, the technical detail, hints, the `Predict, explain & self-check` disclosure, and Previous/Next.

Differences from Tome I:
- **Editor tabs:** `spells.js` (editable, the only learner file) and `stage.html` (read-only). The `stage.html` tab shows the pre-rendered, HTML-highlighted stage markup in a scrollable panel styled like the editor (`surface-editor`), with the caption *"Read-only: the page's HTML. Your JavaScript in spells.js makes it react."* It has the same `role="tab"` pattern as Tome I. Its panel is a `div` with `tabindex="0"`, so keyboard users can scroll it.
- **Success checklist** = the list of trial names, each with its category tag and a ○/✓/✗ state, text first and never colour alone (for example `✓ Typical — Clicking the bell wakes your wizard`).
- The **"Insert exercise gaps"** button inserts the checkpoint's `gap` snippet at a marked comment (`// ✦ gap goes here`) in the starter. A simpler rule than Tome I's.

The right-hand panel — **"The Stage"** (replaces the Conjuring Room for Tome II):
1. Heading `THE STAGE` (eyebrow) + `Your spells, listening` (h2) + the `● LIVE` / `○ NOT LISTENING YET` label (text, not colour-only).
2. A **stage frame** (`tabindex="0"`, `aria-label="Stage. Keys you press here are sent to your spells."`): the 320×240 canvas (scene + sprites, decorative) with **real DOM controls** positioned over or beside it (stage buttons, sprite hotspots, the incantation input). Below it sits the one-line hint *"Click the stage, then press keys. Tab moves out."*
3. **Character strip**: DOM text for the wizard (name, health meter, mana meter, awake/asleep, shield) and Grub (health meter, "Plan: hidden/…" in the battle). Reuse Tome I's `meter` pattern.
4. **Crystal Ball** (§5.4).
5. The **Registered listeners** disclosure: a table of target, event and handler name, from the registration log.

### 5.3 Rendering the stage (`src/edp/stage/renderStage.js`)

- `renderStage(frame, stageDef, snapshot, {live, onStep})`:
  - Create the stage's elements once per checkpoint as **real** host elements (`button`, `input`, `div`) with **host-generated IDs prefixed `stage-`** (so they can never clash with app IDs). Map them to guest IDs.
  - Apply the snapshot using `textContent`, `hidden`, `className` (only from the snapshot's validated classes, prefixed `stg-` for CSS, e.g. `glow` → `stg-glow`), `value` and `disabled`.
  - Draw the canvas with `drawScenes.js` (`drawScene(ctx, stageDef.scene, snapshot.world)`), reusing `sprites.js` for the wizard (with its Tome I look) and Grub. It is decorative, and every state is also in DOM text.
- **Live input forwarding** (only while `live`):
  - `click` on a stage button or hotspot → `{do:'click', target}`. On a `coords` element, compute `offsetX/offsetY` in canvas pixels (`Math.round((e.clientX-rect.left) * 320/rect.width)`).
  - `mouseover`/`mouseout` → forwarded only when the pointer enters or leaves a stage element (use the host's own `mouseover`/`mouseout` with `relatedTarget` checks). **Never forward `mousemove`.**
  - `focus`/`blur` on stage elements → forwarded.
  - `keydown` when focus is inside the stage frame (or on a stage input) → `{do:'key', key:e.key, target}`. **Never forward Tab or Shift+Tab**, so focus can always leave. Call the host's `e.preventDefault()` for arrow keys and Space inside the stage, so the real page doesn't scroll. The simulated scroll notice still depends on the guest's `defaultPrevented` (§4.5).
  - `input` on the stage input → `{do:'type'}` for the new character (or for Backspace when the value gets shorter).
  - Throttle to at most 20 forwarded events per second. Queue while one is in flight.
- Stage CSS classes the curriculum uses: `stg-glow` (gold outline), `stg-outlined` (lavender outline), `stg-open` (door open state), `stg-lit`. All are static styles, with no animation.

### 5.4 The Crystal Ball (event log)

The main teaching aid, because it makes events visible.

```
CRYSTAL BALL                                   [Pause] [Clear]  Filter: ☑ Clicks ☑ Mouse ☑ Keys ☑ Timers ☑ Custom ☑ console.log
0.0s   setup     spells.js ran — 2 listeners added
1.2s   click     #fire-button     → handler: castFire  ✓
1.9s   mouseover #goblin          → handler: showGoblinStats  ✓
2.4s   keydown   key "I"          → nobody is listening 💤
3.9s   timer     goblinTakesTurn  ✓
4.0s   console   "Grub's turn is over"
```

- A `<details class="crystal-ball" open>` with an `<ol>` of text entries. Each entry is **text only** (via `textContent`). The 💤 glyph is supplementary to the words "nobody is listening".
- Trial runs show their logs collapsed per trial ("Trial 2 · Typical — 5 events"), so the learner can see exactly what the automated check did.
- Accessibility: the list is **not** a live region, to avoid flooding screen readers. A separate polite live region announces a throttled summary at most once every 2 seconds ("3 new events"). **Pause** freezes the visible list; events keep running.
- The **slow-motion mode** toggle (used in S5): new events first appear in a visible "Queue" list and move to the log one at a time, every 600ms. Reduced motion disables the timing (items move instantly), but the ordering is still shown as numbered steps. Implement this as a presentation of already-returned entries; it does not slow the guest.

### 5.5 Result messages and diagnostics

Reuse Tome I's result states and wording style:
- Success: `✓ <checkpoint effect text>`, confetti from Run code (existing `createCelebration`), Next enabled.
- Incomplete: `○ Your spells ran. Next: <first failing trial message>`.
- Error/stopped: `⚠ <message> Your last working stage is still here.` plus `Go to problem` (`spells.js · line N, column M`).
- The last good snapshot per checkpoint is saved (`lastGoodSnapshotByCheckpoint`) and restored on revisit, labelled *"Last saved successful stage — rerun to make it live."* A restored snapshot is **never live** until the learner presses Run (Tome I: saved code never runs automatically).

### 5.6 Activities (non-coding checkpoints)

Some checkpoints add a small activity below the objective, in place of or alongside the editor (`cp.activity`). They are formative. Answers are stored in `activityAnswersByCheckpoint`, checked with explicit rules (never evaluated), and allow retries.

| `activity.type` | UI | Checking |
|---|---|---|
| `sort` | Card buttons, each toggling between two labelled bins (radio groups per card: "Mostly procedural" / "Mostly event-driven"). | Per-card feedback text, as in Tome I's C4.1 comparison buttons. |
| `predict` | Before **Run code** is enabled, the learner picks an option (radio group) and presses **Lock in my prediction**. After Run, the actual output is shown beside their prediction. | Never marked wrong. It shows "Your prediction matched" or "Surprise! Here's why…". |
| `trace-table` | A table with some cells as text inputs (with `aria-label`s giving row and column). | Each cell uses `checkAnswer`-style `accept` lists. Feedback per row. |
| `truth-table` | Same as a trace table, with `true`/`false` select boxes. | Explicit answers. |

A checkpoint with an activity completes when its code trials pass **and** its activity has been attempted (not necessarily all correct), consistent with "no perfect-score gate".

### 5.7 The battle screen (E6.7)

- Same layout, with the stage enlarged: at ≥1100px the stage column widens to 60%, using a `body.battle-mode` class.
- The battle HUD is DOM text: Wizard health/mana meters, Grub health meter, the turn indicator ("Your turn" / "Grub is thinking…"), the Fireball window countdown as text updated every second ("Fireball window: 3s left"), and potions left.
- Controls come from the stage definition (`#spell-bar` with fire/ice/electricity cards, `#shield-button`, `#potion-button`, `#fireball-button`, `#goblin` hotspot, `#intent-bubble`, `#incantation-display`). A control with **no accepted listener** after setup gets the text badge "💤 not listening" beside it (from the registration log). The learner can still play, and sees exactly what is missing.
- **Apprentice mode** toggle in Workspace tools (saved in `preferences.apprenticeMode`): Fireball window 10s instead of 5s, and Grub's damage ×0.75. For accessibility and confidence. It is labelled clearly and carries no penalty.
- **End states:** drawn with Tome I's Game Over banner style, mirrored in DOM text. The victory and defeat content is in §9.5.
- After the battle, a **stats panel** (DOM): events handled by type, spells cast by power, turns taken, whether the player scried Grub's plan. It is useful evidence for the report, and it goes into the recap download.

### 5.8 Styling

Append to `src/styles.css`. Reuse tokens and component patterns (DESIGN.md). New classes: `.landing*`, `.tome`, `.stage-frame`, `.stage-hotspot`, `.stg-*`, `.crystal-ball`, `.trial-list`, `.trial-tag`, `.activity-*`, `.battle-hud`. No new fonts, no glow on ordinary controls (the `stg-glow` stage class is game art inside the stage frame), and no looping animation. The stage frame focus ring is the standard gold outline. Check contrast for every new text/background pair (≥4.5:1).

---

## 6. Data model

### 6.1 Checkpoint record (`src/edp/curriculum/checkpoints.js`)

```js
{
  id: 'E2.3', chapter: 2,                         // chapter = Number(id[1]) (same rule as Tome I)
  title: 'Where did I click?', objective: '…',    // prose with backtick code
  scaffold: 'gaps',                               // Tome I labels: worked example | gaps | partial prompts | prompts only | independent | guided
  stage: 'courtyard',
  starter:  {spellsSource: '…'},                  // prepared or carried forward (see starterStrategy)
  solution: {spellsSource: '…'},                  // must pass every trial (tested)
  starterStrategy: 'prepared' | 'previous-success',
  gap: 'wizard.moveTo(event.offsetX, event.____);' | null,
  instructions: ['…'], hints: ['concept', 'location & syntax', 'worked example'],   // exactly 3 (tested)
  reflection: '…' | '',                           // "Predict, explain & self-check" disclosure
  effect: 'Clicking the courtyard walks your wizard to that spot.',
  setup: {wizard:{mana:20}},                      // trusted per-checkpoint world overrides
  trials: [{id:'t1', name:'…', category:'typical', steps:[…], reads:[], expect: snap => null | 'message'}],
  starterExpected: {status:'validButIncomplete'|'error'|'success'|'stopped', reason:'…'},   // tested, as in Tome I
  activity: null | {type:'sort'|'predict'|'trace-table'|'truth-table', …},
  reads: [],                                      // globals exposed to trials
}
```

- `expect` functions are trusted host code. They must read only the plain snapshot.
- Add the same post-processing loop pattern as Tome I only if needed. Prefer explicit per-checkpoint hints (the `customHints` pattern). Every checkpoint in §8 specifies its hints.
- `starterStrategy:'previous-success'`: on sequential Next, the new draft starts from the previous checkpoint's last successful `spellsSource` (Tome I's `initialise()` rule). Where §8 says **prepared**, use the given starter instead. Previous drafts are never lost.

### 6.2 Sections (`src/edp/curriculum/sections.js`)

Identical shape to Tome I's `sections.js` (`id`, `chapter`, `title`, `intro:{hook, build, objectives[≤3], summary, prerequisites, concepts[[term,def]], example:{code, walkthrough[], result, check}, predict:[q,a], assignmentLink}`, `review:{questions}`), with one extension: `example.stage` and `example.steps`. **Tome II worked examples use the stage**, so they can't run in a plain QuickJS context. The test harness runs them through `runEdpExample(QuickJS, {stage, code, steps, check})`, which uses the prelude and evaluates the `check` expression in the guest after the steps.

Constraints (mirror `tests/sections.test.js`): `hook` ≤140 chars, `build` ≤140, `summary` ≤240, 2–3 objectives, `predict.length === 2`, ≥2 choice and ≥2 blank questions, choice options ≥3 with exactly one correct (always written first, per the helper), blank code with exactly one `____`, `revisit` = a Tome II checkpoint ID or `intro:N`, question IDs unique across Tome II.

---

## 7. Story and characters

### 7.1 Characters

- **Your wizard.** The learner's Tome I wizard. It keeps its name and look (D6) and has 100 health, as in Tome I. New in Tome II: **mana** (magic energy that spells use up), `say()`, walking, a shield and potions.
- **Grub.** The goblin from Tome I (`new Goblin("Grub")`). He is cheeky rather than scary, and speaks in the third person ("Grub likes shiny things. Grub likes *your* shiny thing."). In the battle he has eaten Rune Bell cake, so his `maxHealth` is raised on that one object (a callback to Tome I's per-object customisation).
- **Quill.** A new character: the tower's messenger owl and the learner's guide. Delivering messages to whoever is listening makes Quill a living metaphor for events and the event loop. Catchphrase: *"A message nobody is listening for is just a very tired owl."* Quill appears in intro hooks, result messages and the Crystal Ball's empty state ("Quill is waiting for something to happen…").

### 7.2 Continuity bridge from Tome I (welcome screen prologue, ≤60 words visible)

> Your wizard is magnificent: every property set, every method written. There's one problem. It never *does* anything unless a line of `actions.js` tells it to. And right now, Grub is sneaking off with the tower's **Rune Bell**. Your wizard must learn to **listen** — and react the moment something happens.

The "What's new in Tome II" disclosure adds: *"In Tome I, `actions.js` decided the order. In Tome II there is no `actions.js`. You write listeners, and the player decides what happens and when."*

### 7.3 Arc

| Section | Story beat | Stage |
|---|---|---|
| 1 The Listening Stones | Quill wakes the wizard. The first click-driven actions. | Tower bedroom |
| 2 The Click of Command | Grub is spotted in the courtyard. The wizard follows commands: spells, walking, a spellbook. | Spell room, courtyard |
| 3 The Hover Charm | Grub flees into the Whispering Wood. Hidden potions, a cursed chest and a way to read Grub's health. | Whispering Wood |
| 4 The Rune Keys | The Rune Door blocks the path. It opens only to typed words. | Rune Door |
| 5 The Owl's Rounds | Quill explains the queue. Practice turn-taking and timers in the owl loft. | Owl loft |
| 6 Battle of Grubbledown Bridge | The showdown. It runs only on the learner's handlers. | Grubbledown Bridge |

**Ending.** On victory, Grub drops the Rune Bell and scampers off shouting *"Grub will be back! Grub has a whole **database** of grudges!"* (a teaser for Unit 5). The final prompt says *"Ring the Rune Bell."* A single click dispatches a trusted `bellRung` custom event, and the Crystal Ball shows the whole tower waking in sequence: lanterns, the Rune Door, Quill. On defeat, Grub blows a raspberry, and Quill offers a targeted tip based on the post-battle stats (for example *"You never scried Grub's plan — hover over him before choosing a spell."*). Retry is instant.

---

## 8. Content

Conventions for this section:
- Code is shown exactly as it should appear in curriculum strings (double quotes, two-space indent, semicolons, as in Tome I).
- "**Prepared**" = use this starter. "**Carry**" = the starter is the previous checkpoint's last successful source (`starterStrategy:'previous-success'`), plus any appended comment shown.
- Trials are listed as `[category] name — steps → expectation`. The failure message follows ⟶. Write each failure message as a repair the learner can try.
- Unless stated, the wizard trial setup is `{level:1, specialPower:'fire', mana:20, health:100, awake:true}` and Grub is `{health:60, maxHealth:60}`.
- Hints are always three: **1 · Concept**, **2 · Location and syntax**, **3 · Worked example** (the solution, rendered by the existing hint UI).

### 8.0 Module welcome screen (`welcome`)

See §5.1 and §7.2. Objectives (exactly three, rendered after "By the end of Tome II, you will be able to:"):
1. explain what an event, a listener and a handler are
2. write handlers for clicks, mouse movement and key presses
3. judge when event-driven programming is a good choice

---

### SECTION 1 — The Listening Stones (`ES1`, chapter 1)

**Intro**

| Field | Content |
|---|---|
| title | `The Listening Stones` |
| hook | `Your wizard is built but frozen. Teach it to listen.` |
| build | `A wizard that wakes, sleeps and lights a lantern when buttons on the stage are clicked.` |
| objectives | `explain what an event, a listener and a handler are` · `use \`addEventListener\` to connect a click to a function` · `compare event-driven code with the fixed order of \`actions.js\`` |
| summary | `An event is something that happens, such as a click. \`addEventListener\` tells an element which event to listen for and which function, the handler, to run when it happens.` |
| prerequisites | `From Tome I: a method only runs when it is called, and \`actions.js\` ran your calls from top to bottom.` |
| concepts | `event` — Something that happens that a program can notice, such as a click or a key press. · `event listener` — An instruction to wait for one kind of event on one element. · `event handler` — The function that runs when the event happens. · `callback` — A function handed over to be called back later. · `event-driven programming` — A style where the program waits for events and reacts to them. · `procedural programming` — A style where the program runs steps in a fixed order, like \`actions.js\`. |
| example.stage / steps | `example-lantern` / `[{do:'click', target:'#lantern-button'}]` |
| example.code | see below |
| example.check | `lantern.lit === true` |
| walkthrough | `\`document.querySelector("#lantern-button")\` finds the button in the page's HTML. \`#\` means "the element with this id".` · `\`lightLantern\` describes what should happen. Writing it does not run it.` · `\`addEventListener("click", lightLantern)\` hands the function over. There are no brackets after \`lightLantern\`, so it waits for a click.` |
| result | `Nothing happens when the code runs. Each click on the button lights the lantern.` |
| predict | `The code has run, but nobody has clicked. Is the lantern lit?` / `No. \`lightLantern\` was only handed over. It runs when a click happens.` |
| assignmentLink | `Assignment 1 asks you to explain event-driven programming. Use the words event, listener and handler, and say who decides the order in which the code runs.` |

```js
const lanternButton = document.querySelector("#lantern-button");

function lightLantern() {
  lantern.turnOn();
}

lanternButton.addEventListener("click", lightLantern);
```

**Stage `tower-bedroom`:** a canvas bedroom (reuse the Tome I stone wall, add a bed and a window). The wizard is asleep in bed ("Zzz" pixels) when `awake` is false, and standing when awake. Elements: `#wake-button` "Ring the bell", `#sleep-button` "Snuff the candle", `#lantern-button` "Light the lantern", `#snuff-button` "Put the lantern out". World: `wizard` (starts `awake:false`), `lantern` (starts unlit).

**Checkpoints**

| ID | Title | Scaffold | Starter | Activity |
|---|---|---|---|---|
| E1.1 | Listen for the bell | worked example | Prepared | — |
| E1.2 | The lantern that lit too soon | guided | Prepared (E1.1 solution + buggy block) | — |
| E1.3 | Time for bed | partial prompts | Carry + comment | — |
| E1.4 | A shorter way to write it | gaps | Carry + gap | — |
| E1.5 | Who decides the order? | independent | Carry (already passes) | `sort` |

**E1.1 — Listen for the bell.** Objective: ``Add one line so `#wake-button` listens for `"click"` and runs `wakeWizard`.``

Prepared starter:
```js
// spells.js — your wizard's event listeners live here.

// 1. Find the bell button in the page's HTML (see the stage.html tab).
const wakeButton = document.querySelector("#wake-button");

// 2. Say what should happen when the bell rings.
function wakeWizard() {
  wizard.wake();
  wizard.say("Hmm? Who rang the bell?");
}

// 3. Tell the button to listen for clicks. Write your line below:

```
Solution: append `wakeButton.addEventListener("click", wakeWizard);`

Instructions: (1) `In Tome I, \`actions.js\` called your methods in a fixed order. Now there is no \`actions.js\`. Your code will wait for something to happen.` (2) `Open the \`stage.html\` tab. The bell is a button with the id \`wake-button\`.` (3) `Below step 3, type: \`wakeButton.addEventListener("click", wakeWizard);\`` (4) `Run, then click Ring the bell on the stage. Watch the Crystal Ball.`

Trials:
- [typical] Your wizard stays asleep until someone clicks — setup only → `wizard.awake === false`. ⟶ `Your wizard woke up before anyone clicked. Check that \`wakeWizard\` has no brackets after it.`
- [typical] Clicking the bell wakes your wizard — click `#wake-button` → `awake === true` and `lastSpeech` is not empty. ⟶ `Nothing was listening for clicks on \`#wake-button\`. Add the \`addEventListener\` line under step 3.` (Use the §4.6 generic messages when they apply.)
- [typical] Three clicks run the handler three times — 3 × click → the log has 3 entries with handler `wakeWizard`.

Hints: 1 `An event listener waits for one kind of event on one element. \`addEventListener\` needs the event's name as text, then the function to run.` · 2 `Under step 3, write \`wakeButton.addEventListener("click", wakeWizard);\`. The event name is in quotes; the function name is not.` · 3 solution.
Reflection: `spells.js ran in a split second when you pressed Run. So how can your wizard wake up a minute later when you click? Where is the program waiting?`
Effect: `Click Ring the bell: your wizard wakes up and speaks.` starterExpected: `validButIncomplete`.

**E1.2 — The lantern that lit too soon.** Objective: ``Fix the lantern so it lights only when `#lantern-button` is clicked.``

Prepared starter = E1.1 solution, followed by:
```js

const lanternButton = document.querySelector("#lantern-button");

function lightLantern() {
  lantern.turnOn();
}

lanternButton.addEventListener("click", lightLantern());
```
Solution: `lanternButton.addEventListener("click", lightLantern);`

Instructions: `Quill tried to wire up the lantern. Run the code before changing anything. The lantern lights straight away, and clicking does nothing. Find out why and fix it.` The editor warning `called-handler` appears here but does not block Run.

Trials:
- [typical] The lantern is dark until someone clicks — setup → `lantern.lit === false`. ⟶ §4.6 message 2.
- [typical] Clicking lights the lantern — click → `lit === true`.

Hints: 1 `\`lightLantern()\` with brackets means "run it now". \`lightLantern\` without brackets means "here is the function, for later".` · 2 `On the last line, delete the \`()\` after \`lightLantern\`.` · 3 solution.
Reflection: `\`lightLantern()\` ran once, straight away, and handed \`addEventListener\` its result: \`undefined\`. What does the Crystal Ball show when you click now, and why?`
starterExpected: `validButIncomplete`.

**E1.3 — Time for bed.** Objective: ``Make `#sleep-button` run a function that puts your wizard to sleep and says goodnight.``

Carry + appended comment: `\n// ✦ Make #sleep-button call a function that runs wizard.sleep() and wizard.say("Goodnight!").\n`

Solution adds:
```js

const sleepButton = document.querySelector("#sleep-button");

function goToSleep() {
  wizard.sleep();
  wizard.say("Goodnight!");
}

sleepButton.addEventListener("click", goToSleep);
```
Trials:
- [typical] Sleep after waking — click wake, click sleep → `awake === false`, speech matches `/goodnight/i`.
- [typical] The player chooses the order — wake, sleep, wake → `awake === true`.
- [erroneous] Sleeping when already asleep causes no error — click sleep → `awake === false`, no handler errors.

Hints: 1 `You need the same three parts as the bell: find the element, write a function, connect them with \`addEventListener\`.` · 2 `Copy the pattern of the bell code. Use \`#sleep-button\`, a new function name such as \`goToSleep\`, and \`wizard.sleep();\`.` · 3 solution.
Reflection: `In Tome I, \`actions.js\` fixed the order of every action. Here, who decides whether the wizard wakes or sleeps first?`

**E1.4 — A shorter way to write it.** Objective: ``Use an arrow function so `#snuff-button` puts the lantern out.``

Instructions introduce the **arrow function**: `A short way to write a small function with no name. \`() => lantern.turnOff()\` means the same as \`function () { lantern.turnOff(); }\`.` Show both forms side by side.

Carry + gap: `\nconst snuffButton = document.querySelector("#snuff-button");\nsnuffButton.addEventListener("click", ____ => lantern.turnOff());\n`

Solution line: `snuffButton.addEventListener("click", () => lantern.turnOff());`

Trials:
- [typical] Snuffing puts the lantern out — click lantern, click snuff → `lit === false`.
- [typical] The handler is an arrow function — the registration on `#snuff-button` has handler `'(arrow function)'`. ⟶ `This step practises arrow functions. Write \`() => lantern.turnOff()\` as the second argument.`

Hints: 1 `An arrow function starts with its brackets, then \`=>\`.` · 2 `Replace \`____\` with empty brackets: \`()\`.` · 3 solution.

**E1.5 — Who decides the order?** Objective: ``Sort each program into mostly procedural or mostly event-driven, then explain one choice.`` It runs successfully from the carried code (starterExpected `success`), and completes when the sort has been attempted (§5.6).

Instructions show the two approaches:
```js
// PROCEDURAL (like actions.js): the programmer fixes the order
wizard.wake();
wizard.say("Morning!");
wizard.sleep();
```
```js
// EVENT-DRIVEN: the player chooses the order, whenever they like
wakeButton.addEventListener("click", wakeWizard);
sleepButton.addEventListener("click", goToSleep);
```
Sort cards (bins: *Mostly procedural* / *Mostly event-driven*), each with feedback:
- An overnight job that works out everyone's pay → procedural: `It runs once, start to finish, with nobody pressing anything.`
- A calculator app → event-driven: `It waits for button presses.`
- A script that renames 1,000 photos → procedural.
- A video game → event-driven.
- A vending machine → event-driven: `Not a website, but it still waits for coins and button presses.`
- A report printing last month's sales → procedural.
- A smart doorbell → event-driven.

Reflection: `Could you write a video game procedurally, with every step fixed in advance? What would it feel like to play?`

**Review — Check your understanding: The Listening Stones**

```js
choice('ES1-Q1','In an event-driven program, what mainly decides the order in which handlers run?',[['The events that happen, such as the player clicking.','Correct. The player and the world decide.'],['The order the lines are written in.','That describes procedural code, like `actions.js` in Tome I.'],['The alphabetical order of the function names.','Names do not affect when handlers run.']],'E1.3'),
choice('ES1-Q2','What is an event handler?',[['A function that runs when a particular event happens.','Correct.'],['The element that was clicked.','That is the event target.'],['A list of every event on the page.','A handler is one function connected to one event.']],'E1.1'),
choice('ES1-Q3','`lanternButton.addEventListener("click", lightLantern());` What goes wrong?',[['`lightLantern` runs straight away, and nothing useful is left listening.','Correct. Brackets run the function now.'],['The lantern lights twice on every click.','The click handler never runs at all.'],['Nothing. This is correct.','Look at the brackets after `lightLantern`.']],'E1.2'),
choice('ES1-Q4','`spells.js` has finished running and nobody has clicked. What is the program doing?',[['Waiting for the next event.','Correct. The listeners stay ready.'],['Running every handler in a loop.','Handlers run only when their event happens.'],['It has closed.','The listeners are still there, waiting.']],'intro:1'),
blank('ES1-Q5','Listen for clicks.','bell.addEventListener("____", ringBell);',['click'],'Correct. Event names are lower-case strings.','Which event happens when a button is pressed? Use lower case.','E1.1'),
blank('ES1-Q6','Hand over the handler for later.','bell.addEventListener("click", ____);',['ringBell'],'Correct. The name on its own hands over the function without running it.','Write the function name with no brackets.','E1.2'),
blank('ES1-Q7','Find the element whose id is `wake-button`.','const wakeButton = document.querySelector("____");',['#wake-button'],'Correct. `#` means "the element with this id".','IDs need a symbol in front.','E1.1'),
blank('ES1-Q8','Start an arrow function.','snuffButton.addEventListener("click", ____ => lantern.turnOff());',['()'],'Correct. Empty brackets, then the arrow.','An arrow function with no inputs starts with empty brackets.','E1.4'),
```

---

### SECTION 2 — The Click of Command (`ES2`, chapter 2)

**Intro**

| Field | Content |
|---|---|
| hook | `Grub has the Rune Bell and he is getting away. Your wizard needs to follow orders, fast.` |
| build | `Spell buttons that check mana, a courtyard your wizard walks across, and one spellbook listener for every spell.` |
| objectives | `use \`if\` inside a handler to decide what happens` · `read details from the event object` · `handle clicks on many buttons with one listener` |
| summary | `Every handler receives an event object with details such as \`event.target\`, the element that was clicked. Handlers are ordinary functions, so they can use \`if\` and your Tome I methods.` |
| prerequisites | `From Tome I: \`wizard.castSpell(goblin)\` damages its target, and \`specialPower\` chooses fire, ice or electricity.` |
| concepts | `mana` — Your wizard's magic energy. Each spell uses some up. · `event object` — The parcel of details the browser hands to every handler. · `\`event.target\`` — The element the event happened to. · `\`offsetX\` and \`offsetY\`` — Where a click happened inside an element. · `\`data-\` attribute` — Extra information written into HTML, read with \`dataset\`. · `bubbling` — A click on a button also travels up to the elements around it. · `event delegation` — One listener on a container handling events from everything inside it. |
| example.stage / steps | `example-map` / `[{do:'click', target:'#map', offsetX:40, offsetY:25}]` |
| example.check | `document.querySelector("#pin").textContent === "X marks 40, 25"` |
| result | `Clicking the map at (40, 25) makes the pin read "X marks 40, 25".` |
| predict | `What does the pin say after a click at (100, 60)?` / `"X marks 100, 60". The event object carries the new position on every click.` |
| assignmentLink | `For your report, annotate a handler: label the event, the event object, the selection and the method call, then explain how they work together.` |

```js
const map = document.querySelector("#map");
const pin = document.querySelector("#pin");

map.addEventListener("click", function (event) {
  pin.textContent = "X marks " + event.offsetX + ", " + event.offsetY;
});
```
Walkthrough: `The handler now has a parameter, \`event\`. The browser fills it in on every click.` · `\`event.offsetX\` and \`event.offsetY\` say where the click happened inside the map.` · `\`+\` joins text and numbers into one string, as in Tome I.`

Optional disclosure **"TypeScript lens"** (D8), shown in the section intro's walkthrough disclosure only: ``In TypeScript you could write `function (event: MouseEvent)`. The type tells the editor which details a click event carries.``

**Stages.** `spell-room`: Grub is practising dodging at the far end (Grub sprite, 60 health). Elements: `#fire-button` "Fire (4 mana)", `#ice-button` "Ice (3 mana)", `#potion-button` "Healing potion", and `#spellbook` (DIV) containing `#fire-card` (`data-power="fire"`), `#ice-card` (`data-power="ice"`), plus `#learn-button` "Learn a new spell". `#learn-button` has a **trusted stage listener** that creates `#storm-card` (`data-power="electricity"`) inside `#spellbook` the first time it is clicked. The Crystal Ball labels this handler `(stage)`. `courtyard`: a lawn with `#courtyard` (`coords:true`). The wizard walks there (a pixel step animation is **not** needed; draw it at the new position).

| ID | Title | Scaffold | Starter |
|---|---|---|---|
| E2.1 | Cast on command | gaps | Prepared |
| E2.2 | Where did I click? | gaps | Prepared |
| E2.3 | One spellbook, many spells | partial prompts | Prepared |
| E2.4 | The vanishing `this` | guided | Prepared |

**E2.1 — Cast on command.** Objective: ``Make `#ice-button` cast ice when the wizard has at least 3 mana, or say "Not enough mana!".``

Prepared starter:
```js
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
```
`gap` (inserted by *Insert exercise gaps*):
```js
iceButton.addEventListener("____", function () {
  if (wizard.mana >= ____) {
    wizard.specialPower = "ice";
    wizard.castSpell(goblin);
  } else {
    wizard.say("Not enough mana!");
  }
});
```
Solution: the gap block filled with `click` and `3`.

Instructions explain **mana** and that the fire handler contains a Tome I `if`. The ice spell costs 3 mana. `castSpell` is your Tome I method; in Tome II it also uses mana, and it **fizzles** (does nothing) if there isn't enough. Your `if` stops the fizzle and explains why to the player.

Trials (Grub 60 health; fire deals 14 and ice 12 at level 1):
- [typical] Fire works as before — click fire → Grub 46, mana 16.
- [typical] Ice casts with plenty of mana — click ice → Grub 48, mana 17, `lastSpell === 'ice'`.
- [extreme] Exactly 3 mana is enough — setup mana 3; click ice → Grub 48, mana 0.
- [extreme] 2 mana is not enough — setup mana 2; click ice → Grub 60, no fizzle in the log, speech `/not enough mana/i`. ⟶ `With 2 mana the spell fizzled. Check the \`if\` compares \`wizard.mana >= 3\` and the \`else\` says "Not enough mana!".`
- [erroneous] Button mashing drains mana safely — setup mana 10; click ice ×5 → 3 casts (mana 1), then the refusal twice; Grub 60 − 36 = 24.

Reflection: `Why test with exactly 3 mana and with 2 mana? What kind of bug would those tests catch that a test with 20 mana would miss?`

**E2.2 — Where did I click?** Stage `courtyard`. Objective: ``Walk your wizard to wherever the courtyard is clicked, using the event object.``

Prepared starter:
```js
const courtyard = document.querySelector("#courtyard");

courtyard.addEventListener("click", function (event) {
  console.log("Click at", event.offsetX, event.offsetY);
  wizard.moveTo(event.offsetX, event.____);
});
```
Solution: `offsetY`. Instructions introduce `console.log` (it writes to the Crystal Ball) and the live parcel view: the Crystal Ball entry for a click expands to show `type`, `target`, `offsetX`, `offsetY`.

Trials: [typical] click (200,150) → wizard (200,150) · [typical] two clicks, the wizard ends at the second · [extreme] click at the lawn edge (319,239) → the wizard is clamped inside the walkable area and there are no errors.

Reflection: `The browser fills in the event object for you. Why is that better than your handler having to work out where the mouse was?`

**E2.3 — One spellbook, many spells.** Stage `spell-room`. Objective: ``Replace the separate card listeners with one listener on `#spellbook` that casts the clicked card's power.``

Prepared starter (the long way, so the repetition is felt):
```js
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

// ✦ Replace both listeners above with ONE listener on #spellbook.
```
Solution:
```js
const spellbook = document.querySelector("#spellbook");

spellbook.addEventListener("click", function (event) {
  const power = event.target.dataset.power;

  if (power) {
    wizard.specialPower = power;
    wizard.castSpell(goblin);
  }
});
```
Instructions: first, run the starter, click **Learn a new spell**, then click the new Storm card. Nothing happens, because no listener was ever added to it. Explain **bubbling** (*"shout in a room and the whole room hears"*) and `data-power` (show the `stage.html` tab). Then write the delegated listener.

Trials:
- [typical] Fire card casts fire / [typical] Ice card casts ice.
- [erroneous] Clicking the spellbook's cover casts nothing — click `#spellbook` → no cast, no errors. ⟶ `Clicking the book's cover (not a card) tried to cast. Check \`if (power)\` so only cards with a \`data-power\` cast.`
- [typical] A newly learnt spell works straight away — click `#learn-button`, click `#storm-card` → `lastSpell === 'electricity'`.
- [typical] One listener does the work — the registration log has exactly one `click` listener on `#spellbook` and none on the cards. ⟶ `There are still listeners on the individual cards. Remove them and keep one on \`#spellbook\`.`

Reflection: `You spotted a pattern: two listeners that were nearly identical. How did recognising it help? This is pattern recognition and generalisation from computational thinking.`

**E2.4 — The vanishing `this`.** Stage `spell-room`. Objective: ``Fix the potion button so clicking it really heals your wizard.``

Prepared starter:
```js
// Grub's arrow grazed your wizard. The potion should heal them.
const potionButton = document.querySelector("#potion-button");

potionButton.addEventListener("click", wizard.recoverHealth);
```
Trial setup: wizard health 50. Solution: `potionButton.addEventListener("click", () => wizard.recoverHealth());` (also accept `wizard.recoverHealth.bind(wizard)`).

Instructions: `Run it and click the potion. The Crystal Ball shows an error. When a method is handed over on its own, it forgets which object it belongs to. Inside the handler, \`this\` becomes the button, and a button has no health.` Explain that the arrow function calls the method **on** `wizard`. This is the explicit bridge from Tome I's `this`.

Element stubs are **not extensible** (`Object.preventExtensions`), and class bodies are strict, so `this.health = …` on the button throws a `TypeError`. The engine maps this handler error to: `Inside \`recoverHealth\`, \`this\` was the button, not your wizard. Wrap the call in an arrow function: \`() => wizard.recoverHealth()\`.`

Trials: [typical] Clicking the potion heals 50 → 70 · [typical] No errors in the Crystal Ball.

Reflection: `Objects and events are working together here. Which part is object-oriented and which part is event-driven? Could you have one without the other?`

**Review — Check your understanding: The Click of Command**
```js
choice('ES2-Q1','Inside a click handler, what is `event.target`?',[['The element that was clicked.','Correct.'],['The function handling the event.','That is the handler.'],['The next event waiting in line.','The target is where this event happened.']],'E2.3'),
choice('ES2-Q2','Mana is 2 and ice costs 3. The handler checks `if (wizard.mana >= 3)`. What happens when Ice is clicked?',[['The wizard says "Not enough mana!" and no spell is cast.','Correct. The `else` branch runs.'],['Ice is cast and mana becomes -1.','The `if` stops that.'],['An error appears.','An `if` choosing `else` is not an error.']],'E2.1'),
choice('ES2-Q3','Why use one listener on `#spellbook` instead of one on every card?',[['Less repeated code, and cards added later work too.','Correct. Bubbling brings every card click to the book.'],['Clicks on a book are faster.','Speed is not the reason.'],['Buttons cannot have listeners.','They can; one shared listener is just easier to maintain.']],'E2.3'),
choice('ES2-Q4','`potionButton.addEventListener("click", wizard.recoverHealth)` fails. Why?',[['Handed over on its own, the method runs with `this` as the button.','Correct. Wrap it: `() => wizard.recoverHealth()`.'],['`recoverHealth` only works in Tome I.','It works when called on `wizard`.'],['Buttons cannot run methods.','They can run any function you hand them.']],'E2.4'),
blank('ES2-Q5','Read where the click happened.','wizard.moveTo(event.offsetX, event.____);',['offsetY'],'Correct. `offsetY` is the vertical position.','X is across; which letter is up and down?','E2.2'),
blank('ES2-Q6','Allow ice when there is exactly enough mana.','if (wizard.mana ____ 3) {',['>='],'Correct. `>=` includes 3 itself: the boundary.','Which comparison means "at least"?','E2.1'),
blank('ES2-Q7','Read the `data-power` attribute.','const power = event.target.____.power;',['dataset'],'Correct. `dataset` holds every `data-` attribute.','Which property holds `data-` values?','E2.3'),
blank('ES2-Q8','Keep `this` pointing at the wizard.','potionButton.addEventListener("click", () => wizard.____());',['recoverHealth'],'Correct. The method is called on `wizard`, so `this` is the wizard.','Which Tome I method adds 20 health?','E2.4'),
```

---

### SECTION 3 — The Hover Charm (`ES3`, chapter 3)

**Intro**

| Field | Content |
|---|---|
| hook | `Grub fled into the Whispering Wood. Move your pointer over things and they reveal their secrets.` |
| build | `Potion labels, a way to read Grub's health, a glowing staff and a trap that only springs once.` |
| objectives | `use \`mouseover\` and \`mouseout\` as a pair` · `stop listening with \`once\` or \`removeEventListener\`` · `make hover information work for keyboard users` |
| summary | `\`mouseover\` fires when the pointer moves onto an element and \`mouseout\` when it leaves. Some people cannot hover, so good designs also use \`focus\` and \`blur\`.` |
| prerequisites | `From Section 1: \`addEventListener\` connects an element, an event name and a handler.` |
| concepts | `\`mouseover\`` — Fires when the pointer moves onto an element. · `\`mouseout\`` — Fires when the pointer leaves it. · `\`focus\` and \`blur\`` — Fire when keyboard focus (for example, from the Tab key) arrives at or leaves an element. · `\`classList\`` — Adds or removes CSS classes that change how an element looks. · `\`removeEventListener\`` — Stops a listener. It needs the very same function that was added. · `accessibility` — Designing so that everyone can use a program, whatever device or ability they have. |
| example.stage / steps | `example-owl` / `mouseover #owl`, `mouseout #owl` |
| example.check | `document.querySelector("#bubble").hidden === true && document.querySelector("#bubble").textContent === "Hoo! I deliver messages."` |
| result | `Hovering over Quill shows the bubble. Moving away hides it again.` |
| predict | `What happens if you delete the \`mouseout\` listener?` / `The bubble appears but never hides. Each event needs its own listener.` |
| assignmentLink | `Hover-only features affect usability and portability. Use your potion example to evaluate who a design helps and who it leaves out.` |

```js
const owl = document.querySelector("#owl");
const bubble = document.querySelector("#bubble");

owl.addEventListener("mouseover", function () {
  bubble.textContent = "Hoo! I deliver messages.";
  bubble.hidden = false;
});

owl.addEventListener("mouseout", function () {
  bubble.hidden = true;
});
```

**Stage `whispering-wood`:** a dark wood (tree trunks drawn from the stone palette's greens, `#415a50`/`#789869`). Elements: `#red-potion`, `#blue-potion` (buttons shaped as pixel potions), `#tooltip` (starts hidden), `#goblin` (hotspot over Grub peeking from behind a tree), `#stats`, `#wizard` (hotspot), `#chest` (hotspot), `#disarm-button` "Disarm the chest". Canvas state: `stg-glow` on `#wizard` draws a gold halo around the staff (a static pixel outline). `stg-outlined` on `#goblin` draws a lavender outline.

| ID | Title | Scaffold | Starter |
|---|---|---|---|
| E3.1 | Potion labels | gaps | Prepared |
| E3.2 | Scrying Grub | gaps | Prepared |
| E3.3 | The glowing staff | prompts only | Carry + comment |
| E3.4 | The cursed chest | guided | Prepared |
| E3.5 | The apprentice who couldn't hover | partial prompts | Prepared |

**E3.1 — Potion labels.** Objective: ``Show the blue potion's label on `mouseover` and hide it on `mouseout`.``
```js
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

bluePotion.addEventListener("____", function () {
  tooltip.textContent = "Mana tonic: +10 mana";
  tooltip.hidden = false;
});

bluePotion.addEventListener("____", function () {
  tooltip.hidden = ____;
});
```
Solution blanks: `mouseover`, `mouseout`, `true`.
Trials: [typical] the label starts hidden · [typical] hovering blue shows `Mana tonic: +10 mana` · [typical] leaving hides it · [typical] red then blue shows the blue text.

**E3.2 — Scrying Grub.** Objective: ``When the pointer is over Grub, show his health and outline him. Remove both when it leaves.``
```js
const goblinSprite = document.querySelector("#goblin");
const stats = document.querySelector("#stats");

function showGoblinStats() {
  stats.textContent = goblin.name + " — health " + goblin.health + "/" + goblin.maxHealth;
  goblinSprite.classList.add("outlined");
}

function hideGoblinStats() {
  stats.textContent = "";
  goblinSprite.classList.____("outlined");
}

goblinSprite.addEventListener("mouseover", showGoblinStats);
goblinSprite.addEventListener("mouseout", hideGoblinStats);
```
Solution: `remove`. Note in the instructions that `goblin` is Grub's **object** (Tome I) and `goblinSprite` is the **element** on the page. They are two different things.
Trials: [typical] hover → `Grub — health 60/60` and class `outlined` · [typical] out → the text is empty and there is no class · [typical] the reading is live — `set goblin.health = 35`, hover → `35/60`.

**E3.3 — The glowing staff.** Objective: ``Make the staff glow (class `glow` on `#wizard`) while the pointer is over your wizard.`` Carry + comment `// ✦ #wizard should get the class "glow" on mouseover, and lose it on mouseout.` The learner writes the code (named functions or arrows are both accepted).
Trials: [typical] glow on over · [typical] no glow on out · [erroneous] over, over, out → no glow and no errors.

**E3.4 — The cursed chest.** Objective: ``Make the trap spring only once, and make the Disarm button really remove it.``

Prepared starter:
```js
const chest = document.querySelector("#chest");
const disarmButton = document.querySelector("#disarm-button");

function springTrap() {
  wizard.say("Yikes! A spring-loaded frog!");
  wizard.takeDamage(5);
}

chest.addEventListener("mouseover", () => springTrap());

disarmButton.addEventListener("click", function () {
  chest.removeEventListener("mouseover", () => springTrap());
  wizard.say("Trap disarmed. The frog looks disappointed.");
});
```
Solution:
```js
chest.addEventListener("mouseover", springTrap, { once: true });

disarmButton.addEventListener("click", function () {
  chest.removeEventListener("mouseover", springTrap);
  wizard.say("Trap disarmed. The frog looks disappointed.");
});
```
Trials: [typical] The trap springs once — hover ×3 → health 95 · [typical] Disarming works — click disarm, hover → health 100 · [typical] The handler is named — the registration on `#chest` uses `springTrap`, with `once:true`.

Hints: 1 `\`{ once: true }\` removes a listener after it runs one time. \`removeEventListener\` needs the very same function that was added.` · 2 `Use the name \`springTrap\` in both places instead of \`() => springTrap()\`. Add \`{ once: true }\` as a third argument.` · 3 solution.
Reflection: `Two arrow functions that look identical are still two different functions, like identical twins. Why must \`removeEventListener\` be given the very same one?`

**E3.5 — The apprentice who couldn't hover.** Objective: ``Show the red potion's label when it gets keyboard focus, and hide it on blur.``

Prepared starter:
```js
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
```
Solution adds `redPotion.addEventListener("focus", showRedInfo);` and `redPotion.addEventListener("blur", hideTooltip);`.

Instructions: `A new apprentice uses a tablet, and another uses only the keyboard. Neither can hover.` Invite the learner to press Tab on the stage to reach the potion. Explain that the potion is a `<button>` in `stage.html`, which is why it can receive focus.

A **"Did you know?"** disclosure: ```mouseover` also fires again when the pointer moves onto something *inside* the element. `mouseenter` doesn't. Try both on the stage and compare the Crystal Ball.`` (`mouseenter`/`mouseleave` are supported by the prelude. They are not assessed.)

Trials: [typical] focus shows · [typical] blur hides · [typical] hover still works.
Reflection: `Hover effects feel magical on a laptop, but phones have no hover. Is a hover-only design bad, or just designed for particular users? How would you decide?`

**Review — Check your understanding: The Hover Charm**
```js
choice('ES3-Q1','Which event fires when the pointer leaves an element?',[['`mouseout`','Correct.'],['`mouseover`','That fires when the pointer arrives.'],['`mouseleft`','There is no event with that name.']],'E3.1'),
choice('ES3-Q2','Why is information that only appears on hover a problem?',[['People using a touchscreen or only a keyboard cannot hover.','Correct. That is a usability and portability issue.'],['Hover events are slow.','Speed is not the problem.'],['Browsers no longer support hover.','They do, but not every user has a mouse.']],'E3.5'),
choice('ES3-Q3','`chest.removeEventListener("mouseover", () => springTrap());` leaves the trap in place. Why?',[['It creates a new function, not the one that was added.','Correct. Use the name `springTrap` both times.'],['Only click listeners can be removed.','Any listener can be removed with the same function.'],['`removeEventListener` works only once.','It works whenever it gets the same function.']],'E3.4'),
choice('ES3-Q4','Which pair of events lets keyboard users see the potion label?',[['`focus` and `blur`','Correct.'],['`keydown` and `keyup`','Those report key presses, not where focus is.'],['`click` and `mouseout`','`mouseout` still needs a pointer.']],'E3.5'),
blank('ES3-Q5','Spring the trap only once.','chest.addEventListener("mouseover", springTrap, { ____: true });',['once'],'Correct. The listener removes itself after one run.','Which option means "just one time"?','E3.4'),
blank('ES3-Q6','Remove the outline when the pointer leaves.','goblinSprite.classList.____("outlined");',['remove'],'Correct.','The opposite of `add`.','E3.2'),
blank('ES3-Q7','Show the label.','tooltip.hidden = ____;',['false'],'Correct. Not hidden means visible.','Should `hidden` be true or false to show it?','E3.1'),
```

---

### SECTION 4 — The Rune Keys (`ES4`, chapter 4)

**Intro**

| Field | Content |
|---|---|
| hook | `A Rune Door blocks the path to the bridge. It opens only to words typed on the keyboard.` |
| build | `Arrow-key walking, a door that reads your typing, and a spell buffer that copes with unexpected keys.` |
| objectives | `respond to \`keydown\` using \`event.key\`` · `handle typed text with \`trim\`, \`toUpperCase\`, \`startsWith\` and \`slice\`` · `test with typical, extreme and erroneous input` |
| summary | `\`keydown\` fires when a key is pressed, and \`event.key\` says which one, such as \`"a"\` or \`"ArrowUp"\`. The \`input\` event fires whenever the text in a box changes.` |
| prerequisites | `From Tome I: \`if … else if\` chooses between options, and \`===\` compares two values.` |
| concepts | `\`keydown\`` — Fires when a key is pressed down. · `\`event.key\`` — The name of the key, such as \`"a"\`, \`"A"\`, \`"Enter"\` or \`"ArrowUp"\`. · `\`input\` event` — Fires whenever the text in a text box changes. · `default action` — What the browser normally does for an event, such as scrolling on arrow keys. \`preventDefault()\` stops it. · `\`switch\`` — Chooses a block of code by matching a value against several \`case\`s. · `buffer` — A variable that collects input bit by bit. · `validation` — Checking input is sensible before using it. · `typical, extreme and erroneous data` — Normal input, input at the edge of what is allowed, and input that should be rejected. · `robustness` — How well a program copes with unexpected input without breaking. |
| example.stage / steps | `example-keys` / `key "l"`, `key "x"` |
| example.check | `lantern.lit === true` |
| result | `Pressing L lights the lantern and D puts it out. Other keys do nothing.` |
| predict | `Caps Lock is on and you press L. What happens?` / `\`event.key\` is \`"L"\`, which is not \`"l"\`, so nothing happens. This section shows you how to fix that.` |
| assignmentLink | `Your report must evaluate robustness. Use your typical, extreme and erroneous keyboard tests as evidence.` |

```js
document.addEventListener("keydown", function (event) {
  if (event.key === "l") {
    lantern.turnOn();
  } else if (event.key === "d") {
    lantern.turnOff();
  }
});
```
Walkthrough: `The listener is on \`document\`, the whole page, because keys are not pressed "on" a button.` · `\`event.key\` holds the key's name as text.` · `Any other key reaches the handler but matches neither test, so nothing changes.`

**Stage `rune-door`:** a stone door with six rune slots. `runeDoor.runesLit` lights that many slots gold. `flashRed()` shows a red rim for one frame of state (`redFlashes` counts them). `open()` swaps to an open-door drawing. Elements: `#incantation` (INPUT, label "Speak to the door"), `#buffer-display` ("Spell buffer: …"). World: `wizard`, `runeDoor`, `lantern`.

Add to `BattleWizard` (§4.4): `speakIncantation(words)` → normalises with `String(words).trim().toUpperCase()`. `""` → says "…the wizard mumbles nothing." `"IGNIS"` → sets `lastIncantation = "IGNIS"` and says "IGNIS! The torches blaze." `"LUX"` → lights the lantern. Anything else → `lastIncantation = "fizzle"` and says "The words fizzle." (The battle's Fireball uses the separate `battle.speakIncantation`.)

| ID | Title | Scaffold | Starter |
|---|---|---|---|
| E4.1 | Walk with the arrow keys | gaps | Prepared |
| E4.2 | Speak to the door | gaps | Prepared (E4.1 solution + door block) |
| E4.3 | The spell buffer | guided | Prepared (E4.2 solution + buggy buffer) |
| E4.4 | Twelve letters is plenty | independent | Carry, with the `sort` activity |
| E4.5 | Two listeners, one keyboard | prompts only | Carry |

**E4.1 — Walk with the arrow keys.** Objective: ``Add `ArrowUp` and `ArrowDown` cases so your wizard can walk in all four directions without scrolling the page.``
```js
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
    // ✦ Add ArrowUp (move 0, -10) and ArrowDown (move 0, 10) here.
  }
});
```
Instructions: explain `switch`/`case`/`break` next to the equivalent `if … else if`, and ask which is easier to read. Explain `preventDefault()` using the stage's scroll notice (§4.5). Remind the learner to click the stage first so it receives keys.
Trials (wizard starts at 120,150): [typical] Right ×3 → x 150 · [typical] Up → y 140 · [typical] Down → y 160 · [typical] Up and Down don't scroll the page → `page.scrollNudges === 0` ⟶ `The page would have scrolled. Add \`event.preventDefault();\` to your new cases.` · [erroneous] Pressing Q does nothing → position unchanged, no errors.

**E4.2 — Speak to the door.** Objective: ``Complete the door's `input` handler so capital letters don't matter.``

Prepared = E4.1 solution +
```js

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
});
```
Solution: `toUpperCase`. Instructions define each **string method** in one line: `trim()` removes spaces at the ends, `toUpperCase()` makes capitals, `startsWith()` checks the beginning, and `.length` counts characters. The spec names string handling (A4), so the Scribe note says so.
Trials: [typical] `aperio` opens the door · [typical] `ape` lights 3 runes · [erroneous] `apx` flashes red · [extreme] `  APERIO  ` (spaces around) still opens.

**E4.3 — The spell buffer.** Objective: ``Fix the buffer so keys such as Shift and the arrows are not added to it.``

Prepared = E4.2 solution +
```js

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
});
```
Fix: `} else if (event.key.length === 1) {`. `reads:['spellBuffer']`.
Instructions: `Run it, click the stage and press an arrow key. Look at the spell buffer.` Explain that `event.key` for Shift is `"Shift"` (5 characters), and that `slice(0, -1)` keeps everything except the last character.
Trials: [typical] `IGNIS` + Enter → `lastIncantation === "IGNIS"` · [typical] `ignis` + Enter works · [erroneous] Shift, ArrowUp, Control leave the buffer empty ⟶ `Pressing Shift added "SHIFT" to the buffer. Only add keys whose name is one character long: \`event.key.length === 1\`.` · [typical] `IGNIX`, Backspace, `S`, Enter → IGNIS · [erroneous] Enter on an empty buffer → "mumbles nothing", no errors.

**E4.4 — Twelve letters is plenty.** Objective: ``Stop the buffer growing beyond 12 letters, then classify the test data.``

Solution (nested `if`, because `&&` is not taught until Section 5):
```js
  } else if (event.key.length === 1) {
    if (spellBuffer.length < 12) {
      spellBuffer = spellBuffer + event.key.toUpperCase();
    }
  }
```
Trials: [extreme] exactly 12 letters are kept · [extreme] a 13th letter is ignored · [typical] IGNIS still works.

Activity `sort` (three bins: Typical / Extreme / Erroneous). The `sort` component must support N bins; Section 1 uses 2. Cards: `IGNIS then Enter` (typical) · `ignis then Enter` (typical) · `12 letters` (extreme) · `13 letters` (extreme) · `Shift, Ctrl, ArrowUp` (erroneous) · `Enter with nothing typed` (erroneous) · `%%%123 then Enter` (erroneous).
Reflection: `A player presses keys you never expected. Whose job is it to stop the program breaking: the player's or the programmer's? What does "robust" mean to you now?`

**E4.5 — Two listeners, one keyboard.** Objective: ``Typing in the door's box must not fill the spell buffer.``
Instructions: `Click the door's text box and type \`lux\`. Watch the spell buffer. Two listeners are hearing the same keys: the box's, and the whole page's. The key event starts at the box and bubbles up to \`document\`.` Teach `event.target.tagName`.
Solution: first lines inside the buffer handler:
```js
  if (event.target.tagName === "INPUT") {
    return;
  }
```
Trials: [typical] typing `aperio` in the box opens the door **and** leaves `spellBuffer === ""` ⟶ `The door's typing also went into the spell buffer. At the start of the buffer's handler, stop if \`event.target.tagName === "INPUT"\`.` · [typical] typing `LUX` + Enter on the stage (not the box) still lights the lantern.
Stretch (not assessed): `Arrow keys pressed inside the box also move your wizard. Can you fix that in the same way?`
Reflection: `As programs grow, more listeners wait for the same events. How could that make a program harder to maintain? How would you keep track?`

**Review — Check your understanding: The Rune Keys**
```js
choice('ES4-Q1','A player holds Shift and presses A. What is `event.key`?',[['`"A"`','Correct. Shift makes it a capital.'],['`"a"`','Shift changes the key name to a capital.'],['`"Shift+a"`','`event.key` holds one key name.']],'E4.3'),
choice('ES4-Q2','Why check `event.key.length === 1` before adding a key to the buffer?',[['To ignore keys like `"Shift"` and `"ArrowUp"`, whose names are longer.','Correct.'],['To allow only the key 1.','It checks the length of the name, not the key itself.'],['To limit the buffer to one letter.','The buffer can hold up to 12.']],'E4.3'),
choice('ES4-Q3','What does `event.preventDefault()` do for an arrow key?',[['Stops the browser\'s usual action, such as scrolling.','Correct.'],['Stops your handler running.','Your handler still runs.'],['Deletes the event.','The event still happens.']],'E4.1'),
choice('ES4-Q4','The buffer allows up to 12 letters. Which test uses extreme data?',[['Typing exactly 12 letters, then a 13th.','Correct. It tests the edge of what is allowed.'],['Typing `IGNIS`.','That is typical data.'],['Typing `%%%123`.','That is erroneous data.']],'E4.4'),
choice('ES4-Q5','Typing in the door\'s box also fills the spell buffer. Why?',[['Two listeners respond to the same key presses.','Correct. The event bubbles from the box to `document`.'],['The text box is broken.','The box works; both listeners hear the key.'],['`slice` removes the wrong letter.','`slice` is not the cause.']],'E4.5'),
blank('ES4-Q6','Choose what to do by key name.','switch (event.____) {',['key'],'Correct.','Which property holds the key\'s name?','E4.1'),
blank('ES4-Q7','Remove the last letter.','spellBuffer = spellBuffer.____(0, -1);',['slice'],'Correct. `slice(0, -1)` keeps everything except the last character.','Which string method cuts out part of a string?','E4.3'),
blank('ES4-Q8','Make capitals irrelevant when comparing with `"APERIO"`.','const typed = incantationBox.value.trim().____();',['toUpperCase'],'Correct.','The secret word is in capitals.','E4.2'),
```

---

### SECTION 5 — The Owl's Rounds (`ES5`, chapter 5)

**Intro**

| Field | Content |
|---|---|
| hook | `Quill carries every message in the tower, but only one at a time. Time to see how that works.` |
| build | `Timed goblin turns, a rule for whose turn it is, and a custom "goblinDefeated" event.` |
| objectives | `predict the order in which events and timers run` · `use \`setTimeout\` and a state variable to take turns` · `create and listen for your own custom event` |
| summary | `Events wait in a queue. The event loop hands them to handlers one at a time, and each handler must finish before the next starts. \`setTimeout\` adds a message to the queue later.` |
| prerequisites | `From Tome I: \`let\` creates a variable whose value can change. From Section 2: handlers can use \`if\`.` |
| concepts | `event loop` — The part of the browser that waits for events and delivers them one at a time. · `queue` — A line of waiting events: first in, first out. · `\`setTimeout\`` — Runs a function later, after a delay in milliseconds. · `state` — Information about what is going on right now, such as whose turn it is. · `\`&&\`` — "and": true only when both sides are true. · `\`!\`` — "not": turns true into false and false into true. · `custom event` — An event your own code creates and announces with \`dispatchEvent\`. |
| example.stage / steps | `example-night` / `wait 2000` |
| example.check | `isNight === true && lantern.lit === true` |
| result | `For two seconds nothing changes. Then the timer's message is delivered and the lantern lights.` |
| predict | `Straight after the code runs, what is \`isNight\`?` / `\`false\`. \`setTimeout\` only schedules \`nightFalls\`; it runs later.` |
| assignmentLink | `Use a trace table of events and a truth table of your turn condition to explain your program's logic.` |

```js
let isNight = false;

function nightFalls() {
  isNight = true;
  lantern.turnOn();
}

setTimeout(nightFalls, 2000);
```

**Stage `owl-loft`:** a loft with Quill on a perch. **Slow-motion Crystal Ball** is on by default in this section (§5.4). Elements: `#count-button` "Count to a billion", `#bell-button` "Ring the bell", `#zap-button` "Zap Grub (4 mana)". World: `wizard`, `goblin` (a practice Grub, 60 health), `tower`.

| ID | Title | Scaffold | Starter | Activity |
|---|---|---|---|---|
| E5.1 | Predict the order | worked example | Prepared (passes) | `predict` |
| E5.2 | The frozen tower | guided | Prepared (stops) | — |
| E5.3 | Whose turn is it? | guided | Prepared (bug) | `truth-table` |
| E5.4 | Trace the turns | prompts only | Carry (passes) | `trace-table` |
| E5.5 | Grub shouts back | gaps | Carry + gaps | — |

**E5.1 — Predict the order.** Objective: ``Predict the order of the three messages, then run the code and explain the result.``
```js
console.log("1: The wizard raises their staff");

setTimeout(function () {
  console.log("2: Grub sneezes");
}, 0);

console.log("3: The wizard shouts \"Halt!\"");
```
Activity `predict`: options `1, 2, 3` · `1, 3, 2` · `2, 1, 3`. Run is enabled after the learner locks in a prediction. Trial: [typical] the console shows 1, 3, 2 (the prepared code passes; starterExpected `success`).
After Run, the slow-motion Crystal Ball shows the timer's message joining the back of the queue while `spells.js` is still running.
Reflection: `The delay was 0 milliseconds, yet Grub still sneezed last. Why? Think about Quill carrying one message at a time.`

**E5.2 — The frozen tower.** Objective: ``Change the count so the handler finishes quickly, and check the bell still works afterwards.``
```js
const countButton = document.querySelector("#count-button");
const bellButton = document.querySelector("#bell-button");

countButton.addEventListener("click", function () {
  let count = 0;
  while (count < 1000000000) {
    count = count + 1;
  }
  wizard.say("Done counting!");
});

bellButton.addEventListener("click", function () {
  tower.wakeUp(1);
});
```
Instructions define a **`while` loop** in one sentence: it repeats its block while its condition is true. Then: `Run it. The runner stops the program after half a second. In a real browser, the whole page would freeze: no clicks, no hovers, nothing, until the loop ended.` Solution: `count < 10`. starterExpected `stopped`.
The trial that hits the budget reports: `The count handler took too long, so it was stopped. While one handler runs, nothing else can — not even the bell. Make the loop much shorter.`
Trials: [typical] counting finishes with "Done counting!" · [typical] the bell works after counting → `tower.awake === true`.
Reflection: `Have you ever used an app that froze after you pressed a button? Using the event loop, explain what might have been happening.`

**E5.3 — Whose turn is it?** Objective: ``Fix the duel so clicking Zap again during Grub's turn does nothing but "Wait your turn!".``
```js
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
    setTimeout(goblinTakesTurn, 1500);
  } else if (!isWizardTurn) {
    wizard.say("Wait your turn!");
  } else {
    wizard.say("Not enough mana!");
  }
});
```
Bug: the missing `gameState = "goblinTurn";` after `castSpell`. `reads:['gameState']`.
Trials (fire, level 1: 14 damage; Grub attack: 8):
- [typical] One click starts Grub's turn → Grub 46, `gameState === "goblinTurn"` ⟶ `After casting, \`gameState\` is still "wizardTurn", so the wizard can keep casting. Set \`gameState = "goblinTurn";\` after the spell.`
- [erroneous] Button mashing: two quick clicks → Grub 46 (one cast), speech "Wait your turn!".
- [typical] Grub replies after 1.5 seconds → wait 1500 → wizard 92, `gameState === "wizardTurn"`.
- [typical] Click, wait 1500, click → Grub 32.

Activity `truth-table`: columns `isWizardTurn`, `hasEnoughMana`, `isWizardTurn && hasEnoughMana` (select true/false), `What happens?` (select: casts / "Wait your turn!" / "Not enough mana!"). Four rows. The last row (false, false) → false → "Wait your turn!" (the `else if` is checked first). Make that row's feedback explain the order of the `else if` checks.
Reflection: `The same click on the same button now does different things. Which matters more: the click, or the state? Why do most games need both?`

**E5.4 — Trace the turns.** Objective: ``Complete the trace table for four events, then run to check it.`` Carry (the E5.3 solution passes; starterExpected `success`).
Activity `trace-table` for this sequence: click Zap (0s), click Zap (0.5s), timer (1.5s), click Zap (2s).

| Step | Event | Handler that ran | `gameState` after | Grub's health | What the player sees |
|---|---|---|---|---|---|
| 1 | click `#zap-button` | (anonymous function) | `goblinTurn` | 46 | A fire spell |
| 2 | click `#zap-button` | (anonymous function) | ____ (`goblinTurn`) | 46 | ____ (`Wait your turn!`) |
| 3 | timer | ____ (`goblinTakesTurn`) | ____ (`wizardTurn`) | 46 | Grub hits: wizard 92 |
| 4 | click `#zap-button` | (anonymous function) | `goblinTurn` | ____ (`32`) | A fire spell |

Accept lists: `goblinTurn`/`"goblinTurn"`; `Wait your turn!` (case-insensitive, with or without quotes); `goblinTakesTurn`/`goblinTakesTurn()`; `wizardTurn`/`"wizardTurn"`; `32`. After Run, the Crystal Ball log for the trial with the same steps is shown beside the table so the learner can compare.

**E5.5 — Grub shouts back.** Objective: ``Announce a `goblinDefeated` custom event when Grub's health reaches 0, and listen for it.``

Carry + appended gap block, plus an instruction to add the `if` inside the zap handler after `castSpell`:
```js
    if (goblin.health === 0) {
      document.____(new CustomEvent("goblinDefeated", { detail: { name: goblin.name } }));
    }
```
```js

document.____("goblinDefeated", function (event) {
  wizard.say(event.detail.name + " is beaten!");
  tower.wakeUp(3);
});
```
Solutions: `dispatchEvent`, `addEventListener`.
Instructions: `Objects can announce events too. The zap code doesn't need to know who cares that Grub is beaten. The tower, the music or a scoreboard can each listen for themselves.` Introduce the term **loosely coupled** (parts that don't depend on each other's details), which helps maintainability. Mention the **observer pattern** name only.
Trials: [typical] Grub at 10 health: one zap → Grub 0, speech "Grub is beaten!", `tower.awake === true` · [typical] Grub at 60: one zap → the tower stays asleep (no event).
Reflection: `Why is it useful that the code which zaps Grub doesn't need to know what happens when he is beaten?`

**Review — Check your understanding: The Owl's Rounds**
```js
choice('ES5-Q1','What order are the letters logged in? `console.log("A"); setTimeout(() => console.log("B"), 0); console.log("C");`',[['A, C, B','Correct. The timer\'s message waits in the queue until the current code finishes.'],['A, B, C','Even with 0ms, the timer waits its turn.'],['B, A, C','Timers never jump ahead of code that is already running.']],'E5.1'),
choice('ES5-Q2','`isWizardTurn` is true and `hasEnoughMana` is false. What is `isWizardTurn && hasEnoughMana`?',[['`false`','Correct. `&&` needs both to be true.'],['`true`','Only one side is true.'],['`undefined`','`&&` of two booleans is a boolean.']],'E5.3'),
choice('ES5-Q3','Why does the duel need `gameState`?',[['So the same click can do different things depending on whose turn it is.','Correct.'],['Because events cannot use `if`.','They can; the state gives the `if` something to check.'],['To store the wizard\'s name.','The name is a property of `wizard`.']],'E5.3'),
choice('ES5-Q4','A click handler loops for 5 seconds. Meanwhile, the player hovers over Grub. What happens?',[['The hover waits in the queue until the click handler finishes.','Correct. One message at a time.'],['The hover handler runs straight away.','Only one handler can run at once.'],['The hover event is deleted.','It waits; it isn\'t lost.']],'E5.2'),
choice('ES5-Q5','Why are custom events like `goblinDefeated` useful?',[['The code that notices the defeat does not need to know which parts react to it.','Correct. The parts stay loosely coupled.'],['They are faster than functions.','Speed is not the reason.'],['They replace classes.','They work alongside objects.']],'E5.5'),
blank('ES5-Q6','Schedule Grub\'s turn for later.','____(goblinTakesTurn, 1500);',['setTimeout'],'Correct.','Which function runs another function after a delay?','E5.3'),
blank('ES5-Q7','Announce the event.','document.____(new CustomEvent("goblinDefeated"));',['dispatchEvent'],'Correct.','Which method sends an event to listeners?','E5.5'),
blank('ES5-Q8','Require both conditions.','if (isWizardTurn ____ hasEnoughMana) {',['&&'],'Correct. `&&` means "and".','Which operator means "and"?','E5.3'),
```

---

### SECTION 6 — Battle of Grubbledown Bridge (`ES6`, chapter 6)

**Intro**

| Field | Content |
|---|---|
| hook | `Grub is on the bridge with the Rune Bell. The battle is ready, but none of its controls are listening yet.` |
| build | `The controls for a real battle against Grub, wired up by you and then played by you.` |
| objectives | `combine click, hover and key events in one program` · `use state so that controls don't clash` · `evaluate how well your event-driven program works` |
| summary | `The battle engine handles turns, damage and Grub's plans. You write the listeners that connect the player to it. A control that nothing listens to does nothing.` |
| prerequisites | `Everything from Sections 1–5: listeners, the event object, hover pairs, keyboard buffers, state and custom events.` |
| concepts | `API` — The set of functions some code offers for others to use, such as \`battle.cast(power)\`. · `abstraction` — Using something by knowing what it does, without needing to know how it works inside. · `integration` — Making separate parts work together as one program. · `usability` — How easy a program is to use. |
| example.stage / steps | `example-duel` / click `#hit-button`, click `#hit-button`, wait 1000, click `#hit-button` |
| example.check | `dummy.health === 90` |
| result | `Three clicks, but only two hits: the second click arrived during the one-second wait.` |
| predict | `What would the dummy's health be after five very quick clicks?` / `95. Only the first click lands; the others arrive while \`isMyTurn\` is \`false\`.` |
| assignmentLink | `Your report asks you to evaluate quality. Judge your battle's usability, robustness and maintainability, using your own code as evidence.` |

```js
let isMyTurn = true;
const hitButton = document.querySelector("#hit-button");

hitButton.addEventListener("click", function () {
  if (isMyTurn) {
    dummy.takeDamage(5);
    isMyTurn = false;
    setTimeout(function () {
      isMyTurn = true;
    }, 1000);
  }
});
```

The intro's walkthrough disclosure includes the Grub callback: `Grub has been eating Rune Bell cake. In the battle, his object has \`maxHealth\` and \`health\` set to 130: one object customised, just like your wizard in Tome I.`

**Stage `grubbledown-bridge`:** a rickety plank bridge over a river (a static parallax is fine; no looping animation). The wizard is on the left, Grub on the right holding a pixel Rune Bell. Elements: `#spell-bar` (DIV) containing `#fire-card` / `#ice-card` / `#storm-card` (`data-power` fire/ice/electricity, labels include mana cost), `#shield-button`, `#potion-button`, `#fireball-button` "Fireball (type IGNIS)", `#goblin` (hotspot over Grub), `#intent-bubble` (hidden), `#incantation-display`, `#ending` (hidden). The battle HUD (§5.7) is host-rendered from `snapshot.battle`, not a guest element.

The battle engine and its API are in §9. The learner's file for Section 6 starts **prepared** at E6.1 and carries forward to E6.7.

| ID | Title | Scaffold | Starter |
|---|---|---|---|
| E6.1 | Wire the spell bar | gaps | Prepared |
| E6.2 | Shield and potion | prompts only | Carry + comment |
| E6.3 | Scry Grub's plan | independent | Carry + comment |
| E6.4 | The Fireball incantation | independent | Carry + comment |
| E6.5 | Battle hotkeys | independent | Carry + comment |
| E6.6 | When the dust settles | gaps | Carry + gap |
| E6.7 | Play the battle | independent | Carry (passes if E6.1–E6.6 done) |

The complete reference solution after E6.6 (each checkpoint's solution is the prefix up to its marker):
```js
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
Check: pressing `f` starts the incantation from the hotkey handler. The buffer handler, registered earlier, has already seen that `f` keydown while the incantation was still closed, so `f` is not added to the buffer. Add a unit test for exactly this ordering.

**Checkpoint details.** Trials use fixed seeds. Compute expected numbers with the engine's own rules in the test (don't hard-code intent outcomes that depend on the PRNG). Values below assume level 1, Grub at 130 and the default costs (§9.2).

- **E6.1 — Wire the spell bar.** Prepared: file header, the E6.1 block with `dataset.____`, and `// ✦ E6.2 goes here` markers for later steps. Trials: [typical] fire card on the wizard's turn → Grub 116 · [erroneous] clicking a card during Grub's turn does nothing (click, then click again before 1200ms → one cast) · [erroneous] clicking the bar between cards does nothing · [typical] after Grub's turn, ice works (Grub 116 − 12 = 104).
- **E6.2 — Shield and potion.** Comment: `// ✦ Make #shield-button and #potion-button work, but only on your turn.` Trials: [typical] the shield halves Grub's next hit · [typical] the potion heals (+20, capped) and uses one potion · [erroneous] the potion during Grub's turn does nothing · [erroneous] a third potion says "No potions left!" and doesn't end the turn (engine behaviour; check that no error occurs).
- **E6.3 — Scry Grub's plan.** Plain-English spec only: `When the pointer is over Grub, or he has keyboard focus, show his next move in #intent-bubble using battle.revealIntent(). Hide it again afterwards.` Trials: [typical] hover shows the intent text (equals the engine's current intent label) · [typical] out hides · [typical] focus shows · [typical] blur hides. Hint 3 points back to E3.5.
- **E6.4 — The Fireball incantation.** Spec: `Clicking #fireball-button calls battle.startIncantation(). While battle.isIncantationOpen(), collect typed letters (as in Section 4), show them in #incantation-display, and on Enter call battle.speakIncantation(...) with the buffer. Start each incantation with an empty buffer.` `reads:['spellBuffer']`. Trials: [typical] click, type `ignis`, Enter → Fireball: Grub −30, mana −8 · [erroneous] Shift and arrows are ignored · [typical] Backspace works · [erroneous] typing when no incantation is open leaves the buffer empty · [extreme] let the 5-second window run out (wait 5000) → the engine fizzles the spell, then a new incantation starts with an empty buffer.
- **E6.5 — Battle hotkeys.** Spec: `1 fire, 2 ice, 3 electricity, 4 shield, 5 potion, f Fireball. Hotkeys must do nothing during Grub's turn or while an incantation is open.` Trials: [typical] `1` casts fire · [typical] `f` opens an incantation · [erroneous] during an incantation, typing `2` adds "2" to the buffer but does **not** cast ice ⟶ `Pressing 2 during your incantation cast Ice. Stop the hotkeys when it isn't your turn: \`if (!battle.isWizardTurn()) { return; }\`.` · [erroneous] keys during Grub's turn do nothing.
- **E6.6 — When the dust settles.** Gap `if (event.detail.winner === "____") {`. Trials: [typical] a scripted victory shows "The Rune Bell is yours!" · [typical] a scripted defeat (setup: wizard health 5) shows the defeat text.
- **E6.7 — Play the battle.** Objective: ``Every control is listening. Now play the battle — win or lose, then reflect.`` Trials: [typical] Every control is listening → the registration log contains: `click` on `#spell-bar`, `#shield-button`, `#potion-button`, `#fireball-button`; `mouseover` + `focus` on `#goblin`; a `keydown` on `document`; `battleEnded` on `battle.events`. The failure lists the missing ones by name. · [typical] A test player can win with your controls → a scripted "bot" sequence with seed 7 (clicks, hovers, keys, waits) ends in `victory` using the reference solution. Tune the bot script once against the reference engine and store it in the curriculum. Success enables Next.
  After a successful Run, the stage switches to **battle mode** (§5.7) and the learner plays live. Completion does not require winning (D4). The attempt and the result are saved in `battleRecord`.
  Reflection (in the self-check disclosure, discussion only):
  1. `Decomposition: list every event your battle responds to. For each, name the event source, the handler and what changes.`
  2. `Paradigms: your battle uses objects (wizard, Grub) and events (your controls). What does each contribute? Could this battle be written procedurally?`
  3. `Visual Basic uses event handlers too. Compare this with your JavaScript: what is the same, and what is different?`
     ```vb
     Private Sub btnFire_Click(sender As Object, e As EventArgs) Handles btnFire.Click
         If wizard.Mana >= 4 Then
             wizard.CastSpell(goblin)
         Else
             MessageBox.Show("Not enough mana!")
         End If
     End Sub
     ```
     (The `highlight()` language for this block is `vb`, which Shiki supports.)
  4. `Quality: rate your battle for usability, robustness and maintainability, with one piece of evidence for each.`

**Review — Check your understanding: Battle of Grubbledown Bridge** (the last review is also the module's final check)
```js
choice('ES6-Q1','Which best describes event-driven programming?',[['The program waits for events and runs handlers in response.','Correct.'],['Code runs once from top to bottom.','That is procedural.'],['Everything must be written as classes.','That describes object-oriented programming, which can be combined with events.']],'intro:1'),
choice('ES6-Q2','Which of these is markup rather than programming logic?',[['`<button id="shield-button">Shield</button>`','Correct. HTML describes what is on the page.'],['`shieldButton.addEventListener("click", raiseShield);`','That is JavaScript logic.'],['`if (battle.isWizardTurn()) {`','That is a JavaScript decision.']],'E6.2'),
choice('ES6-Q3','Why can you use `battle.revealIntent()` without reading the battle engine\'s code?',[['Abstraction: you only need to know what it does, not how.','Correct.'],['The code is secret.','It is about not needing the details.'],['Hover events cannot read variables.','They can; abstraction is the reason.']],'E6.3'),
choice('ES6-Q4','Visual Basic connects a handler with `Handles btnFire.Click`. What does the same job in JavaScript?',[['`fireButton.addEventListener("click", …)`','Correct.'],['`function btnFire()`','That only defines a function.'],['`event.preventDefault()`','That stops a default action.']],'E6.7'),
choice('ES6-Q5','Pressing 2 during a Fireball incantation cast Ice. What kind of problem is that?',[['A logic error: two listeners respond to the same key.','Correct. A state check fixes it.'],['A syntax error.','The code runs, so the syntax is fine.'],['A hardware fault.','The keyboard is fine.']],'E6.5'),
choice('ES6-Q6','Which is a genuine weakness of event-driven programs?',[['With many listeners and states, the order of events can be hard to follow and debug.','Correct. Tools like the Crystal Ball help.'],['They cannot respond to users.','Responding to users is their strength.'],['They cannot use objects.','Your battle uses both.']],'E6.7'),
blank('ES6-Q7','Read the card\'s power.','const power = event.target.dataset.____;',['power'],'Correct. It reads `data-power`.','Look at the `data-` attribute name in `stage.html`.','E6.1'),
blank('ES6-Q8','Let keyboard players scry Grub too.','goblinSprite.addEventListener("____", showPlan);',['focus'],'Correct.','Which event fires when Tab reaches an element?','E6.3'),
blank('ES6-Q9','Check who won.','if (event.detail.winner === "____") {',['wizard'],'Correct.','Who should the Rune Bell go to?','E6.6'),
```

---

## 9. The battle engine (trusted, in the prelude)

### 9.1 API exposed to learners (frozen object `battle`)

| Member | Behaviour |
|---|---|
| `battle.isWizardTurn()` | `true` only in state `wizardTurn`. |
| `battle.cast(power)` | On the wizard's turn with enough mana: sets `wizard.specialPower = power`, calls `wizard.castSpell(goblin)` (Tome I damage), applies any power effect, and ends the turn. Otherwise it says why ("Not your turn!" / "Not enough mana!"), returns `false` and does **not** end the turn. An unknown power says "That isn't a spell I know." |
| `battle.shield()` | Wizard's turn only: `wizard.raiseShield()`, ends the turn. |
| `battle.drinkPotion()` | Wizard's turn only: if potions > 0, `wizard.drinkPotion()` and ends the turn; else says "No potions left!" (the turn continues). |
| `battle.revealIntent()` | Returns Grub's next move as text, e.g. `"Big Bonk — 20 damage"`. Records `stats.scried += 1`. Allowed at any time. |
| `battle.startIncantation()` | Wizard's turn and mana ≥ 8: state becomes `incantation`, opens a 5000ms window (10000ms in Apprentice mode), returns `true`. Otherwise it says why and returns `false`. |
| `battle.isIncantationOpen()` | `true` in state `incantation`. |
| `battle.speakIncantation(words)` | Only while open. Normalises with `trim().toUpperCase()`. `"IGNIS"` → Fireball (30 damage, 8 mana). Anything else → fizzle (−4 mana). Ends the turn. If the window expires, the engine fizzles automatically. |
| `battle.events` | A trusted event target (`addEventListener`/`removeEventListener`) that dispatches `turnStarted` (`detail:{whose:'wizard'\|'goblin'}`) and `battleEnded` (`detail:{winner:'wizard'\|'goblin'}`). |
| `battle.state` | Getter: `'wizardTurn' \| 'incantation' \| 'goblinTurn' \| 'victory' \| 'defeat'`. |

### 9.2 Rules and starting balance (tune in §12.3)

| Item | Value |
|---|---|
| Wizard | Tome I rules: 100 health, level 1 (trials) or the Tome I look's level (live play, capped at 3 for balance). Mana 20 max, +3 at the start of each wizard turn (capped). Potions: 2. |
| Grub | Tome I `Goblin`, with `maxHealth`/`health` set to **130** on this one object. |
| Fire / ice / electricity | Tome I damage (`12/10/14 + level × 2`), costing 4 / 3 / 6 mana. Ice also reduces Grub's next attack by 4. |
| Fireball | 30 damage, 8 mana. A fizzle costs 4 mana. |
| Shield | Halves (rounding down) the next damage taken, unless the attack ignores shields. |
| Grub's intents (seeded, weighted) | Club Smash 10 (40%) · Big Bonk 20 (25%) · Sneaky Stab 12, ignores the shield (20%) · Taunt: wizard −6 mana (10%) · Snatch: steals a potion if any, otherwise Club Smash (5%). The next intent is chosen as each Grub turn ends, so `revealIntent()` always shows the upcoming move. |
| Timing | Grub acts 1200ms after the wizard's turn ends. `turnStarted` is dispatched on each change of turn. |
| End | Either health 0 → state `victory`/`defeat`, `battleEnded` is dispatched once, and all actions are refused. |

**Balance targets.** Simulate 1,000 seeded battles per strategy using the reference solution driven by bot scripts. Strategy "mash fire only": wizard win rate **25–45%**. Strategy "full controls" (scry every turn, shield before Big Bonk, Fireball when mana ≥ 8, potion below 30 health): win rate **75–90%**. Tune Grub's health (range 100–140) first, then intent weights. Record the final numbers in `TEACHER_GUIDE.md`.

### 9.3 Live-play niceties (host)

- A turn banner and the Fireball countdown are DOM text (§5.7).
- Canvas feedback reuses Tome I effects: the fire, ice and electricity sprites from `renderScene.js`'s effect drawing (extract them into `sprites.js`), Grub's attack slash, the recovery sparkle, and a new shield bubble (pixel ring). Reduced motion shows the end state only (as in Tome I's `TracePlayer`).
- No sound (Tome I has none, and DESIGN.md doesn't mention audio).

### 9.4 Victory and defeat

- **Victory:** Grub lies down (Tome I's `lying()` drawing), the Game Over banner reads "Wizard Wins", and Grub's line appears as DOM text. Then the **Ring the Rune Bell** button (trusted, host-rendered) dispatches a trusted `bellRung` event in the session. The Crystal Ball shows the tower-waking cascade (lanterns → door → Quill), and the Tome II completion badge appears.
- **Defeat:** "Goblin Wins" banner, Grub's raspberry line, Quill's tip chosen from the stats (never scried → hover tip; never used Fireball → incantation tip; never shielded → shield tip). An **Offer Apprentice mode** button appears after two defeats. Retry restarts the session with a new seed.

---

## 10. Tome II recap — "Your Tome II spellbook" (`src/edp/curriculum/recap.js`)

Same structure as Tome I's recap: `title`, `intro`, `sections[{chapter, title, concepts[{term, explanation, code, report}]}]`, and a `recapMarkdown(finalCode, extras)` function. Download filename: `wizard-workshop-tome-2-summary.md`. It is reached from the Section 6 review's **Finish Tome II** button, and from the journey select under "Tome II complete". It is not a progress step.

Concept cards, with 2–3 per section and each with a complete, runnable example and a Unit 4 report line:
1. **Events, listeners and handlers**: the bell example. Report: *"Explain who controls the order of execution in event-driven versus procedural code."*
2. **The event object**: the map example. Report: *"Annotate how `event.target` and `offsetX` pass information into a handler."*
3. **Event delegation and bubbling**: the spellbook listener. Report: *"Evaluate one listener vs many for maintainability and efficiency."*
4. **Hover pairs and accessibility**: the tooltip with focus/blur. Report: *"Evaluate usability and portability across mouse, touch and keyboard."*
5. **Keyboard events and string handling**: the spell buffer. Report: *"Use typical, extreme and erroneous test data to discuss robustness."*
6. **The event loop and timers**: the 1-3-2 example. Report: *"Explain why a long-running handler freezes a program (efficiency, usability)."*
7. **State and compound conditions**: the turn check with its truth table. Report: *"Include a truth table for a compound condition."*
8. **Custom events**: `goblinDefeated`. Report: *"Explain loose coupling and maintainability."*
9. **Paradigms together**: the Visual Basic handler beside the JavaScript one. Report: *"Compare how event-driven programming is implemented in two languages (A.P2)."*

The Markdown download appends:
- **Report prompts** (the reflection questions from E6.7) under the heading "Questions to answer in your own words". Include the reminder: *"These are prompts, not answers. Your report must be your own explanation."*
- **Your battle**, from `battleRecord`: attempts, wins, and the stats from the most recent battle (events by type, spells cast, scried yes/no).
- **Your final code**: the last successful `spells.js` from Section 6 (plain text in a fenced block, never executed).

---

## 11. State and persistence (`src/edp/state/store.js`)

### 11.1 Save format

- Key: `wizard-workshop:edp:v1`. Export `EDP_STORAGE_KEY`, `edpCurriculumVersion = 1`, `emptyEdpState()`, `parseEdpImport(text, {localRestore})`, `loadEdpState(storage)`, `saveEdpState(state, storage)`, `canCommitEdp(state, response)` and `replaceEdpDraft(state, id, draft)`. These mirror Tome I's API and limits (2MB import, 10MB local, 30KB run).
- `emptyEdpState()`:
  ```js
  {curriculumVersion: 1, currentCheckpointId: 'E1.1', currentScreen: {type:'welcome'},
   seenWelcome: false, seenIntroChapters: [], reviewByChapter: {},
   draftsByCheckpoint: {},              // {E1.1: {spellsSource, revision}}
   lastSuccessfulSourcesByCheckpoint: {}, lastGoodSnapshotByCheckpoint: {},
   completedCheckpointIds: [], hintDepthByCheckpoint: {}, backupsByCheckpoint: {},
   activityAnswersByCheckpoint: {},     // {E1.5: {cards: {id: bin}}, E5.3: {cells: {id: value}}, E5.1: {prediction: 'b'}}
   battleRecord: {attempts: 0, wins: 0, lastStats: null},
   preferences: {codeFontSize: 16, reduceMotion: false, apprenticeMode: false, slowMotion: null},
   activeRun: null, activeSession: null}
  ```
- `parseEdpImport` applies the same distrust rules as Tome I: known IDs only, string lengths bounded, drafts ≤2MB, imported completion kept only for known IDs, snapshots re-validated with `validEdpResult`, activity answers bounded (≤40 entries, ≤60 chars each) and matched to known card/cell IDs, `battleRecord` numbers clamped (≤9999), and `lastStats` validated field by field. `currentScreen` is accepted only if it is a known screen.
- **Download work** (Tome II header) exports `wizard-workshop-tome-2-work.json`. **Download code** exports `wizard-workshop-tome-2-spells.txt`. Tome I files are unchanged.

### 11.2 Preferences shared between tomes

The first time Tome II's state is created, copy `codeFontSize` and `reduceMotion` from Tome I's save if it is readable. After that, each tome keeps its own values. The landing page respects `reduceMotion` from either save.

### 11.3 Wizard look from Tome I (D6)

`readTomeOneLook(storage)` in `src/edp/state/look.js`:
- `loadState(storage)` from Tome I (read-only).
- Choose the snapshot from `lastGoodSnapshotByCheckpoint` for the **highest-index** completed checkpoint that has a `wizard`.
- Copy only `name` (1–20 chars, trimmed), `cloakColour`, `cloakPattern`, `wand`, `beardType`, `specialPower` and `level` (validated against Tome I's `choices`; level is clamped to 1–20 for display).
- Fall back to `{name:'Aster', ...defaults}`.
- The look is passed to the guest as data (`look` in the run/session request). It is never code.
- Show "Your wizard from Tome I: Aster" in the character strip, with a **Refresh from Tome I** button in Workspace tools.

### 11.4 Journey progress (`src/edp/state/journeyProgress.js`)

Mirror Tome I:
- `welcome` is complete when seen.
- An intro is complete when visited.
- A checkpoint is complete when validated, **and** its activity has been attempted if it has one.
- A review is complete when every answer is correct.
- `sectionProgress(chapter)` counts the chapter's screens. `welcome` belongs to chapter 1 for grouping.

The landing page uses the total.

---

## 12. Testing plan

Run everything. Never report a check as passed unless it was actually run (AGENTS.md). Record results in `VERIFICATION.md`.

### 12.1 Guard Tome I first (before refactoring)

1. **Capture pixel baselines** before touching `renderScene.js`. Add `tests/sceneBaseline.test.js`, which renders a fixed list of Tome I snapshots (each cloak colour, pattern, wand, beard and power; the blueprint with and without labels; each action effect; both Game Over states) onto an off-screen canvas and stores SHA-256 hashes of `getImageData` in `tests/fixtures/scene-hashes.json`. Vitest has no canvas, so run this with Playwright (`tests/sceneBaseline.spec.js`) using `page.evaluate` against the dev server, as `scripts/visual-review.mjs` does. After extracting `sprites.js`, every hash must match exactly.
2. Run the full existing suite (`npm test`, `npm run test:e2e`) on the branch before changes and save the logs. Firefox may fail to start on Ged's Mac (a profile folder issue recorded in `VERIFICATION.md`). If so, record it rather than skipping it silently.

### 12.2 Unit tests (Vitest, `tests/edp/*.test.js`)

- **`prelude.test.js`** — event semantics, run through the real engine:
  - Bubbling order (target → parent → document).
  - `mouseenter`/`focus` don't bubble.
  - `this === currentTarget` for function handlers; arrow functions keep the outer `this`.
  - The same function registered twice runs once.
  - `removeEventListener` with the same reference works; with an inline twin it doesn't.
  - `{once:true}`.
  - A listener removed during dispatch doesn't run.
  - Handler errors are recorded and later handlers still run.
  - `preventDefault` sets `defaultPrevented` and suppresses `scrollNudges`.
  - Timers: ordering by due time, then insertion; a 0ms timer runs after the current script; `clearTimeout`; the 50-timer cap.
  - `console.log` formatting and caps.
  - `CustomEvent` `detail`.
  - Element stubs are not extensible (the E2.4 `TypeError`).
  - `querySelector` without `#` returns `null`.
  - Determinism: the same seed and steps give identical snapshots across 3 runs.
  - `Date` and `Math.random` are absent.
- **`curriculum.test.js`** — for **every** Tome II checkpoint:
  - The solution returns `success`.
  - The starter returns its documented `starterExpected.status`.
  - There are exactly 3 hints, ≥1 trial, and ≤12 trials × ≤60 steps.
  - Every trial's `steps` targets exist in the checkpoint's stage.
  - Every `reads` name is used.
  - Every `gap` contains `____`, and the solution contains none.
- **`mistakes.test.js`** — each common mistake returns a friendly first message, not a raw error:
  - `querySelector("wake-button")`.
  - `addEventListener("click", wakeWizard())`.
  - `"Click"`, `"onclick"`, `"mouseOver"`, `"keypress"`.
  - A listener on the wrong element.
  - `addEventListener` nested inside a handler (stacking).
  - A detached `wizard.recoverHealth`.
  - An inline-arrow `removeEventListener`.
  - `event.key.length` missing (E4.3).
  - The missing `gameState = "goblinTurn"` (E5.3).
  - Hotkeys without a turn check (E6.5).
  - An infinite loop in the setup phase and in a handler → `stopped`, with a later valid run succeeding (fresh contexts).
- **`parse.test.js`** — Tome II parser:
  - Allowed: `document`, `setTimeout` and `console`.
  - Rejected: `window`, `fetch`, `eval`, `Function`, `setInterval`, `Date`, `Math.random`, `import`/`async`.
  - Redeclaring `wizard` or `class Wizard` is blocked.
  - Warnings don't block Run.
  - `____` gaps block Run.
  - The 30KB limit.
- **`result.test.js`** — `validEdpResult` rejects:
  - Unknown element IDs.
  - Oversized strings or logs.
  - Non-integer or out-of-range health, mana or position.
  - Unknown trial categories.
  - Results over 128KB.
- **`sections.test.js`** — mirrors Tome I's section tests for Tome II:
  - 6 ordered sections with unique IDs.
  - Journey = `welcome` + for each section (intro, checkpoints, review), ending at `review:6`. Assert the exact length.
  - Intro length limits.
  - Every worked example runs through `runEdpExample` and its `check` is `true`.
  - Question schema rules (≥2 choice, ≥2 blank, one correct, one `____`, valid `revisit`, unique IDs).
  - The seeded option order is stable and, across all Tome II questions, the correct option is not always first.
- **`store.test.js`, `journeyProgress.test.js`**:
  - Save/load round trip.
  - Tome I and Tome II keys don't interfere: saving one leaves the other byte-identical, and Tome I's `parseImport` still rejects a Tome II file.
  - The import distrust rules.
  - Preferences copied once from Tome I.
  - `readTomeOneLook` picks the latest valid wizard and falls back when there is none.
  - Progress counts, including activities.
- **`battle.test.js`**:
  - Engine rules from §9: turn refusals, mana, fizzle, shield rounding, the ice slow, Snatch fallback, the incantation window expiry, a single `battleEnded`, and no actions after the end.
  - The `f`-key ordering note in §8 S6.
  - Seeded reproducibility.
  - The **balance simulation** (1,000 battles per strategy), asserting the win-rate target ranges (mark it `test.slow` if needed, and still run it in CI).
- **`descriptor.test.js`** — Tome I descriptor functions return exactly the current hard-coded arrays (§3.2).
- **Existing Tome I tests must pass unchanged**, except for the import path updates caused by moving `main.js` (they don't import it) and `workshop.spec.js` (§12.4).

### 12.3 Benchmark

Add `scripts/benchmark-edp.mjs` (Node, real QuickJS). For every Tome II solution, time a full Run 25 times and write `verification/benchmark-edp.json` (median/max per checkpoint). If any median exceeds 150ms, profile before raising `EDP_LIMITS.execution`. Document the chosen value in the README.

### 12.4 Browser tests (Playwright)

- **Update `tests/workshop.spec.js`:** replace each `page.goto('/')` with `page.goto('/?tome=oop')`. Nothing else should need to change. If anything else does, stop and report it, because it means Tome I behaviour changed.
- **`tests/landing.spec.js`:**
  - A fresh load shows the landing page, the h1 "Choose your tome, apprentice." and two links with accessible names containing "Tome I" and "Tome II".
  - Progress text reads "Not started" for both.
  - Seed a Tome I save with 10 completions → "10 of 54 steps done".
  - Keyboard: Tab to each card, press Enter, and the right app opens.
  - The brand link returns to the library.
  - The owl hotspot shows the bubble on hover **and** focus.
  - No horizontal scroll at 1366/768/390 and at 683×384.
  - Reduced motion removes card transforms.
  - No requests to external hosts.
- **`tests/edp.spec.js`:**
  1. Journey: `/?tome=edp` → welcome → Start → intro 1 (worked example visible) → Start section 1 → E1.1.
     - Run the starter → incomplete, with the result text starting "○".
     - Type the solution line → Run → success, and a confetti canvas appears (not under reduced motion).
     - Click **Ring the bell** on the stage → the Crystal Ball shows `click #wake-button → wakeWizard`, and the character strip says "awake".
     - Next → E1.2. Reload → same screen and drafts.
  2. Live keyboard: E4.1 solution → Run → focus the stage → press ArrowRight ×2 → the wizard's position text changes; Tab moves focus out of the stage (Tab is not forwarded).
  3. Hover and focus: E3.5 solution → hover `#red-potion` shows the label; Tab to it shows the label; blur hides it.
  4. Stale results: edit during a run and navigate during a session → no stale snapshot is committed (mirror Tome I's stale-result test).
  5. Stop: E5.2 starter → Run → the result is `stopped` with the frozen-tower message; the next Run succeeds after the fix.
  6. Battle, keyboard only: put the E6.6 reference solution in E6.7 → Run → success → play using only keys (`1`, `f`, typing `ignis`, Enter, …) with a fixed seed injected via `window.__wwTestSeed` (**read only in `import.meta.env.DEV`**) → reach `victory` → **Ring the Rune Bell** → the recap is reachable → the Markdown download contains "Your final code" and the battle stats.
  7. Reviews: each Tome II review renders its blank inputs and keeps answers across reload. Choice options are in the seeded order.
  8. Layout: E2.3 and E6.7 at 1366/768/390 and 683×384 → no horizontal scroll, the stage's controls stay reachable, and the phone Show preview/Show code switch works.
- **Production preview:** run the landing, the Tome I journey and the Tome II journey tests with `WORKSHOP_PREVIEW=1`.

### 12.5 Pages sub-path

`PAGES_BASE_PATH=/wizard-workshop npm run build`, then preview on 4174. Check that `/wizard-workshop/`, `/wizard-workshop/?tome=oop` and `/wizard-workshop/?tome=edp` all load, the worker and WASM URLs are prefixed, and the brand link returns to `/wizard-workshop/`. Restore a plain build afterwards (README instructions).

### 12.6 Manual checks (AGENTS.md "Verification and completion" 1–8)

Walk the welcome screen, each Tome II intro, one checkpoint per section, each review and the battle:
- Keyboard only, including playing the whole battle.
- With reduced motion on.
- At 1366 and 390 widths.
- At 200% zoom.

Do one screen-reader pass (VoiceOver) on a checkpoint and the battle HUD. Confirm that results are announced and the Crystal Ball summary region is not noisy. Record only what was actually done.

### 12.7 Commands

```sh
npm ci
npm test
npm run build && npm run preview
npm run test:e2e
WORKSHOP_PREVIEW=1 npm run test:e2e
node scripts/benchmark-edp.mjs
node scripts/generate-docs.mjs
```

---

## 13. Documentation updates

- **README.md**
  - "Start the workshop": the landing page and the `?tome=` URLs.
  - "Execution": describe the Tome II stage (a simulated DOM, virtual timers, a seeded PRNG, all inside QuickJS, with no host bridges; D1), its limits, and the live session protocol. Keep Tome I's paragraph accurate: "no DOM or timers" remains true for Tome I.
  - "Saving and privacy": the new key `wizard-workshop:edp:v1`, the Tome II download files, and reading the Tome I look.
  - "Project structure": the new folders.
- **TEACHER_GUIDE.md** — add a "Tome II: Event-Driven Programming" part:
  - Intended outcomes.
  - Six suggested sessions (one per section).
  - Section-by-section notes and misconceptions: brackets on handlers, `#` in selectors, the detached `this`, twin arrow functions, bubbling conflicts, 0ms timers, the frozen UI, state vs event.
  - The battle reference and final balance numbers.
  - Apprentice mode.
  - That Tome II deliberately adds automatic enemy turns and seeded randomness, unlike Tome I.
  - Where to edit content.
  - A note that the Scribe prompts support Assignment 1 but reports must be students' own work.
- **AGENTS.md** — update the architecture table and wording:
  - The landing/router, `src/oop/`, `src/edp/`, `src/shared/`.
  - The Tome II simulated-stage exception to "no DOM, timers…" (D1), stating that learner code still never reaches the host.
  - Record that Tome II includes a dedicated module welcome screen.
- **DESIGN.md** — document:
  - The landing page layout and tome accents.
  - The stage frame, stage hotspots, `stg-*` classes, the Crystal Ball, trial tags and the battle HUD.
  - The rule that stage art stays static apart from single-state redraws.
- **SOLUTIONS-EDP.md** — generated: every Tome II checkpoint solution, trial list and review answer key.
- **VERIFICATION.md** — a new dated entry listing exactly what was run.

---

## 14. Suggested implementation order (small, testable commits)

1. **Baselines:** the pixel hashes (§12.1), and the existing suite run and logged.
2. **Router and move:** `src/main.js` router, `src/oop/app.js` (git mv + wrapper), `moduleShell.js`, and `workshop.spec.js` → `/?tome=oop`. All Tome I tests are green.
3. **Descriptor refactors:** `renderSection`/`renderRecap` descriptors, the editor `choices` option, `Runner` `validate` option, and the worker dispatch stub. Tome I is green, and the descriptor test passes.
4. **Sprites extraction:** `sprites.js` (+ `drawOwl`). The pixel hashes match.
5. **Landing page** and its tests.
6. **Tome II runtime:** `prelude.js`, `engine.js` (run + trials), parser, result validator, and `prelude`/`parse`/`result` unit tests. Then the benchmark.
7. **Tome II state:** store, look, journey progress, and tests.
8. **Highlighting plugin** additions (`html`, `vb`, the Tome II virtual modules).
9. **Tome II app shell:** welcome, section intro/review via descriptors, the checkpoint layout, the `stage.html` tab, stage rendering (static snapshots), the Crystal Ball, the trials checklist.
10. **Content S1–S2** with fixtures and tests. Then live sessions (§4.9) and their e2e tests.
11. **Content S3–S4**, then the `sort` activity (N bins).
12. **Content S5**, then the `predict`, `truth-table` and `trace-table` activities, and the slow-motion Crystal Ball.
13. **Battle engine** + balance simulation, **content S6**, battle mode UI, endings, Apprentice mode.
14. **Recap**, downloads, `generate-docs` → `SOLUTIONS-EDP.md`.
15. The full e2e suite, production preview, Pages sub-path check, manual accessibility pass.
16. Docs and the `VERIFICATION.md` entry. Open a PR into `main` (pushes to `main` deploy automatically, so **don't push directly**).

---

## 15. Out of scope / flagged for Ged

- **Tome I content changes:** none. D7 (shuffling Tome I's choice options) and a dedicated Tome I welcome screen are **not** done here. They are recommended follow-ups, because AGENTS.md asks for a module introduction and Tome I currently uses its Section 1 intro for this.
- **Not taught:** touch/pointer events, `keyup`, `scroll`/`resize`, drag and drop, `setInterval`, promises/`async`, `fetch`, frameworks' event systems, capture phase. `mouseenter`/`mouseleave` appear only in a "Did you know?" disclosure.
- **No backend, accounts, sound or external assets.** No new npm dependencies are needed (Shiki already includes the `html` and `vb` grammars via Expressive Code).
- **Written reflections are not stored or assessed.** Tome I doesn't store them either. The recap download includes the prompts for students to answer in their own reports.
- **Content wording** in §8 is a complete first draft. Ged may want to adjust names, tone or difficulty before release. Use the stable IDs so edits don't break saves.

---

## Appendix A — Glossary (feeds section `concepts` and the recap)

| Term | Definition to use |
|---|---|
| event | Something that happens that a program can notice, such as a click or a key press. |
| event source / target | The element the event happened to. |
| event listener | An instruction to wait for one kind of event on one element. |
| event handler | The function that runs when the event happens. |
| callback | A function handed over to be called back later. |
| event object | The parcel of details delivered with every event (`type`, `target`, `key`, …). |
| event loop | The part of the browser that waits for events and delivers them one at a time. |
| queue | A line of waiting events: first in, first out. |
| bubbling | An event on an inner element travels up through the elements around it. |
| event delegation | One listener on a container handling events from everything inside it. |
| default action | What the browser normally does for an event. `preventDefault()` stops it. |
| state | Information about what is going on right now, such as whose turn it is. |
| custom event | An event your own code creates and announces with `dispatchEvent`. |
| loosely coupled | Parts of a program that work together without depending on each other's details. |
| validation | Checking input is sensible before using it. |
| typical / extreme / erroneous data | Normal input / input at the edge of what is allowed / input that should be rejected. |
| robustness | How well a program copes with unexpected input without breaking. |
| API | The set of functions some code offers for others to use. |
| abstraction | Using something by knowing what it does, without needing to know how it works inside. |
| paradigm | A style of programming: procedural, object-oriented or event-driven. |

## Appendix B — Coverage map (Unit 4 specification → Tome II)

| Spec ref | Content | Where |
|---|---|---|
| A1 Decomposition, pattern recognition, abstraction, inputs/outputs | Events → handlers → state changes; spotting repeated listeners (delegation); the battle API as abstraction | E1.1, E2.3, S6 intro, E6.7 reflection |
| A3 Event-driven paradigm (e.g. Visual Basic); markup vs logic; hardware/software needs | Procedural vs event-driven sort; `stage.html` vs `spells.js`; the VB handler comparison | E1.5, the `stage.html` tab, E6.7, ES6-Q2/Q4 |
| A4 Event handling, selection, iteration, string handling, functions, variables and scope | Every section. String handling in E4.2–E4.4; iteration in E5.2; functions as callbacks throughout | S1–S6 |
| A5 Logic, truth tables, tracing | The E5.3 truth table; the E5.4 trace table; compound `&&` and `!` | S5 |
| A6 Efficiency, maintainability, portability, reliability, robustness, usability | Delegation (E2.3); hover accessibility (E3.5); robustness tests (E4.3–E4.4); listener conflicts (E4.5, E6.5); the frozen UI (E5.2); loose coupling (E5.5); the battle evaluation (E6.7) | S2–S6 |
| B2/C2 Events in design; validation; typical/extreme/erroneous test data | Trial category tags on every Spell Trial; the E4.4 sort | Throughout |
| Assignment 1 evidence checklist: annotated code, language comparisons, logic evidence, balanced evaluation | Recap download: concept code, the VB comparison, truth and trace tables, report prompts, battle stats, their own final code | §10 |
