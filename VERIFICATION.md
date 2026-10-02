# Verification and delivery record

Verified on **26 September 2026**, on this Windows workstation, using Node **22.19.0**, npm **10.9.3**, Vite **8.3.1**, Vitest **5.0.2** and Playwright **1.63.0**.

## Results actually obtained

### Highlighting and celebration update — 26 September 2026

- Installed pinned Expressive Code 0.44.2 and Canvas Confetti 1.9.4; npm reported zero vulnerabilities.
- All 138 unit/fixture tests passed, and the production build passed.
- The expanded development-browser suite has 20 checks across Chromium and Firefox. The first run passed 19; a fixed-delay stale-result test raced on Firefox. It now holds actual worker results until after the edit/navigation, and its rerun passed in both browsers. It also verifies that stale results do not celebrate.
- Both new feature checks passed against the production build in both browsers (4 checks): highlighted inline/multi-line instructions and worked examples, small-screen reflow, visible confetti only on correct runs, natural completion, edit/navigation cancellation, and app/OS reduced-motion preferences.
- Final Chromium highlighting checks passed after the typography and punctuation refinements. [Desktop](verification/chromium-highlighting-1366.png) and [phone](verification/chromium-highlighting-390.png) screenshots were reviewed; no horizontal page overflow was detected.
- Pre-rendered lesson HTML is bundled locally. The main bundle is now approximately 1,188KB before compression / 245KB gzip; Vite still reports its non-fatal size advisory. Shiki/Expressive Code run only during development/build.

The table below records the original project verification before this update.

| Check | Result |
|---|---|
| Locked installation with `npm ci` | Passed; 64 packages installed from the lockfile |
| Production `vite build` | Passed; one local synchronous QuickJS WASM asset emitted |
| Vitest curriculum, runner, persistence and client tests | **138 passed** across 4 test files |
| Development server: Chromium | **8 passed** |
| Development server: Firefox | **8 passed** |
| Production preview: Chromium | **8 passed** |
| Production preview: Firefox | **8 passed** |
| All visual option combinations | **648 rendered without errors** |
| Visual distinction between each option in a property group | Passed by comparing rendered canvas images |

The browser executables were Playwright Chromium/Chrome for Testing **153.0.8010.12** and Firefox **155.0**. The test runner launched headless browser processes with the permissions needed on this host. The first clean-install attempt encountered a Windows native-library lock held by the running Vite server; stopping that server and repeating `npm ci` succeeded.

Saved logs: [unit tests](verification/unit-tests.txt), [development browser tests](verification/e2e-development.txt), [production preview browser tests](verification/e2e-preview.txt).

## Coverage

- All 41 worked solutions execute in the real interpreter and pass their exact checkpoint validator. All 41 starters have separately documented and tested intended states: unfinished, prepared comparison/consolidation, or a newly introduced behavioural contract still needing code.
- Class syntax versus comments/object literals, supplied constructor names, separate instances, constructor defaults versus explicit instance overrides, progressive required fields and intermediate inheritance duplication.
- All power branches at levels 1, 3 and 20; correct arithmetic variants, single quotes, comments, optional semicolons, switch and ternary decisions. An unrelated `if` cannot satisfy the power-decision objective.
- Recovery at 50, near-full and full health; Goblin’s 60-health cap; level cap; damage clamping; wrong target/object/name/cosmetic mutations; exceptions and incorrect return powers.
- The authoritative final battle ends at Wizard health 100 / level 3 and Goblin health 42. The level-1 fire victory trace damages 14, 14, 14, 14 and 4. A sixth action fails without a partial trace.
- Infinite loops, recursion and allocation failure; a subsequent valid run; absent DOM/storage/network/worker bridges; source/action/result limits. Clock and random sources are absent from the guest runtime.
- Independent 10-second loading timeout, 2-second watchdog, Stop/startup cancellation and result schema rejection. Guest limits remain at 500ms, 16MiB heap and 256KiB stack.
- A browser journey from class creation through properties, methods, inheritance and battle, including error/fix, repeated deterministic runs and Back/Next without draft loss.
- Local reload, hints, replacement/reset cancellation, recoverable backups, JSON download and import, keyboard-only Run, normal Enter, Tab exit and reduced motion.
- Delayed worker messages after an edit or navigation cannot update the current checkpoint. An oversized draft remains editable after reload, while execution stays blocked and the last accepted scene remains available.
- Missing WASM produces an infrastructure/loading message and can be retried. No required external network requests were observed during the successful browser journey in either server mode.

## Visual and accessibility inspection

Screenshots were generated and visually inspected for the desktop layout at **1366 × 768**, the phone layout at **390 × 844**, and the enlarged/reflow layout. Automated layout checks also cover **1024 × 768** and the **683 × 384 CSS viewport** equivalent to 200% zoom on the target laptop. The checks confirm no horizontal page overflow, an editor height of at least 384px, and retained code when switching phone views.

