import {stagePrelude} from './runtime/prelude.js';
import {stages} from './curriculum/stages.js';
import {byId} from './curriculum/checkpoints.js';
import {parseEdpSource, EDP_LIMITS} from './validation/parse.js';
import {validEdpResult, validEdpSnapshot} from './validation/result.js';
import {diagnostic} from '../validation/parse.js';
import {timeoutMessage} from '../runner/engine.js';

export class EdpContext {
  constructor(
    QuickJS,
    {
      stage,
      source = '',
      seed = 7,
      setup = {},
      look,
      apprentice = false,
      reads = []
    },
    deadline = Date.now() + EDP_LIMITS.execution
  ) {
    this.source = source;
    this.reads = reads;
    this.deadline = deadline;
    this.runtime = QuickJS.newRuntime();
    this.runtime.setMemoryLimit(16 * 1024 * 1024);
    this.runtime.setMaxStackSize(256 * 1024);
    this.runtime.setInterruptHandler(() => Date.now() > this.deadline);
    this.context = this.runtime.newContext();
    try {
      this.evaluate(
        stagePrelude({
          stage: typeof stage === 'string' ? stages[stage] : stage,
          seed,
          setup,
          look,
          apprentice
        })
      );
      this.evaluate(source, 'spells.js');
      this.evaluate('__ww.finish()');
    } catch (error) {
      this.dispose();
      throw error;
    }
  }
  evaluate(code, file = 'workshop-checks.js') {
    if (Date.now() > this.deadline)
      throw this.error({message: 'interrupted'}, file);
    const result = this.context.evalCode(code, file);
    if (result.error) {
      const error = this.context.dump(result.error);
      result.error.dispose();
      throw this.error(error, file);
    }
    const value = this.context.dump(result.value);
    result.value.dispose();
    if (Date.now() > this.deadline)
      throw this.error({message: 'interrupted'}, file);
    return value;
  }
  error(error, file) {
    const stopped = /interrupted/.test(error.message ?? '');
    const d = diagnostic(
      stopped
        ? timeoutMessage
        : `This run stopped. ${String(error.message ?? error).slice(0, 200)}. Check the highlighted line.`,
      null,
      file,
      stopped ? 'timeout' : 'runtime'
    );
    d.detail = String(error.stack ?? '').slice(0, 1000);
    const match = d.detail.match(/spells\.js:(\d+)(?::(\d+))?/);
    if (match) {
      d.file = 'spells.js';
      d.from =
        this.source
          .split('\n')
          .slice(0, Number(match[1]) - 1)
          .reduce((n, line) => n + line.length + 1, 0) +
        Math.max(0, Number(match[2] ?? 1) - 1);
      d.to = d.from + 1;
    }
    const wrapped = new Error(d.message);
    wrapped.diagnostic = d;
    return wrapped;
  }
  snapshot() {
    const names = this.reads.filter(
      (name) => /^[A-Za-z_$][\w$]*$/.test(name) && !name.startsWith('__ww')
    );
    const globals =
      '{' +
      names
        .map(
          (name) =>
            `${JSON.stringify(name)}:typeof ${name} === 'undefined' ? null : ${name}`
        )
        .join(',') +
      '}';
    const json = this.evaluate(`__ww.read(${globals})`);
    if (
      typeof json !== 'string' ||
      new TextEncoder().encode(json).length > EDP_LIMITS.result
    )
      throw new Error('The stage result exceeds 128KB. Shorten your logs.');
    return JSON.parse(json);
  }
  step(action) {
    this.evaluate(`__ww.step(${JSON.stringify(action)})`);
  }
  nextTimer() {
    return this.evaluate('__ww.nextTimer()');
  }
  dispose() {
    this.context?.dispose();
    this.runtime?.dispose();
    this.context = null;
    this.runtime = null;
  }
}
function failure(error, cp) {
  const d =
    error.diagnostic ??
    diagnostic(
      String(error.message ?? error).slice(0, 300),
      null,
      'spells.js',
      'runtime'
    );
  if (d.code === 'timeout' && cp?.id === 'E5.2')
    d.message =
      'The count handler took too long, so it was stopped. While one handler runs, nothing else can — not even the bell. Make the loop much shorter.';
  return {status: d.code === 'timeout' ? 'stopped' : 'error', diagnostics: [d]};
}
function mistake(snapshot, parsed) {
  const rejected = snapshot.registrations.find(
    (r) => r.reason === 'not-function'
  );
  if (rejected)
    return "The second thing you gave addEventListener wasn't a function, so nothing is listening. Did you write the handler with brackets? Brackets run it straight away. Hand over its name on its own.";
  const warning = parsed.warnings.find((d) =>
    ['event-name', 'nested-listener', 'remove-inline'].includes(d.code)
  );
  if (warning) return warning.message;
  if (
    snapshot.errors.some((e) =>
      /health|extensible|read only/.test(e.message)
    ) &&
    snapshot.registrations.some((r) => r.handler === 'recoverHealth')
  )
    return 'Inside recoverHealth, this was the button, not your wizard. Wrap the call in an arrow function: () => wizard.recoverHealth().';
  return snapshot.errors[0]?.message ?? null;
}
export function runEdpProgram(QuickJS, request) {
  const cp = byId[request.checkpointId];
  if (!cp)
    return failure(new Error('Unknown Tome II checkpoint. Reload the course.'));
  const source = request.source ?? request.sources?.spellsSource;
  const parsed = parseEdpSource(source, cp);
  if (parsed.diagnostics.length)
    return {status: 'error', diagnostics: parsed.diagnostics};
  const deadline = Date.now() + EDP_LIMITS.execution;
  let candidate;
  try {
    candidate = new EdpContext(
      QuickJS,
      {
        stage: cp.stage,
        source,
        seed: request.seed ?? 7,
        setup: cp.setup,
        look: request.look,
        apprentice: request.apprentice,
        reads: cp.reads
      },
      deadline
    );
    const snapshot = candidate.snapshot();
    candidate.dispose();
    candidate = null;
    const trials = [];
    for (const trial of cp.trials) {
      let vm;
      try {
        vm = new EdpContext(
          QuickJS,
          {
            stage: cp.stage,
            source,
            seed: trial.seed ?? 7,
            setup: {...cp.setup, ...trial.setup},
            reads: trial.reads ?? cp.reads
          },
          deadline
        );
        for (const step of trial.steps) vm.step(step);
        const data = vm.snapshot();
        if (!validEdpSnapshot(data, cp.stage))
          throw new Error(
            'The stage produced values outside its rules. Check your property changes.'
          );
        const message = mistake(data, parsed) ?? trial.expect(data);
        trials.push({
          id: trial.id,
          name: trial.name,
          category: trial.category ?? null,
          passed: !message,
          message: String(message ?? 'Passed').slice(0, 300),
          log: data.log
        });
      } finally {
        vm?.dispose();
      }
    }
    const result = {
      status: trials.every((t) => t.passed) ? 'success' : 'validButIncomplete',
      diagnostics: [],
      snapshot,
      trials
    };
    if (!validEdpResult(result, cp.id))
      throw new Error(
        'The stage result is unreadable. Check your property changes.'
      );
    return result;
  } catch (error) {
    const selector = parsed.warnings.find((d) => d.code === 'selector');
    if (selector && !/interrupted/.test(error.message))
      return {status: 'error', diagnostics: [{...selector, severity: 'error'}]};
    return failure(error, cp);
  } finally {
    candidate?.dispose();
  }
}
export function runEdpExample(QuickJS, example) {
  const vm = new EdpContext(QuickJS, {
    stage: example.stage,
    source: example.code
  });
  try {
    for (const step of example.steps) vm.step(step);
    return vm.evaluate(example.check) === true;
  } finally {
    vm.dispose();
  }
}
export class EdpSession {
  constructor(QuickJS, request) {
    const cp = byId[request.checkpointId];
    if (!cp) throw new Error('Unknown checkpoint.');
    const parsed = parseEdpSource(request.source, cp);
    if (parsed.diagnostics.length)
      throw new Error(parsed.diagnostics[0].message);
    this.id = request.sessionId;
    this.checkpointId = cp.id;
    this.seq = 0;
    this.vm = new EdpContext(QuickJS, {
      ...request,
      stage: cp.stage,
      setup: {
        ...cp.setup,
        wizard: {
          ...cp.setup.wizard,
          level:
            cp.stage === 'grubbledown-bridge'
              ? Math.min(3, Math.max(1, request.look?.level ?? 1))
              : Math.min(
                  20,
                  Math.max(1, request.look?.level ?? cp.setup.wizard.level)
                )
        }
      },
      reads: cp.reads
    });
  }
  update(data) {
    this.seq = data.seq ?? this.seq;
    this.vm.deadline = Date.now() + EDP_LIMITS.event;
    if (data.type === 'edp-session-event') {
      this.vm.step({
        do: 'wait',
        ms: Math.max(0, Math.min(2000, data.elapsedMs ?? 0))
      });
      this.vm.step(data.step);
    } else if (data.type === 'edp-session-tick')
      this.vm.step({
        do: 'wait',
        ms: Math.max(0, Math.min(2000, data.elapsedMs))
      });
    return this.state();
  }
  state() {
    const snapshot = this.vm.snapshot();
    if (!validEdpSnapshot(snapshot, byId[this.checkpointId].stage))
      throw new Error(
        'The stage produced values outside its rules. Run again to restart.'
      );
    return {
      type: 'edp-session-state',
      sessionId: this.id,
      seq: this.seq,
      checkpointId: this.checkpointId,
      snapshot,
      nextTimerInMs: this.vm.nextTimer()
    };
  }
  dispose() {
    this.vm.dispose();
  }
}
