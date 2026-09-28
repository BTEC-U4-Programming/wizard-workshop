import {battleRules} from '../runtime/rules.js';
import {stages} from '../curriculum/stages.js';
import {byId} from '../curriculum/checkpoints.js';
import {LIMITS} from '../../validation/parse.js';
import {choices} from '../../curriculum/checkpoints.js';
const plain = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value, limit) =>
  typeof value === 'string' && value.length <= limit;
const integer = (value, min, max) =>
  Number.isInteger(value) && value >= min && value <= max;
const eventLog = (log) =>
  Array.isArray(log) &&
  log.length <= 100 &&
  log.every(
    (e) =>
      plain(e) &&
      integer(e.t, 0, Number.MAX_SAFE_INTEGER) &&
      text(e.type, 40) &&
      text(e.message, 200) &&
      (e.handler == null || text(e.handler, 100)) &&
      (e.target == null || text(e.target, 100))
  );
export function validStats(stats) {
  return (
    plain(stats) &&
    ['turns', 'scried', 'shields', 'potions'].every((key) =>
      integer(stats[key], 0, 9999)
    ) &&
    ['events', 'spells'].every(
      (key) =>
        plain(stats[key]) &&
        Object.entries(stats[key]).every(
          ([name, n]) => text(name, 40) && integer(n, 0, 9999)
        )
    )
  );
}
export function validEdpSnapshot(snapshot, stageId) {
  try {
    return validateSnapshot(snapshot, stageId);
  } catch {
    return false;
  }
}
function validateSnapshot(snapshot, stageId) {
  const stage = stages[stageId];
  if (
    !stage ||
    !plain(snapshot) ||
    !plain(snapshot.elements) ||
    !plain(snapshot.world) ||
    !plain(snapshot.globals) ||
    !plain(snapshot.page) ||
    !integer(snapshot.page.scrollNudges, 0, 9999)
  )
    return false;
  if (
    !Object.entries(snapshot.elements).every(
      ([id, e]) =>
        stage.elements.some((item) => item.id === id) &&
        plain(e) &&
        text(e.text, 200) &&
        typeof e.hidden === 'boolean' &&
        typeof e.disabled === 'boolean' &&
        text(e.value, 40) &&
        Array.isArray(e.classes) &&
        e.classes.length <= 8 &&
        e.classes.every((c) => text(c, 30) && /^[-\w]+$/.test(c))
    )
  )
    return false;
  if (Object.keys(snapshot.elements).length !== stage.elements.length)
    return false;
  if (
    Object.keys(snapshot.world).some(
      (name) => !stage.world.includes(name) || name === 'battle'
    )
  )
    return false;
  const w = snapshot.world.wizard,
    g = snapshot.world.goblin;
  const character = (c) =>
    plain(c) &&
    text(c.name, 20) &&
    c.name.length > 0 &&
    integer(c.level, 1, 20) &&
    integer(c.maxHealth, 1, 140) &&
    integer(c.health, 0, c.maxHealth);
  if (
    !character(w) ||
    w.maxHealth !== 100 ||
    !integer(w.mana, 0, 20) ||
    w.maxMana !== 20 ||
    !integer(w.x, 20, 280) ||
    !integer(w.y, 40, 190) ||
    !integer(w.potions, 0, 2) ||
    typeof w.awake !== 'boolean' ||
    typeof w.shielded !== 'boolean' ||
    !text(w.lastSpeech, 120) ||
    !['fire', 'ice', 'electricity', 'fireball', 'fizzle', null].includes(
      w.lastSpell
    ) ||
    !(w.lastIncantation === null || text(w.lastIncantation, 120))
  )
    return false;
  if (
    !Object.entries(choices).every(
      ([key, values]) => key === 'level' || values.includes(w[key])
    )
  )
    return false;
  if (
    stage.world.includes('goblin') &&
    (!character(g) ||
      g.maxHealth !==
        (stageId === 'grubbledown-bridge' ? battleRules.goblinHealth : 60))
  )
    return false;
  if (
    stage.world.includes('lantern') &&
    typeof snapshot.world.lantern?.lit !== 'boolean'
  )
    return false;
  if (
    stage.world.includes('tower') &&
    typeof snapshot.world.tower?.awake !== 'boolean'
  )
    return false;
  if (
    stage.world.includes('runeDoor') &&
    (!plain(snapshot.world.runeDoor) ||
      typeof snapshot.world.runeDoor.isOpen !== 'boolean' ||
      !integer(snapshot.world.runeDoor.runesLit, 0, 6) ||
      !integer(snapshot.world.runeDoor.redFlashes, 0, 9999))
  )
    return false;
  if (
    stage.world.includes('dummy') &&
    !integer(snapshot.world.dummy?.health, 0, 100)
  )
    return false;
  if (stage.world.includes('battle')) {
    const b = snapshot.battle;
    if (
      !plain(b) ||
      ![
        'wizardTurn',
        'incantation',
        'goblinTurn',
        'victory',
        'defeat'
      ].includes(b.state) ||
      !['wizard', 'goblin'].includes(b.turn) ||
      !text(b.intent, 100) ||
      !integer(b.time, 0, Number.MAX_SAFE_INTEGER) ||
      (b.windowEnd !== null &&
        !integer(b.windowEnd, b.time, Number.MAX_SAFE_INTEGER)) ||
      !validStats(b.stats)
    )
      return false;
  } else if (snapshot.battle !== null) return false;
  if (
    Object.entries(snapshot.globals).some(
      ([name, value]) =>
        !text(name, 60) ||
        !/^[\w$]+$/.test(name) ||
        !(
          value === null ||
          typeof value === 'boolean' ||
          text(value, 200) ||
          (typeof value === 'number' && Number.isFinite(value))
        )
    )
  )
    return false;
  if (
    !Array.isArray(snapshot.registrations) ||
    snapshot.registrations.length > 60 ||
    !snapshot.registrations.every(
      (r) =>
        plain(r) &&
        ['setup', 'event'].includes(r.phase) &&
        text(r.target, 100) &&
        text(r.type, 40) &&
        (r.handler === null || text(r.handler, 100)) &&
        typeof r.accepted === 'boolean' &&
        typeof r.once === 'boolean'
    )
  )
    return false;
  return (
    eventLog(snapshot.log) &&
    Array.isArray(snapshot.errors) &&
    snapshot.errors.length <= 20 &&
    snapshot.errors.every((e) => text(e.message, 200) && text(e.detail, 1000))
  );
}
export function validEdpResult(result, checkpointId) {
  try {
    if (
      !plain(result) ||
      !['success', 'validButIncomplete', 'error', 'stopped'].includes(
        result.status
      ) ||
      new TextEncoder().encode(JSON.stringify(result)).length > LIMITS.result ||
      !Array.isArray(result.diagnostics) ||
      !result.diagnostics.every(
        (d) =>
          plain(d) &&
          text(d.message, 500) &&
          text(d.hint, 500) &&
          ['spells.js', 'workshop-checks.js'].includes(d.file) &&
          integer(d.from, 0, 2 * 1024 * 1024) &&
          integer(d.to, d.from, 2 * 1024 * 1024)
      )
    )
      return false;
    if (['error', 'stopped'].includes(result.status)) return true;
    const cp = byId[checkpointId];
    return (
      !!cp &&
      validEdpSnapshot(result.snapshot, cp.stage) &&
      Array.isArray(result.trials) &&
      result.trials.length <= 12 &&
      result.trials.length === cp.trials.length &&
      result.trials.every(
        (t, index) =>
          t.id === cp.trials[index].id &&
          text(t.name, 200) &&
          [null, 'typical', 'extreme', 'erroneous'].includes(t.category) &&
          typeof t.passed === 'boolean' &&
          text(t.message, 300) &&
          eventLog(t.log)
      )
    );
  } catch {
    return false;
  }
}
