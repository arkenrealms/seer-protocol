# arken/packages/seer/packages/protocol/test/ANALYSIS.md

## Purpose
Provide a direct-repo regression gate for protocol router hardening work.

## This run
- Added Jest test harness entrypoint via package script (`npm test` -> `jest --runInBand`).
- Added and expanded `test/evolution.router.test.ts` to enforce:
  - guarded own-property dispatch and deterministic unavailable-handler messaging for `info`,
  - mutation semantics for `updateConfig` and `updateSettings`,
  - own-property descriptor handler resolution for `updateConfig`, `monitorParties`, and `updateSettings`,
  - deterministic internal-error messaging when handler wiring is missing,
  - context-preserving method invocation,
  - explicit `TRPCError` import presence in `evolution.router.ts` so guarded error paths do not rely on undeclared globals.
- Added `test/oasis.router.test.ts` to enforce:
  - explicit `TRPCError` import in `oasis.router.ts`,
  - own-property descriptor resolution for `Oasis.getPatrons`,
  - deterministic unavailable-handler messaging,
  - context-preserving invocation semantics for Oasis service dispatch,
  - `getScene` non-object payload guarding before `applicationId` reads.

- Added `test/router-routing.test.ts` to lock Isles/Infinite routing invariants:
  - own-property method resolution on `Isles`/`Infinite`,
  - method-matched fallback on `Evolution`,
  - no regression to blanket `Evolution.saveRound` dispatch for non-`saveRound` routes.

## Follow-up
- Expand tests from source-shape checks to runtime caller execution with fixture contexts for high-risk procedures (`saveRound`, payment flows, party mutations).

## 2026-02-18 maintenance update
- Migrated `router-routing` regression test from `.js` to `.ts` (`test/router-routing.test.ts`) to keep package tests aligned with TypeScript-first test standardization.
- Re-ran package-local Jest gate after migration to confirm no behavioral regression.

## 2026-02-19 maintenance update
- Added `test/schema.query-input.test.ts` to cover `util/schema.ts` query envelope compatibility.
- Locked acceptance for both `take` (preferred) and `limit` (legacy alias) in `getQueryInput`.
- Added regression coverage that pagination fields (`skip`/`take`/`limit`) remain constrained to non-negative integers.
- Added regression for array-schema query envelopes to reject unsupported `where` filters.
- Added regression that `mode` in recursive query filters is constrained to `default | insensitive` (no arbitrary mode strings).
