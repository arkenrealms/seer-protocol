# arken/packages/seer/packages/protocol/test

Jest-based package-local tests for `@arken/seer-protocol`.

## Current coverage
- `evolution.router.test.ts`
  - verifies `updateSettings` remains mutation-based (not query-based)
  - verifies own-property descriptor guard usage for `Evolution.updateSettings`
  - verifies deterministic unavailable-handler error string
  - verifies context-preserving `method.call(evolutionService, input, ctx)` dispatch

## Run
- `npm test` (from `arken/packages/seer/packages/protocol`)
