# arken/packages/seer/packages/protocol/test/README.md

Package-local protocol tests for `@arken/seer-protocol`.

## Current scope
- `infinite.router.test.ts`
  - validates method resolution behavior in Infinite router service fallback logic.
  - guards against accidental routing of non-`saveRound` methods (`getScene`, `interact`) to `Evolution.saveRound`.
  - validates inherited-prototype handler safety (own-property method resolution only).
  - validates resilience when candidate handlers are getter-backed/non-function values.
  - validates handler invocation preserves owning service context (`this`) to avoid method-binding drift.
- `isles.router.test.ts`
  - validates Isles resolver precedence (`Isles` before `Evolution`).
  - guards against accidental `getScene`/`interact` -> `Evolution.saveRound` misrouting.
  - validates inherited-prototype handler rejection and context-preserving invocation.
  - validates getter-throwing and non-function own-property handler fallback behavior.
- `methodResolver.test.ts`
  - validates shared resolver policy toggles (`allowMethodMatchedFallback`, `allowSaveRoundFallback`) for explicit fallback behavior.
  - preserves method-matched fallback behavior for non-saveRound methods when saveRound fallback is disabled.
  - verifies strict mode can disable method-matched fallback entirely.
  - validates trimmed/non-empty method-name enforcement to keep resolver inputs deterministic.
  - validates safe fallback behavior when own-property lookup itself throws (Proxy/getOwnPropertyDescriptor traps).
