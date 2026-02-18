// arken/packages/seer/packages/protocol/test/router-routing.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());

const readRouter = async (name: 'isles' | 'infinite') =>
  readFile(resolve(root, name, `${name}.router.ts`), 'utf8');

const activeSaveRoundBlock = /export const createRouter = \(\) =>[\s\S]*?saveRound:[\s\S]*?(?=\n\s*interact:)/;

test('isles router uses method-matched Evolution handlers', async () => {
  const source = await readRouter('isles');
  const saveRoundBlock = source.match(activeSaveRoundBlock)?.[0] ?? '';

  assert.notEqual(saveRoundBlock.length, 0);
  assert.match(saveRoundBlock, /\.mutation\(\(\{ input, ctx \}\) =>/);
  assert.doesNotMatch(saveRoundBlock, /\.query\(\(\{ input, ctx \}\) =>/);
  assert.match(source, /hasOwnProperty\.call\(evolutionService, 'saveRound'\)/);
  assert.match(source, /hasOwnProperty\.call\(evolutionService, 'interact'\)/);
  assert.match(source, /hasOwnProperty\.call\(evolutionService, 'getScene'\)/);
  assert.match(source, /method\.call\(evolutionService, input, ctx\)/);
  assert.doesNotMatch(source, /interact[\s\S]*Evolution\.saveRound as any/);
  assert.doesNotMatch(source, /getScene[\s\S]*Evolution\.saveRound as any/);
});

test('infinite router uses method-matched Evolution handlers', async () => {
  const source = await readRouter('infinite');
  const saveRoundBlock = source.match(activeSaveRoundBlock)?.[0] ?? '';

  assert.notEqual(saveRoundBlock.length, 0);
  assert.match(saveRoundBlock, /\.mutation\(\(\{ input, ctx \}\) =>/);
  assert.doesNotMatch(saveRoundBlock, /\.query\(\(\{ input, ctx \}\) =>/);
  assert.match(source, /hasOwnProperty\.call\(evolutionService, 'saveRound'\)/);
  assert.match(source, /hasOwnProperty\.call\(evolutionService, 'interact'\)/);
  assert.match(source, /hasOwnProperty\.call\(evolutionService, 'getScene'\)/);
  assert.match(source, /method\.call\(evolutionService, input, ctx\)/);
  assert.doesNotMatch(source, /interact[\s\S]*Evolution\.saveRound as any/);
  assert.doesNotMatch(source, /getScene[\s\S]*Evolution\.saveRound as any/);
});
