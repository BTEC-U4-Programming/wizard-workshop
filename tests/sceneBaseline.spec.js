import {test, expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const cases = JSON.parse(
  readFileSync(new URL('./fixtures/scene-hashes.json', import.meta.url), 'utf8')
);
// Text is checked by what is written (words, position, font and colour),
// not by its pixels. Glyph pixels depend on which fonts the computer has
// installed (Consolas on Windows, a fallback monospace elsewhere), so a
// pixel hash of text only ever passes on the machine that recorded it.
// Everything else on the canvas (the sprites) is still checked pixel for
// pixel.
test('shared sprite extraction preserves every recorded Tome I scene pixel', async ({
  page,
  browserName
}) => {
  test.skip(
    process.env.WORKSHOP_PREVIEW === '1' || browserName !== 'chromium',
    'Baseline captures Chromium canvas rasterisation.'
  );
  await page.goto('/?tome=oop');
  const results = await page.evaluate(async (cases) => {
    const {renderScene} = await import('/src/game/renderScene.js');
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const proto = CanvasRenderingContext2D.prototype;
    const realFillText = proto.fillText;
    const results = [];
    try {
      for (const item of cases) {
        const text = [];
        proto.fillText = function (value, x, y) {
          text.push({
            text: String(value),
            x,
            y,
            font: this.font,
            fillStyle: this.fillStyle,
            textAlign: this.textAlign
          });
        };
        renderScene(canvas, item.snapshot, item.effect);
        proto.fillText = realFillText;
        const digest = await crypto.subtle.digest(
          'SHA-256',
          canvas.getContext('2d').getImageData(0, 0, 320, 240).data
        );
        results.push({
          hash: Array.from(new Uint8Array(digest), (b) =>
            b.toString(16).padStart(2, '0')
          ).join(''),
          text
        });
      }
    } finally {
      proto.fillText = realFillText;
    }
    return results;
  }, cases);
  expect(results.map((r) => r.hash)).toEqual(cases.map((item) => item.hash));
  expect(results.map((r) => r.text)).toEqual(
    cases.map((item) => item.text ?? [])
  );
});