The [sprite contact sheet](verification/sprite-options.png) was inspected for all six cloak colours, four patterns, three wands, three beards, three powers and all six action effects. Black uses a lighter cloak edge; patterns stay within the cloak mask. Canvas output is accompanied by DOM names, health meters, levels, inspectors and action logs.

Keyboard-only first-checkpoint execution and editor exit were exercised in both browsers. Result markup uses a polite live region; typing diagnostics do not write into that region. Text and focus styles were inspected visually. These checks are not a formal WCAG certification or an NVDA/JAWS/VoiceOver audit.

## Timing sample

The final four-action fixture was run 25 times on this workstation using the real QuickJS engine in Node. Median **17.69ms**, maximum **46.23ms**, including setup, independent behavioural probes, actions and snapshots; initial WASM loading and browser UI were excluded. See [benchmark data](verification/benchmark.json). No execution-budget increase was necessary here. This is not a benchmark of the school’s entire device fleet; test the actual managed classroom browser and hardware before a lesson.

## Delivery choices and practical limits

- The complete source is in the active workspace’s `wizard-workshop/`, not in the external OneDrive brief directory. The original teaching resources were preserved. Nothing was publicly deployed.
- The README documents installation, architecture, storage, limits and changes from the suggested file structure. The teacher guide links all 41 complete solutions and expected effects in `SOLUTIONS.md`.
- Tests simulate the CSS viewport of 200% browser zoom; the school’s actual browser zoom controls and assistive technologies were not manually exercised.
- Some model errors apply to a whole file and use a document-level offset. Parser errors, action statements and available QuickJS source stacks have source-derived positions. Runtime technical detail remains expandable.
- Vite reports a non-fatal bundle-size advisory; see the update above for the current main-bundle size. The synchronous WASM asset is approximately 503KB. All assets are served locally.
- Browser storage is per device/profile and may be cleared or denied. Download work at session end. The app reports storage failures and keeps the current in-memory draft. Execution has a 30KB source limit; bounded draft recovery retains temporarily oversized code so it can be trimmed.
- This is a local teaching application, not a formally audited sandbox for arbitrary public submissions. Reflection answers and historical imported badges are not secure assessments.

## Section introductions and reviews — 27 September 2026

- `npm test`: 145 passed across 6 files. This includes QuickJS execution of all five new worked examples, review question schema checks, answer checking and save compatibility.
- `npm run build`: passed. The new `virtual:section-content` bundle was produced.
- Development Chromium: 12 Playwright checks passed together, followed by 3 additional targeted checks, including the new intro/review flow, saved review answers, C3.1a/C3.1b guidance, existing learner journey, responsive layouts, keyboard editor use and worker recovery. The targeted checks covered section-boundary source carryover, C3.1b sequential entry, and every review blank rendering. Existing Playwright keyboard shortcuts were updated for this Mac host.
- Production Chromium preview: 3 selected checks passed for the new section flow, file guidance and existing learner coding journey.
- Firefox Playwright executable was installed, but it exits before opening a page with “Could not find profile folder”, including with `TMPDIR=/private/tmp`. Firefox UI behaviour remains unverified on this host.
- The referenced `WIZARD_OOP_IMPLEMENTATION_BRIEF.md` was absent from this checkout and was not found under the local Downloads/project directories. The attached plan and current curriculum/tests supplied the implementation details used here.
- No manual screen reader pass or actual browser zoom control test was performed. Browser tests cover keyboard answer entry and CSS viewport reflow.

### Shorter introduction screens — 27 September 2026

- `npm test`: 145 passed. The section fixture now checks a maximum of three objectives and concise opening, build and key-idea copy.
- `npm run build`: passed with the updated pre-rendered introduction content.
- Development Chromium: all 16 Playwright checks passed. The new check opens all five introductions, confirms their optional explanations start closed, and opens the walkthrough with Enter. Existing journey, draft, review, runner and layout checks also passed.
- Production Chromium preview: 2 selected introduction and section-journey checks passed.
- Desktop Section 1 and 390px phone Section 3 captures were visually inspected. The topic, outcomes, key idea and finished example are visible in a clear reading order; the longer notes sit below the Start/Continue control in labelled disclosures. Phone layout has no horizontal overflow. Firefox remains unverified on this host for the profile-launch reason recorded above.

## GitHub Pages deployment preparation — 27 September 2026

The historical “Nothing was publicly deployed” statement above describes the earlier delivery. This update introduces a GitHub Actions Pages workflow; no remote deployment or live-site result was available to verify here.

