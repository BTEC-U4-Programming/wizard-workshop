import {woodLayout} from '../stage/woodLayout.js';
const element = (id, text = '', extra = {}) => ({
  id,
  tag: 'BUTTON',
  parent: 'stage',
  text,
  ...extra
});
const stage = (title, scene, world, elements) => ({
  title,
  scene,
  world,
  elements: [
    element('stage', '', {tag: 'DIV', parent: 'document'}),
    ...elements
  ]
});
const cards = (parent) =>
  ['fire', 'ice', 'storm'].map((power, index) =>
    element(
      `${power}-card`,
      `${['Fire (4 mana)', 'Ice (3 mana)', 'Storm (6 mana)'][index]}`,
      {parent, data: {power: ['fire', 'ice', 'electricity'][index]}}
    )
  );
// The spellbook with its cards; Storm stays hidden until it is learnt.
const spellbookElements = () => [
  element('spellbook', 'Spellbook', {tag: 'DIV'}),
  ...cards('spellbook').map((e) =>
    e.id === 'storm-card' ? {...e, hidden: true, delayed: true} : e
  ),
  element('learn-button', 'Learn a new spell')
];
export const stages = {
  'tower-bedroom': stage(
    'The Tower Bedroom',
    'bedroom',
    ['wizard', 'lantern'],
    [
      element('wake-button', 'Ring the bell'),
      element('sleep-button', 'Go to sleep'),
      element('lantern-button', 'Light the lantern'),
      element('snuff-button', 'Put the lantern out')
    ]
  ),
  courtyard: stage(
    'The Courtyard',
    'courtyard',
    ['wizard'],
    [element('courtyard', 'Click the lawn to walk', {tag: 'DIV', coords: true})]
  ),
  'spell-room': stage(
    'The Spell Room',
    'workshop',
    ['wizard', 'goblin'],
    [
      element('fire-button', 'Fire (4 mana)'),
      element('ice-button', 'Ice (3 mana)'),
      element('potion-button', 'Healing potion'),
      ...spellbookElements()
    ]
  ),
  // E2.3 uses the same room with only the spellbook, so no unused buttons
  // sit on the stage saying "not listening".
  'spellbook-room': stage(
    'The Spell Room',
    'workshop',
    ['wizard', 'goblin'],
    spellbookElements()
  ),
  // E2.4 is only about the potion, so Fire, Ice and the Spellbook stay out.
  'potion-room': stage(
    'The Spell Room',
    'workshop',
    ['wizard', 'goblin'],
    [element('potion-button', 'Healing potion')]
  ),
  'whispering-wood': stage(
    'The Whispering Wood',
    'wood',
    ['wizard', 'goblin'],
    [
      element('red-potion', 'Red potion', {
        hotspot: woodLayout.hotspots['red-potion']
      }),
      element('blue-potion', 'Blue potion', {
        hotspot: woodLayout.hotspots['blue-potion']
      }),
      element('tooltip', '', {tag: 'DIV', hidden: true}),
      // No sprite draws a hover box of its own. The wizard, goblin and
      // chest are also `quietHover`: no "not listening" badge until the
      // student adds a listener (E3.2, E3.3 and E3.4).
      element('goblin', 'Grub', {
        hotspot: woodLayout.hotspots.goblin,
        quietHover: true
      }),
      element('stats', '', {tag: 'DIV'}),
      element('wizard', 'Your wizard', {
        hotspot: woodLayout.hotspots.wizard,
        quietHover: true
      }),
      element('chest', 'Cursed chest', {
        hotspot: woodLayout.hotspots.chest,
        quietHover: true
      }),
      element('disarm-button', 'Disarm the chest')
    ]
  ),
  'rune-door': stage(
    'The Rune Door',
    'door',
    ['wizard', 'runeDoor', 'lantern'],
    [
      element('incantation', '', {tag: 'INPUT', label: 'Speak to the door'}),
      element('buffer-display', 'Spell buffer: ', {tag: 'DIV'})
    ]
  ),
  'grubbledown-bridge': stage(
    'Grubbledown Bridge',
    'bridge',
    ['wizard', 'goblin', 'battle'],
    [
      element('spell-bar', 'Spell bar', {tag: 'DIV'}),
      ...cards('spell-bar'),
      element('shield-button', 'Shield'),
      element('potion-button', 'Healing potion'),
      element('fireball-button', 'Fireball (type IGNIS)'),
      element('goblin', 'Scry Grub', {hotspot: {x: 240, y: 136, w: 38, h: 52}}),
      element('intent-bubble', '', {tag: 'DIV', hidden: true}),
      element('incantation-display', '', {tag: 'DIV'}),
      element('ending', '', {tag: 'DIV', hidden: true})
    ]
  ),
  'example-lantern': stage(
    'A lantern',
    'bedroom',
    ['wizard', 'lantern'],
    [element('lantern-button', 'Light the lantern')]
  ),
  'example-map': stage(
    'A map',
    'courtyard',
    ['wizard'],
    [
      element('map', 'Map', {tag: 'DIV', coords: true}),
      element('pin', '', {tag: 'DIV'})
    ]
  ),
  'example-owl': stage(
    'Quill',
    'loft',
    ['wizard'],
    [element('owl', 'Quill'), element('bubble', '', {tag: 'DIV', hidden: true})]
  ),
  'example-keys': stage('Lantern keys', 'bedroom', ['wizard', 'lantern'], []),
  'example-duel': stage(
    'A practice dummy',
    'workshop',
    ['wizard', 'dummy'],
    [element('hit-button', 'Hit the dummy')]
  )
};
const escape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
export function stageHtml(stageId) {
  const elements = stages[stageId].elements;
  const draw = (item, depth) => {
    const indent = '  '.repeat(depth),
      tag = item.tag.toLowerCase();
    const attrs =
      `id="${item.id}"` +
      Object.entries(item.data ?? {})
        .map(([key, value]) => ` data-${key}="${escape(value)}"`)
        .join('') +
      (item.hidden ? ' hidden' : '');
    if (tag === 'input')
      return `${indent}<label for="${item.id}">${escape(item.label)}</label>\n${indent}<input ${attrs}>`;
    const children = elements.filter((e) => e.parent === item.id && !e.delayed);
    return `${indent}<${tag} ${attrs}>${escape(item.text)}${children.length ? '\n' + children.map((e) => draw(e, depth + 1)).join('\n') + '\n' + indent : ''}</${tag}>`;
  };
  return draw(elements[0], 0);
}
