import {drawScene} from './drawScenes.js';
import {playBell, isSoundOn, setSoundOn} from './bellSound.js';
import {playWakeEffect} from './wakeEffect.js';
import {woodLayout} from './woodLayout.js';
export function renderStage(
  frame,
  stageDef,
  snapshot,
  {live = false, onStep, reducedMotion = () => false} = {}
) {
  frame.replaceChildren();
  let listening = live,
    effectTimer,
    stopWake,
    wasAwake = snapshot?.world.wizard?.awake ?? false,
    lastLogId = 0;
  const art = document.createElement('div');
  art.className = 'stage-art';
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 240;
  canvas.setAttribute('aria-hidden', 'true');
  art.append(canvas);
  frame.append(art);
  const controls = document.createElement('div');
  controls.className = 'stage-controls';
  frame.append(controls);
  if (stageDef.elements.some((item) => item.id === 'wake-button')) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'sound-toggle';
    const label = () => {
      toggle.textContent = isSoundOn() ? '🔊 Sound on' : '🔇 Sound off';
      toggle.setAttribute('aria-pressed', String(isSoundOn()));
    };
    toggle.onclick = (event) => {
      event.stopPropagation();
      setSoundOn(!isSoundOn());
      label();
    };
    label();
    controls.append(toggle);
  }
  const badges = new Map(),
    captions = new Map();
  const nodes = new Map(),
    guestId = new WeakMap();
  for (const def of stageDef.elements) {
    const node = document.createElement(def.tag.toLowerCase());
    node.id = 'stage-' + def.id;
    node.textContent = def.text ?? '';
    node.hidden = !!def.hidden;
    if (stageDef.elements.some((item) => item.parent === def.id)) {
      const caption = document.createTextNode(def.text ?? '');
      node.replaceChildren(caption);
      captions.set(def.id, caption);
    }
    nodes.set(def.id, node);
    guestId.set(node, def.id);
    if (def.tag === 'INPUT') {
      node.maxLength = 40;
      node.autocomplete = 'off';
      node.spellcheck = false;
      const label = document.createElement('label');
      label.textContent = def.label;
      label.htmlFor = node.id;
      controls.append(label);
    }
    if (def.tag === 'DIV') {
      node.tabIndex = 0;
      node.className = 'stage-container';
      node.setAttribute('aria-label', def.text || 'Stage controls');
    }
    if (def.speech) {
      // A speech bubble drawn over the scene (E5.3: Grub's plan). It is
      // not focusable and ignores the pointer, so it never steals the
      // hover or focus from the sprite it belongs to.
      node.className = 'stage-speech';
      node.removeAttribute('tabindex');
      node.removeAttribute('aria-label');
      node.setAttribute('role', 'status');
      node.setAttribute('aria-live', 'polite');
      node.style.left = (def.speech.x / 320) * 100 + '%';
      node.style.bottom = ((240 - def.speech.y) / 240) * 100 + '%';
      art.append(node);
    } else if (def.hotspot) {
      node.className = 'stage-hotspot';
      // Sprites never show a CSS hover box (see .stage-hotspot:hover).
      // `quietHover` sprites also hide their "not listening" badge until
      // the student's code registers a listener on them.
      if (def.quietHover) node.classList.add('stage-hotspot-quiet');
      node.style.left = (def.hotspot.x / 320) * 100 + '%';
      node.style.top = (def.hotspot.y / 240) * 100 + '%';
      node.style.width = (def.hotspot.w / 320) * 100 + '%';
      node.style.height = (def.hotspot.h / 240) * 100 + '%';
      node.setAttribute('aria-label', def.text);
      art.append(node);
    } else if (def.coords) {
      node.className = 'stage-coordinates';
      art.append(node);
    } else if (def.id === 'stage') controls.append(node);
    else (nodes.get(def.parent) ?? controls).append(node);
  }
  for (const def of stageDef.elements.filter((item) => item.tag === 'BUTTON')) {
    const badge = document.createElement('span');
    badge.className = 'listener-badge';
    badge.textContent = '💤 not listening';
    badge.hidden = true;
    if (def.hotspot) {
      badge.classList.add('listener-badge-hotspot');
      badge.style.left = (def.hotspot.x / 320) * 100 + '%';
      badge.style.top = ((def.hotspot.y + def.hotspot.h) / 240) * 100 + '%';
    }
    nodes.get(def.id).after(badge);
    badges.set(def.id, badge);
  }
  function hasListener(id, registrations) {
    const direct = registrations.some(
      (r) => r.accepted && r.operation !== 'remove' && r.target === '#' + id
    );
    if (direct) return true;
    let parent = stageDef.elements.find((item) => item.id === id)?.parent;
    while (parent && parent !== 'document') {
      if (
        registrations.some(
          (r) =>
            r.accepted &&
            r.operation !== 'remove' &&
            r.target === '#' + parent &&
            r.type === 'click'
        )
      )
        return true;
      parent = stageDef.elements.find((item) => item.id === parent)?.parent;
    }
    return registrations.some(
      (r) =>
        r.accepted &&
        r.operation !== 'remove' &&
        r.target === 'document' &&
        r.type === 'click'
    );
  }
  // True once the student's code has registered a listener directly on
  // this element (any event type).
  const hasOwnListener = (id, value) =>
    !!value?.registrations?.some(
      (r) => r.accepted && r.operation !== 'remove' && r.target === '#' + id
    );
  const targetOf = (target) => {
    let current = target;
    while (current && current !== frame) {
      if (guestId.has(current)) return guestId.get(current);
      current = current.parentElement;
    }
    return 'stage';
  };
  const targetLabel = (target) =>
    target === 'document' ? 'document' : '#' + target;
  function send(step) {
    if (listening) onStep?.(step);
  }
  for (const type of ['click', 'mouseover', 'mouseout', 'focusin', 'focusout'])
    frame.addEventListener(type, (event) => {
      const target = targetOf(event.target),
        def = stageDef.elements.find((e) => e.id === target);
      if (!def) return;
      if (
        (type === 'mouseover' || type === 'mouseout') &&
        event.relatedTarget &&
        nodes.get(target).contains(event.relatedTarget)
      )
        return;
      const action = {
        do: type === 'focusin' ? 'focus' : type === 'focusout' ? 'blur' : type,
        target: targetLabel(target)
      };
      if (type === 'click' && def.coords) {
        const box = art.getBoundingClientRect();
        action.offsetX = Math.round(
          ((event.clientX - box.left) * 320) / box.width
        );
        action.offsetY = Math.round(
          ((event.clientY - box.top) * 240) / box.height
        );
      }
      if (type === 'click' && target === 'wake-button' && listening) {
        // The bell always rings when clicked; whether the wizard wakes
        // depends on the listener the student wrote.
        playBell();
        const bellNode = nodes.get('wake-button');
        bellNode.classList.remove('bell-ringing');
        void bellNode.offsetWidth;
        bellNode.classList.add('bell-ringing');
      }
      send(action);
    });
  frame.addEventListener('keydown', (event) => {
    if (event.key === 'Tab' || !listening) return;
    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(
        event.key
      ) &&
      event.target.tagName !== 'INPUT'
    )
      event.preventDefault();
    send({
      do: 'key',
      key: event.key,
      target: targetLabel(targetOf(event.target))
    });
  });
  frame.addEventListener('input', (event) => {
    if (event.target.tagName === 'INPUT')
      send({
        do: 'input',
        target: targetLabel(targetOf(event.target)),
        value: event.target.value
      });
  });
  // The controller owns the frame for one checkpoint. Abort listeners when
  // navigation replaces it, preventing duplicate event forwarding.
  function update(value, {live = listening} = {}) {
    listening = live;
    frame.dataset.live = String(live);
    for (const [id, node] of nodes) {
      const data = value?.elements[id];
      if (!data) continue;
      const def = stageDef.elements.find((e) => e.id === id);
      if (def.tag === 'INPUT') {
        if (document.activeElement !== node && node.value !== data.value)
          node.value = data.value;
      } else if (
        def.tag === 'BUTTON' ||
        !stageDef.elements.some((e) => e.parent === id)
      ) {
        node.textContent = data.text;
      }
      if (captions.has(id)) captions.get(id).data = data.text;
      node.hidden = data.hidden;
      if (def.tag === 'BUTTON') node.disabled = data.disabled;
      for (const cls of [...node.classList])
        if (cls.startsWith('stg-')) node.classList.remove(cls);
      node.classList.add(...data.classes.map((cls) => 'stg-' + cls));
      if (def.tag === 'BUTTON') {
        const missing = live && !hasListener(id, value.registrations);
        // Quiet sprites stay completely silent (no highlight, no tooltip,
        // no badge) until the student's code registers a listener on them.
        const quiet = !!def.quietHover && !hasOwnListener(id, value);
        node.classList.toggle('stage-hotspot-quiet', quiet);
        badges.get(id).hidden = !missing || data.hidden || quiet;
        // Sprites get no hover tooltip either: only the student's code
        // decides what happens when the pointer is over them.
        node.title =
          missing && !quiet && !def.hotspot
            ? 'No listener is connected yet. Use the Crystal Ball to investigate.'
            : '';
      }
    }
    clearTimeout(effectTimer);
    const fresh = (value?.log ?? []).filter((entry) => entry.id > lastLogId);
    lastLogId = Math.max(lastLogId, ...fresh.map((entry) => entry.id));
    const action = [...fresh]
      .reverse()
      .find((entry) => ['spell', 'battle'].includes(entry.type));
    const effect =
      live && !reducedMotion() && action
        ? {
            method: action.type === 'battle' ? 'attack' : 'castSpell',
            actor: action.type === 'battle' ? 'goblin' : 'wizard',
            power: action.message === 'Fireball' ? 'fire' : action.message
          }
        : null;
    const nowAwake = value?.world.wizard?.awake ?? false;
    const said = [...fresh]
      .reverse()
      .find((entry) => entry.type === 'say' && entry.message);
    if (live) {
      const bedroom = stageDef.scene === 'bedroom';
      const wood = stageDef.scene === 'wood';
      const woke = bedroom && nowAwake && !wasAwake;
      const speech = said?.message ?? (woke ? value.world.wizard.lastSpeech : '');
      // In the bedroom, waking up gets the big effect. Any other line of
      // speech (such as "Goodnight!" or "Not enough mana!") gets a speech
      // bubble above the wizard, in every scene.
      if (woke || speech) {
        const walking = ['courtyard', 'door'].includes(stageDef.scene);
        const wizard = value.world.wizard;
        stopWake?.();
        stopWake = playWakeEffect(
          canvas,
          () => drawScene(canvas, stageDef.scene, value),
          {
            speech,
            reduced: reducedMotion(),
            celebrate: woke,
            bubbleX:
              walking && wizard
                ? wizard.x + 13
                : wood
                  ? woodLayout.bubble.x
                  : 113,
            bubbleY: bedroom
              ? nowAwake
                ? 26
                : 58
              : walking && wizard
                ? Math.max(4, wizard.y - 76)
                : wood
                  ? woodLayout.bubble.y
                  : 60
          }
        );
      }
    }
    wasAwake = nowAwake;
    drawScene(canvas, stageDef.scene, value, effect);
    if (effect)
      effectTimer = setTimeout(
        () => drawScene(canvas, stageDef.scene, value),
        350
      );
  }
  update(snapshot);
  return {
    update,
    nodes,
    canvas,
    setLive(value) {
      listening = value;
    },
    dispose() {
      clearTimeout(effectTimer);
      stopWake?.();
      listening = false;
      frame.replaceWith(frame.cloneNode(false));
    }
  };
}
