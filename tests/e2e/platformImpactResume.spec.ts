import { expect, test } from '@playwright/test';

test('separate platform-impact route has its own document and PDF without initializing the editor', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 } });
  await context.route('https://**/*', (route) => route.abort());
  const page = await context.newPage();
  await page.goto('/resume/tossplace-platform-impact');
  await expect(page.locator('.published-nav')).toContainText('Platform용 개선 버전');
  await expect(page.locator('.rs-name')).toHaveText('최기환');
  await expect(page.locator('.rs-page')).toHaveCount(3);
  await expect(page.getByRole('link', { name: 'PDF 보기' })).toHaveAttribute(
    'href',
    '/resumes/tossplace-platform-impact.pdf',
  );
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
  await context.close();
});

test('separate platform-impact resume fits within A4 print padding and keeps two-level bullets', async ({
  page,
}, testInfo) => {
  // Print geometry must use the shipped fonts, not OS-specific fallback metrics.
  const fontHosts = new Set(['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com']);
  await page.route('https://**/*', (route) =>
    fontHosts.has(new URL(route.request().url()).hostname) ? route.continue() : route.abort(),
  );
  await page.goto('/resume/tossplace-platform-impact');
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
  const overflows = printPages.flatMap((page, index) =>
    page.overflows.map((text) => ({ page: index + 1, text })),
  );
  await page.pdf({
    path: testInfo.outputPath('tossplace-platform-impact.pdf'),
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
  });
  for (let index = 0; index < printPages.length; index += 1) {
    await page
      .locator('.rs-page')
      .nth(index)
      .screenshot({
        path: testInfo.outputPath(`print-page-${index + 1}.png`),
      });
  }
  await page.emulateMedia({ media: 'screen' });
  await page.evaluate(() => {
    delete document.body.dataset.preview;
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath('mobile.png'), fullPage: true });
  expect(overflows, 'Text must fit inside every printed page').toEqual([]);
});
