import {story} from '../curriculum/story.js';
const node = (tag, text) => {
  const n = document.createElement(tag);
  if (text !== undefined) n.textContent = text;
  return n;
};
export function logText(entry) {
  return `${(entry.t / 1000).toFixed(1)}s ${entry.type}${entry.key ? ` key "${entry.key}"` : ''} ${entry.target ?? ''}${
    entry.handler
      ? ' → ' + entry.handler
      : entry.type === 'console' ||
          entry.type === 'error' ||
          entry.type === 'setup' ||
          entry.type === 'error'
        ? ''
        : entry.handler === null
          ? ' → nobody is listening'
          : ''
  }${entry.message ? ' · ' + entry.message : ''}${entry.ok === false ? ' ⚠ handler error' : ''}`;
}
const category = (entry) =>
  entry.type === 'click'
    ? 'Clicks'
    : [
          'mouseover',
          'mouseout',
          'focus',
          'blur',
          'mouseenter',
          'mouseleave'
        ].includes(entry.type)
      ? 'Mouse'
      : entry.type === 'keydown' || entry.type === 'input'
        ? 'Keys'
        : entry.type === 'timer'
          ? 'Timers'
          : entry.type === 'console'
            ? 'console.log'
            : entry.type === 'error' ||
                entry.type === 'setup' ||
                entry.type === 'say' ||
                entry.type === 'world' ||
                entry.type === 'spell' ||
                entry.type === 'battle'
              ? 'Other'
              : 'Custom';
export function createCrystalBall(container, {reducedMotion, slowMotion}) {
  container.innerHTML =
    '<summary>CRYSTAL BALL</summary><div class="crystal-tools"></div><div class="crystal-queue" hidden><h3>Queue</h3><ol></ol></div><ol class="crystal-log"></ol><p class="crystal-empty"></p><p class="sr-only" role="status" aria-live="polite"></p>';
  const tools = container.querySelector('.crystal-tools'),
    list = container.querySelector('.crystal-log'),
    queueList = container.querySelector('.crystal-queue ol'),
    queueFrame = queueList.parentElement,
    summary = container.querySelector('[role=status]'),
    empty = container.querySelector('.crystal-empty');
  empty.textContent = story.emptyLog;
  let lastId = 0,
    paused = false,
    entries = [],
    queue = [],
    timer,
    announcement,
    lastAnnounced = 0,
    pendingCount = 0;
  const enabled = new Set([
    'Clicks',
    'Mouse',
    'Keys',
    'Timers',
    'Custom',
    'console.log',
    'Other'
  ]);
  const pause = node('button', 'Pause'),
    clear = node('button', 'Clear');
  tools.append(pause, clear);
  for (const name of enabled) {
    const label = node('label');
    const input = node('input');
    input.type = 'checkbox';
    input.checked = true;
    input.onchange = () => {
      if (input.checked) enabled.add(name);
      else enabled.delete(name);
      render();
    };
    label.append(input, document.createTextNode(name));
    tools.append(label);
  }
  function render() {
    if (paused) return;
    const visible = entries.filter((entry) => enabled.has(category(entry)));
    list.replaceChildren(
      ...visible.map((entry) => {
        const li = node('li', logText(entry));
        if (entry.offsetX !== null && entry.offsetX !== undefined) {
          const details = node('details');
          details.append(
            node('summary', 'Event parcel'),
            node(
              'p',
              `type: ${entry.type}; target: ${entry.target}; offsetX: ${entry.offsetX}; offsetY: ${entry.offsetY}`
            )
          );
          li.append(details);
        }
        return li;
      })
    );
    empty.hidden = entries.length > 0;
  }
  function drain() {
    clearTimeout(timer);
    timer = null;
    if (!queue.length) {
      queueFrame.hidden = true;
      return;
    }
    if (paused) return;
    entries.push(queue.shift());
    entries = entries.slice(-100);
    render();
    queueList.replaceChildren(
      ...queue.map((entry, index) =>
        node('li', `${index + 1}. ${logText(entry)}`)
      )
    );
    queueFrame.hidden = !queue.length;
    if (queue.length) timer = setTimeout(drain, 600);
  }
  function append(log) {
    const fresh = log.filter((entry) => entry.id > lastId);
    if (!fresh.length) return;
    lastId = Math.max(...fresh.map((e) => e.id));
    pendingCount += fresh.length;
    clearTimeout(announcement);
    announcement = setTimeout(
      () => {
        summary.textContent = `${pendingCount} new events`;
        pendingCount = 0;
        lastAnnounced = Date.now();
      },
      Math.max(0, 2000 - (Date.now() - lastAnnounced))
    );
    if (slowMotion() && !reducedMotion()) {
      queue.push(...fresh);
      queue = queue.slice(-100);
      queueFrame.hidden = false;
      queueList.replaceChildren(
        ...queue.map((entry, index) =>
          node('li', `${index + 1}. ${logText(entry)}`)
        )
      );
      if (!timer)
        timer = setTimeout(() => {
          timer = null;
          drain();
        }, 600);
    } else {
      entries.push(...queue, ...fresh);
      queue = [];
      clearTimeout(timer);
      timer = null;
      queueFrame.hidden = true;
      entries = entries.slice(-100);
      render();
    }
  }
  pause.onclick = () => {
    paused = !paused;
    pause.textContent = paused ? 'Resume' : 'Pause';
    if (!paused) {
      render();
      drain();
    }
  };
  clear.onclick = () => {
    entries = [];
    queue = [];
    clearTimeout(timer);
    timer = null;
    queueFrame.hidden = true;
    list.replaceChildren();
    empty.hidden = false;
  };
  return {
    append,
    reset() {
      lastId = 0;
      clear.click();
    },
    dispose() {
      clearTimeout(timer);
      clearTimeout(announcement);
    },
    refresh: render
  };
}
