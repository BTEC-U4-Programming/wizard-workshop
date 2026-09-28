import {checkpoints, byId} from './checkpoints.js';
import {sections} from './sections.js';
export const RECAP = 'recap';
export const journey = [
  'welcome',
  ...sections.flatMap((section) => [
    `intro:${section.chapter}`,
    ...checkpoints
      .filter((cp) => cp.chapter === section.chapter)
      .map((cp) => cp.id),
    `review:${section.chapter}`
  ])
];
export const screenId = (screen) =>
  screen.type === 'checkpoint'
    ? screen.id
    : ['intro', 'review'].includes(screen.type)
      ? `${screen.type}:${screen.chapter}`
      : screen.type;
export function parseScreen(id) {
  if (typeof id !== 'string') return {type: 'welcome'};
  if (id === 'welcome' || id === RECAP) return {type: id};
  if (byId[id]) return {type: 'checkpoint', id};
  const [type, chapter] = String(id).split(':');
  return ['intro', 'review'].includes(type) &&
    sections.some((s) => s.chapter === Number(chapter))
    ? {type, chapter: Number(chapter)}
    : {type: 'welcome'};
}
export const nextScreen = (id) => journey[journey.indexOf(id) + 1] ?? RECAP;
export const previousScreen = (id) =>
  journey[Math.max(0, journey.indexOf(id) - 1)];
