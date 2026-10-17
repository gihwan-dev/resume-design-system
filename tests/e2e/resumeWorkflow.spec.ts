import { expect, test, type Page } from '@playwright/test';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const fixture = JSON.parse(
  readFileSync('skills/company-resume/tests/fixtures/synthetic.json', 'utf8'),
);

async function paste(page: Page, payload: unknown) {
  await page.getByRole('button', { name: '공유 ▾' }).click();
  await page.getByText('JSON 붙여넣기…', { exact: true }).click();
  await page.locator('.share-modal-textarea').fill(JSON.stringify(payload));
}
async function copyJson(page: Page) {
  await page.getByRole('button', { name: '공유 ▾' }).click();
  await page.getByText('JSON 복사', { exact: true }).click();
  return JSON.parse(await page.evaluate(() => navigator.clipboard.readText()));
}

test.beforeEach(async ({ page }) => {
  // In-memory clipboard avoids reading or overwriting the user's OS clipboard.
  await page.addInitScript(() => {
    let clipboard = '';
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        readText: async () => clipboard,
        writeText: async (value: string) => {
          clipboard = value;
        },
      },
    });
  });
  await page.route('https://**/*', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('.rs-page')).toHaveCount(2);
});

test('UI imports all fields, reissues ids, preserves manual edit and prints two A4 pages', async ({
  page,
}, testInfo) => {
  await paste(page, fixture);
  await expect(page.locator('.share-modal-preview')).toContainText('가상 지원자 테스트');
  await page.getByRole('button', { name: '가져오기', exact: true }).click();
  await expect(page.locator('.rs-name')).toHaveText('가상 지원자');
  const imported = await copyJson(page);
  expect(imported.theme).toBe('mono');
  expect(imported.pages.map((p: { id: string }) => p.id)).not.toEqual(
    fixture.pages.map((p: { id: string }) => p.id),
  );
  for (let p = 0; p < fixture.pages.length; p++) {
    for (let b = 0; b < fixture.pages[p].blocks.length; b++) {
      expect(imported.pages[p].blocks[b].id).not.toBe(fixture.pages[p].blocks[b].id);
      expect(imported.pages[p].blocks[b].data).toEqual(fixture.pages[p].blocks[b].data);
    }
  }
  await page.locator('.rs-intro').click();
  await page
    .locator('.panel-right textarea')
    .fill('사용자가 편집한 첫 문장. 브라우저에서 직접 고친 소개.');
  await expect(page.locator('.rs-intro')).toContainText('브라우저에서 직접 고친 소개');
  const edited = await copyJson(page);
  expect(edited.pages[0].blocks[1].data.text).toBe(
    '사용자가 편집한 첫 문장. 브라우저에서 직접 고친 소개.',
  );
  expect(edited.pages[0].blocks[5].data.result).toBe('');
  expect(edited.pages[0].blocks[5].data.learning).toBe('');
  expect(edited.pages[1]).toEqual(imported.pages[1]);
  expect(edited.theme).toBe(imported.theme);
  await testInfo.attach('latest-ui-export.json', {
    body: Buffer.from(JSON.stringify(edited, null, 2)),
    contentType: 'application/json',
  });
  // The next candidate must use the newly exported IDs and manual text.
  const dir = mkdtempSync(join(tmpdir(), 'resume-ui-roundtrip-'));
  const bytes = JSON.stringify(edited, null, 2);
  const before = edited.pages[0].blocks[1].data.text;
  const after = '사용자가 편집한 첫 문장. 검토한 새 소개.';
  const target = {
    pageId: edited.pages[0].id,
    blockId: edited.pages[0].blocks[1].id,
    path: '/text',
  };
  writeFileSync(join(dir, 'latest.json'), bytes);
  writeFileSync(
    join(dir, 'scope.json'),
    JSON.stringify({
      request: '소개 두 번째 문장만 수정',
      targets: [{ ...target, range: [before.indexOf('브라우저'), before.length] }],
    }),
  );
  writeFileSync(
    join(dir, 'plan.json'),
    JSON.stringify({
      baseHash: createHash('sha256').update(bytes).digest('hex'),
      operations: [
        {
          ...target,
          expected: before,
          value: after,
          reason: '합성 테스트 요청',
          evidence: ['synthetic-request'],
        },
      ],
    }),
  );
  execFileSync(process.execPath, [
    'skills/company-resume/scripts/resume-tool.mjs',
    'propose',
    join(dir, 'latest.json'),
    join(dir, 'scope.json'),
    join(dir, 'plan.json'),
    join(dir, 'candidate'),
  ]);
  const candidate = JSON.parse(readFileSync(join(dir, 'candidate/candidate.json'), 'utf8'));
  await paste(page, candidate);
  await page.getByRole('button', { name: '가져오기', exact: true }).click();
  await expect(page.locator('.rs-intro')).toHaveText(after);
  const reexported = await copyJson(page);
  expect(reexported.pages[0].id).not.toBe(edited.pages[0].id);
  expect(reexported.pages[0].blocks[1].id).not.toBe(edited.pages[0].blocks[1].id);
  const values = (doc: typeof edited) =>
    doc.pages.map((p: { blocks: { type: string; data: unknown }[] }) =>
      p.blocks.map((b) => ({ type: b.type, data: b.data })),
    );
  expect(values(reexported)).toEqual(values(candidate));
  expect(reexported.theme).toBe(edited.theme);
  await testInfo.attach('candidate-ui-reexport.json', {
    body: Buffer.from(JSON.stringify(reexported, null, 2)),
    contentType: 'application/json',
  });
  await expect(page.locator('.canvas-page.is-overflow')).toHaveCount(0);
  await expect(page.locator('.rs-page a[href="https://example.com/ko"]')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  // Exercise the app's print entry point and native print CSS without OS dialog.
  await page.evaluate(() => {
    window.print = () => {};
  });
  await page.getByRole('button', { name: 'Export PDF' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-preview', 'print');
  await page.emulateMedia({ media: 'print' });
  const geometry = await page.locator('.rs-page').evaluateAll((pages) =>
    pages.map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const children = Array.from(el.querySelectorAll('.bb-wrap'));
      return {
        width: r.width,
        height: r.height,
        overflow: cs.overflow,
        fits: children.every((child) => {
          const c = child.getBoundingClientRect();
          return c.bottom <= r.bottom - parseFloat(cs.paddingBottom) + 1 && c.right <= r.right + 1;
        }),
      };
    }),
  );
  for (const g of geometry) {
    expect(g.width).toBeCloseTo(793.7, 0);
    expect(Math.abs(g.height - 1122.52)).toBeLessThanOrEqual(1);
    expect(g.fits).toBe(true);
  }
  const pdf = testInfo.outputPath('synthetic-resume.pdf');
  await page.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true });
  await testInfo.attach('synthetic-resume.pdf', { path: pdf, contentType: 'application/pdf' });
  await page.screenshot({ path: testInfo.outputPath('print.png'), fullPage: true });
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  await expect(page.locator('body')).not.toHaveAttribute('data-preview', 'print');
});

