import {test, expect} from '@playwright/test';
import {emptyState, STORAGE_KEY} from '../src/state/store.js';
import {checkpoints} from '../src/curriculum/checkpoints.js';
test('landing is local, keyboard accessible, and leaves saves untouched', async ({
  page
}) => {
  const hosts = new Set();
  page.on('request', (request) => hosts.add(new URL(request.url()).hostname));
  await page.goto('/');
  await expect(
    page.getByRole('heading', {name: 'Choose your tome, apprentice.'})
  ).toBeVisible();
  await expect(page.getByText('Not started', {exact: true})).toHaveCount(2);
  const owl = page.getByRole('button', {name: 'Quill the owl'});
  await owl.focus();
  await expect(page.locator('.owl-bubble')).toBeVisible();
  await page.locator('.tome-oop').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#section-title')).toBeVisible();
  await page.locator('.brand').click();
  await page.locator('.tome-edp').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#section-title')).toHaveText('Awaken your wizard');
  expect([...hosts]).toEqual(['127.0.0.1']);
});
test('library reads Tome I progress without migrating or rewriting it', async ({
  page
}) => {
  const state = emptyState();
  state.completedCheckpointIds = checkpoints.slice(0, 10).map((cp) => cp.id);
  const saved = JSON.stringify(state);
  await page.addInitScript(({key, saved}) => localStorage.setItem(key, saved), {
    key: STORAGE_KEY,
    saved
  });
  await page.goto('/');
  await expect(page.locator('.tome-oop')).toContainText('10 of 54 steps done');
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)
  ).toBe(saved);
});
test('all library viewports fit and reduced motion suppresses transforms', async ({
  page
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  for (const [width, height] of [
    [1366, 768],
    [768, 1024],
    [390, 844],
    [683, 384]
  ]) {
    await page.setViewportSize({width, height});
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true);
  }
  await page.locator('.tome-edp').hover();
  expect(
    await page
      .locator('.tome-edp')
      .evaluate((node) => getComputedStyle(node).transform)
  ).toBe('none');
  await page.screenshot({path: 'verification/edp-library.png', fullPage: true});
});
