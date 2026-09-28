import {loadState} from '../../state/store.js';
import {checkpoints, choices, defaults} from '../../curriculum/checkpoints.js';
export function readTomeOneLook(storage) {
  const {state} = loadState(storage);
  const fallback = {name: 'Aster', ...defaults};
  for (const cp of [...checkpoints].reverse()) {
    if (!state.completedCheckpointIds.includes(cp.id)) continue;
    const wizard = state.lastGoodSnapshotByCheckpoint[cp.id]?.snapshot.wizard;
    if (!wizard) continue;
    const look = {...fallback};
    if (
      typeof wizard.name === 'string' &&
      wizard.name.trim().length >= 1 &&
      wizard.name.trim().length <= 20
    )
      look.name = wizard.name.trim();
    for (const [key, values] of Object.entries(choices))
      if (key !== 'level' && values.includes(wizard[key]))
        look[key] = wizard[key];
    if (Number.isInteger(wizard.level))
      look.level = Math.min(20, Math.max(1, wizard.level));
    return look;
  }
  return fallback;
}
