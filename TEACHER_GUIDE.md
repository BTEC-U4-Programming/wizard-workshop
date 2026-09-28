# Teaching with Wizard Workshop

## Intended outcomes

Learners explain classes and objects, implement a constructor, use `this`, distinguish class defaults from instance properties, customise objects using dot notation, define and call methods, use conditional logic, refactor shared behaviour using `extends`/`super`, pass a target object to a method, and use file/line feedback to debug.

Assume only light familiarity with variables. A method is a function belonging to a class. Property is introduced as “property (also called an attribute)”; JavaScript does not itself restrict strings to the game’s colour/power choices. Those are workshop rules.

## Suggested four sessions

| Session | Checkpoints | Focus |
|---|---|---|
| 1 | C1.1a–C2.7 | Class, constructor, `new`, independent instances and the six customisations |
| 2 | C3.1a–C3.5 | Define versus call, return values, conditions, recovery cap and level cap |
| 3 | C4.1–C4.5 | Compare duplication; extract Character; coordinated extends/super; shared damage |
| 4 | C5.1a–C5.4 | Object arguments, deterministic interaction, battle scripts and explanation |

The pace is adjustable. A checkpoint is a single edit or tightly connected pair (notably extends and super). No speed score, lives, time pressure, penalty for hints or assessed streak is used.

## Begin and resume

Install/run using the README, or share https://btec-u4-programming.github.io/wizard-workshop/ with learners once GitHub Pages is enabled and configured for GitHub Actions in the repository. Each browser profile keeps its own local progress, including on the hosted site. Ask learners to use fictional names and download work at session end; browser cleanup or moving device can remove local progress.

Section 5 builds the targeted spell in five small steps so learners change one idea at a time: C5.1a adds the `target` parameter and a flat `target.takeDamage(10);` before the `if`; C5.1b passes the goblin object from `actions.js`; C5.1c stores the damage in a `let` variable; C5.1d swaps each branch's `return` for a damage value and moves the single `takeDamage` call and `return this.specialPower;` after the `if`; C5.1e adds the level bonus. Early steps accept any damage that reaches only the target; C5.1d checks fire 12, ice 10 and electricity 14 (and accepts the level bonus from learners who are ahead); from C5.1e the full formula is required. Feedback names the expected and actual health change.

Normal Next navigation carries forward the successful draft and cosmetic choices. Previously visited checkpoints keep their own drafts. A few transitions explicitly use prepared structures: remove the temporary apprentice; select fire for the first conditional demonstration; append the duplicated Goblin; clear old actions and restore full health when introducing targeted spells. Earlier checkpoint drafts remain available.

Use the top checkpoint selector to jump for a demonstration or recovery. A never-visited jump loads a starting example and does not count as earned completion. Press Run to validate it. Returning to a completed checkpoint still requires its current draft to be rerun before Next is enabled. Historical badges are retained.

## Section introductions and reviews

The course opens with an introduction and a complete example. Each later section also starts with a worked example; students can revisit it from the journey selector without losing their code draft. Each section finishes with multiple-choice and short code-completion questions. These are formative: feedback explains answers, retries are free, and no score blocks progress. Review answers are saved separately from code drafts.

Use the journey selector to jump to an introduction or review for a class discussion. Edit the questions and explanations in `src/curriculum/sections.js`. The generated answer key is at the end of `SOLUTIONS.md`.

## Support and differentiation

- Read the objective together, then ask the learner to predict the visible change before Run.
- Hint 1 recalls the concept, Hint 2 locates the edit, and Worked example shows complete code. Help is optional and carries no penalty.
- For lower-confidence learners, start with one changed line and explicitly point to constructor versus object setup. Cloak-pattern steps offer an opt-in gap insertion in the correct location.
- Restart gradual support at methods and inheritance. Success with properties does not imply the learner already understands calling methods or parent constructors.
- For extension, choose equivalent `+=`, `Math.min` or `Math.max`, reorder action lines, predict capped healing, or demonstrate that a level-up affects only subsequent spells.
- Reflection prompts and the shared-member comparison are for discussion. The app does not claim to assess written explanations.

## Misconceptions and useful explanations

