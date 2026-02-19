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

## 2026-02-19 maintenance update (operator-filter strictness)
- Hardened `createPrismaWhereSchema` field operator envelopes by adding `.strict()` on the operator object schema.
- Prevents unknown keys from being silently accepted/stripped in Prisma-like `where` filters, reducing malformed-query drift.

## 2026-02-19 maintenance update (orderBy direction normalization)
- Normalized `orderBy` direction parsing in both exported schema entrypoints (`schema.ts` and `util/schema.ts`) via trim+lowercase preprocessing before enum validation.
- Improves compatibility with clients sending direction casing/spacing variants (e.g., `ASC`, ` Desc `) while still rejecting invalid values.
