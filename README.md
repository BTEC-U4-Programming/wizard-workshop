# Wizard Workshop

A local, self-paced JavaScript course for learners aged 16–17. The Grand Library offers two independent tomes. Tome I has **44 checkpoints**: classes, independent objects, six customisations, methods, conditions, health, inheritance and deterministic battles. Tome II has **31 checkpoints** across six sections on event-driven programming, ending in a playable battle. Learner code runs in QuickJS WebAssembly inside a dedicated worker. There is no backend or account.

## Start the workshop

Use **Node.js 22.19.0** (the tested version in `.nvmrc`) and **npm 10.9.3**. Vite 8.3.1 requires Node 20.19+ or 22.12+; this project supports Node 22.12+ in the 22 release line, or Node 24+. All npm dependency versions and the transitive tree are locked.

```sh
cd wizard-workshop
npm ci
npm run dev
```

Open the local address printed by Vite, normally http://127.0.0.1:5173. Internet access is needed to install packages. Once installed, the application uses only the local server; runtime WASM, editor resources and artwork are bundled locally. This is not an offline PWA.

```sh
npm run build
npm run preview
```

Preview serves the production build at http://127.0.0.1:4173. Do not open `index.html` directly as a file: workers and module assets require the local HTTP server. Every push to `main` triggers `.github/workflows/deploy-pages.yml`; when GitHub Pages is enabled and configured for GitHub Actions, deployment to https://btec-u4-programming.github.io/wizard-workshop/ happens after the workflow checks pass. Local use is unchanged.

**This workstation’s npm launcher:** its global shim incorrectly resolves an absent npm installation. If `npm` reports a missing `npm-cli.js`, this installation has a working CLI at `C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js`. For example:

```powershell
node 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' ci
node 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' run dev
```

This is a workstation repair/workaround, not an extra requirement for teachers with a normal Node installation.

## Use it

Choose a tome in the library (`/`). Direct links are `/?tome=oop` and `/?tome=edp`; both respect the configured Pages base path. In Tome I, start with the short course introduction, then look at each section’s complete example before editing. Open the optional explanations when you want more detail. Every section ends with multiple-choice and fill-in-the-blank questions. Reviews allow retries and never require a perfect score to continue. At a checkpoint, read the objective and expand the short instructions. Write real JavaScript in `character.js`; from chapter 3, use `actions.js` for method calls. Choose **Run code** or Ctrl/Cmd+Enter. Typing gives parser feedback but never executes the program. A successful run enables Next; it never advances automatically. The scene remains unchanged when a run fails.

The Conjuring Room preview shows a hollow, dotted wizard outline as soon as a `Wizard` class exists but no object has been created (C1.1a); property names set by the constructor appear as labels above it (C1.1b). In a battle, a character whose health reaches zero lies on the floor and a **Game Over** banner names the winner. After the final review, **Finish course** opens a course summary with every major concept and a complete example; learners can download it, together with their last successful battle code, as `wizard-workshop-summary.md`.

Three levels of optional help lead to a worked example. Replacing/resetting/importing asks for confirmation inside the app and keeps a recoverable draft backup. Workspace tools includes **Restore previous draft**, code size, reduced motion, export/import and runner reload. The checkpoint selector supports teacher jumps to starting examples without awarding completion. It marks the current screen and shows “✓ Done” beside earned screens (validated checkpoints, visited introductions and fully correct reviews), with a done count per section.

