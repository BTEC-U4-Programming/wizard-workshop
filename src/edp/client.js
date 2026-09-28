import {Runner} from '../runner/client.js';
import {validEdpResult, validEdpSnapshot} from './validation/result.js';
import {byId} from './curriculum/checkpoints.js';
import {EDP_LIMITS} from './validation/parse.js';
export class EdpRunner extends Runner {
  constructor(onStatus) {
    super(onStatus, {validate: validEdpResult});
    this.requestType = 'edp-run';
    this.session = null;
    this.sessionPending = null;
  }
  handleMessage(data) {
    const pending = this.sessionPending;
    if (
      !pending ||
      data.sessionId !== this.session?.id ||
      data.seq !== pending.seq
    )
      return;
    clearTimeout(this.sessionWatchdog);
    this.sessionPending = null;
    if (data.type === 'edp-session-error') {
      pending.reject(new Error(data.message));
      this.endSession();
    } else if (
      data.type === 'edp-session-state' &&
      validEdpSnapshot(data.snapshot, byId[this.session.checkpointId].stage) &&
      (data.nextTimerInMs === null ||
        (Number.isFinite(data.nextTimerInMs) &&
          data.nextTimerInMs >= 0 &&
          data.nextTimerInMs <= 60000))
    ) {
      pending.resolve(data);
    } else {
      pending.reject(
        new Error(
          'The stage returned an unreadable snapshot. Run again to restart.'
        )
      );
      this.endSession();
    }
  }
  message(data) {
    if (!this.worker?.isReady || !this.session)
      return Promise.reject(new Error('Run again to restart the stage.'));
    return new Promise((resolve, reject) => {
      this.sessionPending = {resolve, reject, seq: data.seq};
      this.sessionWatchdog = setTimeout(
        () => this.stop('The stage took too long. Run again to restart it.'),
        EDP_LIMITS.watchdog
      );
      this.worker.postMessage(data);
    });
  }
  async startSession(request) {
    this.endSession();
    await this.ready();
    this.session = {
      id: request.sessionId,
      checkpointId: request.checkpointId,
      seq: 0
    };
    return this.message({type: 'edp-session-start', ...request, seq: 0});
  }
  sendEvent(step, elapsedMs = 0) {
    return this.message({
      type: 'edp-session-event',
      sessionId: this.session.id,
      seq: ++this.session.seq,
      step,
      elapsedMs
    });
  }
  tick(elapsedMs) {
    return this.message({
      type: 'edp-session-tick',
      sessionId: this.session.id,
      seq: ++this.session.seq,
      elapsedMs
    });
  }
  endSession() {
    clearTimeout(this.sessionWatchdog);
    if (this.session)
      this.worker?.postMessage({
        type: 'edp-session-end',
        sessionId: this.session.id
      });
    this.sessionPending?.reject(new Error('Stage ended.'));
    this.sessionPending = null;
    this.session = null;
  }
  stop(message) {
    this.endSession();
    super.stop(message);
  }
}
