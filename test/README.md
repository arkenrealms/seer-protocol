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
- `router-routing.test.ts`
  - verifies Isles and Infinite routers dispatch `interact`/`getScene` to method-matched Evolution handlers instead of always using `saveRound`.
  - verifies `saveRound` remains mutation-based (not query) in both routers.
  - verifies missing method handlers surface deterministic formatted error payloads (status 0).
  - verifies Evolution handlers are invoked via `method.call(ctx.app.service.Evolution, ...)` so service `this` context is preserved.
- `evolution.router.test.ts`
  - verifies `updateSettings` remains mutation-based so profile preference writes are not exposed as query semantics.
- `router-auth.test.ts`
  - executes root router `auth` through a real caller to ensure non-object `data` payloads do not throw.
  - verifies known `applicationId` behavior remains stable after null-guard hardening.

## 2026-02-18 note
- Router-shape assertions now require own-property handler checks for Evolution method dispatch in Isles/Infinite (`hasOwnProperty.call(evolutionService, ...)`).
