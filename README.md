# Wizard Workshop

A local, self-paced JavaScript course for learners aged 16–17. All **41 checkpoints** are implemented: classes, independent objects, six customisations, methods, conditions, health, inheritance and deterministic battles. Learner code runs in QuickJS WebAssembly inside a dedicated worker. There is no backend or account.

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

Preview serves the production build at http://127.0.0.1:4173. Do not open `index.html` directly as a file: workers and module assets require the local HTTP server. Nothing is publicly deployed.

**This workstation’s npm launcher:** its global shim incorrectly resolves an absent npm installation. If `npm` reports a missing `npm-cli.js`, this installation has a working CLI at `C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js`. For example:

```powershell
node 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' ci
node 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' run dev
```

This is a workstation repair/workaround, not an extra requirement for teachers with a normal Node installation.

## Use it

Read the objective and expand the short instructions. Write real JavaScript in `character.js`; from chapter 3, use `actions.js` for method calls. Choose **Run code** or Ctrl/Cmd+Enter. Typing gives parser feedback but never executes the program. A successful run enables Next; it never advances automatically. The scene remains unchanged when a run fails.

Three levels of optional help lead to a worked example. Replacing/resetting/importing asks for confirmation inside the app and keeps a recoverable draft backup. Workspace tools includes **Restore previous draft**, code size, reduced motion, export/import and runner reload. The checkpoint selector supports teacher jumps to starting examples without awarding completion.

The editor uses Tab for normal focus traversal. Ctrl/Cmd+] indents, Ctrl/Cmd+[ outdents, Ctrl+Space explicitly opens contextual completion. Each file and checkpoint has its own editing state and undo history during the session. Undo history is not persisted across reloads; source drafts are.

## Project structure

For colours, typography, layout, components, responsive behaviour and motion, read [DESIGN.md](DESIGN.md). It maps the current styling to its implementation files and provides guidance for future UI changes.

- `src/curriculum/checkpoints.js`: stable IDs, progressive starters, complete solutions, objectives, prompts, hints, expected effects and teaching metadata.
- `src/validation/`: Acorn ES2022 parsing, AST source-scope checks, supported values and structural objectives.
- `src/runner/`: worker loading, bounded QuickJS execution, fresh-context probes, action guards, mutation contracts and plain-data result validation.
- `src/editor/`: CodeMirror 6 with JavaScript highlighting, diagnostics, indentation and explicit completion.
- `src/game/`: original code-drawn pixel art and cancellable trace playback.
- `src/state/`: versioned local progress, size/schema checks, backups and stale-run protection.
- `src/main.js`: accessible UI, navigation, results, file tabs and import/export.
- `tests/`: all-solution fixtures, intended starter states, positive/negative runner cases, persistence and browser workflows.

## Execution and atomic updates

Both sources are parsed before interpretation. `character.js` permits course classes, named object declarations and setup property assignments. `actions.js` is an AST-validated list of at most 30 documented calls. Method bodies remain real synchronous JavaScript, including equivalent arithmetic and branching.

Each run uses a fresh candidate context. Defaults and behavioural scenarios are evaluated in separate disposable contexts, including checks for accidentally modifying the global wizard rather than the probe. Each action captures before/after data, verifies the exact permitted mutation and validates every character. Only a complete valid candidate is sent to the UI. Run ID, checkpoint and revision must still match before commit. A valid but unfinished objective can update the preview without enabling Next.

Limits: 30KB combined UTF-8 source; 30 actions; 200 displayed characters per log entry; 128KB result; 16MiB guest heap; 256KiB stack; 500ms total guest budget after module loading; 2s main-thread watchdog; 10s initial load timeout. There is no guest console bridge, so the 30-action trace stays below the brief’s 100-entry ceiling. Stop terminates the worker; the next Run loads a fresh one. No native `eval`, `Function`, DOM, storage, networking, timers or messaging are exposed to learner code. This is a local teaching tool, not a formally verified public-submission sandbox.

## Saving and privacy

Progress uses `wizard-workshop:progress:v1` in localStorage, after 500ms idle and on navigation. It includes drafts, prior successful sources/previews, historical completion, help depth, preferences and replacement backups. The app stores no student profile; use fictional character names. Saved code never runs automatically. A restored preview is labelled as an earlier successful result; Next needs a fresh Run. Browser storage can be unavailable or cleared: download work at the end of each session.

Download work exports JSON containing both documents and per-checkpoint progress. Import accepts the current curriculum version and validates schema and size (2MB work file). Run enforces the 30KB source-pair limit; a temporarily oversized draft is retained for editing rather than discarded on reload. Recovery is bounded at 2MB per draft and 10MB per local save, subject to the browser’s smaller storage quota. Download code is a clearly labelled combined `.txt` file; copy its two sections into their matching virtual files when returning to the workshop.

## Verification

```sh
npm test
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

## Specification review and documented choices

Instructional code uses [Expressive Code](https://github.com/expressive-code/expressive-code). The Vite plugin in `scripts/lesson-highlighting.mjs` renders trusted curriculum content during development/build; no highlighting engine or remote assets are loaded in the browser. In curriculum prose, surround code with backticks (escape them inside JavaScript template strings). Snippets containing newlines become indented code blocks; shorter snippets stay inline. Worked solutions are highlighted automatically with filename captions. This is a deliberately small code-markup format, not a general Markdown renderer.

Correct, current Run results trigger a short [Canvas Confetti](https://github.com/catdad/canvas-confetti) burst from the Run code button. Incomplete, failed, cancelled and stale results do not celebrate. Editing, navigation, another run and Skip animation stop the burst. Both the workspace Reduce motion setting and the operating system preference disable it. The overlay is decorative and does not intercept input.

- **Location:** source is in the active project workspace’s `wizard-workshop/`, rather than alongside the external OneDrive brief. This application's root `DESIGN.md` documents its web UI; external teaching resources remain separate.
- The specification contains **41** distinct stable checkpoint IDs when its lettered substeps are expanded.
- Intermediate duplication during inheritance is accepted at the explicitly requested steps. Uncapped recovery is accepted only at C3.3b. C3.2a/b only test the requested power branches.
- C2.7, C4.1 and C5.4 can run successfully from their prepared code. Their design/prediction/reflection activities are explicitly self-checks, not automated language assessment.
- One cohesive curriculum module replaces separate starter/solution/hint files; small UI responsibilities live together in `main.js`. All records still expose their data for teacher edits.
- The second object is an inspector card. The canvas is decorative and backed by named health/level DOM summaries. Animation is a sequence of brief discrete pixel effects, not a game engine.
- No console API is supplied; the visible log is generated solely from validated action calls. Exports use a combined labelled text file instead of a ZIP dependency, as permitted by the brief.
- System fonts and original pixel masks avoid external font/image downloads. No accounts, external AI, sound, automatic enemy turns or public deployment were added.

The implementation uses the [Vite Node requirements](https://vite.dev/guide/), [CodeMirror extension interfaces](https://codemirror.net/docs/extensions/) and [QuickJS runtime limits and isolation APIs](https://github.com/justjake/quickjs-emscripten). Dependency versions are recorded in `package.json` and `package-lock.json`.
