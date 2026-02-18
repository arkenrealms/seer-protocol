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
  assert.equal(handler(), 'infinite-save-round');
});

test('resolveInfiniteMethod uses method-matched Evolution fallback for interact', () => {
  const evolutionInteract = () => 'evolution-interact';
  const service = {
    Infinite: {},
    Evolution: { saveRound: () => 'evolution-save-round', interact: evolutionInteract },
  };

  const handler = resolveInfiniteMethod(service, 'interact');
  assert.equal(handler(), 'evolution-interact');
});

test('resolveInfiniteMethod does not misroute getScene to Evolution.saveRound', () => {
  const evolutionSaveRound = () => 'evolution-save-round';
  const service = {
    Infinite: {},
    Evolution: { saveRound: evolutionSaveRound },
  };

  assert.throws(() => resolveInfiniteMethod(service, 'getScene'), /Infinite service method unavailable: getScene/);
});

test('resolveInfiniteMethod does not misroute interact to Evolution.saveRound', () => {
  const evolutionSaveRound = () => 'evolution-save-round';
  const service = {
    Infinite: {},
    Evolution: { saveRound: evolutionSaveRound },
  };

  assert.throws(() => resolveInfiniteMethod(service, 'interact'), /Infinite service method unavailable: interact/);
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

test('resolveInfiniteMethod skips getter-throwing handlers and falls back safely', () => {
  const infiniteService: Record<string, unknown> = {};
  Object.defineProperty(infiniteService, 'interact', {
    enumerable: true,
    get() {
      throw new Error('getter exploded');
    },
  });

  const evolutionInteract = () => 'evolution-interact';
  const service = {
    Infinite: infiniteService,
    Evolution: { interact: evolutionInteract },
  };

  const handler = resolveInfiniteMethod(service, 'interact');
  assert.equal(handler(), 'evolution-interact');
});

test('resolveInfiniteMethod treats non-function own properties as unavailable handlers', () => {
  const service = {
    Infinite: { getScene: 'not-a-function' as unknown },
    Evolution: {},
  };

  assert.throws(() => resolveInfiniteMethod(service, 'getScene'), /Infinite service method unavailable: getScene/);
});

test('resolveInfiniteMethod preserves service context for method handlers', () => {
  const service = {
    Infinite: {
      label: 'infinite',
      getScene(this: { label: string }, suffix: string) {
        return `${this.label}-${suffix}`;
      },
    },
    Evolution: {},
  };

  const handler = resolveInfiniteMethod(service, 'getScene');
  assert.equal(handler('scene'), 'infinite-scene');
});
