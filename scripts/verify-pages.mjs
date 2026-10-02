import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {emptyState, STORAGE_KEY} from '../src/state/store.js';
import {byId as oop} from '../src/curriculum/checkpoints.js';
import {emptyEdpState, EDP_STORAGE_KEY} from '../src/edp/state/store.js';
import {byId as edp} from '../src/edp/curriculum/checkpoints.js';
const browser = await chromium.launch({headless: true});
const page = await browser.newPage({viewport: {width: 1366, height: 768}});
const requests = new Set();
page.on('request', (request) => requests.add(request.url()));
const base = 'http://127.0.0.1:4174/wizard-workshop/';
try {
  await page.goto(base);
  await page
    .getByRole('heading', {name: 'Choose your tome, apprentice.'})
    .waitFor();
  const first = emptyState();
  first.currentScreen = {type: 'checkpoint', id: 'C1.1a'};
  first.draftsByCheckpoint['C1.1a'] = {...oop['C1.1a'].solution, revision: 0};
  const second = emptyEdpState();
  second.currentScreen = {type: 'checkpoint', id: 'E1.1'};
  second.draftsByCheckpoint['E1.1'] = {...edp['E1.1'].solution, revision: 0};
  await page.evaluate(
    ({first, second, keys}) => {
      localStorage.setItem(keys[0], JSON.stringify(first));
      localStorage.setItem(keys[1], JSON.stringify(second));
    },
    {first, second, keys: [STORAGE_KEY, EDP_STORAGE_KEY]}
  );
  for (const tome of ['oop', 'edp']) {
    await page.goto(base + '?tome=' + tome);
    await page.locator('#run').click();
    await page.locator('#result[data-status="success"]').waitFor();
    if (tome === 'edp') {
      await page.locator('.stage-frame[data-live="true"]').waitFor();
      await page.locator('#stage-wake-button').click();
      await page.getByText(/Health 100\/100.*awake/).waitFor();
      for (let chapter = 1; chapter <= 5; chapter++) {
        await page.locator('#checkpoint').selectOption('intro:' + chapter);
        for (const width of [1366, 390]) {
          await page.setViewportSize({
            width,
            height: width === 390 ? 844 : 768
          });
          await page.screenshot({
            path: `verification/edp-intro-${chapter}-${width}.png`,
            fullPage: true
          });
        }
      }
      await page.setViewportSize({width: 1366, height: 768});
      await page.locator('#checkpoint').selectOption('E5.7');
      await page.locator('.cm-content').fill(edp['E5.7'].solution.spellsSource);
      await page.locator('#run').click();
      await page.locator('#result[data-status="success"]').waitFor();
      await page.locator('.stage-frame[data-live="true"]').waitFor();
      await page.screenshot({
        path: 'verification/edp-battle-desktop.png',
        fullPage: true
      });
    }
    const href = await page.locator('.brand').getAttribute('href');
    if (href !== '/wizard-workshop/')
      throw new Error('Brand link lost Pages prefix.');
    await page.locator('.brand').click();
    await page
      .getByRole('heading', {name: 'Choose your tome, apprentice.'})
      .waitFor();
  }
  const assets = [...requests].filter((url) =>
    /runner\.worker|\.wasm/.test(url)
  );
  if (
    !assets.some((url) => url.endsWith('.wasm')) ||
    !assets.some((url) => url.includes('runner.worker'))
  )
    throw new Error('Worker/WASM were not requested.');
  if (
    assets.some((url) => !new URL(url).pathname.startsWith('/wizard-workshop/'))
  )
    throw new Error('Worker/WASM lost Pages prefix.');
  await writeFile(
    'verification/pages-edp.json',
    JSON.stringify(
      {
        routes: [base, base + '?tome=oop', base + '?tome=edp'],
        workerAndWasm: assets,
        brandHref: '/wizard-workshop/',
        bothRuns: 'success',
        edpLiveBell: 'awake'
      },
      null,
      2
    ) + '\n'
  );
  console.log(
    'Pages routes, both real runs, live bell, brand links, worker and WASM prefix passed.'
  );
} finally {
  await browser.close();
}
