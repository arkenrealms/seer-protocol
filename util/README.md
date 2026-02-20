# arken/packages/seer/packages/protocol/util/README.md

Shared schema/util helpers for protocol routers and tests.

## Highlights
- `schema.ts` exports Zod query envelope helpers (`getQueryInput`, `getQueryOutput`) and shared common schemas.
- Query envelopes now accept both `take` (preferred) and legacy `limit` for pagination compatibility.
- Pagination controls (`skip`, `take`, `limit`) are now constrained to non-negative integers to prevent invalid negative/float pagination payloads from reaching service/query layers.
- Prisma-style filter `mode` is constrained to `default | insensitive` in recursive `where` schemas to prevent silent invalid mode values.
- `orderBy` now rejects blank/whitespace-only keys to prevent malformed sort envelopes.
- `include` and `select` now reject blank/whitespace-only keys so malformed projection envelopes fail fast.
