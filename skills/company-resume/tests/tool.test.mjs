import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateResume, blockShapes } from '../scripts/resume-schema.ts';
import { createCandidate, verifyCandidate, sourceHash } from '../scripts/resume-tool.mjs';
const fixture = new URL('./fixtures/synthetic.json', import.meta.url);
const bytes = readFileSync(fixture);
const original = JSON.parse(bytes);
const scope = {
  request: '소개 두 번째 문장만 수정',
  targets: [{ pageId: 'p_fixture_1', blockId: 'b_intro', path: '/text' }],
};
const op = {
  ...scope.targets[0],
  expected: original.pages[0].blocks[1].data.text,
  value: '사용자가 편집한 첫 문장. 요청한 표현을 다듬습니다.',
  reason: '사용자 표현 수정',
  evidence: ['user-request:소개 두 번째 문장'],
};
const plan = { baseHash: sourceHash(bytes), operations: [op] };
scope.targets[0].range = [op.expected.indexOf('요청한'), op.expected.length];
const change = (fn) => {
  const doc = structuredClone(original);
  fn(doc);
  return doc;
};

test('valid synthetic export and empty PAR remain valid', () =>
  assert.deepEqual(validateResume(original), []));
test('sentence range rejects changes to another sentence in the same field', () => {
  assert.throws(
    () =>
      createCandidate(bytes, scope, {
        ...plan,
        operations: [{ ...op, value: '멋대로 바꾼 첫 문장. 요청한 표현을 다듬습니다.' }],
      }),
    /outside requested range/,
  );
  const middle = {
    ...scope,
    targets: [
      {
        ...scope.targets[0],
        range: [op.expected.indexOf('요청한'), op.expected.indexOf('고칩니다')],
      },
    ],
  };
  assert.throws(() => createCandidate(bytes, middle, plan), /outside requested range/);
  for (const range of [[-1, 2], [2, 1], [0, 999], [0.5, 2], [0], 'all']) {
    assert.throws(
      () => createCandidate(bytes, { ...scope, targets: [{ ...scope.targets[0], range }] }, plan),
      /Invalid text range/,
    );
  }
});
test('candidate preserves original and every value outside the requested leaf', () => {
  const result = createCandidate(bytes, scope, plan);
  const expected = change((d) => {
    d.pages[0].blocks[1].data.text = op.value;
  });
  assert.deepEqual(result.candidate, expected);
  assert.equal(result.candidate.pages[0].blocks[5].data.result, '');
  assert.deepEqual(result.original, original);
  assert.equal(readFileSync(fixture).toString(), bytes.toString());
  assert.equal(verifyCandidate(bytes, scope, plan, result.candidate).changes.length, 1);
});
for (const [label, mutate] of [
  [
    'unknown block',
    (d) => {
      d.pages[0].blocks[0].type = 'career';
    },
  ],
  [
    'missing required field',
    (d) => {
      delete d.pages[0].blocks[0].data.name;
    },
  ],
  [
    'wrong field type',
    (d) => {
      d.pages[0].blocks[0].data.contacts = [42];
    },
  ],
  [
    'unknown field',
    (d) => {
      d.pages[0].blocks[1].data.hidden = 'extra';
    },
  ],
  [
    'duplicate block id across pages',
    (d) => {
      d.pages[1].blocks[0].id = 'b_header';
    },
  ],
  [
    'duplicate page id',
    (d) => {
      d.pages[1].id = d.pages[0].id;
    },
  ],
  [
    'unsupported theme',
    (d) => {
      d.theme = 'future';
    },
  ],
  [
    'inherited theme key',
    (d) => {
      d.theme = 'constructor';
    },
  ],
  [
    'invalid envelope',
    (d) => {
      d.v = 2;
    },
  ],
  [
    'invalid page',
    (d) => {
      d.pages[0] = null;
    },
  ],
  [
    'extra top-level field',
    (d) => {
      d.secret = true;
    },
  ],
])
  test(`rejects ${label}`, () => assert.ok(validateResume(change(mutate)).length));

