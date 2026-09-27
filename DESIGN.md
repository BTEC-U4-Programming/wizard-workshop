---
version: alpha
name: Wizard Workshop
description: A calm dark programming workbench with warm gold actions, lavender guidance and original pixel-art characters.
colors:
  primary: "#d9b777"
  primary-hover: "#ebca8f"
  on-primary: "#192132"
  secondary: "#c4a5f2"
  background: "#111a2a"
  surface: "#1b2538"
  surface-control: "#202b40"
  surface-hover: "#2b3650"
  surface-editor: "#111827"
  surface-course: "#141e30"
  on-surface: "#e6e9f0"
  muted: "#a1aec4"
  border: "#313d53"
  focus: "#e3c185"
  link: "#d9c6fc"
  hint: "#231f36"
  hint-border: "#685682"
  info: "#1b293e"
  info-border: "#384861"
  success: "#c1e5c7"
  success-surface: "#1c302e"
  success-border: "#587d68"
  error: "#f4d6c5"
  error-surface: "#392d31"
  error-border: "#c18b73"
typography:
  headline-lg:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
    fontSize: 25px
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: -0.5px
  headline-md:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.4
  headline-sm:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.5
  body-md:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  label-md:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
  eyebrow:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
    fontSize: 11px
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: 1.8px
  code:
    fontFamily: 'Consolas, "Cascadia Code", monospace'
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  inline: 4px
  chip: 5px
  inset: 6px
  control: 7px
  card: 8px
  editor: 10px
  scene: 12px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  column-gap: 28px
  page-inline: 30px
  page-bottom: 36px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.control}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "#162032"
  button-secondary:
    backgroundColor: "{colors.surface-control}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.control}"
  inspector:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: 14px
  editor:
    backgroundColor: "{colors.surface-editor}"
    textColor: "#e3eaf8"
    typography: "{typography.code}"
    rounded: "{rounded.editor}"
  result-success:
    backgroundColor: "{colors.success-surface}"
    textColor: "{colors.success}"
    rounded: "{rounded.control}"
  result-error:
    backgroundColor: "{colors.error-surface}"
    textColor: "{colors.error}"
    rounded: "{rounded.control}"
---

# Wizard Workshop design system

## Overview

Wizard Workshop is a self-paced JavaScript learning application for BTEC students aged 16–17. Its visual identity combines a quiet programming workspace with a small fantasy scene. Learners should feel safe to experiment, able to find their next action and curious about what their code changes. Keep the fantasy in the characters and restrained accents; keep teaching text and controls clear and familiar.

**Status, 27 September 2026:** this guide records the application source and existing verification screenshots. It does not introduce a redesign. The current visible brand is **Wizard Workshop**; the teaching guidance also calls the OOP experience **Wizard Warrior**. Preserve existing labels and identifiers unless a rename is requested.

### Where agents should look

| File | Design responsibility |
|---|---|
| [src/theme.css](src/theme.css) | Root colour variables and save-warning presentation. |
| [src/styles.css](src/styles.css) | Layout, typography, controls, feedback, breakpoints and reduced-motion CSS. |
| [src/main.js](src/main.js) | Screen markup, accessible names, UI states and navigation. |
| [src/editor/createEditor.js](src/editor/createEditor.js) | CodeMirror colours, syntax highlighting and editor behaviour. |
| [scripts/lesson-highlighting.mjs](scripts/lesson-highlighting.mjs) | Expressive Code theme and build-time lesson highlighting. |
| [src/game/renderScene.js](src/game/renderScene.js) | Original pixel artwork, cloak palettes and trace animation. |
| [src/game/celebration.js](src/game/celebration.js) | Success confetti and motion cancellation. |
| [AGENTS.md](AGENTS.md), [TEACHER_GUIDE.md](TEACHER_GUIDE.md) | Learning structure, instructional language and classroom use. |

The YAML values are the reusable design baseline. They are manually documented, not automatically imported by the application. Most values still live as CSS literals; only the root variables below are centralised. Preserve their exact values when extending the current design, and update this document alongside deliberate style changes. Inspect source when a screenshot or this guide appears out of date.

