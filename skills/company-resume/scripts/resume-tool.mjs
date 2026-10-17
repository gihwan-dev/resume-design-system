#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { isObject, validateResume } from './resume-schema.ts';

const fail = (message) => {
  throw new Error(message);
};
export const sourceHash = (bytes) => createHash('sha256').update(bytes).digest('hex');
export function assertResume(raw) {
  const errors = validateResume(raw);
  if (errors.length) fail(errors.join('\n'));
}
function exactKeys(value, keys, label) {
  if (!isObject(value) || !isDeepStrictEqual(Object.keys(value).sort(), [...keys].sort()))
    fail(`Invalid ${label} fields`);
}
function tokens(path) {
  if (typeof path !== 'string' || !/^\/(?:[^~]|~[01])*$/.test(path)) fail('Invalid JSON pointer');
  const parts = path
    .slice(1)
    .split('/')
    .map((s) => s.replace(/~1/g, '/').replace(/~0/g, '~'));
  if (parts.some((s) => ['__proto__', 'prototype', 'constructor'].includes(s))) fail('Unsafe path');
  return parts;
}
function locate(doc, target) {
  const page = doc.pages.find((p) => p.id === target.pageId);
  const block = page?.blocks.find((b) => b.id === target.blockId);
  if (!block) fail('Unknown page/block id: export the latest imported resume again');
  const parts = tokens(target.path);
  let parent = block.data;
  for (const part of parts.slice(0, -1)) {
    if ((!isObject(parent) && !Array.isArray(parent)) || !Object.hasOwn(parent, part))
      fail('Path does not exist');
    if (Array.isArray(parent) && !/^(0|[1-9]\d*)$/.test(part)) fail('Invalid array index');
    parent = parent[part];
  }
  const key = parts.at(-1);
  if ((!isObject(parent) && !Array.isArray(parent)) || !Object.hasOwn(parent, key))
    fail('Path does not exist');
  if (Array.isArray(parent) && !/^(0|[1-9]\d*)$/.test(key)) fail('Invalid array index');
  if (!['string', 'number'].includes(typeof parent[key]))
    fail('Only existing string/number leaves can be replaced');
  return { parent, key, value: parent[key] };
}
const targetKey = ({ pageId, blockId, path }) => JSON.stringify([pageId, blockId, path]);

