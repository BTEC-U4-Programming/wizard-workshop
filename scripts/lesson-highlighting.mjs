import {ExpressiveCode, loadShikiTheme} from 'expressive-code';
import {toHtml} from 'hast-util-to-html';
import {checkpoints as oopCheckpoints} from '../src/curriculum/checkpoints.js';
import {sections as oopSections} from '../src/curriculum/sections.js';
import {recap as oopRecap} from '../src/curriculum/recap.js';

import {checkpoints as edpCheckpoints} from '../src/edp/curriculum/checkpoints.js';
import {sections as edpSections} from '../src/edp/curriculum/sections.js';
import {recap as edpRecap} from '../src/edp/curriculum/recap.js';
import {stageHtml} from '../src/edp/curriculum/stages.js';
import {
  visualBasicExample,
  story,
  javascriptComparison
} from '../src/edp/curriculum/story.js';

// Runs in Node through Vite. Only escaped, pre-rendered curriculum HTML reaches
// the browser; neither the highlighter nor student drafts enter this pipeline.
export async function renderLessons({edp = false} = {}) {
  const checkpoints = edp ? edpCheckpoints : oopCheckpoints,
    sections = edp ? edpSections : oopSections,
    recap = edp ? edpRecap : oopRecap;
  const engine = new ExpressiveCode({
    themes: [await loadShikiTheme('github-dark')],
    frames: {showCopyToClipboardButton: false},
    styleOverrides: {
      codeFontSize: '16px',
      codeFontFamily: 'Consolas, monospace'
    },
    defaultProps: {wrap: true}
  });
  const styles = new Set([
    await engine.getBaseStyles(),
    await engine.getThemeStyles()
  ]);
  const cache = new Map();
  async function highlight(code, inline = false, title = '', language = 'js') {
    const key = JSON.stringify([code, inline, title, language]);
    if (cache.has(key)) return cache.get(key);
    const result = await engine.render({code, language, props: {title}});
    result.styles.forEach((s) => styles.add(s));
    let html;
    if (inline) {
      const findCode = (n) =>
        n.properties?.className?.includes('code')
          ? n
          : n.children?.map(findCode).find(Boolean);
      const line = findCode(result.renderedGroupAst);
      if (!line)
        throw new Error(
          'Expressive Code did not return inline tokens for ' +
            JSON.stringify(code)
        );
      html =
        '<code class="lesson-code">' +
        line.children.map((n) => toHtml(n)).join('') +
        '</code>';
    } else html = toHtml(result.renderedGroupAst);
    cache.set(key, html);
    return html;
  }
  const escape = (value) => toHtml({type: 'text', value});
  async function prose(value) {
    const parts = value.split('`');
    if (parts.length % 2 === 0)
      throw new Error('Unclosed code delimiter: ' + value);
    // Bold (**…**) may wrap inline code, e.g. "**Step 1 — Meet `switch`.**",
    // so track it across the prose and code parts instead of within one part.
    let bold = false;
    const html = (
      await Promise.all(
        parts.map((part, i) =>
          i % 2
            ? highlight(part, !part.includes('\n'))
            : edp
              ? escape(part).replace(/\*\*/g, () =>
                  (bold = !bold) ? '<strong>' : '</strong>'
                )
              : escape(part)
        )
      )
    ).join('');
    return bold ? html + '</strong>' : html;
  }
  const lessons = {};
  for (const c of checkpoints) {
    lessons[c.id] = {
      objective: await prose(c.objective),
      instructions: await Promise.all(c.instructions.map(prose)),
      checklist: await Promise.all(
        (edp ? c.trials.map((t) => t.name) : c.objectiveChecks).map(prose)
      ),
      hints: await Promise.all(c.hints.map(prose)),
      reflection: await prose(c.reflection),
      fileNotice: c.fileNotice ? await prose(c.fileNotice.body) : '',
      ...(edp
        ? {
            stage: await highlight(
              stageHtml(c.stage),
              false,
              'stage.html',
              'html'
            ),
            comparison:
              c.id === 'E5.7'
                ? await highlight(
                    visualBasicExample,
                    false,
                    'Visual Basic',
                    'vb'
                  )
                : ''
          }
        : {}),
      solution: await Promise.all(
        Object.entries(c.solution)
          .filter(([, s]) => s)
          .map(([file, source]) =>
            highlight(
              source,
              false,
              file === 'spellsSource'
                ? 'spells.js'
                : file === 'characterSource'
                  ? 'character.js'
                  : 'actions.js'
            )
          )
      )
    };
  }
  const sectionContent = {};
  for (const section of sections) {
    const intro = section.intro;
    sectionContent[section.id] = {
      hook: await prose(intro.hook),
      build: await prose(intro.build),
      summary: await prose(intro.summary),
      prerequisites: await prose(intro.prerequisites),
      objectives: await Promise.all(intro.objectives.map(prose)),
      concepts: await Promise.all(
        intro.concepts.map(async ([term, definition]) => ({
          term: await prose(term),
          definition: await prose(definition)
        }))
      ),
      example: await highlight(intro.example.code, false, 'example.js'),
      walkthrough: await Promise.all(intro.example.walkthrough.map(prose)),
      result: await prose(intro.example.result),
      predict: await Promise.all(intro.predict.map(prose)),
      assignmentLink: await prose(intro.assignmentLink),
      questions: await Promise.all(
        section.review.questions.map(async (question) => ({
          prompt: await prose(question.prompt),
          code:
            question.type === 'blank' ? await highlight(question.code) : null,
          options:
            question.type === 'choice'
              ? await Promise.all(
                  question.options.map((option) => prose(option.text))
                )
              : null
        }))
      )
    };
  }
  if (edp)
    sectionContent.welcome = {
      prologue: await prose(story.prologue),
      build: await prose(story.build),
      objectives: await Promise.all(story.objectives.map(prose)),
      newInTome: await prose(story.newInTome),
      assignment: await prose(story.assignment)
    };
  // The course summary lives beside the sections under a reserved key.
  sectionContent.recap = {
    intro: await prose(recap.intro),
    sections: await Promise.all(
      recap.sections.map(async (section) => ({
        concepts: await Promise.all(
          section.concepts.map(async (concept) => ({
            term: await prose(concept.term),
            explanation: await prose(concept.explanation),
            report: await prose(concept.report),
            code: await highlight(
              concept.code,
              false,
              concept.language === 'vb' ? 'example.vb' : 'example.js',
              concept.language ?? 'js'
            )
          }))
        )
      }))
    )
  };
  return {lessons, sectionContent, css: [...styles].join('\n')};
}

export function lessonHighlighting() {
  const ids = [
    'virtual:lesson-content',
    'virtual:section-content',
    'virtual:edp-lesson-content',
    'virtual:edp-section-content',
    'virtual:lesson-styles.css'
  ];
  let data;
  return {
    name: 'workshop-lesson-highlighting',
    resolveId(id) {
      if (ids.includes(id)) return '\0' + id;
    },
    async load(id) {
      if (!ids.some((v) => id === '\0' + v)) return;
      data ??= Promise.all([renderLessons(), renderLessons({edp: true})]);
      const results = await data;
      const result = results[id.includes('edp-') ? 1 : 0];
      return id.endsWith('.css')
        ? results.map((r) => r.css).join('\n')
        : 'export default ' +
            JSON.stringify(
              id.endsWith('section-content')
                ? result.sectionContent
                : result.lessons
            );
    }
    // The curriculum is imported by this config: Vite restarts on changes to it.
  };
}
