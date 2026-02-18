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

test('evolution info uses own-property descriptor guard with deterministic handler error', async () => {
  const source = await readFile(resolve(root, 'evolution', 'evolution.router.ts'), 'utf8');

  assert.match(source, /info:\s+procedure/);
  assert.match(source, /Object\.prototype\.hasOwnProperty\.call\(evolutionService, 'info'\)/);
  assert.match(source, /Object\.getOwnPropertyDescriptor\(evolutionService, 'info'\)/);
  assert.match(source, /Evolution\.info handler is unavailable for evolution\.info/);
  assert.match(source, /return method\.call\(evolutionService, input, ctx\)/);
});

test('evolution monitorChest uses own-property descriptor guard with deterministic handler error', async () => {
  const source = await readFile(resolve(root, 'evolution', 'evolution.router.ts'), 'utf8');

  assert.match(source, /monitorChest:\s+procedure/);
  assert.match(source, /Object\.prototype\.hasOwnProperty\.call\(evolutionService, 'monitorChest'\)/);
  assert.match(source, /Object\.getOwnPropertyDescriptor\(evolutionService, 'monitorChest'\)/);
  assert.match(source, /if \(typeof method !== 'function'\)/);
  assert.match(source, /Evolution\.monitorChest handler is unavailable for evolution\.monitorChest/);
  assert.match(source, /return method\.call\(evolutionService, input, ctx\)/);
});

test('evolution monitorParties uses own-property descriptor guard with deterministic handler error', async () => {
  const source = await readFile(resolve(root, 'evolution', 'evolution.router.ts'), 'utf8');

  assert.match(source, /monitorParties:\s+procedure/);
  assert.match(source, /Object\.prototype\.hasOwnProperty\.call\(evolutionService, 'monitorParties'\)/);
  assert.match(source, /Object\.getOwnPropertyDescriptor\(evolutionService, 'monitorParties'\)/);
  assert.match(source, /if \(typeof method !== 'function'\)/);
  assert.match(source, /Evolution\.monitorParties handler is unavailable for evolution\.monitorParties/);
  assert.match(source, /return method\.call\(evolutionService, input, ctx\)/);
});

test('evolution updateGameStats uses own-property descriptor guard with deterministic handler error', async () => {
  const source = await readFile(resolve(root, 'evolution', 'evolution.router.ts'), 'utf8');

  assert.match(source, /updateGameStats:\s+procedure/);
  assert.match(source, /Object\.prototype\.hasOwnProperty\.call\(evolutionService, 'updateGameStats'\)/);
  assert.match(source, /Object\.getOwnPropertyDescriptor\(evolutionService, 'updateGameStats'\)/);
  assert.match(source, /if \(typeof method !== 'function'\)/);
  assert.match(source, /Evolution\.updateGameStats handler is unavailable for evolution\.updateGameStats/);
  assert.match(source, /return method\.call\(evolutionService, input, ctx\)/);
});

test('evolution updateConfig uses own-property descriptor guard with deterministic handler error', async () => {
  const source = await readFile(resolve(root, 'evolution', 'evolution.router.ts'), 'utf8');

  assert.match(source, /updateConfig:\s+procedure/);
  assert.match(source, /Object\.prototype\.hasOwnProperty\.call\(evolutionService, 'updateConfig'\)/);
  assert.match(source, /Object\.getOwnPropertyDescriptor\(evolutionService, 'updateConfig'\)/);
  assert.match(source, /if \(typeof method !== 'function'\)/);
  assert.match(source, /Evolution\.updateConfig handler is unavailable for evolution\.updateConfig/);
  assert.match(source, /return method\.call\(evolutionService, input, ctx\)/);
});

test('evolution getPayments uses own-property descriptor guard with deterministic handler error', async () => {
  const source = await readFile(resolve(root, 'evolution', 'evolution.router.ts'), 'utf8');

  assert.match(source, /getPayments:\s+procedure/);
  assert.match(source, /Object\.prototype\.hasOwnProperty\.call\(evolutionService, 'getPayments'\)/);
  assert.match(source, /Object\.getOwnPropertyDescriptor\(evolutionService, 'getPayments'\)/);
  assert.match(source, /if \(typeof method !== 'function'\)/);
  assert.match(source, /Evolution\.getPayments handler is unavailable for evolution\.getPayments/);
  assert.match(source, /return method\.call\(evolutionService, input, ctx\)/);
});

test('evolution processPayments uses own-property descriptor guard with deterministic handler error', async () => {
  const source = await readFile(resolve(root, 'evolution', 'evolution.router.ts'), 'utf8');

  assert.match(source, /processPayments:\s+procedure/);
  assert.match(source, /Object\.prototype\.hasOwnProperty\.call\(evolutionService, 'processPayments'\)/);
  assert.match(source, /Object\.getOwnPropertyDescriptor\(evolutionService, 'processPayments'\)/);
  assert.match(source, /if \(typeof method !== 'function'\)/);
  assert.match(source, /Evolution\.processPayments handler is unavailable for evolution\.processPayments/);
  assert.match(source, /return method\.call\(evolutionService, input, ctx\)/);
});

test('evolution getScene uses own-property descriptor guard with deterministic handler error', async () => {
  const source = await readFile(resolve(root, 'evolution', 'evolution.router.ts'), 'utf8');

  assert.match(source, /getScene:\s+t\.procedure/);
  assert.match(source, /Object\.prototype\.hasOwnProperty\.call\(evolutionService, 'getScene'\)/);
  assert.match(source, /Object\.getOwnPropertyDescriptor\(evolutionService, 'getScene'\)/);
  assert.match(source, /if \(typeof method !== 'function'\)/);
  assert.match(source, /Evolution\.getScene handler is unavailable for evolution\.getScene/);
  assert.match(source, /return method\.call\(evolutionService, input, ctx\)/);
});
