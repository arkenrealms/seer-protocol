// arken/packages/seer/packages/protocol/test/infinite.router.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveInfiniteMethod } from '../src/modules/infinite/infinite.methodResolver.ts';

test('resolveInfiniteMethod prefers Infinite service handlers for matching methods', () => {
  const infiniteSaveRound = () => 'infinite-save-round';
  const service = {
    Infinite: { saveRound: infiniteSaveRound },
    Evolution: { saveRound: () => 'evolution-save-round' },
  };

  const handler = resolveInfiniteMethod(service, 'saveRound');
  assert.equal(handler, infiniteSaveRound);
});

test('resolveInfiniteMethod uses method-matched Evolution fallback for interact', () => {
  const evolutionInteract = () => 'evolution-interact';
  const service = {
    Infinite: {},
    Evolution: { saveRound: () => 'evolution-save-round', interact: evolutionInteract },
  };

  const handler = resolveInfiniteMethod(service, 'interact');
  assert.equal(handler, evolutionInteract);
});

test('resolveInfiniteMethod does not misroute getScene to Evolution.saveRound', () => {
  const evolutionSaveRound = () => 'evolution-save-round';
  const service = {
    Infinite: {},
    Evolution: { saveRound: evolutionSaveRound },
  };

  assert.throws(() => resolveInfiniteMethod(service, 'getScene'), /Infinite service method unavailable: getScene/);
});

test('resolveInfiniteMethod ignores inherited prototype handlers and requires own service methods', () => {
  const inherited = { interact: () => 'inherited-interact' };
  const evolutionService = Object.create(inherited) as Record<string, unknown>;

  const service = {
    Infinite: {},
    Evolution: evolutionService,
  };

  assert.throws(() => resolveInfiniteMethod(service, 'interact'), /Infinite service method unavailable: interact/);
});
