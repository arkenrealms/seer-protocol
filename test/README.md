# arken/packages/seer/packages/protocol/test/README.md

Package-local protocol tests for `@arken/seer-protocol`.

## Current scope
- `infinite.router.test.ts`
  - validates method resolution behavior in Infinite router service fallback logic.
  - guards against accidental routing of non-`saveRound` methods to `Evolution.saveRound`.
