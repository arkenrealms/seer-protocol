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
  - validates formatted failure behavior when required Evolution method handlers are missing.

## Protocol/test relevance
- Establishes the first package-local runnable test surface for seer-protocol.
- Enables source-change test gate compliance for small router hardening edits.

## Risks / gaps / follow-ups
- Coverage currently targets only Infinite router resolution logic.
- Follow-up: add module tests for Isles/Oasis/Evolution auth + schema boundary behavior once minimal context fixtures are codified.
