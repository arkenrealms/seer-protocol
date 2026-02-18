// arken/packages/seer/packages/protocol/test/methodResolver.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveModuleMethod } from '../src/modules/methodResolver.ts';

test('resolveModuleMethod can disable saveRound fallback explicitly', () => {
  const service = {
    Primary: {},
    Fallback: {
      saveRound: () => 'fallback-save-round',
    },
  };

  assert.throws(
    () =>
      resolveModuleMethod({
        moduleName: 'Primary',
        method: 'saveRound',
        primaryService: service.Primary,
        fallbackService: service.Fallback,
        allowSaveRoundFallback: false,
      }),
    /Primary service method unavailable: saveRound/
  );
});

test('resolveModuleMethod keeps method-matched fallback for non-saveRound methods', () => {
  const service = {
    Primary: {},
    Fallback: {
      interact: () => 'fallback-interact',
    },
  };

  const handler = resolveModuleMethod({
    moduleName: 'Primary',
    method: 'interact',
    primaryService: service.Primary,
    fallbackService: service.Fallback,
    allowSaveRoundFallback: false,
  });

  assert.equal(handler(), 'fallback-interact');
});
