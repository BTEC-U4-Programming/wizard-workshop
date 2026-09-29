import {describe, expect, it} from 'vitest';
import {woodLayout} from '../src/edp/stage/woodLayout.js';
import {stages} from '../src/edp/curriculum/stages.js';
const overlaps = (a, b) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
describe('Whispering Wood layout (E3.1–E3.5)', () => {
  const elements = stages['whispering-wood'].elements;
  it('uses the shared layout for every hotspot', () => {
    for (const [id, box] of Object.entries(woodLayout.hotspots))
      expect(elements.find((e) => e.id === id).hotspot).toEqual(box);
  });
  it('keeps the wizard clear of both potions', () => {
    const {hotspots} = woodLayout;
    expect(overlaps(hotspots.wizard, hotspots['blue-potion'])).toBe(false);
    expect(overlaps(hotspots.wizard, hotspots['red-potion'])).toBe(false);
  });
  it('hides the "not listening" badge on wizard, goblin and chest until a listener is added', () => {
    for (const id of ['wizard', 'goblin', 'chest'])
      expect(elements.find((e) => e.id === id).quietHover).toBe(true);
    for (const id of ['red-potion', 'blue-potion'])
      expect(elements.find((e) => e.id === id).quietHover).toBeUndefined();
  });
  it('places the wizard, goblin and chest lower than before', () => {
    expect(woodLayout.wizard.y).toBeGreaterThan(105);
    expect(woodLayout.goblin.y).toBeGreaterThan(136);
    expect(woodLayout.chest.y).toBeGreaterThan(158);
  });
});