test('UI rejects unknown block and invalid block fields before import', async ({ page }) => {
  const invalid = structuredClone(fixture);
  invalid.pages[0].blocks[0].type = 'futureBlock';
  await paste(page, invalid);
  await expect(page.locator('.share-modal-error')).toContainText('unsupported block');
  await expect(page.getByRole('button', { name: '가져오기', exact: true })).toBeDisabled();
  invalid.pages[0].blocks[0].type = 'header';
  invalid.pages[0].blocks[0].data.contacts = [42];
  await page.locator('.share-modal-textarea').fill(JSON.stringify(invalid));
  await expect(page.locator('.share-modal-error')).toContainText('contacts/0');
  await expect(page.getByRole('button', { name: '가져오기', exact: true })).toBeDisabled();
});

test('overflow fixture warns and cancelling avoids print', async ({ page }) => {
  const tooLong = structuredClone(fixture);
  tooLong.pages[0].blocks.push({
    id: 'b_overflow',
    type: 'freeText',
    data: { text: '한글 초과 내용\n'.repeat(150) },
  });
  await paste(page, tooLong);
  await page.getByRole('button', { name: '가져오기', exact: true }).click();
  await expect(page.locator('.canvas-page.is-overflow')).toHaveCount(1);
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('A4 영역을 초과');
    await dialog.dismiss();
  });
  await page.getByRole('button', { name: 'Export PDF' }).click();
  await expect(page.locator('body')).not.toHaveAttribute('data-preview', 'print');
});
