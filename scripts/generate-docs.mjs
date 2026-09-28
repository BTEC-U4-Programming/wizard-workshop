import {writeFileSync, readFileSync, existsSync} from 'node:fs';
import {checkpoints} from '../src/curriculum/checkpoints.js';
import {sections} from '../src/curriculum/sections.js';
import {checkpoints as edpCheckpoints} from '../src/edp/curriculum/checkpoints.js';
import {sections as edpSections} from '../src/edp/curriculum/sections.js';
let edpText =
  '# Tome II complete solutions and review answers\n\nGenerated from the trusted EDP curriculum. All solutions are executed by the real QuickJS test suite.\n';
for (const cp of edpCheckpoints) {
  edpText += `\n## ${cp.id} — ${cp.title}\n\n${cp.objective}\n\nSupport: ${cp.scaffold}. Starter: ${cp.starterExpected.status}.\n\n\`\`\`javascript\n${cp.solution.spellsSource}\n\`\`\`\n\nSpell Trials: ${cp.trials.map((t) => t.name).join('; ')}.\n`;
  if (cp.reflection) edpText += '\nSelf-check: ' + cp.reflection + '\n';
}
for (const section of edpSections) {
  edpText += `\n## Section ${section.chapter} review\n`;
  for (const q of section.review.questions) {
    const correct =
      q.type === 'choice' ? q.options.find((o) => o.correct) : null;
    edpText += `\n### ${q.id} — ${q.prompt}\n\nAnswer: ${correct ? correct.text : q.accept.map((a) => '\`' + a + '\`').join(' or ')}\n\n${correct ? correct.feedback : q.explanation}\n`;
  }
}
writeFileSync(new URL('../SOLUTIONS-EDP.md', import.meta.url), edpText);
let text =
  '# Complete checkpoint solutions\n\nGenerated from `src/curriculum/checkpoints.js`. Each solution is an executable fixture checked by the test suite. Names and cosmetic choices may differ while satisfying the same objective.\n';
for (const c of checkpoints) {
  text += `\n## ${c.id} — ${c.title}\n\n${c.objective}\n\nExpected: ${c.expectedVisibleResult}\n\nSupport: ${c.scaffold}.\n\n### character.js\n\n\`\`\`javascript\n${c.solution.characterSource}\n\`\`\`\n`;
  if (c.chapter >= 3)
    text += `\n### actions.js\n\n\`\`\`javascript\n${c.solution.actionsSource || '// No action calls needed yet.'}\n\`\`\`\n`;
  if (c.reflection) text += '\nSelf-check: ' + c.reflection + '\n';
}
text += '\n# Section review answers\n';
for (const section of sections) {
  text += `\n## Section ${section.chapter} — ${section.title}\n`;
  for (const question of section.review.questions) {
    const correct =
      question.type === 'choice'
        ? question.options.find((option) => option.correct)
        : null;
    text += `\n### ${question.id} — ${question.prompt}\n\nAnswer: ${question.type === 'choice' ? correct.text : question.accept.map((answer) => '`' + answer + '`').join(' or ')}\n\n${question.type === 'choice' ? correct.feedback : question.explanation}\n`;
  }
}
writeFileSync(new URL('../SOLUTIONS.md', import.meta.url), text);
const lock = JSON.parse(
  readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8')
);
let notices =
  '# Third-party notices\n\nThe workshop uses system fonts. Pixel artwork and masks are original code in `src/game/renderScene.js`, `src/game/sprites.js` and the Tome II scene renderers; no external images, fonts, audio or generated assets are bundled.\n\nThe following locked dependencies are installed for runtime or development. Their complete copyright and licence texts remain in the corresponding package directories under `node_modules`. QuickJS engine copyright/licensing is included in the QuickJS packages (MIT). Preserve applicable notices when redistributing dependencies.\n\n| Package | Version | Licence |\n|---|---|---|\n';
for (const [path, item] of Object.entries(lock.packages)) {
  if (!path) continue;
  const metadata = new URL('../' + path + '/package.json', import.meta.url);
  if (!existsSync(metadata)) continue;
  const p = JSON.parse(readFileSync(metadata, 'utf8'));
  notices += `| ${p.name} | ${p.version} | ${typeof p.license === 'string' ? p.license : JSON.stringify(p.license || 'See package licence')} |\n`;
}
writeFileSync(new URL('../THIRD_PARTY_NOTICES.md', import.meta.url), notices);
