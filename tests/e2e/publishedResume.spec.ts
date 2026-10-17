import { expect, test } from '@playwright/test';

test('published resume is read-only and preserves mobile readability without initializing editor storage', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 } });
  await context.route('https://**/*', (route) => route.abort());
  const page = await context.newPage();
  await page.goto('/resume/tossplace-platform');
  await expect(page.locator('.rs-name')).toHaveText('최기환');
  await expect(page.locator('.rs-page')).toHaveCount(2);
  await expect(page.locator('.rs-blog-row')).toHaveCount(5);
  await expect(
    page.locator('.panel-left,.panel-right,textarea,[contenteditable="true"]'),
  ).toHaveCount(0);
  const info = await page.evaluate(async () => ({
    width: innerWidth,
    content: document.documentElement.scrollWidth,
    databases: await indexedDB.databases(),
  }));
  expect(info.content).toBeLessThanOrEqual(info.width + 1);
  expect(info.databases).toHaveLength(0);
  const pdf = await page.request.get('/resumes/tossplace-platform.pdf');
  expect(pdf.ok()).toBe(true);
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  await context.close();
});

test('published resume reports unavailable or malformed documents without mounting the editor', async ({
  page,
}) => {
  await page.route('**/resumes/tossplace-platform.json', (route) =>
    route.fulfill({ json: { v: 1, pages: [] } }),
  );
  await page.goto('/resume/tossplace-platform');
  await expect(page.getByRole('status')).toContainText('불러오지 못했습니다');
  await expect(page.locator('.rs-page,.panel-left,.resume-picker')).toHaveCount(0);
});
