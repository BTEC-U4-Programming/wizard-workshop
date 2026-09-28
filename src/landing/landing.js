import {tomeUrl, brand} from '../shared/moduleShell.js';
import {drawLibrary} from './drawLibrary.js';
import {loadState} from '../state/store.js';
import {sectionProgress as oopProgress} from '../state/journeyProgress.js';
import {loadEdpState} from '../edp/state/store.js';
import {sectionProgress as edpProgress} from '../edp/state/journeyProgress.js';
import {story} from '../edp/curriculum/story.js';
export function mountLanding() {
  document.title = 'The Grand Library · Wizard Workshop';
  let storage;
  try {
    storage = localStorage;
  } catch {
    storage = {
      getItem() {
        throw new Error('Storage unavailable');
      }
    };
  }
  const oop = loadState(storage),
    edp = loadEdpState(storage);
  const progress = (loaded, count, calculate) => {
    const parts = Array.from({length: count}, (_, i) =>
      calculate(i + 1, loaded.state)
    );
    return {
      done: parts.reduce((n, p) => n + p.done, 0),
      total: parts.reduce((n, p) => n + p.total, 0),
      error: loaded.error
    };
  };
  const first = progress(oop, 5, oopProgress),
    second = progress(edp, 6, edpProgress);
  const card = (id, roman, title, description, p) =>
    `<a class="tome tome-${id}" href="${tomeUrl(id)}"><span class="eyebrow">TOME ${roman}</span><h2>${title}</h2><p>${description}</p><meter min="0" max="${p.total}" value="${p.done}" aria-label="Tome ${roman} progress"></meter><p>${p.error ? 'Progress unavailable in this browser' : p.done ? `${p.done} of ${p.total} steps done` : 'Not started'}</p>${id === 'edp' ? `<p class="tome-recommendation">${first.done === first.total ? 'Recommended next' : 'Best after Tome I'}</p>` : ''}<strong>${p.done === p.total ? 'Revisit' : p.done ? 'Continue' : 'Start'} Tome ${roman} →</strong></a>`;
  document.querySelector('#app').innerHTML =
    `<header class="app-header">${brand()}</header><main class="landing"><div><p class="eyebrow">THE GRAND LIBRARY</p><h1>Choose your tome, apprentice.</h1><p>Each tome is a set of lessons. Your progress in each one is saved separately in this browser.</p></div><div class="landing-art"><canvas width="320" height="180" aria-hidden="true"></canvas><button class="owl-hotspot" aria-label="Quill the owl"></button><p class="owl-bubble" role="status" hidden></p></div><div class="tome-grid">${card('oop', 'I', 'Object-Oriented Programming', 'Forge your wizard: classes, objects, methods, inheritance.', first)}${card('edp', 'II', 'Event-Driven Programming', 'Awaken your wizard: clicks, hovers, keys, timers, battle.', second)}</div><details><summary>What’s the difference between the tomes?</summary><p>Tome I teaches you to describe things with classes and objects.</p><p>Tome II teaches you to make those objects react when something happens. Both paradigms — styles of programming — are named in Unit 4.</p></details></main><footer>Made for learning, one object at a time. <span>No accounts. Progress stays in this browser.</span></footer>`;
  if (oop.state.preferences.reduceMotion || edp.state.preferences.reduceMotion)
    document.body.classList.add('reduce-motion');
  const canvas = document.querySelector('.landing-art canvas');
  drawLibrary(canvas);
  for (const card of document.querySelectorAll('.tome')) {
    const id = card.classList.contains('tome-oop') ? 'oop' : 'edp';
    for (const event of ['mouseenter', 'focus'])
      card.addEventListener(event, () => drawLibrary(canvas, id));
    for (const event of ['mouseleave', 'blur'])
      card.addEventListener(event, () => drawLibrary(canvas));
  }
  const owl = document.querySelector('.owl-hotspot'),
    bubble = document.querySelector('.owl-bubble');
  bubble.textContent = story.owl;
  for (const event of ['mouseenter', 'focus', 'click'])
    owl.addEventListener(event, () => {
      bubble.hidden = false;
    });
  for (const event of ['mouseleave', 'blur'])
    owl.addEventListener(event, () => {
      bubble.hidden = true;
    });
}