Visual references: [desktop with highlighted lessons](verification/chromium-highlighting-1366.png), [phone with highlighted lessons](verification/chromium-highlighting-390.png), and [sprite options](verification/sprite-options.png). These are existing captures, not evidence of a fresh browser audit.

The document uses the token format and section order from the [Google Labs specification](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md). The accessible introduction of the [Design.md Cheat Sheet](https://medium.com/design-bootcamp/design-md-cheat-sheet-ceabe9b1722d) reinforces pairing structured tokens with explanatory prose at the repository root; its member-only remainder was unavailable during preparation.

## Colors

Use deep navy for the canvas of the application, slightly lighter blue surfaces for tools, pale text for reading, muted lavender for guidance and warm gold for the main action. Avoid introducing unrelated accent families.

| Semantic token | Existing CSS variable | Role |
|---|---|---|
| `background` | `--bg` | Page background, `#111a2a`. |
| `on-surface` | `--text` | Main text, `#e6e9f0`. |
| `muted` | `--muted` | Supporting copy, `#a1aec4`. |
| `border` | `--line` | Quiet dividers and control borders, `#313d53`. |
| `focus` | `--gold` | Keyboard focus and selected-tab accent, `#e3c185`. |
| `primary` | No variable yet | Gold action fill, `#d9b777`; distinct from the focus gold. |

Hints use the violet `hint` surface and `hint-border`. Neutral results use `info` with `info-border`. Success uses green text, surface and border tokens; errors, stopped runs and save warnings use the warm rose error family. Pair status colours with explicit words and useful next steps. Never communicate completion, a problem or selection solely through colour.

The six cloak swatches are game data, not UI status colours: grey `#a4adbc`, purple `#ae87e8`, gold `#e6bc60`, black `#41495f`, blue `#73a8e5`, green `#73bc91`. Keep their mapping in `renderScene.js` and the allowed choice names in the curriculum. Show the typed value beside each swatch.

The application declares `color-scheme: dark`; no light theme is currently defined. For new or changed combinations, verify normal-text contrast of at least 4.5:1 and large-text contrast of at least 3:1. Essential control boundaries and focus indicators need 3:1 against adjacent colours. The low-contrast decorative divider is not a suitable substitute for a visible focus indicator. These are acceptance requirements, not a claim that every existing element has been audited.

## Typography

Use local system fonts. The body stack is `system-ui, -apple-system, "Segoe UI", sans-serif`; the editor uses `Consolas, "Cascadia Code", monospace`. Do not add remote fonts. The brand uses `ui-monospace, Consolas, monospace`, 18px/1.3, weight 600 and 1px tracking; its lavender second word provides the identity accent.

The YAML contains the default text roles. Main activity headings are 25px, dropping to 23px at widths of 600px or less. Body text is 16px, instructions and hints 15px, results and disclosure headings 14px. Keep long explanations in sentence case. Reserve uppercase and tracking for short chapter or scaffold labels.

The editor starts at 16px and offers 14, 16, 18, 20 and 24px in Workspace tools. Preserve this preference. Its syntax colours are keyword `#c7a6fa`, string `#c8df9a`, number `#f0c785`, comment `#98a9c0`, called function name `#9ed7fa` and property name `#e5c694`. Active lines use `#202a40`; selections use `#3c4968`.

Read-only teaching examples use Expressive Code's `github-dark` theme, a configured 16px Consolas font, wrapping and filename captions for complete solutions. Their syntax palette is separate from CodeMirror's. Inline code uses `.lesson-code`, 0.92em/1.6, a `#172033` fill and a thin border. Preserve the distinction between a finished example and the learner's editable draft.

Existing peripheral labels range from 9–13px. Treat these as legacy metadata sizing, not a model for new essential instructions. Prefer at least 12px for new supporting labels and 16px for new instructional prose; verify readability at browser zoom.

## Layout

The header establishes identity and local workspace tools. The journey bar gives checkpoint selection and progress. Below it, the workbench contains the objective, instructions, editor, Run controls, feedback, optional help and previous/next navigation. The preview contains the scene, text summaries, object inspectors, property reference and action log.

| Viewport | Existing layout contract |
|---|---|
| 1100px and wider | Two columns in a 56:44 ratio; 28px gap; maximum width 1720px; main padding 24px 30px 36px. Preview has a left divider and 24px left padding. |
| 601–1099px | One column, maximum width 900px. Preview follows the workbench with a top divider and 26px top padding. Show a Jump to preview link. |
| 600px and narrower | Main padding 18px 16px and 10px gap. Show either workbench or preview using the existing Show preview/Show editor control. Journey selector spans the width. |
| 1500px and wider | Inspector key/value lists become two columns; editor height becomes 450px. |

The editor is normally 400px high, 420px at the middle breakpoint and 410px on phones. Its contents scroll within the editor. The scene is a 320×240 canvas rendered at a 4:3 ratio; at the middle and wide breakpoints its displayed width is capped at 640px. Keep `min-width: 0` on grid children so long code and names cannot force the page wider.

Use the spacing tokens as common anchors, not a claim of a strict grid. Existing components also use 6, 10, 14, 18, 20, 22 and 26px for specific relationships. Match the neighbouring component before inventing a new spacing value. Keep controls near the content they affect, and place results directly after Run controls.

### Learning screens to add or revise

`AGENTS.md` requires a module introduction, section introductions with complete examples, supported practice, independent application, mixed-format section reviews and a recap. The current checkpoint screen is not evidence that all of these screens exist. When implementing them, reuse this palette, heading hierarchy, panel shapes and navigation. Introductions need clear objectives and Start/Continue controls; reviews need labelled answer fields, explanatory feedback and retry. Keep examples accessible while learners edit, and avoid punitive scoring or progress gates based on perfect review answers.

Design introductions for a quick first read. The visible path is: topic and what the learner will make, up to three objectives, one short key idea, a complete highlighted example, its result and a prominent Start/Continue control. Put the longer walkthrough, glossary, prerequisite reminder, prediction and course or assignment notes in labelled disclosures after the main path. Keep those disclosures keyboard accessible and let students revisit them. Avoid repeating definitions in several visible blocks. Check the first view at 1366px and 390px widths so the next action remains easy to find.

## Elevation & Depth

Most hierarchy comes from surface colour, whitespace and thin borders. Keep lesson copy directly on the page; use contained surfaces for editing, inspectors, hints and feedback.

| Element | Existing shadow or layering |
|---|---|
| Editor shell | `0 10px 24px #080d1826` |
| Scene | `0 10px 40px #0003` |
| Primary button | `0 2px 0 #a17f49` |
| Workspace tools popover | `0 15px 60px #0009`; tools wrapper has `z-index: 10`. |
| Confirmation dialog | `0 20px 90px #000a`; native dialog top layer and backdrop `#070d1cbb`. |
| Celebration canvas | Fixed overlay, `z-index: 1000`, `pointer-events: none`. |

Do not add glow to ordinary controls or heavy shadows to every card. Reserve stronger separation for temporary UI above the workbench.

## Shapes

Use modest rounded rectangles: 4px for inline code, 5px for reference chips, 6px for inset blocks, 7px for controls and feedback, 8px for hints and inspectors, 10px for the editor and tool popover, 12px for the scene and dialog. Borders are generally 1px. Editor file tabs have square corners within the rounded shell.

Keep the pixel artwork sharply stepped. Retain integer-coordinate drawing, disabled canvas image smoothing and CSS `image-rendering: pixelated`. Do not blur sprites or replace them with unrelated stock imagery. The star mark, play triangle and navigation arrows supplement text; unfamiliar symbols must not become the only label for an action.

## Components

### Actions and navigation

Primary actions use the gold tokens, weight 750, border `#e6c78a`, 8px 13px padding and minimum height 44px. Run code has a minimum width of 140px. Keep one visually dominant action within the current task or dialog. Secondary buttons use `surface-control`; hover changes to `surface-hover` with border `#a19bc6`. Disabled controls use opacity 0.46 and a default cursor. There is no bespoke pressed-state palette today.

Keyboard focus uses a 3px `focus` outline with 3px offset on buttons, links, summaries, selects and inputs. Preserve meaningful text labels, native keyboard operation and the minimum 44px button height. Do not make hover the only route to instructions or help.

### Editor and examples

The shell uses border `#40495e`; its tab bar is `#1d263b`. The selected tab uses the editor background, pale gold text `#e9d8ad` and an inset 2px gold top line, with `aria-selected` reflecting the selection. Keep file labels `character.js` and `actions.js` unchanged. Show whether code has been run beside the tabs and keep keyboard help below the editor.

Tab must leave the editor. Ctrl/Cmd+Enter runs code; Ctrl/Cmd+] and Ctrl/Cmd+[ indent and outdent. Preserve focusable diagnostics and the Go to problem action. Code presentation must support selection, scrolling and increased font size without clipping controls.

### Feedback, hints and progress

Results use a 7px radius, 12px 14px padding and minimum height 53px. Keep neutral, running, incomplete, successful, error and stopped outcomes understandable in text. The result region is a polite live region. Errors should identify a repair the learner can try; they must leave the last successful preview visible.

Hints use an 8px violet panel with 18px padding. Reveal support progressively and retain the finished worked example as a separate reference. Completion may show a tick and explicit wording; a new run never advances the checkpoint automatically. Draft, save and progress messages must describe the actual state.

### Preview, inspectors and reference

Keep the scene decorative and provide character name, level and health in DOM text. Health meters have accessible labels. Show fresh-object values and the learner's object in two separately titled inspector cards; use a definition list and wrap long values. Cards use `surface`, border `#344058` and 14px padding, reduced to 10px on phones.

Property reference chips show exact typed values, with optional colour swatches. They are read-only code, not buttons. The action log uses text from validated actions and supports a clear empty state. Before the first object exists, retain the empty room and an explanation of how to create the wizard.

### Workspace tools, dialogs and review inputs

Use the existing disclosure popover for occasional preferences and file actions. It has 16px padding, 12px internal gaps and minimum width 265px. Draft replacement dialogs use a maximum width of 480px, 26px padding and clearly labelled keep/replace choices. Preserve native dialog focus behaviour and draft recovery.

Review inputs are a future extension, not an existing visual component. Reuse control surfaces and focus styling; use semantic radio groups with question legends and associated labels for short answers. Keep feedback next to its question and allow retry. Do not invent disabled or successful states that conflict with the learner's saved answer state.

### Motion

Current trace playback waits 200ms before starting, then shows each action for 550ms. Keep Skip animation available and ensure it lands on the final validated state. A successful, current run produces one short confetti burst from Run code, using gold, lavender, green and blue. Never celebrate a failed, incomplete or stale result.

Respect both the operating system's reduced-motion preference and the workspace setting. Reduced motion suppresses confetti and trace playback; the CSS media query also removes smooth scrolling, animations and transitions. Stop obsolete effects after edits, navigation or another run. Avoid looping ambient motion, flashing and effects that intercept input.

## Do's and Don'ts

- **Do** preserve the navy, gold and lavender identity, the local font stacks and the pixel-art style.
- **Do** explain one idea at a time in short, supportive UK English. Name the next useful action.
- **Do** reuse established components, tokens and breakpoints, and update this guide when they intentionally change.
- **Do** keep worked examples, editable drafts, validated results and review answers visually and conceptually distinct.
- **Do** check keyboard focus, 200% browser zoom, a 1366px classroom laptop viewport, a 390px phone viewport and reduced motion after relevant UI changes. Check long names, errors, empty states and expanded help as well as the successful path.
- **Don't** turn the workbench into an ornate fantasy dashboard or use decorative fonts for teaching text.
- **Don't** add external fonts, stock artwork, a new theme or a component framework as an incidental styling change.
- **Don't** hide essential explanations in tiny metadata, colour alone, hover-only controls or animation.
- **Don't** treat decorative dividers as accessible control outlines or claim accessibility compliance from palette values alone.
- **Don't** replace the learner's last working scene with a broken result or erase drafts to simplify navigation.

### Agent handoff and maintenance

Before a styling task, read this file, `AGENTS.md` and the relevant source listed above. Describe any proposed departure from the existing identity. Keep application behaviour and curriculum rules intact while changing presentation. Use the checks in `README.md` appropriate to the actual change, record what was verified, and refresh affected visual references when taking new captures. Documentation-only updates do not establish that browser journeys or accessibility checks have passed.
