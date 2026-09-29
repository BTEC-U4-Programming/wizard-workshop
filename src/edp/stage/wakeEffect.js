// Big, obvious "the wizard woke up!" animation drawn on top of the scene.
// It runs after the wizard's handler has changed wizard.awake to true.
// With `celebrate` (waking up) the scene flashes and rings spread out.
// Without it, only the speech bubble appears (for example "Goodnight!").
export function playWakeEffect(
  canvas,
  redraw,
  {speech = '', reduced = false, celebrate = true, bubbleX = 113, bubbleY = 26}
) {
  const DURATION = celebrate ? 1400 : 1800;
  const c = canvas.getContext('2d');
  const start = performance.now();
  let frame;
  const bubble = (progress) => {
    const text = speech;
    c.save();
    c.font = 'bold 13px Consolas, monospace';
    const width = Math.min(300, c.measureText(text).width + 20);
    const x = Math.max(6, Math.min(314 - width, bubbleX - width / 2));
    c.fillStyle = '#f5e7c4';
    c.fillRect(x, bubbleY, width, 28);
    c.fillRect(Math.max(12, Math.min(308, bubbleX)) - 8, bubbleY + 28, 12, 8);
    c.fillStyle = '#121b30';
    c.textAlign = 'center';
    c.globalAlpha = Math.min(1, progress * 8, (1 - progress) * 8);
    c.fillText(text, x + width / 2, bubbleY + 19, width - 12);
    c.restore();
  };
  const draw = (now) => {
    const t = Math.min(1, (now - start) / DURATION);
    redraw();
    c.save();
    // 1. Screen flash
    if (celebrate && !reduced && t < 0.25) {
      c.fillStyle = `rgba(255, 226, 160, ${0.55 * (1 - t / 0.25)})`;
      c.fillRect(0, 0, 320, 240);
    }
    // 2. Expanding gold sound-wave rings from the wizard
    if (celebrate && !reduced)
      for (let i = 0; i < 3; i++) {
        const p = (t * 1.6 - i * 0.2) % 1;
        if (t * 1.6 - i * 0.2 < 0 || t * 1.6 - i * 0.2 > 1) continue;
        c.strokeStyle = `rgba(230, 188, 96, ${1 - p})`;
        c.lineWidth = 4;
        c.beginPath();
        c.arc(113, 140, 20 + p * 110, 0, Math.PI * 2);
        c.stroke();
      }
    // 3. A bouncing "!" above the wizard
    const bounce = reduced ? 0 : Math.abs(Math.sin(t * Math.PI * 4)) * 14;
    if (celebrate) {
      c.font = 'bold 40px Consolas, monospace';
      c.textAlign = 'center';
      c.fillStyle = '#e6bc60';
      c.strokeStyle = '#121b30';
      c.lineWidth = 4;
      c.strokeText('!', 150, 100 - bounce);
      c.fillText('!', 150, 100 - bounce);
    }
    c.restore();
    // 4. Speech bubble with what the wizard said
    if (speech) bubble(t);
    if (t < 1) frame = requestAnimationFrame(draw);
    else redraw();
  };
  frame = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(frame);
}
