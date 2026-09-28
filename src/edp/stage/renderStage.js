import {drawScene} from './drawScenes.js';
export function renderStage(
  frame,
  stageDef,
  snapshot,
  {live = false, onStep, reducedMotion = () => false} = {}
) {
  frame.replaceChildren();
  let listening = live,
    effectTimer,
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
    if (def.hotspot) {
      node.className = 'stage-hotspot';
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
        badges.get(id).hidden = !missing || data.hidden;
        node.title = missing
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
      listening = false;
      frame.replaceWith(frame.cloneNode(false));
    }
  };
}
