import {getQuickJS} from 'quickjs-emscripten';
import {writeFile, mkdir} from 'node:fs/promises';
import {performance} from 'node:perf_hooks';
import {checkpoints} from '../src/edp/curriculum/checkpoints.js';
import {runEdpProgram} from '../src/edp/engine.js';
const QuickJS = await getQuickJS();
const checkpointsReport = [];
for (const cp of checkpoints) {
  const timings = [];
  for (let i = 0; i < 25; i++) {
    const start = performance.now();
    const result = runEdpProgram(QuickJS, {
      checkpointId: cp.id,
      source: cp.solution.spellsSource
    });
    if (result.status !== 'success')
      throw new Error(`${cp.id}: ${JSON.stringify(result)}`);
    timings.push(performance.now() - start);
  }
  timings.sort((a, b) => a - b);
  checkpointsReport.push({
    id: cp.id,
    medianMs: Number(timings[12].toFixed(2)),
    maxMs: Number(timings.at(-1).toFixed(2))
  });
}
await mkdir('verification', {recursive: true});
await writeFile(
  'verification/benchmark-edp.json',
  JSON.stringify(
    {
      node: process.version,
      runsPerCheckpoint: 25,
      executionBudgetMs: 500,
      checkpoints: checkpointsReport
    },
    null,
    2
  ) + '\n'
);
console.log(
  `Benchmarked ${checkpointsReport.length} checkpoints; largest median ${Math.max(...checkpointsReport.map((cp) => cp.medianMs))}ms.`
);
