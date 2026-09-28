import {checkAnswer} from '../../review/checkAnswer.js';
import {activityAttempted} from '../state/journeyProgress.js';
const node = (tag, text) => {
  const n = document.createElement(tag);
  if (text !== undefined) n.textContent = text;
  return n;
};
export function renderActivity(container, cp, state, onChange) {
  container.replaceChildren();
  const activity = cp.activity;
  container.hidden = !activity;
  if (!activity) return;
  const saved = (state.activityAnswersByCheckpoint[cp.id] ??= {});
  container.append(
    node(
      'h2',
      activity.type === 'predict'
        ? 'Make a prediction'
        : activity.type === 'sort'
          ? 'Sort the cards'
          : activity.type === 'truth-table'
            ? 'Complete the truth table'
            : 'Trace the turns'
    )
  );
  const feedback = node('p');
  feedback.setAttribute('role', 'status');
  if (activity.type === 'predict') {
    const group = node('fieldset');
    group.append(node('legend', 'Which order will the messages appear?'));
    activity.options.forEach((text, index) => {
      const label = node('label');
      const radio = node('input');
      radio.type = 'radio';
      radio.name = cp.id + '-prediction';
      radio.value = String(index);
      radio.checked = saved.prediction === String(index);
      label.append(radio, document.createTextNode(text));
      group.append(label);
    });
    const lock = node('button', 'Lock in my prediction');
    lock.onclick = () => {
      const selected = group.querySelector('input:checked');
      if (!selected) {
        feedback.textContent = 'Choose a prediction first.';
        return;
      }
      saved.prediction = selected.value;
      feedback.textContent =
        'Prediction saved. Run to compare it with the result.';
      onChange();
    };
    container.append(group, lock);
  } else if (activity.type === 'sort') {
    saved.cards ??= {};
    for (const card of activity.cards) {
      const group = node('fieldset');
      group.append(node('legend', card.text));
      activity.bins.forEach((bin, index) => {
        const label = node('label');
        const radio = node('input');
        radio.type = 'radio';
        radio.name = cp.id + '-' + card.id;
        radio.value = String(index);
        radio.checked = saved.cards[card.id] === String(index);
        radio.onchange = () => {
          saved.cards[card.id] = radio.value;
          onChange();
        };
        label.append(radio, document.createTextNode(bin));
        group.append(label);
      });
      container.append(group);
    }
    const check = node('button', 'Check my sorting');
    check.onclick = () => {
      feedback.replaceChildren();
      for (const card of activity.cards)
        feedback.append(
          node(
            'p',
            (saved.cards[card.id] === card.answer
              ? 'Correct: '
              : 'Try again: ') +
              card.text +
              ' — ' +
              card.feedback
          )
        );
      onChange();
    };
    container.append(check);
  } else {
    saved.cells ??= {};
    const wrapper = node('div');
    wrapper.className = 'activity-table';
    const table = node('table');
    const head = node('thead');
    const row = node('tr');
    for (const text of activity.columns) row.append(node('th', text));
    head.append(row);
    table.append(head);
    const body = node('tbody');
    activity.rows.forEach((values, index) => {
      const row = node('tr');
      activity.columns.forEach((heading, column) => {
        const cell = node('td'),
          field = activity.cells.find(
            (c) => c.row === index && c.column === column
          );
        if (!field) cell.textContent = values[column] ?? '';
        else {
          const input = node(field.options ? 'select' : 'input');
          input.setAttribute('aria-label', `Row ${index + 1}: ${heading}`);
          if (field.options) {
            const empty = node('option', 'Choose');
            empty.value = '';
            input.append(empty);
            for (const value of field.options) {
              const option = node('option', value);
              option.value = value;
              input.append(option);
            }
          } else {
            input.type = 'text';
            input.maxLength = 60;
          }
          input.value = saved.cells[field.id] ?? '';
          input.onchange = input.oninput = () => {
            saved.cells[field.id] = input.value;
            onChange();
          };
          cell.append(input);
        }
        row.append(cell);
      });
      body.append(row);
    });
    table.append(body);
    wrapper.append(table);
    container.append(wrapper);
    const check = node('button', 'Check table');
    check.onclick = () => {
      const messages = activity.cells.map((cell) => {
        const correct = checkAnswer(
          {
            type: 'blank',
            accept: cell.accept,
            caseSensitive: cell.caseSensitive
          },
          saved.cells[cell.id]
        ).correct;
        return `${correct ? 'Correct' : 'Try again'} — row ${cell.row + 1}, ${activity.columns[cell.column]}: ${correct ? (cell.feedback ?? 'This matches the code’s decisions.') : 'Trace the branch that runs. Try ' + cell.accept[0] + '.'}`;
      });
      feedback.replaceChildren(...messages.map((text) => node('p', text)));
      onChange();
    };
    container.append(check);
  }
  container.append(
    feedback,
    node(
      'p',
      'Hints and retries carry no penalty. An attempt is enough to continue.'
    )
  );
  return {
    afterRun() {
      if (activity.type === 'predict' && activityAttempted(cp, state))
        feedback.textContent =
          (saved.prediction === activity.answer
            ? 'Your prediction matched. '
            : 'Surprise! ') + activity.explanation;
    }
  };
}
