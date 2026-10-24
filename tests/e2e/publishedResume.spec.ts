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
  const document = await (await page.request.get('/resumes/tossplace-platform.json')).json();
  await expect(page.locator('.rs-page')).toHaveCount(document.pages.length);
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

test('published resume fits within A4 print padding and keeps two-level bullets', async ({
  page,
}) => {
  // Print geometry must use the shipped fonts, not OS-specific fallback metrics.
  const fontHosts = new Set(['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com']);
  await page.route('https://**/*', (route) =>
    fontHosts.has(new URL(route.request().url()).hostname) ? route.continue() : route.abort(),
  );
  await page.goto('/resume/tossplace-platform');
  await expect(page.locator('.rs-name')).toHaveText('최기환');
  await page.emulateMedia({ media: 'print' });
  const loadedFonts = await page.evaluate(async () => {
    document.body.dataset.preview = 'print';
    const fonts = await Promise.all(
      [400, 600, 700].map((weight) => document.fonts.load(`${weight} 13.5px Pretendard`, '한글')),
    );
    await document.fonts.ready;
    return fonts.map((faces) => faces.length);
  });
  expect(
    loadedFonts.every((count) => count > 0),
    'Print fonts must be loaded',
  ).toBe(true);
  await expect(page.locator('.rs-tree--d2')).toHaveCount(0);
  const printPages = await page.locator('.rs-page').evaluateAll((pages) =>
    pages.map((element) => {
      const page = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const bounds = {
        top: page.top + parseFloat(style.paddingTop),
        bottom: page.bottom - parseFloat(style.paddingBottom),
        left: page.left + parseFloat(style.paddingLeft),
        right: page.right - parseFloat(style.paddingRight),
      };
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const overflows: string[] = [];
      while (walker.nextNode()) {
        if (!walker.currentNode.textContent?.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(walker.currentNode);
        for (const rect of range.getClientRects()) {
          if (
            rect.width > 0 &&
            (rect.top < bounds.top - 1 ||
              rect.bottom > bounds.bottom + 1 ||
              rect.left < bounds.left - 1 ||
              rect.right > bounds.right + 1)
          ) {
            overflows.push(walker.currentNode.textContent.trim());
          }
        }
      }
      return { text: element.textContent, overflows };
    }),
  );
  for (const [index, page] of printPages.entries()) {
    expect(page.overflows, `Print overflow on page ${index + 1}`).toEqual([]);
    expect(page.text).not.toMatch(/[·—]/u);
  }
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