export function createCandidate(bytes, scope, plan) {
  const original = JSON.parse(bytes.toString());
  assertResume(original);
  exactKeys(scope, ['request', 'targets'], 'scope');
  exactKeys(plan, ['baseHash', 'operations'], 'plan');
  if (
    typeof scope.request !== 'string' ||
    !scope.request.trim() ||
    !Array.isArray(scope.targets) ||
    !scope.targets.length
  )
    fail('Scope requires request and targets');
  if (plan.baseHash !== sourceHash(bytes))
    fail('Stale source hash: use latest full JSON export; no automatic merge');
  if (!Array.isArray(plan.operations) || !plan.operations.length) fail('Empty operations');
  const allowed = new Map();
  for (const target of scope.targets) {
    exactKeys(
      target,
      ['pageId', 'blockId', 'path', ...(Object.hasOwn(target, 'range') ? ['range'] : [])],
      'target',
    );
    const leaf = locate(original, target);
    if (Object.hasOwn(target, 'range')) {
      const range = target.range;
      if (
        typeof leaf.value !== 'string' ||
        !Array.isArray(range) ||
        range.length !== 2 ||
        !range.every(Number.isInteger) ||
        range[0] < 0 ||
        range[0] >= range[1] ||
        range[1] > leaf.value.length
      )
        fail('Invalid text range');
    }
    const key = targetKey(target);
    if (allowed.has(key)) fail('Duplicate scope target');
    allowed.set(key, target);
  }
  const candidate = structuredClone(original);
  const seen = new Set();
  const changes = [];
  for (const op of plan.operations) {
    exactKeys(
      op,
      ['pageId', 'blockId', 'path', 'expected', 'value', 'reason', 'evidence'],
      'operation',
    );
    if (
      typeof op.reason !== 'string' ||
      !op.reason.trim() ||
      !Array.isArray(op.evidence) ||
      !op.evidence.length ||
      op.evidence.some((e) => typeof e !== 'string' || !e.trim())
    )
      fail('Reason and evidence references required (facts need separate human verification)');
    const key = targetKey(op);
    if (!allowed.has(key)) fail('Operation outside requested scope');
    if (seen.has(key)) fail('Duplicate operation');
    seen.add(key);
    const leaf = locate(candidate, op);
    if (!isDeepStrictEqual(leaf.value, op.expected))
      fail('Expected value conflict: do not overwrite user edit');
    if (
      typeof op.value !== typeof leaf.value ||
      (typeof op.value === 'number' && !Number.isFinite(op.value))
    )
      fail('Leaf type cannot change');
    if (isDeepStrictEqual(op.expected, op.value)) fail('No-op operation');
    const range = allowed.get(key).range;
    if (range) {
      const prefix = op.expected.slice(0, range[0]);
      const suffix = op.expected.slice(range[1]);
      if (
        op.value.length < prefix.length + suffix.length ||
        !op.value.startsWith(prefix) ||
        !op.value.endsWith(suffix)
      )
        fail('Text outside requested range changed');
    }
    leaf.parent[leaf.key] = op.value;
    changes.push({
      pageId: op.pageId,
      blockId: op.blockId,
      path: op.path,
      before: op.expected,
      after: op.value,
      reason: op.reason,
      evidence: op.evidence,
    });
  }
  assertResume(candidate);
  return { original, candidate, changes, baseHash: plan.baseHash, request: scope.request };
}

export function verifyCandidate(bytes, scope, plan, candidate) {
  const result = createCandidate(bytes, scope, plan);
  assertResume(candidate);
  if (!isDeepStrictEqual(result.candidate, candidate))
    fail('Candidate differs from authorized operations: unexpected text/block/order/theme change');
  return result;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}
export function main(args) {
  const [command, ...rest] = args;
  if (command === 'hash' && rest.length === 1)
    return console.log(sourceHash(readFileSync(rest[0])));
  if (command === 'validate' && rest.length === 1) {
    assertResume(readJson(rest[0]));
    return console.log('Valid ResumeExportV1');
  }
  if (command === 'propose' && rest.length === 4) {
    const [input, scopeFile, planFile, out] = rest;
    const bytes = readFileSync(input);
    const result = createCandidate(bytes, readJson(scopeFile), readJson(planFile));
    // Exclusive directory creation refuses any existing destination, including source parents.
    mkdirSync(out, { mode: 0o700 });
    const write = (name, content) =>
      writeFileSync(resolve(out, name), content, { flag: 'wx', mode: 0o600 });
    write('original.json', bytes);
    write('candidate.json', JSON.stringify(result.candidate, null, 2) + '\n');
    write(
      'changes.json',
      JSON.stringify(
        {
          baseHash: result.baseHash,
          candidateHash: sourceHash(readFileSync(resolve(out, 'candidate.json'))),
          request: result.request,
          changes: result.changes,
        },
        null,
        2,
      ) + '\n',
    );
    write('scope.json', readFileSync(scopeFile));
    write('plan.json', readFileSync(planFile));
    console.log(`Created ${result.changes.length} scoped change(s) in ${out}`);
    return;
  }
  if (command === 'verify' && rest.length === 4) {
    const [input, scopeFile, planFile, candidate] = rest;
    const result = verifyCandidate(
      readFileSync(input),
      readJson(scopeFile),
      readJson(planFile),
      readJson(candidate),
    );
    return console.log(`Verified ${result.changes.length} change(s); all other values preserved`);
  }
  fail(
    'Usage: node resume-tool.mjs validate|hash FILE; propose INPUT SCOPE PLAN NEW_DIR; verify INPUT SCOPE PLAN CANDIDATE',
  );
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
