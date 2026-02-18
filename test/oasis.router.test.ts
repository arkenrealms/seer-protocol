// arken/packages/seer/packages/protocol/test/oasis.router.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());

test('oasis getScene guards non-object data before applicationId access', async () => {
  const source = await readFile(resolve(root, 'oasis', 'oasis.router.ts'), 'utf8');

  assert.match(source, /input\.data && typeof input\.data === 'object'/);
  assert.match(source, /applicationId\?: unknown/);
  assert.match(source, /if \(applicationId === '668e4e805f9a03927caf883b'\)/);
  assert.doesNotMatch(source, /if \(input\.data\.applicationId === '668e4e805f9a03927caf883b'\)/);
});
