import { expect, test } from '@playwright/test';

test('app boots, shows seed resume, and toggles preview', async ({ page }) => {
  await page.goto('/');
  // Seed resume header
  await expect(page.locator('.rs-page')).toHaveCount(2);
  await expect(page.locator('.rs-name').first()).toBeVisible();
  // Preview toggle hides the sidebar
  await page.getByRole('button', { name: 'Preview' }).click();
  await expect(page.locator('.panel-left')).toHaveCount(0);
});

test('add a Header block to a fresh empty resume', async ({ page }) => {
  await page.goto('/');
  // Pop open the resume picker and start empty
  await page.locator('.resume-picker').click();
  await page.getByText('+ 빈 이력서로 시작').click();
  await expect(page.locator('.rs-page')).toHaveCount(1);
  await expect(page.locator('.rs-name')).toHaveCount(0);
});