- Node 22.19.0 and npm 10.9.3: `npm ci` passed from the committed lockfile. `npm test` passed: 145 tests in 6 files.
- Plain `npm run build` passed. `dist/index.html` contained two root `/assets/` references, as expected for local use.
- `PAGES_BASE_PATH=/wizard-workshop npm run build` passed. The HTML script and stylesheet URLs used `/wizard-workshop/assets/`; the main bundle's worker URL and the worker/WASM loader URLs used the same prefix. No bare `"/assets/` references were found in `dist/index.html` or built JavaScript.
- With `PAGES_BASE_PATH` set for both build and Vite preview, headless Chromium loaded `http://127.0.0.1:4174/wizard-workshop/` without HTTP errors or page exceptions. The worker and WASM returned 200, checkpoint C1.1a ran successfully, and its draft remained after reload. A first preview attempt without the variable on the preview command returned a JavaScript 404; the README now gives the working command.
- Restored a plain `npm run build`. `npm run test:e2e` passed all 16 Chromium tests in development mode. Its 16 Firefox tests could not start because this host's Firefox process reported “Could not find profile folder”, the same issue recorded above. `WORKSHOP_PREVIEW=1 npm run test:e2e -- --project=chromium` passed all 16 Chromium tests against the plain production preview.
- PR #1 was opened from `feat/add-github-pages`. Its first workflow run completed checkout, Node setup, `npm ci` and `npm test`, then failed at `Configure GitHub Pages` with “Get Pages site failed … Resource not accessible by integration”. The build and artifact steps were skipped, as was the Deploy job. The repository is currently private; GitHub's Pages API requires `pages: read` for private-site reads, so the build job was given that read-only scope in a follow-up commit. The next PR run reached the same step and returned “Not Found”, matching the read-only Pages API's 404 response. An administrator must enable Pages with **GitHub Actions** as the source, then rerun the PR check. The `main` deployment run and live Pages URL remain unverified.

## Conjuring Room outline, Section 5 spell steps, Game Over and course summary — 28 September 2026

Changes: dotted class outline with property labels (C1.1a/C1.1b); C5.1a split into C5.1a–C5.1e with staged damage checks and new unit tests (`tests/sectionFive.test.js`, `tests/recap.test.js`); lying defeated sprites and a Game Over banner; end-of-course summary screen with Markdown download. `journey.length` is now 54.

- These changes were made in a cloud workspace where the npm registry was unavailable, so `npm ci`, `npm run build` and `npm run test:e2e` were **not run**. Run them before pushing to `main`.
- The Vitest files for curriculum, runner, sections, progress, journey progress, review, section five and recap were executed with a minimal local stand-in for the Vitest API, Acorn 8.16 and an older QuickJS build (0.23, with `Object.hasOwn` polyfilled): all 161 checks passed. `tests/client.test.js` was not run.
- The canvas scenes (empty outline, labelled outline, battle, goblin defeated, wizard defeated) and the summary screen at 1280px and 390px were rendered in headless Chromium and inspected; the summary had no horizontal overflow and its download produced Markdown including the learner's code.
- `tests/workshop.spec.js` gained a summary/download check and updated C1.1a/C1.1b summary text expectations. These have not been run.

## Tome II Section 5 shortened — 2 October 2026

The old E5.4 (Fireball incantation), E5.5 (hotkeys) and E5.6 (custom-event ending) were removed, and the old E5.7 battle was renumbered **E5.4**. E5.4 now starts from the complete, fully wired battle: learners press Run, play, then read the code with a pair programmer and prepare a verbal explanation and one question. Tome II has **22 checkpoints** and a **33-screen** journey. Older saves (no `saveLayout: 2` marker) are upgraded on load: old E5.4–E5.6 work is dropped, learners on those steps or the old E5.7 move to E5.4, and the old E5.7 draft becomes E5.4's restorable backup.

- **Unit checks:** run in Node 22.23 on the Cowork Linux VM with a minimal offline stand-in for the `vitest` API (the package registry was unreachable, so the Linux Vite/Rolldown bindings could not be installed). All 11 test files except `client.test.js` (which needs `vi` fake timers, untouched by this change) passed: **247 tests**, including every EDP solution and starter result, the 1,000-seed balance test, the new Section 5 contract (E5.4 starter equals the complete battle, controls and pair task in the instructions) and the old-numbering save upgrade. Re-run `npm run test` on a workstation with dependencies installed to confirm under real Vitest.
- **Browser checks:** `tests/edp.spec.js` gains a journey from E5.3 → E5.4 (full battle loads with no draft, plays straight from Run, then Section 5 review → spellbook download containing the final code). **Not run here** (Vite needs native bindings); run `npm run test:e2e`.
- **Benchmark:** `node scripts/benchmark-edp.mjs` re-run for the 22 checkpoints; largest median **19ms** (E2.1). `SOLUTIONS-EDP.md` regenerated.

## Tome II event-driven programming — 28–29 September 2026

