// arken/packages/seer/packages/protocol/test/isles.router.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveIslesMethod } from '../src/modules/isles/isles.methodResolver.ts';

test('resolveIslesMethod prefers Isles service handlers for matching methods', () => {
  const islesSaveRound = () => 'isles-save-round';
  const service = {
    Isles: { saveRound: islesSaveRound },
    Evolution: { saveRound: () => 'evolution-save-round' },
  };

  const handler = resolveIslesMethod(service, 'saveRound');
  assert.equal(handler(), 'isles-save-round');
});

test('resolveIslesMethod uses method-matched Evolution fallback for interact', () => {
  const evolutionInteract = () => 'evolution-interact';
  const service = {
    Isles: {},
    Evolution: { saveRound: () => 'evolution-save-round', interact: evolutionInteract },
  };

  const handler = resolveIslesMethod(service, 'interact');
  assert.equal(handler(), 'evolution-interact');
});

test('resolveIslesMethod does not misroute getScene to Evolution.saveRound', () => {
  const service = {
    Isles: {},
    Evolution: { saveRound: () => 'evolution-save-round' },
  };

  assert.throws(() => resolveIslesMethod(service, 'getScene'), /Isles service method unavailable: getScene/);
});

test('resolveIslesMethod does not misroute interact to Evolution.saveRound', () => {
  const service = {
    Isles: {},
    Evolution: { saveRound: () => 'evolution-save-round' },
  };

  assert.throws(() => resolveIslesMethod(service, 'interact'), /Isles service method unavailable: interact/);
});

test('resolveIslesMethod ignores inherited prototype handlers and requires own service methods', () => {
  const inherited = { interact: () => 'inherited-interact' };
  const evolutionService = Object.create(inherited) as Record<string, unknown>;

  const service = {
    Isles: {},
    Evolution: evolutionService,
  };

  assert.throws(() => resolveIslesMethod(service, 'interact'), /Isles service method unavailable: interact/);
});

test('resolveIslesMethod skips getter-throwing handlers and falls back safely', () => {
  const islesService: Record<string, unknown> = {};
  Object.defineProperty(islesService, 'interact', {
    enumerable: true,
    get() {
      throw new Error('getter exploded');
    },
  });

  const evolutionInteract = () => 'evolution-interact';
  const service = {
    Isles: islesService,
    Evolution: { interact: evolutionInteract },
  };

  const handler = resolveIslesMethod(service, 'interact');
  assert.equal(handler(), 'evolution-interact');
});

test('resolveIslesMethod treats non-function own properties as unavailable handlers', () => {
  const service = {
    Isles: { getScene: 'not-a-function' as unknown },
    Evolution: {},
  };

  assert.throws(() => resolveIslesMethod(service, 'getScene'), /Isles service method unavailable: getScene/);
});

test('resolveIslesMethod preserves service context for method handlers', () => {
  const service = {
    Isles: {
      label: 'isles',
      getScene(this: { label: string }, suffix: string) {
        return `${this.label}-${suffix}`;
      },
    },
    Evolution: {},
  };

  const handler = resolveIslesMethod(service, 'getScene');
  assert.equal(handler('scene'), 'isles-scene');
});
