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
- `methodResolver.test.ts`
  - verifies shared resolver toggle behavior for saveRound compatibility fallback.
  - verifies strict-mode toggle (`allowMethodMatchedFallback: false`) disables all fallback resolution when required.
  - ensures disabling saveRound fallback does not disable method-matched fallback for non-saveRound procedures.
  - verifies empty/whitespace method names are rejected and trimmed method names still resolve correctly.
  - verifies resolver behavior remains deterministic when own-property inspection throws during primary/fallback lookup.

## Protocol/test relevance
- Establishes the first package-local runnable test surface for seer-protocol.
- Enables source-change test gate compliance for small router hardening edits.

## Risks / gaps / follow-ups
- Coverage currently targets only Infinite router resolution logic.
- Follow-up: add module tests for Isles/Oasis/Evolution auth + schema boundary behavior once minimal context fixtures are codified.
