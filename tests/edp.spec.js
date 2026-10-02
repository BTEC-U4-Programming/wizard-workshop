import {test, expect} from '@playwright/test';
import {byId, checkpoints} from '../src/edp/curriculum/checkpoints.js';
import {emptyEdpState} from '../src/edp/state/store.js';
async function openStep(page, id, source = byId[id].solution.spellsSource) {
  const state = emptyEdpState();
  state.currentCheckpointId = id;
  state.currentScreen = {type: 'checkpoint', id};
  state.draftsByCheckpoint[id] = {spellsSource: source, revision: 0};
  await page.addInitScript(
    (state) =>
      localStorage.setItem('wizard-workshop:edp:v1', JSON.stringify(state)),
    state
  );
  await page.goto('/?tome=edp');
  await expect(page.locator('#title')).toHaveText(byId[id].title);
}
async function run(page) {
  await page.locator('#run').click();
  await expect(page.locator('#result')).toHaveAttribute(
    'data-status',
    'success'
  );
  await expect(page.locator('#live-label')).toHaveText('● LIVE');
}
test('library routes, progress independence and revisit-able introductions', async ({
  page
}) => {
  await page.goto('/');
  await expect(page.locator('.tome-oop')).toBeVisible();
  await page.locator('.tome-edp').click();
  await expect(page.locator('#section-title')).toHaveText('Awaken your wizard');
  await page.getByRole('button', {name: 'Start Tome II'}).click();
  await expect(page.locator('.worked-example')).toBeVisible();
  await page.getByRole('button', {name: /Start section/}).click();
  await expect(page.locator('#title')).toHaveText(byId['E1.1'].title);
  await page.locator('.brand').click();
  await expect(page.locator('.tome-edp')).toBeVisible();
});
test('live click, draft cancellation, error recovery and save/reload without automatic execution', async ({
  page
}) => {
  await openStep(page, 'E1.1');
  await run(page);
  await page.locator('#stage-wake-button').click();
  await expect(page.locator('#character-summary')).toContainText('awake');
  const editor = page.locator('.cm-content');
  await editor.fill('while (true) {}');
  await expect(page.locator('#live-label')).toContainText('NOT LISTENING');
  await page.locator('#run').click();
  await expect(page.locator('#result')).toHaveAttribute(
    'data-status',
    'stopped'
  );
  await expect(page.locator('#character-summary')).toContainText('awake');
  await editor.fill(byId['E1.1'].solution.spellsSource);
  await run(page);
  await page.reload();
  await expect(page.locator('#live-label')).toContainText('NOT LISTENING');
  await expect(editor).toContainText('wakeWizard');
});
test('delegation reaches newly learned spell; stage HTML is read-only', async ({
  page
}) => {
  await openStep(page, 'E2.3');
  await run(page);
  await page.locator('#stage-learn-button').click();
  await expect(page.locator('#stage-storm-card')).toBeVisible();
  await page.locator('#stage-storm-card').click();
  await expect(page.locator('#character-summary')).toContainText('14/20');
  await page.getByRole('tab', {name: 'stage.html'}).click();
  await expect(page.locator('#stage-html')).toContainText('spellbook');
  await expect(page.locator('#stage-html [contenteditable]')).toHaveCount(0);
});
test('keyboard movement, incantations and input guards', async ({page}) => {
  await openStep(page, 'E4.4');
  await run(page);
  await page.locator('.stage-frame').focus();
  await page.keyboard.type('ignis');
  await page.keyboard.press('Enter');
  await expect(page.locator('#stage-buffer-display')).toHaveText(
    'Spell buffer: '
  );
  await page.locator('.stage-frame').focus();
  await page.keyboard.type('LUX');
  await page.keyboard.press('Enter');
  await expect(page.locator('#preview-note')).not.toContainText('error');
  await page.keyboard.press('Tab');
  await expect(page.locator('.stage-frame')).not.toBeFocused();
});
test('battle controls, optional attempt gate, retry and keyboard scry', async ({
  page
}) => {
  await openStep(page, 'E5.4');
  await run(page);
  await expect(page.locator('#next')).toBeDisabled();
  await page.locator('#stage-goblin').focus();
  // The plan appears as a speech bubble in the scene, not below it.
  await expect(page.locator('.stage-art #stage-intent-bubble')).toBeVisible();
  await page.locator('#stage-fireball-button').click();
  await page.locator('.stage-frame').focus();
  await page.keyboard.type('IGNIS');
  await page.keyboard.press('Enter');
  await expect(page.locator('#goblin-summary')).toContainText('80/110');
  await expect(page.locator('#next')).toBeEnabled();
});
test('Section 5 ends with the complete battle: Run, play, then download the spellbook', async ({
  page
}) => {
  test.setTimeout(60000);
  // Arrive from E5.3 as a learner would, with no E5.4 draft yet.
  await openStep(page, 'E5.3');
  await run(page);
  await page.locator('#next').click();
  await expect(page.locator('#title')).toHaveText(byId['E5.4'].title);
  // The editor opens with the whole battle, not the learner's E5.3 code.
  await expect(page.locator('.cm-content')).toContainText('battleEnded');
  await expect(page.locator('.lesson-card')).toContainText('pair programmer');
  // One press of Run code, no edits, and the battle is playable.
  await run(page);
  await expect(page.locator('#next')).toBeDisabled();
  await page.locator('#stage-fire-card').click();
  await expect(page.locator('#goblin-summary')).toContainText('96/110');
  await expect(page.locator('#next')).toBeEnabled();
  await page.locator('#next').click();
  await page.getByRole('button', {name: /Finish Tome II/}).click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page
      .getByRole('button', {name: 'Download summary (.md)', exact: true})
      .first()
      .click()
  ]);
  const {readFile} = await import('node:fs/promises');
  const markdown = await readFile(await download.path(), 'utf8');
  expect(markdown).toContain('Your Tome II spellbook');
  expect(markdown).toContain('Your final code');
  expect(markdown).toContain('battle.events.addEventListener("battleEnded"');
});
test('every checkpoint solution passes in the browser worker', async ({
  page
}) => {
  test.setTimeout(90000);
  const state = emptyEdpState();
  for (const cp of checkpoints)
    state.draftsByCheckpoint[cp.id] = {
      spellsSource: cp.solution.spellsSource,
      revision: 0
    };
  await page.addInitScript(
    (state) =>
      localStorage.setItem('wizard-workshop:edp:v1', JSON.stringify(state)),
    state
  );
  await page.goto('/?tome=edp');
  for (const cp of checkpoints) {
    await page.locator('#checkpoint').selectOption(cp.id);
    await run(page);
  }
});
test('phone, zoom and reduced-motion layouts fit; learner markup stays text', async ({
  page
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await openStep(page, 'E5.4');
  await page.setViewportSize({width: 390, height: 844});
  await expect(page.locator('body')).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  await page.locator('#view-switch').click();
  await expect(page.locator('.stage-frame')).toBeVisible();
  await page.screenshot({
    path: 'verification/edp-battle-phone.png',
    fullPage: true
  });
  await page.setViewportSize({width: 1366, height: 768});
  await page.evaluate(() => (document.documentElement.style.zoom = '2'));
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
});
test('every review supports retries and preserves answers across reload', async ({
  page
}) => {
  await page.goto('/?tome=edp');
  for (let chapter = 1; chapter <= 5; chapter++) {
    await page.locator('#checkpoint').selectOption('review:' + chapter);
    await expect(page.locator('.blank-input').first()).toBeVisible();
    await page.locator('.choice-option input').first().check();
    await page
      .locator('.question')
      .first()
      .getByRole('button', {name: 'Check answer', exact: true})
      .click();
    const checked = await page
      .locator('.choice-option input:checked')
      .inputValue();
    await page.reload();
    await expect(page.locator('.choice-option input:checked')).toHaveValue(
      checked
    );
    await expect(
      page.getByRole('button', {
        name: chapter === 5 ? /Finish Tome II/ : /Continue to section/
      })
    ).toBeEnabled();
  }
});
test('keyboard battle can end, ring the bell and download evidence', async ({
  page
}) => {
  test.setTimeout(180000);
  await page.addInitScript(() => {
    window.__wwTestSeed = 7;
  });
  await openStep(page, 'E5.4');
  await run(page);
  const hud = page.locator('#battle-hud');
  const ending = page.locator('#battle-ending');
  // Use only learner keyboard listeners, adapting to the visible resources
  // and Grub's plan. Production chooses a fresh seed for each attempt.
  for (let attempt = 0; attempt < 5; attempt++) {
    for (let turn = 0; turn < 50 && !(await ending.isVisible()); turn++) {
      await page.locator('#stage-goblin').focus();
      await expect(page.locator('#stage-intent-bubble')).toBeVisible();
      const plan = await page.locator('#stage-intent-bubble').textContent();
      const health = await page
        .getByRole('meter', {name: 'Wizard health'})
        .evaluate((meter) => meter.value);
      const mana = await page
        .getByRole('meter', {name: 'Wizard mana'})
        .evaluate((meter) => meter.value);
      const potions = Number(
        (await hud.textContent()).match(/Potions (\d+)/)[1]
      );
      await page.locator('.stage-frame').focus();
      const key =
        health < 30 && potions > 0
          ? '5'
          : plan.includes('Big Bonk')
            ? '4'
            : mana >= 8
              ? 'f'
              : '2';
      await page.keyboard.press(key);
      if (key === 'f') {
        await expect(hud).toContainText('Type IGNIS');
        await page.keyboard.type('IGNIS');
        await page.keyboard.press('Enter');
      }
      await expect
        .poll(
          async () =>
            (await ending.isVisible()) ||
            (await hud.textContent()).includes('Grub is thinking')
        )
        .toBe(true);
      await expect
        .poll(
          async () =>
            (await ending.isVisible()) ||
            (await hud.textContent()).includes('Your turn'),
          {timeout: 4000}
        )
        .toBe(true);
    }
    if ((await ending.textContent()).includes('Wizard Wins')) break;
    const retry = page.getByRole('button', {
      name: attempt >= 1 ? 'Try Apprentice mode' : 'Retry battle',
      exact: true
    });
    await retry.focus();
    await page.keyboard.press('Enter');
    await expect(ending).toBeHidden();
    await expect(hud).toContainText('Your turn');
  }
  await expect(ending).toContainText('Wizard Wins');
  await page
    .getByRole('button', {name: 'Ring the Rune Bell', exact: true})
    .focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.crystal-log')).toContainText('Quill wakes');
  await page.locator('#checkpoint').selectOption('recap');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page
      .getByRole('button', {name: 'Download summary (.md)', exact: true})
      .first()
      .click()
  ]);
  const path = await download.path();
  const {readFile} = await import('node:fs/promises');
  const markdown = await readFile(path, 'utf8');
  expect(markdown).toContain('Your final code');
  expect(markdown).toMatch(/Attempts: \d+; wins: 1/);
});
test('stale run results and session replies cannot overwrite edits or navigation', async ({
  page
}) => {
  await page.addInitScript(() => {
    window.__heldResults = [];
    window.__holdResults = false;
    window.__releaseResults = () => {
      window.__holdResults = false;
      window.__heldResults.splice(0).forEach((deliver) => deliver());
    };
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      set onmessage(handler) {
        super.onmessage = (event) =>
          window.__holdResults &&
          ['result', 'edp-session-state'].includes(event.data.type)
            ? window.__heldResults.push(() => handler(event))
            : handler(event);
      }
    };
  });
  await openStep(page, 'E1.1');
  await run(page);
  await page.evaluate(() => (window.__holdResults = true));
  await page.locator('#run').click();
  await expect
    .poll(() => page.evaluate(() => window.__heldResults.length))
    .toBeGreaterThan(0);
  await page.locator('.cm-content').fill('// unfinished new draft');
  await page.evaluate(() => window.__releaseResults());
  await expect(page.locator('#next')).toBeDisabled();
  await expect(page.locator('#live-label')).toContainText('NOT LISTENING');
  await expect(page.locator('.cm-content')).toContainText('unfinished');
  await page.locator('.cm-content').fill(byId['E1.1'].solution.spellsSource);
  await run(page);
  await page.evaluate(() => (window.__holdResults = true));
  await page.locator('#stage-wake-button').click();
  await expect
    .poll(() => page.evaluate(() => window.__heldResults.length))
    .toBeGreaterThan(0);
  await page.locator('#checkpoint').selectOption('E2.2');
  await page.evaluate(() => window.__releaseResults());
  await expect(page.locator('#title')).toHaveText(byId['E2.2'].title);
  await expect(page.locator('#live-label')).toContainText('NOT LISTENING');
  await expect(page.locator('#next')).toBeDisabled();
});
test('learner names, speech and element text render as text', async ({
  page
}) => {
  await openStep(
    page,
    'E1.1',
    byId['E1.1'].solution.spellsSource +
      `\nwizard.name = "<img src=x>";\nwizard.say("<b>Hello</b>");\nwakeButton.textContent = "<img src=x>";`
  );
  await run(page);
  await expect(page.locator('#character-summary')).toContainText('<img src=x>');
  await expect(page.locator('#character-summary')).toContainText(
    '<b>Hello</b>'
  );
  await expect(page.locator('#stage-wake-button')).toHaveText('<img src=x>');
  await expect(page.locator('#preview img')).toHaveCount(0);
});
// Sprites must never draw a hover box of their own (no gold box, and no
// grey button:hover box). Only classes the student's code adds may outline
// them. Checked on the starter (before listeners) and the solution.
for (const id of ['E3.1', 'E3.2', 'E3.3', 'E3.4', 'E3.5', 'E5.3'])
  for (const version of ['starter', 'solution'])
    test(`${id} ${version}: sprites draw no hover box of their own`, async ({
      page
    }) => {
      await openStep(page, id, byId[id][version].spellsSource);
      const sprites = page.locator('.stage-hotspot');
      const count = await sprites.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        const sprite = sprites.nth(i);
        if (!(await sprite.isVisible())) continue;
        await sprite.hover();
        const look = await sprite.evaluate((node) => {
          const css = getComputedStyle(node);
          return {
            background: css.backgroundColor,
            border: css.borderTopColor,
            cursor: css.cursor,
            title: node.title
          };
        });
        expect(look.background).toBe('rgba(0, 0, 0, 0)');
        expect(look.border).toBe('rgba(0, 0, 0, 0)');
        expect(look.cursor).toBe('default');
        expect(look.title).toBe('');
      }
    });
test('potion hover and keyboard focus show the same accessible label', async ({
  page
}) => {
  await openStep(page, 'E3.5');
  await run(page);
  await page.locator('#stage-red-potion').hover();
  await expect(page.locator('#stage-tooltip')).toContainText('Healing draught');
  await page.mouse.move(0, 0);
  await expect(page.locator('#stage-tooltip')).toBeHidden();
  await page.locator('#stage-red-potion').focus();
  await expect(page.locator('#stage-tooltip')).toContainText('Healing draught');
  await page.locator('#stage-disarm-button').focus();
  await expect(page.locator('#stage-tooltip')).toBeHidden();
});
