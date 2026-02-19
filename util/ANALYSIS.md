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

## 2026-02-19 maintenance update (logical clause normalization)
- Hardened `createPrismaWhereSchema` logical operators (`AND`/`OR`/`NOT`) to accept either array form or single-object shorthand.
- Added preprocessing that normalizes single-object logical clauses to one-element arrays while preserving array inputs.
- Improves compatibility with callers that send Prisma-style object shorthand for logical groups.