*Update, 2 October 2026: the old Section 5 (The Owl's Rounds) was removed and the Battle renumbered from Section 6 to Section 5 (steps E6.x are now E5.x). Tome II now has five sections, 25 checkpoints and a 36-screen journey. The counts and results below describe the earlier six-section build and have not been re-run.*

Implemented `PLAN-event-driven-programming.md`: the Grand Library router; mechanical Tome I extraction and shared descriptors/sprites; an independent Tome II welcome and 44-screen journey; six introductions, 31 coding checkpoints, mixed review questions, supporting activities, live stages, Crystal Ball, bridge battle, recap and Markdown evidence. No dependencies were added. The OOP implementation brief remains absent; the plan explicitly permits these mechanical Tome I changes without it.

- **Baseline:** `npm ci` passed with Node 22.19.0/npm 10.9.3. All 165 existing unit tests passed before implementation. The initial browser run recorded 16 Chromium passes, one Chromium navigation timeout and 17 Firefox launch failures; it overlapped the router work and is not claimed as a clean browser baseline. Final Tome I browser coverage passes below. Original scene pixel hashes were captured before sprite extraction. Logs: `verification/edp-baseline-unit.txt`, `verification/edp-baseline-browser.txt`.
- **Unit checks:** final `npm run test` passed **243 tests in 11 files**, including every EDP solution, intended starter results, all six worked examples, listener/event/timer semantics, exception recovery, resource limits, actual battle strategies, state/import validation, review answers and descriptor compatibility. Log: `verification/edp-final-unit.txt`.
- **Development Chromium:** final `npm run test:e2e -- --project=chromium` passed **34 tests**, including all 17 Tome I journeys and the original canvas pixel comparison. A preceding run had 33 passes and exhausted the 30-second overall timeout in the batch that runs 31 EDP solutions; that batch now has a 90-second overall test limit. Application execution limits were not raised. Log: `verification/edp-chromium-dev.txt`.
- **Production Chromium:** `WORKSHOP_PREVIEW=1 npm run test:e2e -- --project=chromium` passed **33 tests**, with one intentional skip for the development-only pixel test. This includes all 31 EDP solutions in the worker, both learning journeys, saved reviews, stale replies, blocked-handler recovery, keyboard input, hover/focus equivalence, independent progress, literal text rendering, and a complete keyboard battle/Rune Bell/report download. The battle test responds to visible health, mana and intent rather than assuming a fixed random sequence; development supplies seed 7, while production ignores the test hook. Log: `verification/edp-chromium-preview.txt`.
- **Battle calibration:** `node scripts/balance-edp.mjs` drove the actual reference listeners over 1,000 seeds per strategy. Fire-only won 360/1,000 (**36%**); full controls won 840/1,000 (**84%**), meeting the plan's 25–45% and 75–90% targets. Final Grub health is 110; intent weights are 10/55/15/10/10. Results: `verification/balance-edp.json`; strategy and rules: `TEACHER_GUIDE.md`.
- **Execution benchmark:** `node scripts/benchmark-edp.mjs` ran every checkpoint solution 25 times. The largest median was **12.76ms**, the old Fireball step (numbered E6.4 when this was measured, later E5.4; it has since been removed). The measured setup/trial budget is 500ms; live messages have a separate 100ms guest budget and 2s host watchdog. Results: `verification/benchmark-edp.json`.
- **Build and Pages:** plain `npm run build` and `PAGES_BASE_PATH=/wizard-workshop npm run build` passed. `node scripts/verify-pages.mjs`, against a preview configured with the same base, loaded the library and both tome routes, executed both runners, delivered a live EDP bell click, checked brand navigation and confirmed prefixed worker/WASM requests. Results: `verification/pages-edp.json`, `verification/edp-pages-browser.txt`. The temporary Pages preview was stopped and a plain build restored. Build logs are saved; Vite reports a non-blocking warning for chunks above 500kB, including the pre-highlighted curriculum.
- **Content and layout:** the six introductions were captured at 1366px and 390px and visually inspected, with completed examples, expected results and optional explanations. Library and battle captures are saved under `verification/edp-*.png`. Automated keyboard/reduced-motion checks and viewport checks passed, including 683×384 as the 200% laptop-zoom reflow equivalent. Actual browser zoom controls were not exercised. `node scripts/generate-docs.mjs` regenerated `SOLUTIONS-EDP.md`; `git diff --check` passed.
- **Remaining environment checks:** Firefox was attempted, but all 30 checks in that run failed before page load with “Could not find profile folder”, the same host failure seen in the baseline; no Firefox behaviour is claimed verified (`verification/edp-firefox-launch.txt`). The requested native VoiceOver pass was attempted through computer-use discovery, which reported that the Mac is locked and automatic unlock failed. VoiceOver announcements and Crystal Ball noise therefore remain unverified. These checks need an unlocked Mac/working Firefox host before release. No main-branch push or deployment was performed.
