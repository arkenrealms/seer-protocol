import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());

const readRouter = async (name: 'isles' | 'infinite') =>
  readFile(resolve(root, name, `${name}.router.ts`), 'utf8');

test('isles router uses method-matched Evolution handlers', async () => {
  const source = await readRouter('isles');

  assert.match(source, /Evolution as any\)\?\.saveRound/);
  assert.match(source, /Evolution as any\)\?\.interact/);
  assert.match(source, /Evolution as any\)\?\.getScene/);
  assert.doesNotMatch(source, /interact[\s\S]*Evolution\.saveRound as any/);
  assert.doesNotMatch(source, /getScene[\s\S]*Evolution\.saveRound as any/);
});

test('infinite router uses method-matched Evolution handlers', async () => {
  const source = await readRouter('infinite');

  assert.match(source, /Evolution as any\)\?\.saveRound/);
  assert.match(source, /Evolution as any\)\?\.interact/);
  assert.match(source, /Evolution as any\)\?\.getScene/);
  assert.doesNotMatch(source, /interact[\s\S]*Evolution\.saveRound as any/);
  assert.doesNotMatch(source, /getScene[\s\S]*Evolution\.saveRound as any/);
});
