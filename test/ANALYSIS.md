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

## 2026-02-19 15:45 PST — depth normalization regression lock
- Added `schema.depth-normalization.test.ts` to assert `createPrismaWhereSchema` normalizes depth before recursion.
- Locks guardrails against non-finite and fractional depth values being used directly in recursive schema construction.
- Added regression that `mode` in recursive query filters is constrained to `default | insensitive` (no arbitrary mode strings).

## 2026-02-19 21:33 PST — root schema query-envelope parity lock
- Added `schema.root-query-input.test.ts` to ensure root `schema.ts` matches util-layer strict pagination behavior (`skip`/`take`/`limit` are non-negative integers).
- Locked root recursive filter `mode` operator to enum (`default | insensitive`) to prevent arbitrary string modes.
- Test gate run via `rushx test` in `arken/seer/protocol` after source + test updates.

## 2026-02-19 23:xx PST — exported Query schema strictness lock
- Expanded `schema.query-input.test.ts` and `schema.root-query-input.test.ts` with explicit checks for exported `Query` helper strictness.
- New assertions lock parity that both root/util `Query` enforce non-negative integer pagination and expose legacy `limit` alias.

## 2026-02-19 23:45 PST — replace brittle source-text assertions with behavior tests
- Replaced regex/source-read assertions in `schema.query-input.test.ts` with runtime behavior tests against `Query` and `getQueryInput` parsing outcomes.
- Added coverage for valid pagination acceptance, invalid pagination rejection, strict `mode` enum enforcement, and array-schema `where` rejection.
- Why: requested by architect (`highruned`) after review feedback that source-code string matching is brittle and prone to false breakage from harmless formatting/refactor changes.

## 2026-02-19 23:55 PST — root query-input test hardened to behavior assertions
- Replaced brittle regex/source-read assertions in `schema.root-query-input.test.ts` with runtime behavior tests that execute root `schema.ts` exports.
- Added validation for accepted/rejected pagination inputs and strict `mode` enum enforcement through `getQueryInput` parsing.
- Why: follow-up architect request (`highruned`) to remove fragile source-shape tests and use robust contract behavior checks.

## 2026-02-20 00:10 PST — router/schema brittle test suite converted to runtime behavior
- Reworked `evolution.router.test.ts` to validate actual router procedure types (`query` vs `mutation`) and service dispatch execution via `createCaller`, instead of matching source text.
- Reworked `oasis.router.test.ts` to validate runtime dispatch for `getPatrons` and safe `getScene` behavior with both non-object and object `data` payloads.
- Reworked `router-routing.test.ts` to validate Isles/Infinite method resolution behavior (service-first + Evolution fallback + deterministic missing-handler errors) using executable callers.
- Reworked `schema.depth-normalization.test.ts` to validate depth normalization behavior through parse outcomes for NaN/negative/fractional depths rather than source regex checks.
- Why: direct architect request (`highruned`) to replace brittle source-shape tests with robust behavior-based tests less prone to breakage from formatting/refactors.
