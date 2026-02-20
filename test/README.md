# arken/packages/seer/packages/protocol/test

Jest-based package-local tests for `@arken/seer-protocol`.

## Current coverage
- `evolution.router.test.ts`
  - verifies `info` uses own-property descriptor guard lookup on `Evolution.info`
  - verifies deterministic unavailable-handler error string for missing `Evolution.info` wiring
  - verifies `updateConfig` and `updateSettings` remain mutation-based (not query-based)
  - verifies `monitorParties` uses guarded own-property query dispatch
  - verifies own-property descriptor guard usage for `Evolution.updateConfig`, `Evolution.monitorParties`, and `Evolution.updateSettings`
  - verifies deterministic unavailable-handler error strings
  - verifies context-preserving `method.call(evolutionService, input, ctx)` dispatch
  - verifies explicit `TRPCError` import from `@trpc/server` for guarded throw paths
- `oasis.router.test.ts`
  - verifies `getPatrons` uses own-property descriptor guard lookup on `Oasis.getPatrons`
  - verifies deterministic unavailable-handler error string for missing Oasis handler wiring
  - verifies context-preserving `method.call(oasisService, input, ctx)` dispatch
  - verifies `getScene` guards non-object `input.data` before reading `applicationId`
- `router-routing.test.ts`
  - verifies `isles` and `infinite` resolve handlers by matching method names (`saveRound`/`interact`/`getScene`)
  - verifies Isles/Infinite service own-property handlers are preferred with Evolution method-matched fallback
  - verifies legacy blanket `Evolution.saveRound` routing is not reintroduced for `interact`/`getScene`
- `schema.query-input.test.ts`
  - verifies `getQueryInput` accepts `take` for pagination
  - verifies legacy `limit` alias remains accepted for compatibility
  - verifies pagination fields (`skip`/`take`/`limit`) are constrained to non-negative integers
  - verifies recursive schema filter `mode` is constrained to `default | insensitive`
  - verifies array-schema query envelopes reject unsupported `where` filters

## Run
- `npm test` (from `arken/packages/seer/packages/protocol`)