The editor uses Tab for normal focus traversal. Ctrl/Cmd+] indents, Ctrl/Cmd+[ outdents, Ctrl+Space explicitly opens contextual completion. Each file and checkpoint has its own editing state and undo history during the session. Undo history is not persisted across reloads; source drafts are.

## Project structure

For colours, typography, layout, components, responsive behaviour and motion, read [DESIGN.md](DESIGN.md). It maps the current styling to its implementation files and provides guidance for future UI changes.

- `src/curriculum/sections.js` and `src/review/`: section introductions, worked examples, review questions and answer checking.
- `src/curriculum/recap.js` and `src/review/renderRecap.js`: the end-of-course summary screen and its Markdown download.
- `src/curriculum/checkpoints.js`: stable IDs, progressive starters, complete solutions, objectives, prompts, hints, expected effects and teaching metadata.
- `src/validation/`: Acorn ES2022 parsing, AST source-scope checks, supported values and structural objectives.
- `src/runner/`: worker loading, bounded QuickJS execution, fresh-context probes, action guards, mutation contracts and plain-data result validation.
- `src/editor/`: CodeMirror 6 with JavaScript highlighting, diagnostics, indentation and explicit completion.
- `src/game/`: original code-drawn pixel art and cancellable trace playback.
- `src/state/`: versioned local progress, size/schema checks, backups and stale-run protection.
- `src/main.js`: query-based router. `src/landing/` renders the library; `src/oop/app.js` preserves Tome I’s UI.
- `src/shared/moduleShell.js`, `src/oop/moduleDescriptor.js` and `src/edp/moduleDescriptor.js`: base-aware links and module-specific navigation/recap configuration.
- `src/edp/`: independent curriculum, activities, state, Acorn validation, simulated stage, Crystal Ball, runtime and live controller.
- `tests/`: all-solution fixtures, intended starter states, positive/negative runner cases, persistence and browser workflows.

## Execution and atomic updates

Both sources are parsed before interpretation. `character.js` permits course classes, named object declarations and setup property assignments. `actions.js` is an AST-validated list of at most 30 documented calls. Method bodies remain real synchronous JavaScript, including equivalent arithmetic and branching.

Each run uses a fresh candidate context. Defaults and behavioural scenarios are evaluated in separate disposable contexts, including checks for accidentally modifying the global wizard rather than the probe. Each action captures before/after data, verifies the exact permitted mutation and validates every character. Only a complete valid candidate is sent to the UI. Run ID, checkpoint and revision must still match before commit. A valid but unfinished objective can update the preview without enabling Next.

Limits: 30KB combined UTF-8 source; 30 actions; 200 displayed characters per log entry; 128KB result; 16MiB guest heap; 256KiB stack; 500ms total guest budget after module loading; 2s main-thread watchdog; 10s initial load timeout. There is no guest console bridge, so the 30-action trace stays below the brief’s 100-entry ceiling. Stop terminates the worker; the next Run loads a fresh one. No native `eval`, `Function`, DOM, storage, networking, timers or messaging are exposed to learner code. This is a local teaching tool, not a formally verified public-submission sandbox.

## Tome II: events and live execution

Tome II starts with its own welcome screen, then six complete examples, supported practice, independent activities and mixed reviews. Students edit `spells.js`; `stage.html` is a highlighted, read-only view of the current controls. Run checks fresh **Spell Trials** before keeping a separate live stage session. Click, hover, focus, keyboard and input events are forwarded only from that stage. Tab always leaves it. The **Crystal Ball** exposes event targets, handlers, timer ordering, errors and `console.log`; Section 5 defaults to a slow visual queue. Sorting, predictions, truth tables and trace tables are stored separately from code. Trying every activity response is enough to continue; perfect answers and battle victories are not progression gates.

The simulated DOM, trusted wizard classes, virtual clock, timers and seeded mulberry32 PRNG all run inside QuickJS. There are no callbacks into the host, real DOM references or network/storage APIs. Each run uses fresh contexts for setup and every trial. The live protocol uses `edp-session-start`, `event`, `tick`, `state`, `error` and `end` messages, with session IDs and sequence numbers. Editing, Stop, navigation or worker failure cancels the session. Timers advance with bounded elapsed time and pause in hidden tabs. No code executes on restore.

Tome II limits: 30KB UTF-8 source, 16MiB guest memory, 256KiB stack, **500ms** for setup plus trials, 100ms per live message, 2s host watchdog, 50 pending timers, 60 active listeners, 100 log entries and 128KB validated results. Every solution was benchmarked over 25 runs; see [verification/benchmark-edp.json](verification/benchmark-edp.json). The largest median was below 150ms, so the plan’s 800ms provisional budget was reduced to 500ms.

The battle uses turn checks, scrying, mana, shields, potions and timed Fireball input. **Apprentice mode** doubles the incantation window and reduces incoming damage, with no penalty. A fresh seed is supplied by host `crypto.getRandomValues`; the development-only `window.__wwTestSeed` override is ignored in production. The final rules and 1,000-seed strategy measurements are in [TEACHER_GUIDE.md](TEACHER_GUIDE.md). The final review opens a spellbook recap with downloadable examples, report prompts, tables, battle stats and the learner’s own successful code.

## Saving and privacy

Progress uses `wizard-workshop:progress:v1` in localStorage, after 500ms idle and on navigation. It includes drafts, prior successful sources/previews, historical completion, section position and review answers, help depth, preferences and replacement backups. Older version-1 saves remain readable. The app stores no student profile; use fictional character names. Saved code never runs automatically. A restored preview is labelled as an earlier successful result; Next needs a fresh Run. Browser storage can be unavailable or cleared: download work at the end of each session.

Tome II uses the separate key `wizard-workshop:edp:v1`. Its first save copies code size and reduced-motion preferences from Tome I; later changes stay independent. It reads the latest validated Tome I wizard appearance without modifying the original save. **Refresh from Tome I** updates that appearance. Tome II exports `wizard-workshop-tome-2-work.json` and `wizard-workshop-tome-2-spells.txt`; its recap is `wizard-workshop-tome-2-summary.md`. The tomes reject each other’s work files.

On the hosted site, progress stays in the learner's own browser and is not shared with other devices. All sites under `btec-u4-programming.github.io` share one browser storage origin; the workshop's namespaced key avoids a clash.

Download work exports JSON containing both documents and per-checkpoint progress. Import accepts the current curriculum version and validates schema and size (2MB work file). Run enforces the 30KB source-pair limit; a temporarily oversized draft is retained for editing rather than discarded on reload. Recovery is bounded at 2MB per draft and 10MB per local save, subject to the browser’s smaller storage quota. Download code is a clearly labelled combined `.txt` file; copy its two sections into their matching virtual files when returning to the workshop.

## Verification

```sh
npm test
node scripts/benchmark-edp.mjs
node scripts/balance-edp.mjs
node scripts/generate-docs.mjs
npx playwright install chromium firefox
npm run test:e2e
```

To repeat against the built application:

```powershell
npm run build
$env:WORKSHOP_PREVIEW = '1'
npm run test:e2e
Remove-Item Env:WORKSHOP_PREVIEW
```

The Playwright configuration starts a local server when needed. On Unix, use `WORKSHOP_PREVIEW=1 npm run test:e2e`. See [VERIFICATION.md](VERIFICATION.md) for the actual run record and limitations; tests alone do not constitute a visual or screen-reader audit.

## Deployment

Pull requests into `main` install dependencies, run `npm test` and build, but do not deploy. A push or merge to `main` publishes the site after those checks pass. A failed test blocks deployment. See runs in the repository's **Actions** tab. **Run workflow** is for manual validation runs; publishing still happens on a push to `main`.

To reproduce the Pages build locally, run:

```sh
PAGES_BASE_PATH=/wizard-workshop npm run build
PAGES_BASE_PATH=/wizard-workshop npx vite preview --host 127.0.0.1 --port 4174
```

Open http://127.0.0.1:4174/wizard-workshop/. For PowerShell, set `$env:PAGES_BASE_PATH='/wizard-workshop'` before both commands and run `Remove-Item Env:PAGES_BASE_PATH` afterwards. Run `npm run build` again without the variable to restore a normal local preview.

## Specification review and documented choices

Instructional code uses [Expressive Code](https://github.com/expressive-code/expressive-code). The Vite plugin in `scripts/lesson-highlighting.mjs` renders trusted curriculum content during development/build; no highlighting engine or remote assets are loaded in the browser. In curriculum prose, surround code with backticks (escape them inside JavaScript template strings). Snippets containing newlines become indented code blocks; shorter snippets stay inline. Worked solutions are highlighted automatically with filename captions. This is a deliberately small code-markup format, not a general Markdown renderer.

Correct, current Run results trigger a short [Canvas Confetti](https://github.com/catdad/canvas-confetti) burst from the Run code button, and a correct review-quiz answer triggers the same burst from its Check answer button. Incomplete, failed, cancelled and stale results do not celebrate. Editing, navigation, another run and Skip animation stop the burst. Both the workspace Reduce motion setting and the operating system preference disable it. The overlay is decorative and does not intercept input.

- **Location:** source is in the active project workspace’s `wizard-workshop/`, rather than alongside the external OneDrive brief. This application's root `DESIGN.md` documents its web UI; external teaching resources remain separate.
- Tome I now contains **44** stable checkpoint IDs, including the supported Section 5 battle steps.
- Intermediate duplication during inheritance is accepted at the explicitly requested steps. Uncapped recovery is accepted only at C3.3b. C3.2a/b only test the requested power branches.
- C2.7, C4.1 and C5.4 can run successfully from their prepared code. Their design/prediction/reflection activities are explicitly self-checks, not automated language assessment.
- One cohesive curriculum module replaces separate starter/solution/hint files; Tome I UI responsibilities live together in `src/oop/app.js`. All records still expose their data for teacher edits.
- The second object is an inspector card. The canvas is decorative and backed by named health/level DOM summaries. Animation is a sequence of brief discrete pixel effects, not a game engine.
- In Tome I no console API is supplied; the visible log is generated solely from validated action calls. Exports use a combined labelled text file instead of a ZIP dependency, as permitted by the brief.
- System fonts and original pixel masks avoid external font/image downloads. Tome I has no accounts, external AI, sound or automatic enemy turns. Tome II adds bounded virtual timers for the enemy turn. A static GitHub Pages deployment was added later; there is still no backend.

The implementation uses the [Vite Node requirements](https://vite.dev/guide/), [CodeMirror extension interfaces](https://codemirror.net/docs/extensions/) and [QuickJS runtime limits and isolation APIs](https://github.com/justjake/quickjs-emscripten). Dependency versions are recorded in `package.json` and `package-lock.json`.
