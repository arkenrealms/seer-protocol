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