- **Class versus object:** `Wizard` describes a kind of object. `wizard` is one particular instance; names are case-sensitive. An object literal is not a substitute for this course’s class objective.
- **Constructor defaults:** “What a new Wizard starts with” is a fresh probe instance, not static properties on the class itself. Changing `wizard.cloakColour` does not change that constructor default.
- **Two instances:** changing `apprentice.name` does not rename `wizard`. Only the primary wizard is rendered on the platform.
- **Re-running:** normal JavaScript does not retroactively reconstruct old objects after editing a constructor. This workshop deliberately rebuilds all objects on each Run, then executes overrides again.
- **Define versus call:** a method declaration describes work. Nothing happens until an action line calls it. `return` supplies the spell-kind value the renderer uses.
- **Comparison versus assignment:** `===` compares values. `=` changes a value. Multiple probe states prevent a hardcoded answer for the currently selected power from passing the whole conditional activity.
- **Recovery:** it adds up to 20, bounded by maxHealth. From 95 the actual recovery is 5; at full health it is 0.
- **Inheritance:** temporary duplication in C4.2 and early C4.3 is intentional. Move shared methods before removing subclass copies. Call super before this. Goblin has no wizard-only properties.
- **Class versus object on screen:** a class on its own draws only a dotted outline in The Conjuring Room. The outline gains a `name` label once the constructor sets it, and becomes a real wizard only when `new Wizard(...)` runs.
- **`return` stops the method:** in C5.1d, a `takeDamage` line placed after branches that still `return` would never run. This is why the branches set `damage` instead.
- **Target:** it is the object passed as an argument, not a quoted name. `wizard.castSpell(goblin)` permits the method to call the goblin’s inherited damage behaviour.
- **Workshop guards:** living actors, valid targets and action-list rules are enforced by the runner before trial calls. This does not mean learners have already written those defensive checks inside their own methods.
- **Atomic failure:** an invalid late action discards the entire trial trace. Earlier actions in that run are not committed. Correct the highlighted file/line and rerun; the last accepted scene remains.

## Battle reference

Fire damage = `12 + level * 2`; ice = `10 + level * 2`; electricity = `14 + level * 2`. Goblin attack damage is always 8. Damage is clamped at zero, healing at maxHealth and level at 20. There is no randomness or automatic enemy response.

The final worked example uses a level-2 electricity wizard and full-health characters:

```js
wizard.castSpell(goblin); // goblin 60 → 42, damage 18
goblin.attack(wizard);   // wizard 100 → 92, damage 8
wizard.recoverHealth();  // wizard 92 → 100, actual recovery 8
wizard.levelUp();        // wizard level 2 → 3
```

For a simple victory demonstration, use a level-1 fire wizard and five spell calls: damage is 14, 14, 14, 14 and finally 4. A sixth action fails because the battle has concluded. That pure victory trace can be demonstrated from C5.1e (at C5.1b–C5.1c each spell deals a flat 10); C5.3 additionally requires a response and recovery somewhere in its complete script. A C5.3 victory can start with spell, goblin attack and recovery, followed by four more spells. Defeat is also a valid learning result; invite a change in action order.

When either character reaches zero health, the defeated sprite lies on the floor and a **Game Over** banner reads **Wizard Wins** or **Goblin Wins**. The result message and character summary give the same outcome as text.

## Course summary

**Finish course** on the Section 5 review opens a summary of every major concept, each with a complete example and a Unit 4 report link. **Download summary (.md)** saves it as Markdown, followed by the learner's last successful Section 5 code. The summary is also listed in the journey selector under “Course complete”. It is not a progress step and is never locked. Edit its content in `src/curriculum/recap.js`.

## Accessibility and classroom setup

The editor supports keyboard navigation, line numbers, indentation, undo/redo and explicit completion. Tab leaves the editor. Use Ctrl/Cmd+Enter to Run, Ctrl/Cmd+] to indent and Ctrl/Cmd+[ to outdent. Workspace tools changes the code font size. Results are announced in a polite live region after Run; typing diagnostics are not sent to that region. Go to problem focuses the relevant file and source selection.

DOM text and health meters accompany the decorative canvas. Reduced-motion mode or the OS preference immediately displays the accepted final state. Skip animation does the same. Tablet layouts stack the panels; the narrow layout offers a Code/Preview switch. Browser zoom may require vertical scrolling.

Try the actual managed classroom browser before the first lesson. Policies that block workers or WASM cause a retryable runner-loading message. Reload code runner is in Workspace tools. There is no unsafe evaluation fallback.

## All checkpoint solutions and expected outputs

See [SOLUTIONS.md](SOLUTIONS.md). It contains all 41 complete two-file solutions, objectives, expected effects and reflection prompts generated from the same curriculum records used by the app. To regenerate after teacher curriculum changes, run `node scripts/generate-docs.mjs`.

For deliberate debugging exercises, use the fixtures in `tests/runner.test.js` or change a colour to `"Purple"`, remove a brace, quote level `"3"`, use `castspell`, omit `super`, pass `"goblin"`, or add a sixth action after victory. Avoid asking beginners to understand the infrastructure in `src/runner`.
