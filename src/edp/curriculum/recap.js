import {sections} from './sections.js';
import {sources} from './sources.js';
import {
  reportPrompts,
  visualBasicExample,
  javascriptComparison
} from './story.js';
const concept = (term, explanation, code, report, language = 'js') => ({
  term,
  explanation,
  code,
  report,
  language
});
export const recap = {
  title: 'Your Tome II spellbook',
  intro:
    'You made objects react to events. Revisit the examples and use your final code to explain your choices in your own words.',
  sections: sections.map((section) => ({
    chapter: section.chapter,
    title: section.title,
    concepts: [
      concept(
        section.intro.concepts[0][0],
        section.intro.summary,
        section.intro.example.code,
        section.intro.assignmentLink
      ),
      [
        concept(
          'Events, listeners and handlers',
          'A listener waits for an event; a handler runs in response. The player controls when it happens.',
          sources['E1.1'],
          'Compare the order of execution with a procedural program.'
        ),
        concept(
          'Event delegation and bubbling',
          'A card click travels to its container, so one listener handles both existing and new cards.',
          sources['E2.3'],
          'Evaluate one listener versus many for maintainability and efficiency.'
        ),
        concept(
          'Hover pairs and accessibility',
          'Focus and blur let keyboard users read the same information as mouse users.',
          sources['E3.5'],
          'Evaluate usability and portability across mouse, touch and keyboard.'
        ),
        concept(
          'Keyboard buffers and robustness',
          'Collect single-character keys, handle Backspace and Enter, and limit the buffer to 12 letters.',
          sources['E4.5'],
          'Use typical, extreme and erroneous test data as evidence.'
        ),
        concept(
          'State and compound conditions',
          'State records whose turn it is. Both turn and mana conditions must be true to cast.',
          sources['E5.3'],
          'Include the truth table and trace table below to explain your logic.'
        ),
        concept(
          'Paradigms together',
          'Visual Basic uses event handlers too. Objects can work alongside event-driven controls.',
          visualBasicExample,
          'Compare how JavaScript and Visual Basic connect click events to handlers (A.P2).',
          'vb'
        )
      ][section.chapter - 1],
      ...(section.chapter === 6
        ? [
            concept(
              'JavaScript beside Visual Basic',
              'Both handlers test mana, call a method on the wizard, and explain a refusal. JavaScript connects the function with addEventListener; Visual Basic uses Handles.',
              javascriptComparison,
              'Compare this JavaScript handler with the Visual Basic handler above (A.P2).'
            )
          ]
        : []),
      ...(section.chapter === 5
        ? [
            concept(
              'Custom events and loose coupling',
              'The zap code announces a defeat. The tower decides how to respond without the zap handler depending on it.',
              sources['E5.5'],
              'Explain loose coupling and its effect on maintainability.'
            )
          ]
        : [])
    ]
  }))
};
export function recapMarkdown(finalCode, extras = {}) {
  let text = `# ${recap.title}\n\n${recap.intro}\n`;
  for (const section of recap.sections) {
    text += `\n## Section ${section.chapter}: ${section.title}\n`;
    for (const c of section.concepts)
      text += `\n### ${c.term}\n\n${c.explanation}\n\n\`\`\`${c.language === 'vb' ? 'vb' : 'javascript'}\n${c.code}\n\`\`\`\n\nUnit 4 link: ${c.report}\n`;
  }
  text +=
    '\n## Truth table\n\n| Wizard turn | Enough mana | Both | Outcome |\n|---|---|---|---|\n| true | true | true | casts |\n| true | false | false | Not enough mana! |\n| false | true | false | Wait your turn! |\n| false | false | false | Wait your turn! |\n';
  text +=
    '\n## Trace table\n\n| Event | State after | Grub health | Outcome |\n|---|---|---|---|\n| Click at 0s | goblinTurn | 46 | Spell |\n| Click at 0.5s | goblinTurn | 46 | Wait your turn! |\n| Timer at 1.5s | wizardTurn | 46 | Wizard health 92 |\n| Click at 2s | goblinTurn | 32 | Spell |\n';
  text +=
    '\n## Questions to answer in your own words\n\nThese are prompts, not answers. Your report must be your own explanation.\n\n' +
    reportPrompts.map((p) => '- ' + p).join('\n') +
    '\n';
  if (extras.battleRecord) {
    const record = extras.battleRecord;
    text += `\n## Your battle\n\nAttempts: ${record.attempts}; wins: ${record.wins}.\n`;
    if (record.lastStats)
      text += `\nEvents by type: ${JSON.stringify(record.lastStats.events)}\n\nSpells cast: ${JSON.stringify(record.lastStats.spells)}\n\nTurns: ${record.lastStats.turns}. Scried Grub’s plan: ${record.lastStats.scried ? 'yes' : 'no'}.\n`;
  }
  if (finalCode) {
    const code = finalCode.spellsSource ?? String(finalCode);
    const fence = '`'.repeat(
      Math.max(3, ...(code.match(/`+/g) ?? []).map((s) => s.length + 1))
    );
    text += `\n## Your final code\n\n${fence}javascript\n${code}\n${fence}\n`;
  }
  return text;
}
