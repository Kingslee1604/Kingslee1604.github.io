import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = ['/', '/projects/agentforge/', '/projects/medrex/', '/404.html'];

for (const path of pages) {
  for (const theme of ['dark', 'light'] as const) {
    test(`no accessibility violations on ${path} (${theme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze();
      const summary = results.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target.join(' ')}`);
      expect(summary).toEqual([]);
    });
  }

  test(`no sideways scrolling at 360px on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });

  test(`links to other sites open in a new tab on ${path}`, async ({ page }) => {
    await page.goto(path);
    const sameTab = await page.$$eval('a[href^="http"]', (links) =>
      links
        .filter((a) => a.getAttribute('target') !== '_blank' || !a.getAttribute('rel')?.includes('noopener'))
        .map((a) => a.getAttribute('href')),
    );
    expect(sameTab).toEqual([]);
  });
}

test('the skip link is the first stop and jumps to the main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('the theme toggle switches theme and remembers the choice', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Switch to light theme' });
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('the demo never moves on its own; Play starts it and Stop returns to the still', async ({ page }) => {
  await page.goto('/projects/agentforge/');
  const still = page.locator('[data-demo-still]');
  const gif = page.locator('[data-demo-gif]');
  await expect(still).toBeVisible();
  await expect(gif).toBeHidden();
  // The GIF is not even downloaded until asked for.
  expect(await gif.getAttribute('src')).toBeNull();

  await page.getByRole('button', { name: 'Play the demo' }).click();
  await expect(gif).toBeVisible();
  await expect(gif).toHaveAttribute('src', /\.gif$/);
  await expect(still).toBeHidden();

  await page.getByRole('button', { name: 'Stop the demo' }).click();
  await expect(still).toBeVisible();
  await expect(gif).toBeHidden();
});

test('every page has a link-preview image that loads', async ({ page, request }) => {
  for (const path of pages.filter((p) => !p.endsWith('404.html'))) {
    await page.goto(path);
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(og).toMatch(/^https:\/\/kingslee1604\.github\.io\/og\/.+\.png$/);
    const local = new URL(og!).pathname;
    const res = await request.get(local);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/png');
  }
});
