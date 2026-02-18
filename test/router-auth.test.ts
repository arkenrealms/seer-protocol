import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());

test('root auth guards applicationId access behind object-shape check', async () => {
  const source = await readFile(resolve(root, 'router.ts'), 'utf8');
  const authBlock = source.match(/auth:[\s\S]*?(?=\n\s*banProfile:)/)?.[0] ?? '';

  assert.notEqual(authBlock.length, 0);
  assert.match(authBlock, /typeof input\.data === 'object'/);
  assert.match(authBlock, /applicationId/);
  assert.doesNotMatch(authBlock, /input\.data\.applicationId/);
});
