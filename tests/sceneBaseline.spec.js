import {test, expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const cases = JSON.parse(
  readFileSync(new URL('./fixtures/scene-hashes.json', import.meta.url), 'utf8')
);
test('shared sprite extraction preserves every recorded Tome I scene pixel', async ({
  page,
  browserName
}) => {
  test.skip(
    process.env.WORKSHOP_PREVIEW === '1' || browserName !== 'chromium',
    'Baseline captures Chromium canvas/font rasterisation.'
  );
  await page.goto('/?tome=oop');
  const hashes = await page.evaluate(async (cases) => {
    const {renderScene} = await import('/src/game/renderScene.js');
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const hashes = [];
    for (const item of cases) {
      renderScene(canvas, item.snapshot, item.effect);
      const digest = await crypto.subtle.digest(
        'SHA-256',
        canvas.getContext('2d').getImageData(0, 0, 320, 240).data
      );
      hashes.push(
        Array.from(new Uint8Array(digest), (b) =>
          b.toString(16).padStart(2, '0')
        ).join('')
      );
    }
    return hashes;
  }, cases);
  expect(hashes).toEqual(cases.map((item) => item.hash));
});