test('stale file hash refuses user edits anywhere', () => {
  const edited = Buffer.from(
    JSON.stringify(
      change((d) => {
        d.pages[1].blocks[0].data.text = '새 사용자 문장';
      }),
    ),
  );
  assert.throws(() => createCandidate(edited, scope, plan), /Stale source hash/);
});
test('fresh hash cannot bypass expected-value conflict', () => {
  const edited = Buffer.from(
    JSON.stringify(
      change((d) => {
        d.pages[0].blocks[1].data.text =
          '최신 사용자 소개. 이전 글보다 충분히 긴 최신 편집본입니다.';
      }),
    ),
  );
  assert.throws(
    () => createCandidate(edited, scope, { ...plan, baseHash: sourceHash(edited) }),
    /Expected value conflict/,
  );
});
test('fresh source preserves unrelated manual edits', () => {
  const editedDoc = change((d) => {
    d.pages[1].blocks[0].data.text = '새 사용자 문장';
  });
  const edited = Buffer.from(JSON.stringify(editedDoc));
  const result = createCandidate(edited, scope, { ...plan, baseHash: sourceHash(edited) });
  assert.equal(result.candidate.pages[1].blocks[0].data.text, '새 사용자 문장');
});
test('out-of-scope operations and obsolete imported ids fail', () => {
  assert.throws(
    () =>
      createCandidate(bytes, scope, {
        ...plan,
        operations: [{ ...op, blockId: 'b_last', pageId: 'p_fixture_2' }],
      }),
    /outside requested scope/,
  );
  assert.throws(
    () =>
      createCandidate(
        bytes,
        { ...scope, targets: [{ ...scope.targets[0], blockId: 'b_obsolete' }] },
        plan,
      ),
    /latest imported resume/,
  );
});
for (const [label, mutate] of [
  [
    'other sentence field',
    (d) => {
      d.pages[1].blocks[0].data.text = '침범';
    },
  ],
  [
    'theme',
    (d) => {
      d.theme = 'default';
    },
  ],
  [
    'block deletion',
    (d) => {
      d.pages[0].blocks.pop();
    },
  ],
  [
    'block order',
    (d) => {
      d.pages[0].blocks.reverse();
    },
  ],
  [
    'page order',
    (d) => {
      d.pages.reverse();
    },
  ],
  [
    'id',
    (d) => {
      d.pages[1].blocks[0].id = 'new';
    },
  ],
  [
    'name',
    (d) => {
      d.name = '다른 이름';
    },
  ],
])
  test(`verify rejects unauthorized ${label} change`, () => {
    const result = createCandidate(bytes, scope, plan);
    mutate(result.candidate);
    assert.throws(
      () => verifyCandidate(bytes, scope, plan, result.candidate),
      /unexpected text\/block\/order\/theme/,
    );
  });
test('array leaf paths work while array replacement, unsafe paths and type changes fail', () => {
  const target = { pageId: 'p_fixture_1', blockId: 'b_skills', path: '/rows/0/val' };
  const rowScope = { request: '도구 표현', targets: [target] };
  const rowPlan = {
    baseHash: sourceHash(bytes),
    operations: [{ ...op, ...target, expected: '가상 예시', value: '가상 예시 수정' }],
  };
  assert.equal(
    createCandidate(bytes, rowScope, rowPlan).candidate.pages[0].blocks[6].data.rows[0].val,
    '가상 예시 수정',
  );
  assert.throws(
    () => createCandidate(bytes, { ...scope, targets: [{ ...target, path: '/rows' }] }, plan),
    /Only existing/,
  );
  assert.throws(
    () =>
      createCandidate(bytes, { ...scope, targets: [{ ...target, path: '/__proto__/x' }] }, plan),
    /Unsafe path/,
  );
  assert.throws(
    () => createCandidate(bytes, scope, { ...plan, operations: [{ ...op, value: 4 }] }),
    /type cannot change/,
  );
});
test('malformed scope, duplicate operations and missing evidence fail', () => {
  assert.throws(() => createCandidate(bytes, { ...scope, other: true }, plan), /Invalid scope/);
  assert.throws(
    () => createCandidate(bytes, scope, { ...plan, operations: [op, op] }),
    /Duplicate operation/,
  );
  assert.throws(
    () => createCandidate(bytes, scope, { ...plan, operations: [{ ...op, evidence: [] }] }),
    /evidence references/,
  );
});
test('every schema checks malformed data and finite spacer', () => {
  for (const type of Object.keys(blockShapes)) {
    assert.ok(
      validateResume({ ...original, pages: [{ id: 'p', blocks: [{ id: 'b', type, data: {} }] }] })
        .length,
      type,
    );
  }
  for (const height of [-1, Infinity, NaN, '16'])
    assert.ok(
      validateResume({
        ...original,
        pages: [{ id: 'p', blocks: [{ id: 'b', type: 'spacer', data: { height } }] }],
      }).length,
    );
});
test('CLI creates exclusive bundle and refuses existing output without overwrite', () => {
  const dir = mkdtempSync(join(tmpdir(), 'resume-tool-'));
  writeFileSync(join(dir, 'scope.json'), JSON.stringify(scope));
  writeFileSync(join(dir, 'plan.json'), JSON.stringify(plan));
  const cli = fileURLToPath(new URL('../scripts/resume-tool.mjs', import.meta.url));
  const input = fileURLToPath(fixture);
  const out = join(dir, 'candidate');
  const args = [cli, 'propose', input, join(dir, 'scope.json'), join(dir, 'plan.json'), out];
  execFileSync(process.execPath, args);
  assert.deepEqual(readFileSync(join(out, 'original.json')), bytes);
  assert.deepEqual(readdirSync(out).sort(), [
    'candidate.json',
    'changes.json',
    'original.json',
    'plan.json',
    'scope.json',
  ]);
  const before = readFileSync(join(out, 'candidate.json'));
  assert.equal(spawnSync(process.execPath, args).status, 1);
  assert.deepEqual(readFileSync(join(out, 'candidate.json')), before);
  const invalidOut = join(dir, 'invalid');
  writeFileSync(join(dir, 'plan.json'), JSON.stringify({ ...plan, baseHash: 'old' }));
  assert.equal(spawnSync(process.execPath, [...args.slice(0, -1), invalidOut]).status, 1);
  assert.equal(existsSync(invalidOut), false);
});
