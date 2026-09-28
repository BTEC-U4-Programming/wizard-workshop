import {battleRules} from './rules.js';
// This function is serialised and evaluated inside QuickJS. It has no host
// references: its only input is JSON, and every output is a JSON snapshot.
function createStage(config) {
  const stringify = JSON.stringify.bind(JSON);
  const pendingElements = new Map();
  const elements = new Map(),
    listeners = new WeakMap(),
    models = new WeakMap();
  const log = [],
    registrations = [],
    errors = [],
    timers = [];
  let logId = 0,
    now = 0,
    timerId = 0,
    phase = 'setup',
    listenerCount = 0,
    focused = null,
    scrollNudges = 0;
  let seed = config.seed >>> 0;
  const random = () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const bounded = (items, item, limit) => {
    items.push(item);
    if (items.length > limit) items.shift();
  };
  const nameOf = (fn) =>
    fn.name === 'stageLearnsSpell'
      ? '(stage)'
      : fn.name ||
        (!Object.hasOwn(fn, 'prototype')
          ? '(arrow function)'
          : '(anonymous function)');
  const label = (node) =>
    node.id === 'document'
      ? 'document'
      : node.id === 'battle.events'
        ? 'battle.events'
        : '#' + node.id;
  const record = (type, message = '', extra = {}) =>
    bounded(
      log,
      {
        id: ++logId,
        t: now,
        type,
        message: String(message).slice(0, 200),
        ...extra
      },
      100
    );
  const recordError = (error) => {
    const message = String(error.message || error).slice(0, 200),
      detail = String(error.stack || '').slice(0, 1000);
    bounded(errors, {message, detail}, 20);
    const line = detail.match(/spells\.js:(\d+)/)?.[1];
    record(
      'error',
      `This handler stopped${line ? ' at spells.js, line ' + line : ''}: ${message}`
    );
  };
  function CustomEvent(type, options = {}) {
    this.type = String(type);
    this.detail = options.detail ?? null;
    this.bubbles = !!options.bubbles;
  }
  Object.freeze(CustomEvent.prototype);
  function target(id, tag = 'DIV') {
    const node = {id, tagName: tag};
    listeners.set(node, new Map());
    Object.defineProperties(node, {
      addEventListener: {
        value: function (type, fn, options = {}) {
          type = String(type);
          const entries = listeners.get(this).get(type) ?? [];
          const duplicate = entries.some(
            (entry) => !entry.removed && entry.fn === fn
          );
          if (listenerCount >= 60 && !duplicate)
            throw new RangeError(
              'There are already 60 listeners. Move repeated registration out of your handlers.'
            );
          const accepted = typeof fn === 'function' && !duplicate;
          bounded(
            registrations,
            {
              phase,
              target: label(this),
              type,
              handler: typeof fn === 'function' ? nameOf(fn) : null,
              once: !!options?.once,
              accepted,
              reason:
                typeof fn !== 'function'
                  ? 'not-function'
                  : duplicate
                    ? 'duplicate'
                    : null
            },
            60
          );
          if (accepted) {
            listenerCount++;
            entries.push({fn, once: !!options?.once, removed: false});
            listeners.get(this).set(type, entries);
          }
        }
      },
      removeEventListener: {
        value: function (type, fn) {
          let removed = false;
          for (const entry of listeners.get(this).get(String(type)) ?? [])
            if (entry.fn === fn && !entry.removed) {
              entry.removed = true;
              listenerCount--;
              removed = true;
            }
          bounded(
            registrations,
            {
              phase,
              target: label(this),
              type: String(type),
              handler: typeof fn === 'function' ? nameOf(fn) : null,
              once: false,
              accepted: removed,
              reason: removed ? 'removed' : 'reference-not-found',
              operation: 'remove'
            },
            60
          );
        }
      },
      dispatchEvent: {
        value: function (event) {
          dispatch(this, event);
          return !event.defaultPrevented;
        }
      }
    });
    return node;
  }
  const document = target('document', '#DOCUMENT');
  Object.defineProperty(document, 'querySelector', {
    value: (selector) =>
      elements.get(String(selector).slice(1)) &&
      String(selector).startsWith('#')
        ? elements.get(String(selector).slice(1))
        : null
  });
  Object.preventExtensions(document);
  const elementData = new Map();
  for (const def of config.stage.elements) {
    const node = target(def.id, def.tag),
      data = {
        text: def.text ?? '',
        hidden: !!def.hidden,
        value: '',
        classes: [],
        disabled: false
      };
    elementData.set(def.id, data);
    (def.delayed ? pendingElements : elements).set(def.id, node);
    const classList = Object.freeze({
      add(...names) {
        for (const name of names) {
          if (typeof name !== 'string' || !/^[-\w]{1,30}$/.test(name))
            throw new TypeError('Use a short class name.');
          if (!data.classes.includes(name) && data.classes.length < 8)
            data.classes.push(name);
        }
      },
      remove(...names) {
        data.classes = data.classes.filter((name) => !names.includes(name));
      },
      contains(name) {
        return data.classes.includes(name);
      },
      toggle(name, force) {
        const present = data.classes.includes(name),
          add = force === undefined ? !present : !!force;
        if (add) this.add(name);
        else this.remove(name);
        return add;
      }
    });
    Object.defineProperties(node, {
      textContent: {
        get: () => data.text,
        set: (value) => {
          data.text = String(value).slice(0, 200);
        }
      },
      hidden: {
        get: () => data.hidden,
        set: (value) => {
          data.hidden = !!value;
        }
      },
      dataset: {value: Object.freeze({...def.data})},
      classList: {value: classList},
      parentElement: {
        get: () =>
          def.parent === 'document' ? document : elements.get(def.parent)
      },
      focus: {
        value: () => {
          focused = node;
          dispatch(node, {type: 'focus', bubbles: false});
        }
      },
      ...(def.tag === 'INPUT'
        ? {
            value: {
              get: () => data.value,
              set: (value) => {
                data.value = String(value).slice(0, 40);
              }
            }
          }
        : {}),
      ...(def.tag === 'BUTTON'
        ? {
            disabled: {
              get: () => data.disabled,
              set: (value) => {
                data.disabled = !!value;
              }
            }
          }
        : {})
    });
    Object.preventExtensions(node);
  }
  function dispatch(node, init) {
    const event = init;
    event.target = node;
    event.currentTarget = node;
    event.timeStamp = now;
    event.defaultPrevented = false;
    event.preventDefault = () => {
      event.defaultPrevented = true;
    };
    event.stopPropagation = () => {
      event.propagationStopped = true;
    };
    const path = [node];
    if (event.bubbles)
      while (path.at(-1) !== document && path.at(-1).parentElement)
        path.push(path.at(-1).parentElement);
    let handled = false;
    const oldPhase = phase;
    phase = 'event';
    if (battleState)
      stats.events[event.type] = (stats.events[event.type] ?? 0) + 1;
    for (const current of path) {
      event.currentTarget = current;
      for (const entry of [...(listeners.get(current).get(event.type) ?? [])]) {
        if (entry.removed) continue;
        if (entry.once) {
          entry.removed = true;
          listenerCount--;
        }
        handled = true;
        let ok = true;
        try {
          entry.fn.call(current, event);
        } catch (error) {
          ok = false;
          recordError(error);
        }
        record(event.type, '', {
          target: label(node),
          handler: nameOf(entry.fn),
          ok,
          key: event.key ?? null,
          offsetX: event.offsetX ?? null,
          offsetY: event.offsetY ?? null
        });
      }
      if (event.propagationStopped) break;
    }
    if (!handled)
      record(event.type, 'nobody is listening', {
        target: label(node),
        handler: null,
        ok: true,
        key: event.key ?? null
      });
    if (
      event.type === 'keydown' &&
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(
        event.key
      ) &&
      ['document', 'stage'].includes(node.id) &&
      !event.defaultPrevented
    )
      scrollNudges++;
    phase = oldPhase;
    return event;
  }
  function setTimeout(fn, ms = 0) {
    if (typeof fn !== 'function')
      throw new TypeError('setTimeout needs a function.');
    if (timers.length >= 50)
      throw new RangeError('There are already 50 waiting timers.');
    const id = ++timerId;
    timers.push({
      id,
      due: now + Math.max(0, Math.min(60000, Number(ms) || 0)),
      fn
    });
    return id;
  }
  function clearTimeout(id) {
    const index = timers.findIndex((timer) => timer.id === id);
    if (index >= 0) timers.splice(index, 1);
  }
  function drain(until) {
    let count = 0;
    while (true) {
      timers.sort((a, b) => a.due - b.due || a.id - b.id);
      if (!timers.length || timers[0].due > until) break;
      if (++count > 1000) throw new RangeError('Too many timers in one step.');
      const timer = timers.shift();
      now = timer.due;
      const oldPhase = phase;
      phase = 'event';
      let ok = true;
      try {
        timer.fn();
      } catch (error) {
        ok = false;
        recordError(error);
      }
      record('timer', '', {handler: nameOf(timer.fn), ok, target: null});
      phase = oldPhase;
    }
    now = until;
  }
  const console = Object.freeze({
    log(...values) {
      record(
        'console',
        values
          .map((value) => {
            try {
              return typeof value === 'object'
                ? stringify(value)
                : String(value);
            } catch {
              return '[unreadable value]';
            }
          })
          .join(' ')
      );
    }
  });
  const clamp = (value, min, max) =>
    Math.max(min, Math.min(max, Math.round(Number(value) || 0)));
  function properties(object, data) {
    models.set(object, data);
    for (const key of Object.keys(data))
      Object.defineProperty(object, key, {
        enumerable: true,
        configurable: true,
        get: () => data[key],
        set: (value) => {
          if (typeof data[key] === 'number') {
            const max =
              key === 'health'
                ? data.maxHealth
                : key === 'mana'
                  ? 20
                  : key === 'level'
                    ? 20
                    : key === 'x'
                      ? 280
                      : key === 'y'
                        ? 190
                        : key === 'potions'
                          ? 2
                          : key === 'maxHealth'
                            ? 140
                            : 9999;
            data[key] = clamp(
              value,
              key === 'level' ? 1 : key === 'x' ? 20 : key === 'y' ? 40 : 0,
              max
            );
          } else if (typeof data[key] === 'boolean') data[key] = !!value;
          else if (key === 'specialPower') {
            if (['fire', 'ice', 'electricity'].includes(value))
              data[key] = value;
            else throw new TypeError('Choose fire, ice or electricity.');
          } else
            data[key] =
              value === null
                ? null
                : String(value).slice(0, key === 'name' ? 20 : 120);
        }
      });
  }
  class Character {
    constructor(name, maxHealth) {
      properties(this, {name, level: 1, maxHealth, health: maxHealth});
    }
    recoverHealth() {
      this.health = Math.min(this.maxHealth, this.health + 20);
    }
    levelUp() {
      this.level = Math.min(20, this.level + 1);
    }
    takeDamage(amount) {
      this.health = Math.max(0, this.health - amount);
    }
  }
  class Wizard extends Character {
    constructor(name) {
      super(name, 100);
      properties(this, {
        ...models.get(this),
        cloakColour: 'grey',
        cloakPattern: 'plain',
        wand: 'oak',
        beardType: 'none',
        specialPower: 'fire'
      });
    }
    castSpell(target) {
      target.takeDamage(
        {fire: 12, ice: 10, electricity: 14}[this.specialPower] + this.level * 2
      );
      return this.specialPower;
    }
  }
  class Goblin extends Character {
    constructor(name) {
      super(name, 60);
    }
    attack(target) {
      target.takeDamage(8);
    }
  }
  class BattleWizard extends Wizard {
    constructor(name) {
      super(name);
      properties(this, {
        ...models.get(this),
        mana: 20,
        maxMana: 20,
        awake: false,
        x: 120,
        y: 150,
        shielded: false,
        potions: 2,
        lastSpeech: '',
        lastSpell: null,
        lastIncantation: null
      });
    }
    say(text) {
      this.lastSpeech = String(text).slice(0, 120);
      record('say', this.lastSpeech);
    }
    wake() {
      this.awake = true;
    }
    sleep() {
      this.awake = false;
    }
    moveTo(x, y) {
      this.x = clamp(x, 20, 280);
      this.y = clamp(y, 40, 190);
    }
    moveBy(dx, dy) {
      this.moveTo(this.x + dx, this.y + dy);
    }
    castSpell(target) {
      const cost = {fire: 4, ice: 3, electricity: 6}[this.specialPower];
      if (this.mana < cost) {
        this.lastSpell = 'fizzle';
        record('fizzle', this.specialPower);
        return null;
      }
      this.mana -= cost;
      this.lastSpell = this.specialPower;
      record('spell', this.specialPower);
      return super.castSpell(target);
    }
    raiseShield() {
      this.shielded = true;
    }
    speakIncantation(words) {
      const normalised = String(words).trim().toUpperCase();
      this.lastIncantation =
        normalised === 'IGNIS' || normalised === 'LUX'
          ? normalised
          : normalised
            ? 'fizzle'
            : null;
      if (!normalised) this.say('…the wizard mumbles nothing.');
      else if (normalised === 'IGNIS') this.say('IGNIS! The torches blaze.');
      else if (normalised === 'LUX') {
        lantern.turnOn();
        this.say('LUX!');
      } else this.say('The words fizzle.');
    }
    drinkPotion() {
      if (this.potions > 0) {
        this.potions--;
        this.recoverHealth();
      }
    }
  }
  // Re-definitions above retain one private data record; configurable accessors
  // are only needed during construction and are sealed before learner setup.
  const wizard = new BattleWizard(config.look?.name ?? 'Aster'),
    goblin = new Goblin('Grub');
  for (const [key, value] of Object.entries(config.look ?? {}))
    if (key in wizard) wizard[key] = value;
  function worldObject(data, methods) {
    const object = {};
    properties(object, data);
    for (const [name, fn] of Object.entries(methods))
      Object.defineProperty(object, name, {value: fn});
    return Object.freeze(object);
  }
  const lantern = worldObject(
    {lit: false},
    {
      turnOn() {
        lantern.lit = true;
        record('world', 'Lantern lit');
      },
      turnOff() {
        lantern.lit = false;
        record('world', 'Lantern dark');
      }
    }
  );
  const runeDoor = worldObject(
    {isOpen: false, runesLit: 0, redFlashes: 0},
    {
      open() {
        runeDoor.isOpen = true;
        record('world', 'Door open');
      },
      lightRunes(n) {
        runeDoor.runesLit = clamp(n, 0, 6);
      },
      flashRed() {
        runeDoor.redFlashes++;
      },
      reset() {
        runeDoor.isOpen = false;
        runeDoor.runesLit = 0;
      }
    }
  );
  const tower = worldObject(
    {awake: false},
    {
      wakeUp(loudness) {
        tower.awake = true;
        record('world', `Tower wakes: ${loudness}`);
      }
    }
  );
  const dummy = worldObject(
    {health: 100, maxHealth: 100},
    {
      takeDamage(n) {
        dummy.health -= n;
      }
    }
  );
  const world = {wizard, goblin, lantern, runeDoor, tower, dummy};
  let battleState = config.stage.world.includes('battle') ? 'wizardTurn' : null,
    intent = null,
    slowed = false,
    windowTimer = null,
    windowEnd = null;
  const stats = {
    events: {},
    spells: {fire: 0, ice: 0, electricity: 0, fireball: 0},
    turns: 0,
    scried: 0,
    shields: 0,
    potions: 0
  };
  const battleEvents = target('battle.events');
  Object.preventExtensions(battleEvents);
  const intents = [
    ['Club Smash — 10 damage', 10, false],
    ['Big Bonk — 20 damage', 20, false],
    ['Sneaky Stab — 12 damage, ignores shields', 12, true],
    ['Taunt — lose 6 mana', 0, false],
    ['Snatch — steals a potion', 0, false]
  ];
  const chooseIntent = () => {
    const r = random();
    return intents[
      r < config.rules.intentWeights[0]
        ? 0
        : r < config.rules.intentWeights[0] + config.rules.intentWeights[1]
          ? 1
          : r <
              config.rules.intentWeights[0] +
                config.rules.intentWeights[1] +
                config.rules.intentWeights[2]
            ? 2
            : r < 1 - config.rules.intentWeights[4]
              ? 3
              : 4
    ];
  };
  if (battleState) {
    goblin.maxHealth = config.rules.goblinHealth;
    goblin.health = config.rules.goblinHealth;
    wizard.level = clamp(config.look?.level ?? 1, 1, 3);
    intent = chooseIntent();
  }
  function announce(type, detail) {
    dispatch(battleEvents, new CustomEvent(type, {detail}));
  }
  function checkEnd() {
    if (['victory', 'defeat'].includes(battleState)) return true;
    if (wizard.health === 0 || goblin.health === 0) {
      battleState = wizard.health === 0 ? 'defeat' : 'victory';
      clearTimeout(windowTimer);
      windowEnd = null;
      announce('battleEnded', {
        winner: battleState === 'victory' ? 'wizard' : 'goblin'
      });
      return true;
    }
    return false;
  }
  function goblinTakesTurn() {
    if (checkEnd()) return;
    let damage = intent[1];
    if (intent === intents[3]) wizard.mana -= 6;
    else if (intent === intents[4] && wizard.potions > 0) wizard.potions--;
    else {
      if (intent === intents[4]) damage = 10;
      damage = Math.max(0, damage - (slowed ? 4 : 0));
      if (wizard.shielded && !intent[2]) damage = Math.floor(damage / 2);
      if (config.apprentice) damage = Math.floor(damage * 0.75);
      wizard.takeDamage(damage);
    }
    wizard.shielded = false;
    slowed = false;
    record('battle', intent[0]);
    if (checkEnd()) return;
    intent = chooseIntent();
    battleState = 'wizardTurn';
    wizard.mana = Math.min(20, wizard.mana + 3);
    announce('turnStarted', {whose: 'wizard'});
  }
  function endTurn() {
    windowEnd = null;
    if (checkEnd()) return;
    battleState = 'goblinTurn';
    stats.turns++;
    announce('turnStarted', {whose: 'goblin'});
    setTimeout(goblinTakesTurn, config.rules.goblinDelay);
  }
  function canAct() {
    if (battleState !== 'wizardTurn') {
      wizard.say(
        ['victory', 'defeat'].includes(battleState)
          ? 'The battle has ended.'
          : 'Not your turn!'
      );
      return false;
    }
    return !checkEnd();
  }
  const battle = Object.freeze({
    events: battleEvents,
    get state() {
      return battleState;
    },
    isWizardTurn: () => battleState === 'wizardTurn',
    isIncantationOpen: () => battleState === 'incantation',
    cast(power) {
      if (!canAct()) return false;
      const cost = {fire: 4, ice: 3, electricity: 6}[power];
      if (!cost) {
        wizard.say("That isn't a spell I know.");
        return false;
      }
      if (wizard.mana < cost) {
        wizard.say('Not enough mana!');
        return false;
      }
      wizard.specialPower = power;
      wizard.castSpell(goblin);
      stats.spells[power]++;
      if (power === 'ice') slowed = true;
      endTurn();
      return true;
    },
    shield() {
      if (!canAct()) return false;
      wizard.raiseShield();
      stats.shields++;
      endTurn();
      return true;
    },
    drinkPotion() {
      if (!canAct()) return false;
      if (!wizard.potions) {
        wizard.say('No potions left!');
        return false;
      }
      wizard.drinkPotion();
      stats.potions++;
      endTurn();
      return true;
    },
    revealIntent() {
      stats.scried++;
      return intent?.[0] ?? 'No plan';
    },
    startIncantation() {
      if (!canAct()) return false;
      if (wizard.mana < 8) {
        wizard.say('Not enough mana!');
        return false;
      }
      battleState = 'incantation';
      windowEnd =
        now +
        (config.apprentice
          ? config.rules.apprenticeWindow
          : config.rules.incantationWindow);
      windowTimer = setTimeout(
        () => battle.speakIncantation(''),
        config.apprentice
          ? config.rules.apprenticeWindow
          : config.rules.incantationWindow
      );
      return true;
    },
    speakIncantation(words) {
      if (battleState !== 'incantation') return false;
      clearTimeout(windowTimer);
      if (String(words).trim().toUpperCase() === 'IGNIS') {
        wizard.mana -= 8;
        goblin.takeDamage(30);
        stats.spells.fireball++;
        wizard.lastSpell = 'fireball';
        record('spell', 'Fireball');
      } else {
        wizard.mana -= 4;
        wizard.lastSpell = 'fizzle';
        record('fizzle', 'Incantation');
      }
      endTurn();
      return true;
    }
  });
  world.battle = battle;
  for (const object of [wizard, goblin]) Object.freeze(object);
  for (const cls of [Character, Wizard, Goblin, BattleWizard]) {
    Object.freeze(cls.prototype);
    Object.freeze(cls);
  }
  if (elements.has('learn-button'))
    elements
      .get('learn-button')
      .addEventListener('click', function stageLearnsSpell() {
        elements.set('storm-card', pendingElements.get('storm-card'));
        elementData.get('storm-card').hidden = false;
      });
  function setup(overrides) {
    for (const [name, values] of Object.entries(overrides ?? {}))
      if (world[name])
        for (const [key, value] of Object.entries(values))
          if (key in world[name]) world[name][key] = value;
  }
  setup(config.setup);
  function step(action) {
    if (action.do === 'wait') {
      drain(now + clamp(action.ms, 0, 60000));
      return;
    }
    if (action.do === 'set') {
      const [name, key] = action.path.split('.');
      if (world[name] && key in world[name]) world[name][key] = action.value;
      return;
    }
    if (action.do === 'bell') {
      if (battleState === 'victory') {
        record('bellRung', 'The Rune Bell rings');
        lantern.turnOn();
        runeDoor.open();
        tower.wakeUp(10);
        record('owl', 'Quill wakes: the tower is listening!');
        dispatch(
          document,
          new CustomEvent('bellRung', {detail: {winner: 'wizard'}})
        );
      }
      return;
    }
    const node =
      action.target === 'document'
        ? document
        : (elements.get(String(action.target ?? '').replace(/^#/, '')) ??
          (action.do === 'key' ? (focused ?? document) : null));
    if (!node) throw new TypeError('That stage element does not exist.');
    if (elementData.get(node.id)?.hidden || elementData.get(node.id)?.disabled)
      return;
    if (action.do === 'type') {
      for (const key of String(action.text ?? '')) {
        dispatch(node, {type: 'keydown', key, bubbles: true});
        node.value += key;
        dispatch(node, {type: 'input', bubbles: true});
      }
    } else if (action.do === 'input') {
      node.value = action.value;
      dispatch(node, {type: 'input', bubbles: true});
    } else {
      if (action.do === 'focus') focused = node;
      if (action.do === 'blur') focused = null;
      dispatch(node, {
        type: action.do === 'key' ? 'keydown' : action.do,
        key: action.key,
        offsetX: action.offsetX ?? 0,
        offsetY: action.offsetY ?? 0,
        bubbles: !['focus', 'blur', 'mouseenter', 'mouseleave'].includes(
          action.do
        )
      });
    }
    drain(now);
  }
  function snapshot(globals = {}) {
    return {
      elements: Object.fromEntries(elementData),
      world: Object.fromEntries(
        config.stage.world
          .filter((name) => name !== 'battle')
          .map((name) => [name, models.get(world[name])])
      ),
      page: {scrollNudges},
      battle: battleState
        ? {
            state: battleState,
            turn: battleState === 'goblinTurn' ? 'goblin' : 'wizard',
            intent: intent[0],
            windowEnd,
            time: now,
            stats
          }
        : null,
      globals,
      registrations,
      log,
      errors
    };
  }
  return Object.freeze({
    document,
    console,
    CustomEvent,
    setTimeout,
    clearTimeout,
    ...Object.fromEntries(
      config.stage.world.map((name) => [name, world[name]])
    ),
    step,
    setup,
    finish() {
      record('setup', 'spells.js ran — ' + listenerCount + ' listeners added');
      drain(now);
    },
    read(globals) {
      return stringify(snapshot(globals));
    },
    nextTimer() {
      return timers.length
        ? Math.max(0, Math.min(...timers.map((timer) => timer.due)) - now)
        : null;
    }
  });
}
export const prelude = createStage.toString();
export function stagePrelude(config) {
  const names = [
    'document',
    'console',
    'CustomEvent',
    'setTimeout',
    'clearTimeout',
    ...config.stage.world
  ];
  return `delete globalThis.Date; delete Math.random;\nconst __ww = (${prelude})(${JSON.stringify({...config, rules: battleRules})});\nconst {${names.join(',')}} = __ww;`;
}
