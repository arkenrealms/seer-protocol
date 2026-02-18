# arken/packages/seer/packages/protocol/test/ANALYSIS.md

## Folder purpose in project context
Local, package-scoped test harness for `@arken/seer-protocol` so source changes can be validated within this direct repo.

## Notable files and responsibilities
- `infinite.router.test.ts`
  - verifies `resolveInfiniteMethod` handler precedence and fallback behavior.
  - protects against protocol misrouting bugs where non-`saveRound` calls (`getScene`, `interact`) could be incorrectly delegated.
  - adds inherited-prototype safety coverage so callback resolution only accepts own handler properties.
  - covers getter-throwing and non-function own-property handler surfaces to ensure fallback/availability behavior stays deterministic.
  - verifies resolved handlers preserve method `this` binding to the owning service object.
- `isles.router.test.ts`
  - verifies `resolveIslesMethod` Isles-first precedence + method-matched Evolution fallback.
  - protects against `getScene`/`interact` misrouting into `Evolution.saveRound`.
  - verifies own-property-only callable resolution and context-preserving invocation.
  - verifies getter-throwing and non-function own-property fallback safety.
- `router-routing.test.ts`
  - verifies Isles/Infinite route dispatch correctness (`interact` and `getScene` must not route through `Evolution.saveRound`).
  - verifies `saveRound` is mutation-based in both routers.
  - validates formatted failure behavior when required Evolution method handlers are missing.
  - enforces Evolution handler invocation through `method.call(ctx.app.service.Evolution, ...)` to preserve service `this` context.
- `router-auth.test.ts`
  - executes the root `auth` procedure via `createCallerFactory` to validate runtime behavior (not just source-shape checks).
  - covers null/undefined `data` payload handling to prevent `input.data.applicationId` dereference crashes.
- `evolution.router.test.ts`
  - verifies `updateSettings` remains mutation-based.
  - verifies `info`, `monitorParties`, and `getScene` resolve handlers through own-property descriptors, raise deterministic unavailable-handler errors, and preserve service context.
- `oasis.router.test.ts`
  - enforces object-shape guarding in `oasis.getScene` before reading `applicationId`.
  - prevents regressions where null/non-object payloads could crash scene queries.
  - asserts deterministic guardrails for missing `ctx.app.service.Oasis.getPatrons` handler wiring.
  - verifies getter-safe handler extraction via `Object.getOwnPropertyDescriptor(...).value` to avoid trap-property crashes.
  - verifies context-preserving invocation through `method.call(oasisService, ...)`.

## Protocol/test relevance
- Establishes the first package-local runnable test surface for seer-protocol.
- Enables source-change test gate compliance for small router hardening edits.

## Risks / gaps / follow-ups
- Coverage remains source-shape oriented and does not yet execute live tRPC handlers with fixture contexts.
- Follow-up: add module tests for Isles/Oasis/Evolution auth + schema boundary behavior once minimal context fixtures are codified.

## 2026-02-18 maintenance update
- `router-routing.test.ts` now asserts own-property handler guards are present in Isles/Infinite routers (`hasOwnProperty.call(evolutionService, '<method>')`).
- Expanded `router-routing.test.ts` source assertions for missing-service guards (`ctx.app?.service?.Evolution`) and explicit `TRPCError`/`INTERNAL_SERVER_ERROR` handler-unavailable branches.
- Coverage still skews toward source-shape routing guards because direct runtime imports for router modules are currently constrained by extensionless ESM resolution in this package test harness.
