# arken/packages/seer/packages/protocol/util/ANALYSIS.md

## Scope
Utility schema helpers used across Seer protocol routers.

## This run
- Corrected `schema.ts` path header to the package-local `arken/...` path.
- Hardened pagination envelope compatibility in `getQueryInput` by supporting both:
  - `take` (aligned with package `Query` schema), and
  - `limit` (legacy alias retained for backwards compatibility).

## Reliability impact
Prevents pagination drift between callers that send `take` vs callers still sending `limit`.
Also narrows recursive query-filter `mode` to supported values (`default`/`insensitive`), reducing typo-driven mismatches that previously passed as arbitrary strings.
Additionally constrains `skip`/`take`/`limit` to non-negative integers, blocking malformed negative/decimal pagination values earlier at protocol boundaries.

## 2026-02-19 23:xx PST — Query envelope parity hardening
- Tightened exported `Query` helper pagination fields to non-negative integers (`skip`, `take`) and added legacy `limit` alias for parity with `getQueryInput`.
- This closes a schema drift where `Query` was more permissive than `getQueryInput`, allowing negative/float pagination in some call paths.

## 2026-02-20 02:xx PST — orderBy blank-key guard
- Hardened both root/util query envelopes to reject blank or whitespace-only `orderBy` keys.
- Added shared `NonBlankOrderByRecord` validation and applied it to exported `Query` plus `getQueryInput`.
- Why: empty sort keys can leak malformed query envelopes into downstream data layers where they are hard to diagnose.

## 2026-02-20 04:xx PST — include/select blank-key guard parity
- Hardened both root/util query envelopes to reject blank or whitespace-only keys in `include` and `select`.
- Added shared `NonBlankBooleanRecord` validation and applied it to exported `Query` plus `getQueryInput`.
- Why: blank projection keys silently create invalid selection maps and can cause confusing downstream query behavior; this keeps projection validation parity with `orderBy` hardening.

## 2026-02-20 06:5x PST — take/limit parity guard
- Added shared `assertTakeLimitParity` refinement in both root/util schema query envelopes.
- `Query` and `getQueryInput` now reject payloads where `take` and legacy `limit` are both present but differ.
- Why: conflicting pagination aliases can produce ambiguous downstream behavior; failing fast at protocol boundary keeps pagination deterministic.

## 2026-02-20 09:0x PST — single-alias pagination normalization
- Added `normalizeTakeLimitAliases` in both util/root schema query envelopes.
- `Query` and `getQueryInput` now backfill missing alias fields (`limit` -> `take`, `take` -> `limit`) after parity checks.
- Why: mixed callers still send a single alias; normalizing at the protocol boundary prevents downstream branching and keeps pagination handling deterministic.

## 2026-02-20 13:0x PST — logical where-array non-empty enforcement
- Added `.min(1)` guards for recursive logical operators (`AND`, `OR`, `NOT`) in both util `QueryWhereSchema` and `createPrismaWhereSchema`.
- Why: empty logical arrays are ambiguous no-op filters; rejecting them at schema boundary catches malformed queries before router/data-layer execution.

## 2026-02-20 15:xx PST — reserved-key rejection for query envelope maps
- Added `rejectReservedQueryEnvelopeKey` checks to `orderBy`, `include`/`select`, and `cursor` record validators in both root + util schema helpers.
- Rejected keys: `__proto__`, `constructor`, `prototype`.
- Why: these are prototype-pollution vectors in dynamic object maps; failing at protocol parse time keeps query envelopes deterministic and prevents polluted payloads from reaching downstream services.

## 2026-02-20 17:xx PST — whitespace-trimmed reserved-key guard
- Hardened `rejectReservedQueryEnvelopeKey` in both util/root schema helpers to trim map keys before reserved-key checks.
- Why: previously payloads like `' __proto__ '` or `' constructor '` bypassed reserved-key rejection despite representing the same dangerous keys.

## 2026-02-20 19:xx PST — untrimmed key rejection for query envelope maps
- Added `rejectUntrimmedQueryEnvelopeKey` in both util/root schema helpers and applied it to `orderBy`, `include`/`select`, and `cursor` validators.
- Why: keys like `' name '` parsed as distinct field names and could create hard-to-debug sort/selection/cursor mismatches downstream; rejecting boundary whitespace keeps query envelopes deterministic.

## 2026-02-20 23:xx PST — empty membership-operator guard
- Hardened both util/root query filter operator schemas so `in` and `notIn` require at least one value.
- Applied the same non-empty guard inside recursive `createPrismaWhereSchema` field-filter operator objects.
- Why: empty membership arrays are ambiguous no-op filters that hide caller mistakes and can lead to inconsistent data-layer behavior; failing fast at protocol boundary keeps where semantics explicit.

## 2026-02-21 01:4x PST — default pagination envelope normalization
- Reordered pagination defaults in util/root query schemas to `optional().default(...)` for `skip`, `take`, and legacy `limit`.
- Removed redundant `querySchema.partial()` in `getQueryInput`, which previously prevented defaults from materializing on `{}` payloads.
- Why: callers omitting pagination now receive deterministic parsed envelopes (`skip:0`, `take:10`, `limit:10`) without router-level fallback logic.

## 2026-02-21 03:3x PST — empty where-operator object guard
- Added shared non-empty operator validation so query where filters reject empty operator maps in both util/root schemas.
- Applied guard in both top-level `QueryWhereSchema` operators and recursive `createPrismaWhereSchema` operator objects.
- Why: payloads like `{ where: { name: {} } }` are ambiguous no-op filters; failing fast at schema boundary keeps filter intent explicit and deterministic.

## 2026-02-21 04:xx PST — strict where-key enforcement
- Hardened `QueryWhereSchema` and recursive `createPrismaWhereSchema` objects with `.strict()`.
- Why: unknown filter keys were previously stripped silently, hiding client typos and producing ambiguous no-op filters.

## 2026-02-21 06:1x PST — empty where-envelope rejection
- Added shared `rejectEmptyWhereObject` guard and applied it to util `QueryWhereSchema` plus recursive `createPrismaWhereSchema` branches.
- Why: payloads like `{ where: {} }` are no-op/ambiguous and can hide caller defects; rejecting them at parse time preserves deterministic filtering behavior.
