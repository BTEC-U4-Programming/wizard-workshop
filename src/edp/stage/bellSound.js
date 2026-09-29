// A tiny retro "ding-dong" made from two square-wave beeps (Web Audio API).
// No sound file needed: the browser makes the noise from numbers.
let ctx = null;
let soundOn = true;
export const isSoundOn = () => soundOn;
export const setSoundOn = (value) => {
  soundOn = !!value;
};
export function playBell() {
  if (!soundOn) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    ctx ??= new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const start = ctx.currentTime;
    // [pitch in Hz, when it starts, how long it lasts]
    for (const [pitch, delay, length] of [
      [1319, 0, 0.12],
      [988, 0.13, 0.45]
    ]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = pitch;
      gain.gain.setValueAtTime(0.0001, start + delay);
      gain.gain.exponentialRampToValueAtTime(0.12, start + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + delay + length);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start + delay);
      osc.stop(start + delay + length + 0.02);
    }
  } catch {
    // Sound is a bonus. If the browser blocks it, the game still works.
  }
}
