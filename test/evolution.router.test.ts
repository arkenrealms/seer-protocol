// arken/packages/seer/packages/protocol/test/evolution.router.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());

test('evolution updateSettings stays mutation-based', async () => {
  const source = await readFile(resolve(root, 'evolution', 'evolution.router.ts'), 'utf8');

  const updateSettingsBlock =
    source.match(/updateSettings:[\s\S]*?(?=\n\s*getPayments:)/)?.[0] ?? '';

  assert.notEqual(updateSettingsBlock.length, 0);
  assert.match(updateSettingsBlock, /\.mutation\(\(\{ input, ctx \}\) =>/);
  assert.doesNotMatch(updateSettingsBlock, /\.query\(\(\{ input, ctx \}\) =>/);
});
